import { Index } from '@upstash/vector'
import { checkRateLimit } from './_ratelimit.js'

const vector = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN
})

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are the Local LLM Clinic, an expert assistant for LocalFTW — a community site about running AI models locally on your own hardware.

You answer questions about local LLM use-cases, hardware, deployment, tools, and techniques based on the site's published articles provided as context.

Rules:
- Answer concisely and practically (2-4 paragraphs max)
- Reference specific articles using [1], [2] etc. notation matching the source order
- If the context articles don't cover the question well, say so honestly
- Stay focused on local/on-device AI topics
- Never make up article titles or URLs — only reference what's in the context
- Be opinionated where the articles support a clear recommendation`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Parse body
  let question
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    question = body?.question?.trim()
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  // Validate question
  if (!question || question.length < 5) {
    res.status(400).json({ error: 'Question must be at least 5 characters' })
    return
  }
  if (question.length > 500) {
    res.status(400).json({ error: 'Question must be 500 characters or fewer' })
    return
  }

  // Rate limit
  const rl = await checkRateLimit(req)
  res.setHeader('X-RateLimit-Remaining', rl.remaining)
  res.setHeader('X-RateLimit-Reset', rl.reset)

  if (!rl.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded. Try again later.',
      remaining: 0,
      reset: rl.reset
    })
    return
  }

  try {
    // Vector search — send raw text, Upstash embeds it with built-in model
    const results = await vector.query({
      data: question,
      topK: 5,
      includeMetadata: true
    })

    if (!results || results.length === 0) {
      res.status(200).json({
        answer: "I couldn't find any relevant articles for your question. Try rephrasing, or browse the site's posts and guides for inspiration.",
        sources: [],
        remaining: rl.remaining
      })
      return
    }

    // Build context from top results
    const sources = results.map((r, i) => ({
      num: i + 1,
      title: r.metadata?.title || 'Untitled',
      url: r.metadata?.url || '#',
      description: r.metadata?.description || '',
      score: r.score
    }))

    const contextBlock = sources.map(s =>
      `[${s.num}] "${s.title}"\n${s.description}`
    ).join('\n\n')

    // Groq LLM call
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Context articles:\n\n${contextBlock}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.4,
        max_tokens: 1024
      })
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('[clinic] Groq error:', groqRes.status, errText)
      res.status(502).json({ error: 'LLM service temporarily unavailable' })
      return
    }

    const groqData = await groqRes.json()
    const answer = groqData.choices?.[0]?.message?.content || 'No response generated.'

    res.status(200).json({
      answer,
      sources: sources.map(s => ({ title: s.title, url: s.url })),
      remaining: rl.remaining
    })
  } catch (err) {
    console.error('[clinic] Error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.', debug: err.message })
  }
}
