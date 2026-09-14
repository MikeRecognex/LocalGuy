import { Redis } from '@upstash/redis'
import { checkRateLimit } from './clinic/_ratelimit.js'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

// Vercel's own referrer data has a retention window and no supported export, so
// anything worth comparing across months has to be kept here. Only external
// referrals are recorded — the interesting event is someone arriving from
// elsewhere, and that is rare enough to store forever without thought for cost.
const DAY_KEY = (d) => `ref:day:${d}`   // hash: hostname -> count, one per day
const TOTALS_KEY = 'ref:totals'         // sorted set: hostname -> all-time count
const RECENT_KEY = 'ref:recent'         // list: the last RECENT_MAX arrivals
const RECENT_MAX = 500

// An engaged visit: someone who scrolled, clicked, or stayed. Vercel's visitor
// count cannot separate people from automation, because its own analytics is a
// client script and the traffic inflating the count executes JavaScript to be
// counted at all. Reading behaviour is the part that is expensive to fake, so
// this is the visitor number that is actually ours.
const VISIT_DAY_KEY = (d) => `visit:day:${d}`  // hash: 'engaged' -> count
const VISIT_PAGES_KEY = 'visit:pages'          // sorted set: path -> engaged count

// Referrals from the site to itself are ordinary navigation, not a referral.
const OWN_HOSTS = new Set(['lftw.dev', 'www.lftw.dev', 'localhost'])

// Generous: a reader clicking through several pages from an aggregator is
// normal, and this costs no upstream API call. It exists to bound a script
// posting junk, not to ration real traffic.
const RATE_PREFIX = 'ref:rl:'
const RATE_LIMIT = 200

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // sendBeacon posts a Blob, which arrives as a string on some runtimes and a
  // parsed object on others.
  let ref, path, type
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ref = body?.ref
    path = body?.path
    type = body?.type
  } catch {
    res.status(204).end()
    return
  }

  const landedPath = typeof path === 'string' && path.startsWith('/') ? path.slice(0, 200) : '/'

  if (type === 'engaged') {
    try {
      const rl = await checkRateLimit(req, { prefix: RATE_PREFIX, limit: RATE_LIMIT })
      if (rl.allowed) {
        const day = new Date().toISOString().slice(0, 10)
        await Promise.all([
          redis.hincrby(VISIT_DAY_KEY(day), 'engaged', 1),
          redis.zincrby(VISIT_PAGES_KEY, 1, landedPath)
        ])
      }
    } catch (err) {
      console.error('[referrer] engagement log error:', err)
    }
    res.status(204).end()
    return
  }

  if (typeof ref !== 'string' || !ref || ref.length > 255) {
    res.status(204).end()
    return
  }

  // The client sends a hostname, never a full URL: a referring URL can carry
  // the visitor's search terms, and the hostname is all that is needed to tell
  // one source from another.
  const host = ref.toLowerCase().replace(/^www\./, '')
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) || OWN_HOSTS.has(host) || OWN_HOSTS.has(`www.${host}`)) {
    res.status(204).end()
    return
  }

  try {
    const rl = await checkRateLimit(req, { prefix: RATE_PREFIX, limit: RATE_LIMIT })
    if (!rl.allowed) {
      res.status(204).end()
      return
    }

    const day = new Date().toISOString().slice(0, 10)
    await Promise.all([
      redis.hincrby(DAY_KEY(day), host, 1),
      redis.zincrby(TOTALS_KEY, 1, host),
      redis.lpush(RECENT_KEY, JSON.stringify({ t: new Date().toISOString(), host, path: landedPath }))
    ])
    await redis.ltrim(RECENT_KEY, 0, RECENT_MAX - 1)
  } catch (err) {
    // Losing a referral record is not worth reporting to the visitor, whose
    // page has already rendered.
    console.error('[referrer] log error:', err)
  }

  // Nothing to return, and nothing the page does with it.
  res.status(204).end()
}
