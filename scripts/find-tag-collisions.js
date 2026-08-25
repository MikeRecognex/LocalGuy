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
 * Usage:
 *   node scripts/find-tag-collisions.js           # report
 *   node scripts/find-tag-collisions.js --check   # exit 1 if any unaliased collision
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

const { canonicalTag } = require("../_data/tag-aliases.js");

const POSTS_DIR = path.resolve(__dirname, "../content/posts");
const checkMode = process.argv.includes("--check");

function collect() {
  const counts = new Map();
  const files = glob.sync("**/*.md", { cwd: POSTS_DIR, absolute: true });
  for (const file of files) {
    const { data } = matter(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(data.tags)) continue;
    for (const raw of data.tags) {
      if (typeof raw !== "string") continue;
      // Compare what the site actually renders: lowercased and alias-resolved.
      const tag = canonicalTag(raw.toLowerCase());
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return counts;
}

function main() {
  const counts = collect();
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
    console.log(`No tag collisions. ${counts.size} unique tags.`);
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

  if (checkMode) {
    console.error(`\nFAIL: ${collisions.length} unaliased tag collisions.`);
    process.exit(1);
  }
}

function sum(variants) {
  return variants.reduce((n, v) => n + v.count, 0);
}

main();
