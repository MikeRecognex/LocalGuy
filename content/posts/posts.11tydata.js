const fs = require("fs");
const taxonomy = require("../../_data/tag-taxonomy.js");

module.exports = {
  eleventyComputed: {
    tags: (data) => {
      let raw = "";
      try {
        const file = fs.readFileSync(data.page.inputPath, "utf8");
        raw = file.replace(/^---[\s\S]*?---/, "");
      } catch (e) {
        // inputPath unavailable — fall back to empty
      }

      // Strip URLs and markdown link targets to avoid false positives
      // (e.g. news.google.com triggering "google")
      const cleaned = raw
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

      // Normalize variant frontmatter tags to canonical slugs
      const aliases = {
        benchmark: "benchmarks",
        "edge-inference": "edge-deployment",
        "on-device": "edge-deployment",
        "open-weights": "open-source",
      };
      for (const [from, to] of Object.entries(aliases)) {
        if (found.has(from)) {
          found.delete(from);
          found.add(to);
        }
      }

      return [...found].sort();
    },
  },
};
