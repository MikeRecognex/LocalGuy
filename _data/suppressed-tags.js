/**
 * Tags that exist in post frontmatter but must never be rendered or given a page.
 *
 * Removing a pattern from tag-taxonomy.js only stops NEW matches. Roughly 1,900 posts
 * already carry these words in their frontmatter `tags:` and the computed-tags function
 * unions frontmatter in, so they need suppressing explicitly.
 *
 * The test applied here: does the tag narrow the corpus? A tag carried by a quarter or
 * more of every post on the site describes the site, not the post, and no reader can use
 * it to find anything. Measured over 1,909 posts.
 */

// Forced-choice classifier axes from scripts/smart-retag.py. The prompt demanded
// "exactly 1" of each per post, so the model supplied one whether or not the text
// justified it and defaulted to the same value nearly every time: bullish 70%,
// developer 70%, intermediate 67%. The prompt no longer emits these; this clears
// the ones already written to disk.
const DEGENERATE_AXES = [
  // sentiment
  "bullish", "cautious", "neutral",
  // audience
  "developer", "enterprise", "hobbyist", "researcher", "business",
  // technical-depth
  "beginner-friendly", "intermediate", "advanced",
];

// Restatements of the site's premise. Every post here is about running models locally,
// so "runs locally" cannot distinguish one post from another. Kept as separate entries
// rather than canonicalised because the destination tag would be suppressed anyway.
const SITE_PREMISE = [
  "open-source", "open-weights", "open-source-ai",
  "edge-device", "edge-inference", "edge-deployment", "edge-computing", "edge-ai",
  "local-deployment", "local-inference", "local-llm-deployment", "local-llms",
  "on-device", "on-device-ai", "on-device-inference", "on-device-deployment",
  "offline-deployment", "offline-inference", "offline-ai",
  "self-hosted", "self-hosting", "self-hosted-ai",
  "privacy", "data-privacy", "privacy-compliance", "privacy-preserving-ai",
];

// Too vague to act as a destination, and each above the 25% line.
const NON_DISCRIMINATING = [
  "hardware",     // 26% — every hardware post also carries a specific chip or tier tag
  "inference",    // ubiquitous on a local-inference site
  "daily-digest", // 71% — provenance of the ingest run, not a subject
];

module.exports = new Set([...DEGENERATE_AXES, ...SITE_PREMISE, ...NON_DISCRIMINATING]);
