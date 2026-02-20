#!/usr/bin/env node
/**
 * retag-posts.js
 *
 * Rewrites the frontmatter `tags` field in every post markdown file
 * using the canonical taxonomy from _data/tag-taxonomy.js.
 *
 * Preserves: daily-digest, any date-folder tags, status, title, etc.
 * Replaces: the tags array with taxonomy-matched tags.
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
        // Reset lastIndex for sticky/global regexes
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

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = match[1];
  const body = content.slice(match[0].length);

  // Simple YAML parser for our known fields
  const data = {};
  let currentKey = null;
  let currentList = null;

  for (const line of fm.split("\n")) {
    const listItem = line.match(/^\s+-\s+(.+)/);
    const keyVal = line.match(/^(\w[\w-]*):\s*(.*)/);

    if (listItem && currentKey) {
      if (!currentList) currentList = [];
      // Strip quotes
      currentList.push(listItem[1].replace(/^["']|["']$/g, ""));
    } else {
      // Save previous list
      if (currentKey && currentList) {
        data[currentKey] = currentList;
        currentList = null;
      }
      if (keyVal) {
        currentKey = keyVal[1];
        const val = keyVal[2].trim();
        if (val === "") {
          // Might be a list starting on next line
          currentList = [];
        } else {
          data[currentKey] = val.replace(/^["']|["']$/g, "");
          currentList = null;
        }
      }
    }
  }
  // Final flush
  if (currentKey && currentList) {
    data[currentKey] = currentList;
  }

  return { data, body, raw: fm };
}

function buildFrontmatter(data, originalTags, newTags) {
  // Rebuild frontmatter preserving field order
  const lines = [];
  lines.push("---");
  lines.push(`title: "${data.title.replace(/"/g, '\\"')}"`);
  lines.push(`date: ${data.date}`);
  lines.push(`description: ${data.description}`);
  lines.push("tags:");
  for (const tag of newTags) {
    lines.push(`  - ${tag}`);
  }
  if (data.status) {
    lines.push(`status: ${data.status}`);
  }
  lines.push("---");
  return lines.join("\n");
}

// Main
const files = glob.sync("**/*.md", { cwd: POSTS_DIR, absolute: true });
let changed = 0;
let unchanged = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    console.log(`  SKIP (no frontmatter): ${path.relative(POSTS_DIR, file)}`);
    continue;
  }

  const { data, body } = parsed;
  const existingTags = Array.isArray(data.tags) ? data.tags : [];

  // Extract taxonomy tags from content
  const autoTags = extractTags(data.title, data.description, body);

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

  // Rebuild the file
  const newFm = buildFrontmatter(data, existingTags, sortedTags);
  const newContent = newFm + body;
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
