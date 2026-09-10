#!/usr/bin/env node
/**
 * clinic-index.js
 *
 * Reads all published posts and upserts them to Upstash Vector
 * for the Local LLM Clinic RAG feature.
 *
 * Usage:
 *   npm run clinic:index            # upsert all published posts, then prune retired ones
 *   npm run clinic:index -- --dry-run  # read-only: list the upserts and the exact prune set
 *
 * --dry-run still reads the live index, since the prune set can only be
 * determined from it. It never writes.
 */

const fs = require('fs')
const path = require('path')

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const POSTS_DIR = path.resolve(__dirname, '../content/posts')
const GUIDES_DIR = path.resolve(__dirname, '../content/guides')
const FM_RE = /^---\n([\s\S]*?\n)---\n([\s\S]*)$/

// Upstash allows 48KB of metadata per vector. Posts are short news digests
// (p90 ~1.5K chars) so they fit whole; long-form guides get truncated.
const MAX_EXCERPT = 6000

function extractField(fm, field) {
  const re = new RegExp(`^${field}:\\s*"?(.+?)"?\\s*$`, 'm')
  const m = fm.match(re)
  return m ? m[1].trim() : ''
}

function extractTags(fm) {
  const tags = []
  const lines = fm.split('\n')
  let inTags = false
  for (const line of lines) {
    if (/^tags:\s*$/.test(line)) { inTags = true; continue }
    if (inTags) {
      const item = line.match(/^\s+-\s+(.+)/)
      if (item) tags.push(item[1].replace(/^["']|["']$/g, ''))
      else break
    }
  }
  return tags
}

function stripMarkdown(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, '')  // frontmatter
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // links
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')  // images
    .replace(/#{1,6}\s+/g, '')  // headings
    // Emphasis/code markers. Underscores are NOT stripped blindly: identifiers
    // like Q4_K_M, --n_ctx and mmproj_f16.gguf must survive intact, since this
    // text is quoted back to users verbatim. Only strip _ used as emphasis,
    // i.e. flanked by whitespace or string boundaries.
    .replace(/[*~`]+/g, '')
    .replace(/(^|\s)_+|_+(?=\s|$)/g, '$1')
    .replace(/>\s+/g, '')  // blockquotes
    .replace(/-{3,}/g, '')  // horizontal rules
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function collectPosts() {
  const posts = []

  function walk(dir, kind) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full, kind); continue }
      if (!entry.name.endsWith('.md')) continue

      const content = fs.readFileSync(full, 'utf8')
      const match = content.match(FM_RE)
      if (!match) continue

      const fm = match[1]
      const body = match[2]

      const status = extractField(fm, 'status')
      if (status !== 'published') continue

      const title = extractField(fm, 'title')
      const date = extractField(fm, 'date')
      const description = extractField(fm, 'description')
      const tags = extractTags(fm)

      // Derive URL from directory structure: content/posts/2026-02-11/slug.md → /posts/slug/
      const slug = path.basename(full, '.md')
      const url = `/${kind}/${slug}/`
      // Post IDs stay bare slugs so existing vectors are updated, not duplicated.
      const id = kind === 'posts' ? slug : `${kind}/${slug}`

      const plainBody = stripMarkdown(body)

      posts.push({
        id,
        data: `${title}\n\n${description}\n\n${plainBody}`,
        metadata: {
          title, url, date, description,
          tags: tags.join(', '),
          kind,
          body: plainBody.slice(0, MAX_EXCERPT)
        }
      })
    }
  }

  walk(POSTS_DIR, 'posts')
  walk(GUIDES_DIR, 'guides')
  return posts
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  const posts = collectPosts()
  console.log(`Found ${posts.length} published posts`)

  if (dryRun) {
    for (const p of posts) {
      console.log(`  ${p.id} (${p.data.length} chars)`)
    }
    console.log(`\n${posts.length} posts would be upserted.`)
  }

  // Validate env vars. This runs as a build step, where absent credentials
  // (e.g. a preview deploy) are an expected condition rather than a failure —
  // skip the re-index and let the build carry on.
  const url = process.env.UPSTASH_VECTOR_REST_URL
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN
  if (!url || !token) {
    console.warn(dryRun
      ? '\nNo credentials, so the prune cannot be previewed — it reads the live index.'
      : 'Skipping clinic re-index: UPSTASH_VECTOR_REST_URL / _TOKEN not set')
    return
  }

  const { Index } = require('@upstash/vector')
  const index = new Index({ url, token })

  // Batch upsert in groups of 50
  const BATCH_SIZE = 50
  let total = 0

  if (!dryRun) {
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE)
      await index.upsert(batch)
      total += batch.length
      console.log(`  Upserted ${total}/${posts.length}`)
    }
  }

  // Prune vectors whose source is no longer published. Without this the clinic
  // can cite a URL that now 404s, since upserts alone never remove anything.
  const liveIds = new Set(posts.map(p => p.id))
  const stale = []
  let cursor = ''
  do {
    const page = await index.range({ cursor, limit: 1000, includeMetadata: false })
    for (const v of page.vectors) if (!liveIds.has(v.id)) stale.push(v.id)
    cursor = page.nextCursor
  } while (cursor)

  // A bug in collectPosts would otherwise quietly empty the index, so only
  // prune what looks like ordinary churn.
  const ceiling = Math.floor(posts.length * 0.2)
  if (stale.length > ceiling) {
    console.warn(`\nRefusing to prune ${stale.length} vectors against only ${posts.length} live posts — that looks wrong. Skipping prune.`)
  } else if (!stale.length) {
    console.log('\nNothing to prune.')
  } else if (dryRun) {
    // The stale set is (index ids − live ids), and upserting only ever adds
    // live ids, so skipping the upsert above does not change it.
    console.log(`\nWould prune ${stale.length} stale vectors (guard trips above ${ceiling}):`)
    for (const id of stale) console.log(`  ${id}`)
  } else {
    await index.delete(stale)
    console.log(`\nPruned ${stale.length} stale vectors: ${stale.slice(0, 10).join(', ')}${stale.length > 10 ? ', …' : ''}`)
  }

  console.log(dryRun
    ? '\nDry run complete. Nothing was written to Upstash Vector.'
    : `\nDone. ${total} vectors upserted to Upstash Vector.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
