#!/usr/bin/env node
/**
 * queue-url.js
 *
 * A local queue of URLs to be drafted by the n8n workflow on demand,
 * instead of waiting for the 12:15 cron.
 *
 * The queue lives at n8n/url-queue.json (gitignored). Dispatching POSTs a
 * single entry to the workflow's Webhook trigger, which joins the existing
 * chain just before "Deduplicate & Prepare for AI" and reuses the same
 * drafting and GitHub-commit nodes.
 *
 * Usage:
 *   node scripts/queue-url.js add <url> [--title "..."] [--note "..."]
 *   node scripts/queue-url.js list
 *   node scripts/queue-url.js run <id>          # dispatch one entry
 *   node scripts/queue-url.js run --all         # dispatch every pending entry
 *   node scripts/queue-url.js remove <id>
 *
 * Requires in .env:
 *   N8N_MANUAL_WEBHOOK_URL     production webhook URL from n8n Cloud
 *   N8N_MANUAL_WEBHOOK_SECRET  value for the webhook's header auth
 */

const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true })

const QUEUE_PATH = path.resolve(__dirname, '../n8n/url-queue.json')

function readQueue() {
  if (!fs.existsSync(QUEUE_PATH)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error(`Queue file is not valid JSON: ${QUEUE_PATH}`)
    console.error(`  ${e.message}`)
    console.error('Fix or delete it before continuing — refusing to overwrite.')
    process.exit(1)
  }
}

function writeQueue(queue) {
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true })
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n')
}

function parseUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error(`Not a valid URL: ${raw}`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Only http and https URLs are accepted, got ${url.protocol}`)
  }
  return url
}

function flag(args, name) {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : null
}

function nextId(queue) {
  return queue.reduce((max, e) => Math.max(max, e.id), 0) + 1
}

function fmt(entry) {
  const mark = entry.status === 'sent' ? '\u2713' : ' '
  const note = entry.note ? `\n      note: ${entry.note}` : ''
  const sent = entry.sentAt ? `  (sent ${entry.sentAt.slice(0, 16).replace('T', ' ')})` : ''
  return `  [${mark}] ${String(entry.id).padStart(3)}  ${entry.title || entry.url}${sent}\n      ${entry.url}${note}`
}

function cmdAdd(args) {
  const raw = args.find((a) => !a.startsWith('--') )
  if (!raw) throw new Error('Usage: queue-url.js add <url> [--title "..."] [--note "..."]')

  const url = parseUrl(raw)
  const queue = readQueue()

  const existing = queue.find((e) => e.url === url.href)
  if (existing) {
    console.log(`Already queued as #${existing.id} (${existing.status}).`)
    return
  }

  const entry = {
    id: nextId(queue),
    url: url.href,
    title: flag(args, '--title'),
    note: flag(args, '--note'),
    source: 'Manual',
    status: 'pending',
    addedAt: new Date().toISOString(),
    sentAt: null,
  }

  queue.push(entry)
  writeQueue(queue)
  console.log(`Queued #${entry.id}: ${entry.title || entry.url}`)
  console.log(`Dispatch it with:  node scripts/queue-url.js run ${entry.id}`)
}

function cmdList() {
  const queue = readQueue()
  if (!queue.length) {
    console.log('Queue is empty.')
    return
  }
  const pending = queue.filter((e) => e.status === 'pending')
  const sent = queue.filter((e) => e.status === 'sent')

  console.log(`Pending (${pending.length}):`)
  console.log(pending.length ? pending.map(fmt).join('\n') : '  none')
  if (sent.length) {
    console.log(`\nSent (${sent.length}):`)
    console.log(sent.map(fmt).join('\n'))
  }
}

function cmdRemove(args) {
  const id = Number(args[0])
  if (!Number.isInteger(id)) throw new Error('Usage: queue-url.js remove <id>')

  const queue = readQueue()
  const idx = queue.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error(`No queue entry #${id}`)

  const [removed] = queue.splice(idx, 1)
  writeQueue(queue)
  console.log(`Removed #${id}: ${removed.title || removed.url}`)
}

async function dispatch(entry, endpoint, secret) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-manual-queue-secret': secret,
    },
    body: JSON.stringify({
      url: entry.url,
      title: entry.title || undefined,
      note: entry.note || undefined,
      source: 'Manual',
      queued_at: entry.addedAt,
    }),
  })

  const body = await res.text()
  if (!res.ok) {
    throw new Error(`n8n returned ${res.status} ${res.statusText}\n${body.slice(0, 400)}`)
  }
  return body
}

async function cmdRun(args) {
  const endpoint = process.env.N8N_MANUAL_WEBHOOK_URL
  const secret = process.env.N8N_MANUAL_WEBHOOK_SECRET

  if (!endpoint || !secret) {
    console.error('Missing N8N_MANUAL_WEBHOOK_URL or N8N_MANUAL_WEBHOOK_SECRET in .env')
    console.error('Add the Webhook trigger in n8n Cloud first — see n8n/MANUAL-URL-SETUP.md')
    process.exit(1)
  }

  const queue = readQueue()
  const all = args.includes('--all')

  let targets
  if (all) {
    targets = queue.filter((e) => e.status === 'pending')
    if (!targets.length) {
      console.log('Nothing pending.')
      return
    }
  } else {
    const id = Number(args[0])
    if (!Number.isInteger(id)) throw new Error('Usage: queue-url.js run <id> | --all')
    const entry = queue.find((e) => e.id === id)
    if (!entry) throw new Error(`No queue entry #${id}`)
    if (entry.status === 'sent') {
      console.log(`#${id} was already sent at ${entry.sentAt}. Remove and re-add to resend.`)
      return
    }
    targets = [entry]
  }

  let failures = 0
  for (const entry of targets) {
    process.stdout.write(`-> #${entry.id} ${entry.url} ... `)
    try {
      await dispatch(entry, endpoint, secret)
      entry.status = 'sent'
      entry.sentAt = new Date().toISOString()
      writeQueue(queue)
      console.log('accepted')
    } catch (e) {
      failures++
      console.log('FAILED')
      console.error(`   ${e.message}`)
    }
  }

  if (failures) {
    console.error(`\n${failures} of ${targets.length} failed. Entries left pending.`)
    process.exit(1)
  }

  console.log(
    `\nDispatched ${targets.length}. n8n commits the draft to GitHub — ` +
      'give it a minute, then `git pull`.'
  )
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2)

  switch (cmd) {
    case 'add':
      return cmdAdd(args)
    case 'list':
      return cmdList()
    case 'run':
      return cmdRun(args)
    case 'remove':
      return cmdRemove(args)
    default:
      console.log(
        [
          'Usage:',
          '  node scripts/queue-url.js add <url> [--title "..."] [--note "..."]',
          '  node scripts/queue-url.js list',
          '  node scripts/queue-url.js run <id>',
          '  node scripts/queue-url.js run --all',
          '  node scripts/queue-url.js remove <id>',
        ].join('\n')
      )
      process.exit(cmd ? 1 : 0)
  }
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
