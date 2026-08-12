const fs = require("fs");
const path = require("path");
const taxonomy = require("../../_data/tag-taxonomy.js");
const suppressed = require("../../_data/suppressed-tags.js");

// Ingestion sometimes re-creates the same story on a later date with an
// identical filename. Permalinks are date-less, so duplicates collide and
// break the build. Detect them once at build start and suppress all but the
// earliest copy (posts live in date-named dirs, so lexical sort = date sort).
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
  for (const [file, paths] of bySlug) {
    for (const p of paths.slice(1)) {
      skip.add(p);
      console.warn(`[posts] Suppressing duplicate post ${p} (earliest copy kept: ${paths[0]})`);
    }
  }
  return skip;
})();

const isDuplicate = (data) =>
  duplicatePaths.has(path.resolve(data.page.inputPath));

module.exports = {
  eleventyComputed: {
    permalink: (data) => (isDuplicate(data) ? false : data.permalink),
    eleventyExcludeFromCollections: (data) =>
      isDuplicate(data) ? true : data.eleventyExcludeFromCollections || false,
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
      const aliases = {
        benchmark: "benchmarks",
      };
      for (const [from, to] of Object.entries(aliases)) {
        if (found.has(from)) {
          found.delete(from);
          found.add(to);
        }
      }

      for (const tag of suppressed) found.delete(tag);

      return [...found].sort();
    },
  },
};
