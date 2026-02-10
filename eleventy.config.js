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
      title: "LocalGuy",
      subtitle: "A local-first publishing pipeline.",
      base: "https://localguy.example.com/",
      author: {
        name: "Your Name",
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
      title: "LocalGuy",
      subtitle: "A local-first publishing pipeline.",
      base: "https://localguy.example.com/",
      author: {
        name: "Your Name",
      },
    },
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("content/assets");
  eleventyConfig.addPassthroughCopy("css");

  // --- Collections ---

  // Published posts — feeds and listing pages
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/posts/*.md")
      .filter((item) => item.data.status === "published")
      .sort((a, b) => b.date - a.date);
  });

  // All built posts — includes archived (URL preservation)
  // Drafts excluded in production, shown in dev
  eleventyConfig.addCollection("allPosts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/posts/*.md")
      .filter((item) => {
        if (process.env.ELEVENTY_ENV === "production") {
          return item.data.status !== "draft";
        }
        return true;
      })
      .sort((a, b) => b.date - a.date);
  });

  // Notes (published only)
  eleventyConfig.addCollection("notes", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/notes/*.md")
      .filter((item) => item.data.status === "published")
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

    const posts = collectionApi.getFilteredByGlob("content/posts/*.md");
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
