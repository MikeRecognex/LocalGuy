const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const wikilinks = require("markdown-it-wikilinks");
const obsidianCallouts = require("markdown-it-obsidian-callouts");

module.exports = function (eleventyConfig) {
  // --- Markdown plugins ---

  // Wikilinks: [[page-name]] → /posts/page-name/
  // [[page-name|display text]] → <a href="/posts/page-name/">display text</a>
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(
      wikilinks({
        baseURL: "/posts/",
        uriSuffix: "",
        makeAllLinksAbsolute: true,
        generatePageNameFromLabel: (label) => {
          return label
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");
        },
        htmlAttributes: {
          class: "wikilink",
        },
      })
    );
  });

  // Obsidian callouts: > [!note] Title → styled HTML divs
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(obsidianCallouts);
  });
  // Syntax highlighting for fenced code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // RSS / Atom feed (published posts only)
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 20,
    },
    metadata: {
      language: "en",
      title: "LocalFTW",
      subtitle: "A local-first publishing pipeline.",
      base: "https://lftw.dev/",
      author: {
        name: "Mike Doyle",
      },
    },
  });

  // JSON feed (published posts only)
  eleventyConfig.addPlugin(feedPlugin, {
    type: "json",
    outputPath: "/feed.json",
    collection: {
      name: "posts",
      limit: 20,
    },
    metadata: {
      language: "en",
      title: "LocalFTW",
      subtitle: "A local-first publishing pipeline.",
      base: "https://lftw.dev/",
      author: {
        name: "Mike Doyle",
      },
    },
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("content/assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy({ "favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "ambulogo.png": "ambulogo.png" });

  // --- Collections ---

  // Published posts — feeds and listing pages
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/posts/**/*.md")
      .filter((item) => item.data.status === "published")
      .sort((a, b) => b.date - a.date);
  });

  // Published guides — evergreen tutorials
  eleventyConfig.addCollection("guides", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/guides/*.md")
      .filter((item) => item.data.status === "published")
      .sort((a, b) => (b.data.updated || b.date) - (a.data.updated || a.date));
  });

  // All built posts — includes archived (URL preservation)
  // Drafts excluded in production, shown in dev
  eleventyConfig.addCollection("allPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/posts/**/*.md")
      .filter((item) => {
        if (process.env.ELEVENTY_ENV === "production") {
          return item.data.status !== "draft";
        }
        return true;
      })
      .sort((a, b) => b.date - a.date);
  });

  // --- Filters ---

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return [];
    return array.slice(0, n);
  });

  // Filter out semantic classifier tags, keep descriptive/entity tags
  const classifierTags = new Set([
    "news", "tutorial", "analysis", "release", "showcase", "benchmark-report",
    "opinion", "comparison",
    "beginner-friendly", "intermediate", "advanced",
    "hobbyist", "developer", "enterprise", "researcher",
    "bullish", "cautious", "neutral",
    "consumer-gpu", "datacenter-gpu", "apple-silicon",
    "cpu-only", "edge-device", "custom-asic",
    "daily-digest",
  ]);
  eleventyConfig.addFilter("topicTags", (tags) => {
    if (!Array.isArray(tags)) return [];
    return tags.filter(t => !classifierTags.has(t));
  });

  // Posts from the last N days (minimum 3 posts as fallback)
  eleventyConfig.addFilter("recentDays", (posts, days) => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);
    const recent = posts.filter((p) => p.date >= cutoff);
    return recent.length >= 3 ? recent : posts.slice(0, 3);
  });

  // Posts older than N days
  eleventyConfig.addFilter("olderThanDays", (posts, days) => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);
    return posts.filter((p) => p.date < cutoff);
  });

  // Group posts into [ { label: "11 February 2026", posts: [...] }, ... ]
  eleventyConfig.addFilter("groupByDate", (posts) => {
    const groups = [];
    let current = null;
    for (const post of posts) {
      const label = new Date(post.date).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!current || current.label !== label) {
        current = { label, date: post.date, posts: [] };
        groups.push(current);
      }
      current.posts.push(post);
    }
    return groups;
  });

  // Tag cloud: returns [ { tag, count, weight } ] sorted by count descending
  // weight is 1–5 based on relative frequency
  // Picks diverse tags across categories (companies, models, tools, topics)
  eleventyConfig.addFilter("tagCloud", (posts) => {
    const taxonomy = require("./_data/tag-taxonomy.js");

    // Normalize variant frontmatter tags to canonical slugs
    const aliases = {
      benchmark: "benchmarks",
      "edge-inference": "edge-deployment",
      "on-device": "edge-deployment",
      "open-weights": "open-source",
      inference: null, // too ubiquitous — suppress from cloud
    };
    const counts = {};
    for (const post of posts) {
      for (let tag of post.data.tags || []) {
        if (tag in aliases) tag = aliases[tag];
        if (tag === null) continue;
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    const exclude = new Set(["posts", "all", "notes", "allPosts", "_validatePosts", "guides"]);
    // Also exclude semantic classifier tags from the cloud (they dominate counts but add no value)
    for (const tag of classifierTags) exclude.add(tag);

    // Build a lookup: tag slug → category name
    const tagCategory = {};
    for (const [cat, entries] of Object.entries(taxonomy)) {
      for (const slug of Object.keys(entries)) {
        tagCategory[slug] = cat;
      }
    }

    // Bucket tags by category, sorted by count within each
    // Tags not in the regex taxonomy are treated as semantic (from smart-retag.py / Gemini)
    const buckets = { companies: [], models: [], tools: [], topics: [], semantic: [], other: [] };
    for (const [tag, count] of Object.entries(counts)) {
      if (exclude.has(tag)) continue;
      const cat = tagCategory[tag] || "semantic";
      buckets[cat] = buckets[cat] || [];
      buckets[cat].push({ tag, count });
    }
    for (const cat of Object.keys(buckets)) {
      buckets[cat].sort((a, b) => b.count - a.count);
    }

    // Pick top tags from each category for a diverse cloud
    // 4 companies, 3 models, 3 tools, 5 topics, 3 semantic = 18 slots
    const picked = [
      ...buckets.companies.slice(0, 4),
      ...buckets.models.slice(0, 3),
      ...buckets.tools.slice(0, 3),
      ...buckets.topics.slice(0, 5),
      ...buckets.semantic.slice(0, 3),
    ];

    if (!picked.length) return [];
    const max = Math.max(...picked.map((t) => t.count));
    const min = Math.min(...picked.map((t) => t.count));
    for (const t of picked) {
      t.weight = min === max ? 3 : Math.ceil(((t.count - min) / (max - min)) * 4) + 1;
    }
    return picked.sort((a, b) => b.count - a.count);
  });

  eleventyConfig.addFilter("byCategory", (items, category) => {
    return items.filter((item) => item.data.category === category);
  });

  eleventyConfig.addFilter("categoryName", (slug) => {
    const names = {
      "getting-started": "Getting Started",
      "hardware": "Hardware",
      "models": "Models",
      "deployment": "Deployment",
    };
    return names[slug] || slug;
  });

  // Strip YYYY-MM-DD- prefix from slugs for cleaner permalinks
  eleventyConfig.addFilter("removeDatePrefix", (slug) => {
    return slug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  });

  // Reading time estimate (200 wpm, minimum 1 min)
  eleventyConfig.addFilter("readingTime", (content) => {
    const text = (content || "").replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  });

  // --- Draft Exclusion ---
  // In production, draft posts get permalink: false (not rendered)
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: function (data) {
      if (
        process.env.ELEVENTY_ENV === "production" &&
        data.status === "draft"
      ) {
        return false;
      }
      return data.permalink;
    },
    eleventyExcludeFromCollections: function (data) {
      if (
        process.env.ELEVENTY_ENV === "production" &&
        data.status === "draft"
      ) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    },
  });

  // --- Frontmatter Validation ---
  // Runs after collections are built, before templates render

  eleventyConfig.on("eleventy.after", () => {
    // Validation happens via the collection filters above.
    // Posts missing 'status' won't appear in any collection.
    // This is intentional — the strictest enforcement is exclusion.
  });

  eleventyConfig.addCollection("_validatePosts", function (collectionApi) {
    const required = ["title", "date", "description", "tags", "status"];
    const validStatuses = ["draft", "published", "archived"];

    const posts = collectionApi.getFilteredByGlob("content/posts/**/*.md");
    for (const post of posts) {
      for (const field of required) {
        if (post.data[field] === undefined || post.data[field] === null || post.data[field] === "") {
          console.warn(`\n⚠ Missing required field "${field}" in ${post.inputPath}`);
        }
      }
      if (post.data.status && !validStatuses.includes(post.data.status)) {
        console.warn(
          `\n⚠ Invalid status "${post.data.status}" in ${post.inputPath}. Must be: ${validStatuses.join(", ")}`
        );
      }
    }
    return []; // Empty collection, just used for validation
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
