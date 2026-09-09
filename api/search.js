import { retrieve, KINDS } from './_retrieve.js'
import { checkRateLimit } from './clinic/_ratelimit.js'

const SITE_URL = 'https://www.lftw.dev'

const MIN_QUERY = 3
const MAX_QUERY = 500
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 20
const SNIPPET_CHARS = 400

// Retrieval costs one Upstash query and no LLM call, so this bucket is far
// looser than the 10/hour on /ask/. Separate prefix: agent traffic here must
// not consume a reader's allowance there.
const RATE_PREFIX = 'search:rl:'
const RATE_LIMIT = 60

// No LLM sees this text, so the prompt-injection stripping in ask.js is not
// needed. Control characters and tags are removed only to keep the echoed
// `query` field safe for whatever renders it.
function sanitize(q) {
  return q
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function absolute(url) {
  if (!url || url === '#') return null
  return url.startsWith('http') ? url : `${SITE_URL}${url}`
}

export default async function handler(req, res) {
  // Public, uncredentialled, read-only — the point is that anything can call it.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const rawQuery = typeof req.query?.q === 'string' ? req.query.q : ''
  const query = sanitize(rawQuery)

  if (query.length < MIN_QUERY) {
    res.status(400).json({ error: `q must be at least ${MIN_QUERY} characters` })
    return
  }
  if (query.length > MAX_QUERY) {
    res.status(400).json({ error: `q must be ${MAX_QUERY} characters or fewer` })
    return
  }

  const kind = typeof req.query?.kind === 'string' ? req.query.kind : 'all'
  if (!KINDS.includes(kind)) {
    res.status(400).json({ error: `kind must be one of: ${KINDS.join(', ')}` })
    return
  }

  const parsedLimit = parseInt(req.query?.limit, 10)
  const limit = Number.isNaN(parsedLimit)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)

  // Fail closed, matching ask.js: an outage of the limiter must not become a
  // way to hammer the vector index for free.
  let rl
  try {
    rl = await checkRateLimit(req, { prefix: RATE_PREFIX, limit: RATE_LIMIT })
  } catch (err) {
    console.error('[search] rate limit error:', err)
    res.status(503).json({ error: 'Service temporarily unavailable' })
    return
  }

  res.setHeader('X-RateLimit-Remaining', rl.remaining)
  res.setHeader('X-RateLimit-Reset', rl.reset)

  if (!rl.allowed) {
    res.status(429).json({ error: 'Rate limit exceeded', remaining: 0, reset: rl.reset })
    return
  }

  // Query text is deliberately not written to clinic:log — that log is the
  // record of what readers ask, and agent traffic would swamp it.

  try {
    const hits = await retrieve({ query, topK: limit, kind })

    const results = hits.map(r => ({
      title: r.metadata?.title || 'Untitled',
      url: absolute(r.metadata?.url),
      // 'guides' | 'posts' in the index; singular reads better in an API.
      kind: r.metadata?.kind === 'guides' ? 'guide' : 'post',
      date: r.metadata?.date || null,
      description: r.metadata?.description || '',
      snippet: (r.metadata?.body || r.metadata?.description || '').slice(0, SNIPPET_CHARS),
      score: r.score
    })).filter(r => r.url)

    // Repeat queries are answered by the edge, which is both the cost control
    // and the defence against the Upstash instance hibernating under load.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')

    // An empty result set is a valid answer, not a missing endpoint.
    res.status(200).json({ query, kind, count: results.length, results })
  } catch (err) {
    console.error('[search] Error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
