#!/usr/bin/env node
/**
 * referrers.js — read the referral history recorded by api/referrer.js.
 *
 * Vercel's own referrer data has a retention window and no supported export,
 * so this is the copy that can be compared across months.
 *
 *   node scripts/referrers.js           # all-time totals + last 14 days
 *   node scripts/referrers.js --recent  # the most recent arrivals in detail
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function main() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.error('UPSTASH_REDIS_REST_URL / _TOKEN not set')
    process.exit(1)
  }
  const { Redis } = require('@upstash/redis')
  const redis = new Redis({ url, token })

  const totals = await redis.zrange('ref:totals', 0, -1, { rev: true, withScores: true })
  if (!totals.length) {
    console.log('No referrals recorded yet.')
    return
  }

  console.log('All-time referrers:')
  for (let i = 0; i < totals.length; i += 2) {
    console.log(`  ${String(totals[i + 1]).padStart(5)}  ${totals[i]}`)
  }

  if (process.argv.includes('--recent')) {
    const rows = await redis.lrange('ref:recent', 0, 49)
    console.log(`\nMost recent ${rows.length} arrivals:`)
    for (const raw of rows) {
      const o = typeof raw === 'string' ? JSON.parse(raw) : raw
      console.log(`  ${o.t}  ${String(o.host).padEnd(28)} -> ${o.path}`)
    }
    return
  }

  // Day hashes are written one per day and never expire, so a gap simply means
  // no external referral landed that day.
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    days.push([d, await redis.hgetall(`ref:day:${d}`)])
  }
  console.log('\nLast 14 days:')
  for (const [d, h] of days) {
    const entries = Object.entries(h || {})
    const n = entries.reduce((a, [, v]) => a + Number(v), 0)
    const detail = entries.sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}(${v})`).join(' ')
    console.log(`  ${d}  ${String(n).padStart(3)}  ${detail}`)
  }
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1) })
