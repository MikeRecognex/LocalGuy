import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const WINDOW = 3600 // 1 hour in seconds
const LIMIT = 10
const LOG_KEY = 'clinic:log'
const LOG_MAX = 1000

// Answers and ratings live in a per-query hash rather than in the log list,
// because a list entry cannot be updated by id: the question is recorded before
// the LLM runs, and the answer and rating arrive afterwards. The list stays the
// chronological index; the hash holds everything learned later.
const QUERY_KEY = (id) => `clinic:q:${id}`
const QUERY_TTL = 60 * 60 * 24 * 90 // 90 days

// Answer bodies are bulky and only useful while the corresponding article set is
// current, so they expire. The question list is deliberately permanent.
export const RATING_VALUES = new Set([1, -1])

// Ids are concatenated into a Redis key, so anything reaching that path is
// checked against this first.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

// Callers pass their own bucket. /ask/ spends a Groq call per request and is
// held to LIMIT; retrieval-only callers cost one Upstash query and get their
// own, looser prefix so the two cannot exhaust each other.
export async function checkRateLimit(req, { prefix = 'clinic:rl:', limit = LIMIT } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || 'unknown'

  const key = `${prefix}${ip}`
  const count = await redis.incr(key)

  // Set TTL on first request in window
  if (count === 1) {
    await redis.expire(key, WINDOW)
  }

  const ttl = await redis.ttl(key)
  const remaining = Math.max(0, limit - count)
  const reset = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : WINDOW)

  // Fire abuse alert on first block
  if (count === limit + 1) {
    fireAbuseAlert(ip, count).catch(() => {})
  }

  return {
    allowed: count <= limit,
    remaining,
    reset,
    ip
  }
}

// Returns the id the answer and any rating will be filed under. Entries written
// before this field existed simply have no id and join to nothing.
export async function logQuery(ip, question, rateLimited) {
  const id = randomUUID()
  const partialIp = ip.replace(/\.\d+$/, '.xxx') // mask last octet
  const entry = JSON.stringify({
    t: new Date().toISOString(),
    ip: partialIp,
    q: question.slice(0, 500),
    blocked: rateLimited,
    id
  })
  // No TTL: the log is a long-run record of what people ask, so it should not
  // expire during quiet weeks. ltrim caps it at LOG_MAX, so it stays bounded.
  await redis.lpush(LOG_KEY, entry)
  await redis.ltrim(LOG_KEY, 0, LOG_MAX - 1)
  return id
}

// Files the answer against the question, so a rating can later be read as
// "this answer was wrong" rather than just "something about this question was".
export async function logAnswer(id, question, answer, sources) {
  const key = QUERY_KEY(id)
  await redis.hset(key, {
    q: question.slice(0, 500),
    answer: answer.slice(0, 4000),
    sources: JSON.stringify((sources || []).map((s) => s.url).filter(Boolean)),
    answered_at: new Date().toISOString()
  })
  await redis.expire(key, QUERY_TTL)
}

// Rejects an unknown id rather than creating the key, so the endpoint cannot be
// used to write arbitrary entries. Returns false when there is nothing to rate.
export async function logRating(id, rating) {
  const key = QUERY_KEY(id)
  if (!(await redis.exists(key))) return false
  await redis.hset(key, { rating, rated_at: new Date().toISOString() })
  return true
}

async function fireAbuseAlert(ip, count) {
  console.warn(`[clinic] Rate limit exceeded: ${ip} (${count} requests)`)

  const webhookUrl = process.env.CLINIC_ABUSE_WEBHOOK
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `[Clinic] Rate limit exceeded: ${ip} (${count} requests in last hour)`
    })
  })
}
