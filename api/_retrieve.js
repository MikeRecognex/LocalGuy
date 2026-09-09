import { Index } from '@upstash/vector'

const vector = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN
})

export const TOP_K = 5

// Guides are outnumbered by news posts roughly 260:1, and cosine scores across
// this corpus are tightly bunched (~0.90-0.92 for a good match), so a guide
// loses its slot to near-duplicate news items even when it is the better
// answer. Guides are therefore queried separately and promoted when they come
// within this margin of the best overall hit. Measured gaps: a genuinely
// relevant guide sits ~0.02 behind the leader, an off-topic one ~0.075+.
export const GUIDE_PROMOTE_GAP = 0.03

export const KINDS = ['all', 'guides', 'posts']

function dedupe(hits, limit) {
  const results = []
  const seen = new Set()
  for (const r of hits) {
    const key = r.metadata?.url || r.id
    if (seen.has(key)) continue
    seen.add(key)
    results.push(r)
    if (results.length === limit) break
  }
  return results
}

/**
 * Vector search over the published corpus. Raw text is sent to Upstash, which
 * embeds it with its built-in model.
 *
 * `kind` is checked against KINDS before it reaches the filter string — it
 * arrives from a query parameter, and Upstash filters are a query language.
 */
export async function retrieve({ query, topK = TOP_K, kind = 'all' }) {
  if (!KINDS.includes(kind)) throw new Error(`invalid kind: ${kind}`)

  if (kind !== 'all') {
    const hits = await vector.query({
      data: query,
      topK,
      includeMetadata: true,
      filter: `kind = '${kind}'`
    })
    return dedupe(hits, topK)
  }

  const [general, guideHits] = await Promise.all([
    vector.query({ data: query, topK, includeMetadata: true }),
    vector.query({ data: query, topK: 2, includeMetadata: true, filter: "kind = 'guides'" })
  ])

  const topScore = general[0]?.score ?? 0
  const promoted = guideHits.filter(g => topScore - g.score <= GUIDE_PROMOTE_GAP)
  return dedupe([...promoted, ...general], topK)
}
