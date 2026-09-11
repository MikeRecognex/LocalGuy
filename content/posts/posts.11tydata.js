const fs = require("fs");
const path = require("path");
const taxonomy = require("../../_data/tag-taxonomy.js");
const suppressed = require("../../_data/suppressed-tags.js");
const { canonicalTag } = require("../../_data/tag-aliases.js");

// Reads `status` without parsing the whole document — this runs for every post
// at build start, before the data cascade has loaded any of them.
const statusOf = (p) => {
  try {
    const fm = fs.readFileSync(p, "utf8").match(/^---\n([\s\S]*?\n)---\n/);
    return fm ? (fm[1].match(/^status:\s*"?(\S+?)"?\s*$/m)?.[1] ?? "") : "";
  } catch {
    return "";
  }
};

// Ingestion sometimes re-creates the same story on a later date with an
// identical filename. Permalinks are date-less, so duplicates collide and
// break the build. Detect them once at build start and suppress all but one
// copy (posts live in date-named dirs, so lexical sort = date sort).
const duplicatePaths = (() => {
  const postsDir = __dirname;
  const bySlug = new Map();
  for (const dir of fs.readdirSync(postsDir).sort()) {
    const dirPath = path.join(postsDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".md")) continue;
      if (!bySlug.has(file)) bySlug.set(file, []);
      bySlug.get(file).push(path.join(dirPath, file));
    }
  }
  const skip = new Set();
  for (const [, paths] of bySlug) {
    if (paths.length < 2) continue;
    // Keep the earliest PUBLISHED copy, not simply the earliest. Retiring a
    // duplicate by hand sets the copy being dropped to `status: draft`, and
    // when that copy was the earliest, keeping it blindly suppressed the
    // survivor too — the story then disappeared from the site entirely.
    // Falling back to paths[0] when none is published keeps one owner of the
    // URL; the draft rule below hides it anyway.
    const keep = paths.find((p) => statusOf(p) === "published") ?? paths[0];
    for (const p of paths) {
      if (p === keep) continue;
      skip.add(p);
      console.warn(`[posts] Suppressing duplicate post ${p} (kept: ${keep})`);
    }
  }
  return skip;
})();

const isDuplicate = (data) =>
  duplicatePaths.has(path.resolve(data.page.inputPath));

// Drafts are excluded globally in eleventy.config.js, but this file defines its
// own eleventyComputed.permalink, and a directory data file wins over global
// data for the same key — so that rule never reached posts. Retiring a post by
// hand with `status: draft` silently left it published. Both conditions are
// therefore checked together here, in the one place that decides for posts.
const isHidden = (data) =>
  isDuplicate(data) ||
  (process.env.ELEVENTY_ENV === "production" && data.status === "draft");

module.exports = {
  eleventyComputed: {
    permalink: (data) => (isHidden(data) ? false : data.permalink),
    eleventyExcludeFromCollections: (data) =>
      isHidden(data) ? true : data.eleventyExcludeFromCollections || false,
    tags: (data) => {
      let raw = "";
      try {
        const file = fs.readFileSync(data.page.inputPath, "utf8");
        raw = file.replace(/^---[\s\S]*?---/, "");
      } catch (e) {
        // inputPath unavailable — fall back to empty
      }

      // Publisher attribution is metadata, not subject matter — drop it before
      // scanning. Stripping the URL alone is not enough: the link TEXT survives, so
      // "*Source: [Google News](...)*" left the words "Google News" in the body and
      // tagged 244 posts with `google` that never mention Google.
      const withoutAttribution = raw
        .replace(/^\s*\*Source:.*$/gim, " ")
        .replace(/\[Read the full article on [^\]]*\]\([^)]*\)\.?/gi, " ");

      // Strip remaining URLs and markdown link targets to avoid false positives
      // (e.g. news.google.com triggering "google")
      const cleaned = withoutAttribution
        .replace(/https?:\/\/[^\s)]+/g, "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

      const searchText = [data.title || "", data.description || "", cleaned].join(" ");
      const found = new Set(data.tags || []);

      for (const entries of Object.values(taxonomy)) {
        for (const [slug, patterns] of Object.entries(entries)) {
          for (const pattern of patterns) {
            if (pattern.test(searchText)) {
              found.add(slug);
              break;
            }
          }
        }
      }

      // Normalize variant frontmatter tags to canonical slugs. The edge/on-device and
      // open-weights aliases are gone — their destinations are now suppressed, so
      // mapping into them would only have renamed a tag on its way to being dropped.
      const canonical = new Set([...found].map(canonicalTag));

      for (const tag of suppressed) canonical.delete(tag);

      return [...canonical].sort();
    },
  },
};
