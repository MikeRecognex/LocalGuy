import { checkRateLimit, logRating, RATING_VALUES, UUID_RE } from './_ratelimit.js'

// Rating costs no upstream API call — only a Redis write — so it gets its own,
// looser bucket. Sharing the /ask/ allowance would mean giving feedback used up
// the questions it was feedback about.
const RATE_PREFIX = 'clinic:rate:rl:'
const RATE_LIMIT = 60

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let id, rating
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    id = body?.id
    rating = body?.rating
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  // The id is concatenated into a Redis key, so it is checked against the UUID
  // shape before it is used for anything at all.
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }

  if (!RATING_VALUES.has(rating)) {
    res.status(400).json({ error: 'Rating must be 1 or -1' })
    return
  }

  // Fail closed, matching ask.js: an unreachable store must not become a way to
  // write without limit.
  let rl
  try {
    rl = await checkRateLimit(req, { prefix: RATE_PREFIX, limit: RATE_LIMIT })
  } catch (err) {
    console.error('[clinic] rate limit error:', err)
    res.status(503).json({ error: 'Service temporarily unavailable.' })
    return
  }

  res.setHeader('X-RateLimit-Remaining', rl.remaining)
  res.setHeader('X-RateLimit-Reset', rl.reset)

  if (!rl.allowed) {
    res.status(429).json({ error: 'Rate limit exceeded. Try again later.' })
    return
  }

  try {
    // An unknown id is refused rather than created: ids are unguessable and
    // handed only to the client that asked the question, so a miss means either
    // an expired answer or someone writing keys by hand.
    const recorded = await logRating(id, rating)
    if (!recorded) {
      res.status(404).json({ error: 'Unknown or expired answer' })
      return
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[clinic] rating error:', err)
    res.status(500).json({ error: 'Could not record rating' })
  }
}
