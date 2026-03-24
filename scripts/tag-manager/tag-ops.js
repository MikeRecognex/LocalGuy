/**
 * tag-ops.js — Pure functions for reading and surgically editing tags in post frontmatter.
 * Reuses the proven regex approach from retag-posts.js.
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const POSTS_DIR = path.resolve(__dirname, "../../content/posts");
const taxonomy = require("../../_data/tag-taxonomy.js");

/** Regex that matches the entire tags: block in frontmatter */
const TAGS_BLOCK_RE = /^tags:\n(?:\s+-\s+.+\n?)*/m;

/** Extract existing tags from raw frontmatter text */
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

/** Get all markdown files in content/posts */
function getAllPostFiles() {
  return glob.sync("**/*.md", { cwd: POSTS_DIR, absolute: true });
}

/** Build a map of tag → { count, posts: [{ file, title }] } */
function getAllTags() {
  const files = getAllPostFiles();
  const tagMap = {};

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const fmMatch = content.match(/^(---\n)([\s\S]*?\n)(---)/);
    if (!fmMatch) continue;

    const fmText = fmMatch[2];
    const tags = extractExistingTags(fmText);
    const titleMatch = fmText.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(file, ".md");
    const rel = path.relative(POSTS_DIR, file);

    for (const tag of tags) {
      if (!tagMap[tag]) tagMap[tag] = { count: 0, posts: [] };
      tagMap[tag].count++;
      tagMap[tag].posts.push({ file: rel, title });
    }
  }

  return tagMap;
}

/** Categorize a tag using the taxonomy */
function categorizeTag(tag) {
  for (const [category, entries] of Object.entries(taxonomy)) {
    if (tag in entries) return category;
  }
  return "uncategorized";
}

/** Check if a tag is a classifier (from taxonomy) */
function isClassifier(tag) {
  for (const entries of Object.values(taxonomy)) {
    if (tag in entries) return true;
  }
  return false;
}

/**
 * Surgically replace the tags block in a single file's frontmatter.
 * Returns true if file was modified, false otherwise.
 */
function replaceTagsInFile(filePath, transformFn) {
  const content = fs.readFileSync(filePath, "utf8");
  const fmMatch = content.match(/^(---\n)([\s\S]*?\n)(---)/);
  if (!fmMatch) return false;

  const fmText = fmMatch[2];
  if (!TAGS_BLOCK_RE.test(fmText)) return false;

  const existingTags = extractExistingTags(fmText);
  const newTags = transformFn(existingTags);
  if (!newTags) return false;

  const dedupedSorted = [...new Set(newTags)].sort();

  // Check if tags actually changed
  const oldSorted = [...existingTags].sort();
  if (
    dedupedSorted.length === oldSorted.length &&
    dedupedSorted.every((t, i) => t === oldSorted[i])
  ) {
    return false;
  }

  const newTagsBlock =
    "tags:\n" + dedupedSorted.map((t) => `  - ${t}`).join("\n");
  const newFmText = fmText.replace(TAGS_BLOCK_RE, newTagsBlock + "\n");
  const newContent = fmMatch[1] + newFmText + fmMatch[3] + content.slice(fmMatch[0].length);

  fs.writeFileSync(filePath, newContent, "utf8");
  return true;
}

/** Rename a tag across all posts. Returns count of modified files. */
function renameTag(from, to) {
  const files = getAllPostFiles();
  let modified = 0;

  for (const file of files) {
    const changed = replaceTagsInFile(file, (tags) => {
      if (!tags.includes(from)) return null;
      return tags.map((t) => (t === from ? to : t));
    });
    if (changed) modified++;
  }

  return modified;
}

/** Merge multiple source tags into one canonical tag. Returns count of modified files. */
function mergeTags(sources, canonical) {
  const sourceSet = new Set(sources);
  const files = getAllPostFiles();
  let modified = 0;

  for (const file of files) {
    const changed = replaceTagsInFile(file, (tags) => {
      if (!tags.some((t) => sourceSet.has(t))) return null;
      return tags.map((t) => (sourceSet.has(t) ? canonical : t));
    });
    if (changed) modified++;
  }

  return modified;
}

/** Delete a tag from all posts. Returns count of modified files. */
function deleteTag(tag) {
  const files = getAllPostFiles();
  let modified = 0;

  for (const file of files) {
    const changed = replaceTagsInFile(file, (tags) => {
      if (!tags.includes(tag)) return null;
      return tags.filter((t) => t !== tag);
    });
    if (changed) modified++;
  }

  return modified;
}

/** Get posts for a specific tag */
function getPostsForTag(tag) {
  const files = getAllPostFiles();
  const posts = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const fmMatch = content.match(/^(---\n)([\s\S]*?\n)(---)/);
    if (!fmMatch) continue;

    const fmText = fmMatch[2];
    const tags = extractExistingTags(fmText);
    if (!tags.includes(tag)) continue;

    const titleMatch = fmText.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(file, ".md");
    posts.push({ file: path.relative(POSTS_DIR, file), title });
  }

  return posts;
}

module.exports = {
  getAllTags,
  categorizeTag,
  isClassifier,
  renameTag,
  mergeTags,
  deleteTag,
  getPostsForTag,
  POSTS_DIR,
};
