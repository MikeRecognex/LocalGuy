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

// Upstash embeds the raw query with a general-purpose model that has no useful
// representation of this domain's acronyms: "STT" on its own scored 0.804,
// which is the same band as a deliberate nonsense string, and returned five
// generic "best local LLM" posts while 38 files on Whisper sat unreturned.
// "TTS" failed identically, and so did the ordinary word "transcription" —
// the "best local model for ..." framing dominates the sentence unless
// something in it overlaps lexically with the target posts.
//
// Appending the words an author would actually have written fixes all three
// (0/5 -> 5/5 relevant) and left every already-working query unchanged.
// Expansion is additive: the original wording stays, so nothing is lost if a
// term is ambiguous.
const EXPANSIONS = {
  stt: 'speech to text transcription whisper',
  asr: 'automatic speech recognition transcription',
  tts: 'text to speech voice synthesis',
  transcription: 'speech to text',
  transcribe: 'speech to text',
  ocr: 'optical character recognition document vision',
  vlm: 'vision language multimodal image',
  rag: 'retrieval augmented generation',
  moe: 'mixture of experts',
}

// Note: speech-to-text and text-to-speech are near-identical to an embedding
// model, so an STT query still surfaces some TTS posts. That is a large
// improvement on generic chat-model posts, not a clean separation.
export function expandQuery(query) {
  const extra = []
  for (const [term, synonyms] of Object.entries(EXPANSIONS)) {
    if (!new RegExp(`\\b${term}\\b`, 'i').test(query)) continue
    for (const word of synonyms.split(' ')) {
      // Skip anything the query already says, so a phrase is not weighted
      // twice simply because two acronyms expand to overlapping text.
      if (new RegExp(`\\b${word}\\b`, 'i').test(query)) continue
      if (!extra.includes(word)) extra.push(word)
    }
  }
  return extra.length ? `${query} ${extra.join(' ')}` : query
}

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

  // Expand once, so the general and guide passes are embedded identically and
  // the promotion margin below still compares like with like.
  const q = expandQuery(query)

  if (kind !== 'all') {
    const hits = await vector.query({
      data: q,
      topK,
      includeMetadata: true,
      filter: `kind = '${kind}'`
    })
    return dedupe(hits, topK)
  }

  const [general, guideHits] = await Promise.all([
    vector.query({ data: q, topK, includeMetadata: true }),
    vector.query({ data: q, topK: 2, includeMetadata: true, filter: "kind = 'guides'" })
  ])

  const topScore = general[0]?.score ?? 0
  const promoted = guideHits.filter(g => topScore - g.score <= GUIDE_PROMOTE_GAP)
  return dedupe([...promoted, ...general], topK)
}
