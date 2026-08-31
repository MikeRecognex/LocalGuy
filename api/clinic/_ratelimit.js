import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const WINDOW = 3600 // 1 hour in seconds
const LIMIT = 10
const LOG_KEY = 'clinic:log'
const LOG_MAX = 1000

export async function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || 'unknown'

  const key = `clinic:rl:${ip}`
  const count = await redis.incr(key)

  // Set TTL on first request in window
  if (count === 1) {
    await redis.expire(key, WINDOW)
  }

  const ttl = await redis.ttl(key)
  const remaining = Math.max(0, LIMIT - count)
  const reset = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : WINDOW)

  // Fire abuse alert on first block
  if (count === LIMIT + 1) {
    fireAbuseAlert(ip, count).catch(() => {})
  }

  return {
    allowed: count <= LIMIT,
    remaining,
    reset,
    ip
  }
}

export async function logQuery(ip, question, rateLimited) {
  const partialIp = ip.replace(/\.\d+$/, '.xxx') // mask last octet
  const entry = JSON.stringify({
    t: new Date().toISOString(),
    ip: partialIp,
    q: question.slice(0, 500),
    blocked: rateLimited
  })
  // No TTL: the log is a long-run record of what people ask, so it should not
  // expire during quiet weeks. ltrim caps it at LOG_MAX, so it stays bounded.
  await redis.lpush(LOG_KEY, entry)
  await redis.ltrim(LOG_KEY, 0, LOG_MAX - 1)
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
