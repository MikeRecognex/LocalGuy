#!/usr/bin/env node
/**
 * retag-posts.js
 *
 * Surgically replaces ONLY the `tags:` block in each post's frontmatter
 * using the canonical taxonomy from _data/tag-taxonomy.js.
 * All other frontmatter fields are left completely untouched.
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const taxonomy = require("../_data/tag-taxonomy.js");

const POSTS_DIR = path.resolve(__dirname, "../content/posts");

const aliases = {
  benchmark: "benchmarks",
  "edge-inference": "edge-deployment",
  "on-device": "edge-deployment",
  "open-weights": "open-source",
};

function extractTags(title, description, body) {
  // Strip URLs and markdown link targets to avoid false positives
  const cleaned = body
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

  const searchText = [title || "", description || "", cleaned].join(" ");
  const found = new Set();

  for (const entries of Object.values(taxonomy)) {
    for (const [slug, patterns] of Object.entries(entries)) {
      for (const pattern of patterns) {
        pattern.lastIndex = 0;
        if (pattern.test(searchText)) {
          found.add(slug);
          break;
        }
      }
    }
  }

  return found;
}

/**
 * Extract title and description from raw frontmatter text
 * without parsing/rebuilding the entire frontmatter.
 */
function extractField(fmText, field) {
  const re = new RegExp(`^${field}:\\s*(.*)`, "m");
  const m = fmText.match(re);
  if (!m) return "";
  // Strip surrounding quotes
  return m[1].replace(/^["']|["']$/g, "").trim();
}

/**
 * Extract existing tags from raw frontmatter text.
 */
function extractExistingTags(fmText) {
  const tags = [];
  const lines = fmText.split("\n");
  let inTags = false;
  for (const line of lines) {
    if (/^tags:\s*$/.test(line)) {
      inTags = true;
      continue;
    }
    if (inTags) {
      const item = line.match(/^\s+-\s+(.+)/);
      if (item) {
        tags.push(item[1].replace(/^["']|["']$/g, ""));
      } else {
        break;
      }
    }
  }
  return tags;
}

// Main
const files = glob.sync("**/*.md", { cwd: POSTS_DIR, absolute: true });
let changed = 0;
let unchanged = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  // Match frontmatter
  const fmMatch = content.match(/^(---\n)([\s\S]*?\n)(---)/);
  if (!fmMatch) {
    console.log(`  SKIP (no frontmatter): ${path.relative(POSTS_DIR, file)}`);
    continue;
  }

  const fmText = fmMatch[2];
  const body = content.slice(fmMatch[0].length);

  const title = extractField(fmText, "title");
  const description = extractField(fmText, "description");
  const existingTags = extractExistingTags(fmText);

  // Extract taxonomy tags from content
  const autoTags = extractTags(title, description, body);

  // Preserve special tags from existing frontmatter
  const preserveTags = ["daily-digest"];
  for (const t of existingTags) {
    if (preserveTags.includes(t)) {
      autoTags.add(t);
    }
  }

  // Apply aliases
  for (const [from, to] of Object.entries(aliases)) {
    if (autoTags.has(from)) {
      autoTags.delete(from);
      autoTags.add(to);
    }
  }

  const sortedTags = [...autoTags].sort();
  const oldSorted = [...existingTags].sort();

  // Check if tags actually changed
  const tagsChanged =
    sortedTags.length !== oldSorted.length ||
    sortedTags.some((t, i) => t !== oldSorted[i]);

  if (!tagsChanged) {
    unchanged++;
    continue;
  }

  // Build new tags block
  const newTagsBlock = "tags:\n" + sortedTags.map((t) => `  - ${t}`).join("\n");

  // Replace ONLY the tags block in the raw frontmatter text
  // Match "tags:\n  - ...\n  - ...\n" up to the next non-list-item line
  const tagsBlockRe = /^tags:\n(?:\s+-\s+.+\n?)*/m;
  if (!tagsBlockRe.test(fmText)) {
    console.log(`  SKIP (no tags block): ${path.relative(POSTS_DIR, file)}`);
    continue;
  }

  const newFmText = fmText.replace(tagsBlockRe, newTagsBlock + "\n");
  const newContent = fmMatch[1] + newFmText + fmMatch[3] + body;

  fs.writeFileSync(file, newContent, "utf8");

  const rel = path.relative(POSTS_DIR, file);
  const added = sortedTags.filter((t) => !existingTags.includes(t));
  const removed = existingTags.filter((t) => !sortedTags.includes(t));
  console.log(`  ${rel}`);
  if (added.length) console.log(`    + ${added.join(", ")}`);
  if (removed.length) console.log(`    - ${removed.join(", ")}`);
  changed++;
}

console.log(`\nDone. ${changed} files updated, ${unchanged} unchanged.`);
