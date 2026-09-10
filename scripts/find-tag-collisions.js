#!/usr/bin/env node
/**
 * find-tag-collisions.js
 *
 * Finds tags that are the same concept spelled differently, so their posts end up
 * split across two half-empty /tags/ pages instead of one.
 *
 * Two tags collide when they are identical after stripping every non-alphanumeric
 * character: `qwen-3-8-27b` and `qwen3-8-27b` both reduce to `qwen3827b`, so the
 * nine posts carrying them are really nine posts about one model.
 *
 * The merge is NOT applied automatically. A blanket "insert a hyphen between letters
 * and digits" rule would rewrite `gpt4all` to `gpt-4-all` and `lfm2` to `lfm-2`,
 * corrupting real product names — the same trap documented in _data/tag-aliases.js
 * for the -isation/-ization rule. So this script only reports; a human copies the
 * survivors into the EXPLICIT map in _data/tag-aliases.js.
 *
 * Case-only pairs ("MediaTek" vs "mediatek") are excluded: the tagPages collection
 * lowercases slugs and every template renders `{{ tag | lower }}` in the href, so
 * those already resolve to one page.
 *
 * SECOND PASS — synonyms that share no spelling.
 *
 * The rule above only finds tags that look alike, so it cannot see that `mcp` and
 * `model-context-protocol` name one protocol: they share no characters. Those splits
 * are found instead by how the tags are USED. Two tags that keep landing on the same
 * posts are one concept wearing two names, so the pass scores every pair by Jaccard
 * overlap (shared posts / posts carrying either) and reports the densest.
 *
 * The two passes differ in how much they can conclude, and are treated differently:
 *
 *   - An orthographic collision is a fact. `qwen3-8-27b` and `qwen-3-8-27b` cannot be
 *     two subjects. --check fails on these.
 *   - A Jaccard pair is a lead. High overlap proves the tags co-occur, never that they
 *     mean the same thing: `apple` and `apple-silicon` overlap heavily and are a
 *     company and a chip family. --check IGNORES these, because a permanent supply of
 *     related-but-distinct pairs would wedge CI shut forever.
 *
 * So the second pass asks a human the one question it cannot answer itself: SAME
 * REFERENT, or merely related? Merging on relatedness rather than identity is how an
 * open vocabulary collapses into a generic one. Pairs already judged distinct go in
 * REVIEWED_DISTINCT below so they stop being re-reported.
 *
 * Usage:
 *   node scripts/find-tag-collisions.js           # both passes
 *   node scripts/find-tag-collisions.js --check   # exit 1 on orthographic collisions only
 *   node scripts/find-tag-collisions.js --spelling-only   # skip the Jaccard pass
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

const { canonicalTag } = require("../_data/tag-aliases.js");
const suppressedTags = require("../_data/suppressed-tags.js");

const POSTS_DIR = path.resolve(__dirname, "../content/posts");
const checkMode = process.argv.includes("--check");
const spellingOnly = process.argv.includes("--spelling-only");

// The forced-choice content-type axis from the extraction prompt in smart-retag.py.
// Every post carries exactly one, so they co-occur with everything and would flood the
// Jaccard pass. They also produce a specific false positive worth naming: benchmarks is
// a subject, benchmark-report is a content-type, and they overlap enough to look like a
// merge until you notice they answer different questions.
const CONTENT_TYPES = new Set([
  "news", "tutorial", "analysis", "release", "showcase",
  "benchmark-report", "opinion", "comparison",
]);

// Pairs whose overlap has been checked and judged to be two different things. Keeping
// them here is what stops the report degrading into noise that nobody reads.
const REVIEWED_DISTINCT = new Set([
  "apple|apple-silicon",            // a company and a chip family
  "consumer-gpu|quantization",      // both common; co-occurrence is volume, not identity
  "consumer-gpu|inference-optimization",
  "memory-optimization|quantization",     // quantizing is one way to save memory, not the same
  "model-optimization|quantization",
  "agent-orchestration|agents",     // orchestration is a sub-topic of agents
  "inference-speed|performance",    // speed is one dimension of performance
  "benchmarking|llama",
  "benchmarking|model-comparison",
  "benchmarking|qwen",
  // Judged 2026-09-10. Each of these was nominated by co-occurrence alone and is a
  // merge that would have destroyed a real distinction — kept here as the worked
  // example of why this pass reports leads rather than suggestions.
  "apple-silicon|mlx",              // hardware vs the framework that targets it
  "llama-cpp|ollama",               // two projects; ollama embeds llama.cpp
  "llama|qwen",                     // two model families that get benchmarked together
  "consumer-gpu|memory-optimization",
  "developer-tooling|production-ops",
]);

const MIN_TAG_POSTS = 20; // below this, Jaccard is too noisy to act on
const MIN_SHARED_POSTS = 10;
const MIN_JACCARD = 0.15;

function collect() {
  const counts = new Map();
  const postTagSets = [];
  const files = glob.sync("**/*.md", { cwd: POSTS_DIR, absolute: true });
  for (const file of files) {
    const { data } = matter(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(data.tags)) continue;
    const tags = new Set();
    for (const raw of data.tags) {
      if (typeof raw !== "string") continue;
      // Compare what the site actually renders: lowercased and alias-resolved.
      const tag = canonicalTag(raw.toLowerCase());
      counts.set(tag, (counts.get(tag) || 0) + 1);
      // Suppressed tags render nowhere, so they cannot be a split page.
      if (!suppressedTags.has(tag) && !CONTENT_TYPES.has(tag)) tags.add(tag);
    }
    if (tags.size) postTagSets.push(tags);
  }
  return { counts, postTagSets };
}

