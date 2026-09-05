const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const wikilinks = require("markdown-it-wikilinks");
const obsidianCallouts = require("markdown-it-obsidian-callouts");
const suppressedTags = require("./_data/suppressed-tags.js");
const { buildRelatedIndex } = require("./_data/related-posts.js");

// Eleventy collection names. A post carrying one of these as a frontmatter tag joins
// that collection rather than describing itself, so it must never get a /tags/ page.
const RESERVED_TAGS = new Set([
  "posts", "all", "notes", "allPosts", "_validatePosts", "guides", "tagPages",
  "_relatedPosts",
]);

// A tag needs this many posts before it earns its own /tags/ page.
//
// At 1, the site generated 6,020 tag pages for 2,004 posts and 4,206 of them (70%)
// listed a single article. A page whose entire body is one link is thin content, and
// three of them for every real post is what search engines use to judge the site as a
// whole. The open-ended LLM vocabulary guarantees this: most semantic tags are minted
// once and never seen again.
//
// Two is still one link plus one link. Three is the smallest count at which the page
// answers "what else is there on this?" — which is the only reason to visit it.
const MIN_POSTS_FOR_TAG_PAGE = 3;

// Tags that are allowed to exist at all — reserved collection names and tags that
// restate the site's premise are dropped regardless of how many posts carry them.
const eligible = (tags) =>
  (Array.isArray(tags) ? tags : [])
    .filter((t) => typeof t === "string")
    .filter((t) => {
      const slug = t.toLowerCase();
      return !RESERVED_TAGS.has(slug) && !suppressedTags.has(slug);
    });

// Slugs that actually got a page, filled in by the tagPages collection below.
// Eleventy runs every collection before it renders any template, so this is populated
// by the time `linkable` is called from a filter. It must NOT be consulted from inside
// tagPages itself, which is what builds it — use `eligible` there.
const generatedTagSlugs = new Set();

// The set of tags a template may link to — must stay in lockstep with the tagPages
// collection below, or posts link to /tags/ URLs that were never generated. That is
// how `guides` (one post, glob-based collection, no page) became a 404.
const linkable = (tags) =>
  eligible(tags).filter((t) => generatedTagSlugs.has(t.toLowerCase()));

