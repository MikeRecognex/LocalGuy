// Related-post scoring: IDF-weighted cosine similarity over each post's tag set.
//
// Counting shared tags does not work on this corpus. The most common tags are on
// most of the site and none of them describe subject matter: daily-digest (72% of
// posts) is a pipeline artifact, bullish (66%) is sentiment, developer (66%) is
// audience and intermediate (63%) is difficulty. Raw overlap therefore links every
// post to every other post through four tags that mean nothing, and the ranking is
// decided by whichever candidate happens to carry the most boilerplate.
//
// Weighting each shared tag by ln(N/df) inverts that: a tag on three quarters of the
// site contributes almost nothing, while a tag on four posts dominates the score.
// This is the same reason the vocabulary is left open rather than closed — the rare,
// specific slugs the classifier mints are exactly the ones that carry the signal, so
// the weighting has to be derived from the corpus rather than hand-maintained. It
// recalibrates on every build as new tags arrive.

// Tags on more than this share of the corpus are dropped before scoring.
//
// IDF already reduces them to near-zero weight, so this is not what makes the
// ranking work; it is a guard on the candidate-generation step below, which walks
// the posting list of every tag a post carries. Without a ceiling, the four
// boilerplate tags above would each contribute a posting list of ~1,300 posts and
// make the pass quadratic over the whole site for no gain in result quality.
const DF_CEILING = 0.25;

// A tag on a single post cannot relate anything to anything — it has no second post
// to point at. 70% of the vocabulary (4,211 of 6,039 tags) is in this state, an
// expected consequence of an open vocabulary, so this discards most of the tag list
// without discarding any signal.
const MIN_DF = 2;

// Two posts must share at least this many meaningful tags before they are linked.
//
// At 1, a single rare tag is enough, and because rare tags carry the highest IDF
// weight that lone coincidence also produces a high score. The pairs this produced
// were mostly classifier noise — one shared slug minted twice, with the posts
// otherwise unrelated. Requiring corroboration costs little: posts genuinely on the
// same subject share several specific tags, not one.
const MIN_SHARED_TAGS = 2;

const DEFAULT_LIMIT = 4;

/**
 * Build a url -> related items index.
 *
 * @param {Array} items      Eleventy collection items. Callers must pass only posts
 *                           that are actually published: this index becomes on-page
 *                           links, so anything included here and not built is a 404.
 * @param {Function} eligible Tag filter shared with the tagPages collection, so a
 *                           tag suppressed there cannot silently come back as a
 *                           relatedness signal here.
 * @param {number} limit     Maximum related posts per item.
 * @returns {Map<string, Array>} url -> related items, best first.
 */
function buildRelatedIndex(items, eligible, limit = DEFAULT_LIMIT) {
  const docs = items.map((item) => ({
    item,
    tags: [...new Set(eligible(item.data.tags).map((t) => t.toLowerCase()))],
  }));

  const n = docs.length;
  if (n === 0) return new Map();

  const df = new Map();
  for (const doc of docs) {
    for (const tag of doc.tags) df.set(tag, (df.get(tag) || 0) + 1);
  }

  const ceiling = n * DF_CEILING;
  const idf = new Map();
  for (const [tag, count] of df) {
    if (count < MIN_DF || count > ceiling) continue;
    idf.set(tag, Math.log(n / count));
  }

  // Keep only scoring tags, then precompute the vector norm so scores are cosine
  // similarities. Without normalising, a post carrying 20 tags outranks a closer
  // match carrying 6 on volume alone, and the heavily-tagged posts become everyone's
  // "related" list.
  const postings = new Map();
  for (let i = 0; i < n; i++) {
    const doc = docs[i];
    doc.tags = doc.tags.filter((t) => idf.has(t));
    let sumSquares = 0;
    for (const tag of doc.tags) {
      const w = idf.get(tag);
      sumSquares += w * w;
      if (!postings.has(tag)) postings.set(tag, []);
      postings.get(tag).push(i);
    }
    doc.norm = Math.sqrt(sumSquares);
  }

  const index = new Map();

  for (let i = 0; i < n; i++) {
    const doc = docs[i];
    if (doc.tags.length < MIN_SHARED_TAGS || doc.norm === 0) {
      index.set(doc.item.url, []);
      continue;
    }

    const dot = new Map();
    const shared = new Map();
    for (const tag of doc.tags) {
      const w = idf.get(tag);
      const weightSquared = w * w;
      for (const j of postings.get(tag)) {
        if (j === i) continue;
        dot.set(j, (dot.get(j) || 0) + weightSquared);
        shared.set(j, (shared.get(j) || 0) + 1);
      }
    }

    const scored = [];
    for (const [j, product] of dot) {
      if (shared.get(j) < MIN_SHARED_TAGS) continue;
      const other = docs[j];
      if (other.norm === 0) continue;
      scored.push({ j, score: product / (doc.norm * other.norm) });
    }

    // Ties are common — posts from one ingestion run share a tag set exactly. Sorting
    // on score alone leaves their order down to Map iteration, so the same input
    // produces a different page on the next build and every rebuild shows a diff.
    // Date then url makes it deterministic.
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const da = docs[a.j].item;
      const db = docs[b.j].item;
      if (db.date - da.date !== 0) return db.date - da.date;
      return da.url.localeCompare(db.url);
    });

    index.set(
      doc.item.url,
      scored.slice(0, limit).map(({ j }) => docs[j].item)
    );
  }

  return index;
}

module.exports = { buildRelatedIndex };