// Tags that keep landing on the same posts, scored by Jaccard overlap.
function findSynonymCandidates(postTagSets) {
  const freq = new Map();
  for (const tags of postTagSets) {
    for (const t of tags) freq.set(t, (freq.get(t) || 0) + 1);
  }

  const shared = new Map();
  for (const tags of postTagSets) {
    const live = [...tags].filter((t) => freq.get(t) >= MIN_TAG_POSTS).sort();
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const key = `${live[i]}|${live[j]}`;
        shared.set(key, (shared.get(key) || 0) + 1);
      }
    }
  }

  const candidates = [];
  for (const [key, both] of shared) {
    if (both < MIN_SHARED_POSTS) continue;
    if (REVIEWED_DISTINCT.has(key)) continue;
    const [a, b] = key.split("|");
    const jaccard = both / (freq.get(a) + freq.get(b) - both);
    if (jaccard < MIN_JACCARD) continue;
    candidates.push({ a, b, both, jaccard, countA: freq.get(a), countB: freq.get(b) });
  }
  return candidates.sort((x, y) => y.jaccard - x.jaccard);
}

function reportSynonyms(postTagSets) {
  const candidates = findSynonymCandidates(postTagSets);

  console.log(`\n${"-".repeat(70)}`);
  if (!candidates.length) {
    console.log("No unreviewed synonym candidates.");
    return;
  }

  console.log(
    `${candidates.length} synonym candidate${candidates.length === 1 ? "" : "s"} ` +
      `by co-occurrence (J >= ${MIN_JACCARD}, >= ${MIN_SHARED_POSTS} shared posts).\n`
  );
  console.log("SAME REFERENT? If yes, add to SAME_REFERENT in _data/tag-aliases.js.");
  console.log("If merely related, add the pair to REVIEWED_DISTINCT in this script.");
  console.log("Beware chaining: canonicalTag does ONE lookup, so re-point any existing");
  console.log("alias that targets a slug you are about to alias away.\n");

  for (const c of candidates) {
    console.log(
      `  ${c.a}(${c.countA})  +  ${c.b}(${c.countB})` +
        `   ${c.both} shared, J=${c.jaccard.toFixed(2)}`
    );
    // Deliberately NOT a paste-ready line with a direction already chosen. Once the
    // real synonyms have been merged, most of what remains at any threshold is
    // related-but-distinct, and a confident-looking suggestion invites exactly the
    // wrong merge: co-occurrence alone once nominated "llama": "qwen" and
    // "llama-cpp": "ollama", which are two model families and two projects.
    console.log(`      same referent? -> pick a direction:  "${c.a}": "${c.b}"  |  "${c.b}": "${c.a}"`);
    console.log(`      different things? -> REVIEWED_DISTINCT += "${c.a}|${c.b}"\n`);
  }
}

function main() {
  const { counts, postTagSets } = collect();
  const groups = new Map();

  for (const [tag, count] of counts) {
    const key = tag.replace(/[^a-z0-9]/g, "");
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ tag, count });
  }

  const collisions = [...groups.values()]
    .filter((variants) => variants.length > 1)
    .map((variants) => variants.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)))
    .sort((a, b) => sum(b) - sum(a));

  if (!collisions.length) {
    console.log(`No spelling collisions. ${counts.size} unique tags.`);
    if (!spellingOnly) reportSynonyms(postTagSets);
    return;
  }

  const splitPosts = collisions.reduce((n, v) => n + sum(v), 0);
  console.log(
    `${collisions.length} collision groups across ${counts.size} unique tags ` +
      `— ${splitPosts} post-tags split over ${collisions.reduce((n, v) => n + v.length, 0)} pages.\n`
  );

  console.log("Suggested additions to EXPLICIT in _data/tag-aliases.js");
  console.log("(most frequent variant wins; verify against vendor spelling before pasting)\n");

  for (const variants of collisions) {
    const [winner, ...losers] = variants;
    const detail = variants.map((v) => `${v.tag}(${v.count})`).join(" + ");
    console.log(`  // ${detail}`);
    for (const loser of losers) {
      console.log(`  "${loser.tag}": "${winner.tag}",`);
    }
  }

  if (!spellingOnly) reportSynonyms(postTagSets);

  // Only spelling collisions gate CI. See the header: a Jaccard pair is a lead for a
  // human, and there is always a fresh supply of related-but-distinct pairs.
  if (checkMode) {
    console.error(`\nFAIL: ${collisions.length} unaliased tag collisions.`);
    process.exit(1);
  }
}

function sum(variants) {
  return variants.reduce((n, v) => n + v.count, 0);
}

main();