// Post url -> related posts, filled in by the _relatedPosts collection below and read
// back by the relatedTo filter at render time. Same arrangement as generatedTagSlugs
// above: Eleventy runs every collection before it renders any template, so the map is
// populated by the time a template asks for it.
const relatedByUrl = new Map();

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

  // Commercial-interest disclosure, for use immediately adjacent to any Revyzor
  // mention or revyzor.com link. Single source of wording — see /about/.
  // Usage: put {% disclosure %} on its own line, next to the mention.
  // Equivalent hand-written form (renders in Obsidian too):
  //   > [!info] Disclosure
  //   > Revyzor is my own product.
  eleventyConfig.addShortcode(
    "disclosure",
    () => "> [!info] Disclosure\n> Revyzor is my own product.\n"
  );
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
  eleventyConfig.addPassthroughCopy({ "graphlogo.svg": "graphlogo.svg" });

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

  // Tags that get their own /tags/{slug}/ page.
  //
  // Paginating straight over `collections` does not work for this: Eleventy registers a
  // collection key for every tag it sees in raw frontmatter, and suppressing a tag in
  // eleventyComputed empties that collection without removing the key. The result is a
  // generated page with nothing on it. Deriving the list from the collection contents
  // instead means a tag only gets a URL if something actually carries it.
  // Case variants are merged onto one lowercase slug. Tags arrive in both casings
  // ("MediaTek" and "mediatek", "HP" and "hp" — 13 such pairs), which produced two
  // separate collections and therefore two pages splitting the same posts. It looked
  // fine locally only because macOS is case-insensitive and one directory silently
  // overwrote the other; on a case-sensitive host both would exist, each half-empty,
  // and every post links to the lowercase form.
  eleventyConfig.addCollection("tagPages", function (collectionApi) {
    const bySlug = new Map();
    for (const item of collectionApi.getAll()) {
      // `eligible`, not `linkable`: linkable filters on generatedTagSlugs, which this
      // loop is what populates. Using it here would return nothing on every build.
      for (const tag of eligible(item.data.tags)) {
        const slug = tag.toLowerCase();
        if (!bySlug.has(slug)) bySlug.set(slug, { slug, items: new Set() });
        bySlug.get(slug).items.add(item);
      }
    }

    const pages = [...bySlug.values()]
      .filter(({ items }) => items.size >= MIN_POSTS_FOR_TAG_PAGE)
      .map(({ slug, items }) => ({
        slug,
        posts: [...items].sort((a, b) => a.date - b.date),
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug));

    generatedTagSlugs.clear();
    for (const page of pages) generatedTagSlugs.add(page.slug);

    const dropped = bySlug.size - pages.length;
    console.log(
      `[tags] ${pages.length} tag pages generated, ${dropped} below the ` +
        `${MIN_POSTS_FOR_TAG_PAGE}-post threshold suppressed.`
    );

    return pages;
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

  // Related posts, keyed by url. Side-effect only — nothing paginates over this, it
  // just populates relatedByUrl for the relatedTo filter, which is why it carries the
  // underscore prefix used by _validatePosts.
  //
  // Candidates come from the published set, not allPosts. allPosts keeps archived and
  // (in dev) draft posts so their URLs survive, and linking to those from a published
  // page would put drafts in front of readers and, in production, emit links to pages
  // that were never built.
  eleventyConfig.addCollection("_relatedPosts", function (collectionApi) {
    const published = collectionApi
      .getFilteredByGlob("content/posts/**/*.md")
      .filter((item) => item.data.status === "published")
      .filter((item) => item.data.eleventyExcludeFromCollections !== true);

    relatedByUrl.clear();
    for (const [url, items] of buildRelatedIndex(published, eligible)) {
      relatedByUrl.set(url, items);
    }

    const withRelated = [...relatedByUrl.values()].filter((r) => r.length > 0).length;
    console.log(
      `[related] ${withRelated}/${published.length} posts have related links ` +
        `(${published.length - withRelated} below the shared-tag threshold).`
    );

    return [];
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

  eleventyConfig.addFilter("dateKey", (dateObj) => {
    return new Date(dateObj).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("shortDate", (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
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
    return linkable(tags).filter(t => !classifierTags.has(t));
  });

  // Every tag that has a page. Use this anywhere a tag is rendered as a link.
  eleventyConfig.addFilter("linkableTags", linkable);

  eleventyConfig.addFilter("relatedTo", (url) => relatedByUrl.get(url) || []);

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

  // Group posts into weeks (Monday-keyed) with nested day groups
  // Returns [ { weekKey, weekLabel, days: [{ label, dateKey, posts }], postCount } ]
  eleventyConfig.addFilter("groupByWeek", (posts) => {
    // Helper: get Monday of a given date's week
    function getMonday(d) {
      const date = new Date(d);
      const day = date.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday = 1
      date.setDate(date.getDate() + diff);
      return date.toISOString().slice(0, 10);
    }

    const weekMap = new Map();
    for (const post of posts) {
      const postDate = new Date(post.date);
      const mondayKey = getMonday(postDate);
      const dateKey = postDate.toISOString().slice(0, 10);
      const dayLabel = postDate.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!weekMap.has(mondayKey)) {
        const monday = new Date(mondayKey + "T00:00:00");
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        const fmt = (d) =>
          d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        weekMap.set(mondayKey, {
          weekKey: mondayKey,
          weekLabel: `${fmt(monday)} – ${fmt(sunday)}`,
          dayMap: new Map(),
          postCount: 0,
        });
      }
      const week = weekMap.get(mondayKey);
      week.postCount++;

      if (!week.dayMap.has(dateKey)) {
        week.dayMap.set(dateKey, { label: dayLabel, dateKey, posts: [] });
      }
      week.dayMap.get(dateKey).posts.push(post);
    }

    // Convert to arrays, sorted descending
    const weeks = [];
    for (const week of weekMap.values()) {
      week.days = Array.from(week.dayMap.values());
      delete week.dayMap;
      weeks.push(week);
    }
    weeks.sort((a, b) => b.weekKey.localeCompare(a.weekKey));
    return weeks;
  });

  // Tag cloud: returns [ { tag, count, weight } ] sorted by count descending
  // weight is 1–5 based on relative frequency
  // Picks diverse tags across categories (companies, models, tools, topics)
  eleventyConfig.addFilter("tagCloud", (posts) => {
    const taxonomy = require("./_data/tag-taxonomy.js");

    // Normalize variant frontmatter tags to canonical slugs
    const aliases = {
      benchmark: "benchmarks",
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

  // Trend data: rolling 30-day trending + all-time leaderboard
  // Used by the /trends/ page to power tag velocity visualizations
  eleventyConfig.addFilter("trendData", (posts) => {
    const taxonomy = require("./_data/tag-taxonomy.js");

    const aliases = {
      benchmark: "benchmarks",
      inference: null,
    };

    // Build category lookup from taxonomy
    const tagCategory = {};
    for (const [cat, entries] of Object.entries(taxonomy)) {
      for (const slug of Object.keys(entries)) {
        tagCategory[slug] = cat;
      }
    }

    const now = new Date();
    // Week boundaries: 4 weeks, oldest first
    const weekBounds = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i + 1) * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      weekBounds.push({ start, end });
    }
    const thirtyDaysAgo = weekBounds[0].start;

    const tagData = {};
    const exclude = new Set(["posts", "all", "notes", "allPosts", "_validatePosts", "guides"]);
    for (const tag of classifierTags) exclude.add(tag);

    for (const post of posts) {
      const postDate = new Date(post.date);
      for (let tag of post.data.tags || []) {
        if (tag in aliases) tag = aliases[tag];
        if (tag === null || exclude.has(tag)) continue;

        if (!tagData[tag]) {
          tagData[tag] = { total: 0, weeks: [0, 0, 0, 0], last30: 0 };
        }
        tagData[tag].total++;

        if (postDate >= thirtyDaysAgo) {
          tagData[tag].last30++;
          for (let w = 0; w < 4; w++) {
            if (postDate >= weekBounds[w].start && postDate <= weekBounds[w].end) {
              tagData[tag].weeks[w]++;
              break;
            }
          }
        }
      }
    }

    // Remove tags appearing in >8% of articles (generic "local AI vocabulary")
    const totalPosts = posts.length || 1;
    const noiseFloor = new Set();
    for (const [tag, d] of Object.entries(tagData)) {
      if (d.total / totalPosts > 0.08) noiseFloor.add(tag);
    }

    // Trending: velocity = weighted recent / weighted older
    const trending = [];
    for (const [tag, data] of Object.entries(tagData)) {
      if (data.last30 < 2) continue;
      if (noiseFloor.has(tag)) continue;
      const recentWeight = data.weeks[3] * 1.0 + data.weeks[2] * 0.7;
      const olderWeight = data.weeks[1] * 0.5 + data.weeks[0] * 0.3;
      const velocity = recentWeight / (olderWeight + 1);
      const score = velocity * Math.sqrt(data.last30);

      trending.push({
        tag,
        count: data.last30,
        total: data.total,
        velocity: Math.round(velocity * 100) / 100,
        score: Math.round(score * 100) / 100,
        weeks: data.weeks,
        category: tagCategory[tag] || "semantic",
      });
    }
    trending.sort((a, b) => b.score - a.score);

    // Recent arrivals: tags that first appeared in the last 10 days
    // These are novel signals — new models, techniques, tools entering the discourse
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    tenDaysAgo.setHours(0, 0, 0, 0);

    // Find each tag's earliest appearance
    const tagFirstSeen = {};
    for (const post of posts) {
      const postDate = new Date(post.date);
      for (let tag of post.data.tags || []) {
        if (tag in aliases) tag = aliases[tag];
        if (tag === null || exclude.has(tag) || noiseFloor.has(tag)) continue;
        if (!tagFirstSeen[tag] || postDate < tagFirstSeen[tag]) {
          tagFirstSeen[tag] = postDate;
        }
      }
    }

    const recentArrivals = [];
    for (const [tag, firstSeen] of Object.entries(tagFirstSeen)) {
      if (firstSeen < tenDaysAgo) continue;
      const d = tagData[tag];
      if (!d || d.total < 2 || d.total > 6) continue;
      const cat = tagCategory[tag] || "semantic";
      // For semantic tags, require compound terms (hyphenated) — single words are too generic
      if (cat === "semantic" && !tag.includes("-")) continue;
      recentArrivals.push({
        tag,
        count: d.total,
        firstSeen: firstSeen.toISOString().slice(0, 10),
        category: cat,
      });
    }
    recentArrivals.sort((a, b) => b.count - a.count);

    // All-time: filter singletons + noise-floor tags, sort by total
    const allTime = Object.entries(tagData)
      .filter(([tag, d]) => d.total >= 2 && !noiseFloor.has(tag))
      .map(([tag, d]) => ({
        tag,
        count: d.total,
        category: tagCategory[tag] || "semantic",
      }))
      .sort((a, b) => b.count - a.count);

    return {
      trending: trending.slice(0, 25),
      recentArrivals: recentArrivals.slice(0, 20),
      allTime: allTime.slice(0, 50),
      generated: now.toISOString(),
      window: { start: thirtyDaysAgo.toISOString(), end: now.toISOString() },
    };
  });

  // Normalise a post's raw tags to the ids used as graph nodes.
  // Shared by graphData and graphPostIndex so the two always agree.
  const graphTagAliases = { benchmark: "benchmarks", inference: null };
  const graphTagExclude = new Set(["posts", "all", "notes", "allPosts", "_validatePosts", "guides"]);

  const normaliseGraphTags = (rawTags) => {
    const out = [];
    for (let tag of rawTags || []) {
      if (tag in graphTagAliases) tag = graphTagAliases[tag];
      if (tag === null || graphTagExclude.has(tag) || classifierTags.has(tag)) continue;
      out.push(tag);
    }
    return out;
  };

  // Co-occurrence graph data: nodes = tags, edges = shared articles
  // Used by the /graph/ page for force-directed visualization
  const buildGraphData = (posts) => {
    const taxonomy = require("./_data/tag-taxonomy.js");

    const aliases = {
      benchmark: "benchmarks",
      inference: null,
    };

    // Build category lookup from taxonomy
    const tagCategory = {};
    for (const [cat, entries] of Object.entries(taxonomy)) {
      for (const slug of Object.keys(entries)) {
        tagCategory[slug] = cat;
      }
    }

    const exclude = new Set(["posts", "all", "notes", "allPosts", "_validatePosts", "guides"]);
    for (const tag of classifierTags) exclude.add(tag);

    // Count tag occurrences and build co-occurrence pairs
    const tagCounts = {};
    const edgeCounts = {};

    for (const post of posts) {
      const rawTags = post.data.tags || [];
      const filtered = [];
      for (let tag of rawTags) {
        if (tag in aliases) tag = aliases[tag];
        if (tag === null || exclude.has(tag)) continue;
        filtered.push(tag);
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }

      // Generate all unique pairs for co-occurrence
      const unique = [...new Set(filtered)];
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          const key = [unique[i], unique[j]].sort().join("|||");
          edgeCounts[key] = (edgeCounts[key] || 0) + 1;
        }
      }
    }

    // Remove noise-floor tags (>8% of articles)
    const totalPosts = posts.length || 1;
    const noiseFloor = new Set();
    for (const [tag, count] of Object.entries(tagCounts)) {
      if (count / totalPosts > 0.08) noiseFloor.add(tag);
    }

    // Filter singletons and noise-floor tags from nodes
    const validTags = new Set();
    for (const [tag, count] of Object.entries(tagCounts)) {
      if (count >= 2 && !noiseFloor.has(tag)) validTags.add(tag);
    }

    // Build edges with weight >= 2, max 5 per node
    const rawEdges = [];
    for (const [key, weight] of Object.entries(edgeCounts)) {
      if (weight < 2) continue;
      const [source, target] = key.split("|||");
      if (!validTags.has(source) || !validTags.has(target)) continue;
      rawEdges.push({ source, target, weight });
    }
    rawEdges.sort((a, b) => b.weight - a.weight);

    // Limit to top 5 edges per node to prevent hairball
    const nodeEdgeCount = {};
    const edges = [];
    for (const edge of rawEdges) {
      const sc = nodeEdgeCount[edge.source] || 0;
      const tc = nodeEdgeCount[edge.target] || 0;
      if (sc >= 5 && tc >= 5) continue;
      edges.push(edge);
      nodeEdgeCount[edge.source] = sc + 1;
      nodeEdgeCount[edge.target] = tc + 1;
    }

    // Only include nodes that have at least one edge
    const connectedTags = new Set();
    for (const e of edges) {
      connectedTags.add(e.source);
      connectedTags.add(e.target);
    }

    const nodes = [];
    for (const tag of connectedTags) {
      nodes.push({
        id: tag,
        count: tagCounts[tag],
        category: tagCategory[tag] || "semantic",
      });
    }

    return {
      nodes,
      edges,
      meta: {
        generated: new Date().toISOString(),
        totalPosts,
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
    };
  };

  // Recomputing the graph is expensive; graphPostIndex needs the same node set.
  let graphCacheKey = null;
  let graphCacheValue = null;
  const graphDataCached = (posts) => {
    if (graphCacheKey !== posts) {
      graphCacheKey = posts;
      graphCacheValue = buildGraphData(posts);
    }
    return graphCacheValue;
  };

  eleventyConfig.addFilter("graphData", graphDataCached);

  // Lazy-loaded search index: maps post text to graph node ids, so the graph
  // can be searched by what posts actually say, not just by tag name.
  eleventyConfig.addFilter("graphPostIndex", (posts) => {
    const nodeIds = new Set(graphDataCached(posts).nodes.map((n) => n.id));

    // Tag strings repeat across thousands of posts; index into a dictionary instead
    const tagList = [...nodeIds];
    const tagIndex = new Map(tagList.map((t, i) => [t, i]));

    const entries = [];
    for (const post of posts) {
      const tags = normaliseGraphTags(post.data.tags)
        .filter((t) => nodeIds.has(t))
        .map((t) => tagIndex.get(t));
      if (!tags.length) continue;

      const text = `${post.data.title || ""} ${post.data.description || ""}`
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      if (!text) continue;

      entries.push([text, [...new Set(tags)]]);
    }

    return { tags: tagList, posts: entries };
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
