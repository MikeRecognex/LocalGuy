#!/usr/bin/env node
/**
 * server.js — Express server for the Tag Manager webapp.
 * Run with: npm run tag-manager
 */

const express = require("express");
const path = require("path");
const { execSync } = require("child_process");
const tagOps = require("./tag-ops");
const gemini = require("./gemini");

const app = express();
const PORT = 3001;
const ROOT = path.resolve(__dirname, "../..");

app.use(express.json());

// Serve index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// GET /api/tags — all tags with counts, categories, classifier flag
app.get("/api/tags", (_req, res) => {
  try {
    const tagMap = tagOps.getAllTags();
    const tags = Object.entries(tagMap).map(([name, data]) => ({
      name,
      count: data.count,
      category: tagOps.categorizeTag(name),
      isClassifier: tagOps.isClassifier(name),
    }));
    tags.sort((a, b) => b.count - a.count);
    res.json({ tags, totalPosts: new Set(Object.values(tagMap).flatMap((d) => d.posts.map((p) => p.file))).size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tags/:tag/posts — posts containing a specific tag
app.get("/api/tags/:tag/posts", (req, res) => {
  try {
    const posts = tagOps.getPostsForTag(req.params.tag);
    res.json({ tag: req.params.tag, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Auto-commit before a mutation */
function autoCommit(operation) {
  try {
    execSync("git add content/posts/", { cwd: ROOT, stdio: "pipe" });
    execSync(`git commit -m "tag-manager: before ${operation}" --allow-empty`, {
      cwd: ROOT,
      stdio: "pipe",
    });
  } catch {
    // Nothing to commit is fine
  }
}

// POST /api/tags/rename — { from, to }
app.post("/api/tags/rename", (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: "Missing from/to" });

    autoCommit(`rename ${from} → ${to}`);
    const modified = tagOps.renameTag(from, to);
    res.json({ success: true, modified, from, to });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tags/merge — { sources[], canonical }
app.post("/api/tags/merge", (req, res) => {
  try {
    const { sources, canonical } = req.body;
    if (!sources?.length || !canonical)
      return res.status(400).json({ error: "Missing sources/canonical" });

    autoCommit(`merge [${sources.join(", ")}] → ${canonical}`);
    const modified = tagOps.mergeTags(sources, canonical);
    res.json({ success: true, modified, sources, canonical });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tags/delete — { tag }
app.post("/api/tags/delete", (req, res) => {
  try {
    const { tag } = req.body;
    if (!tag) return res.status(400).json({ error: "Missing tag" });

    autoCommit(`delete ${tag}`);
    const modified = tagOps.deleteTag(tag);
    res.json({ success: true, modified, tag });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/suggest-merges — send tags to Gemini
app.post("/api/ai/suggest-merges", async (_req, res) => {
  try {
    const tagMap = tagOps.getAllTags();
    const tags = Object.entries(tagMap)
      .map(([tag, data]) => ({ tag, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 300);

    const suggestions = await gemini.suggestMerges(tags);
    // Enrich with counts
    const enriched = suggestions.map((group) => ({
      ...group,
      tags: group.tags.map((t) => ({ name: t, count: tagMap[t]?.count || 0 })),
    }));
    res.json({ suggestions: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history — recent git commits touching content/posts/
app.get("/api/history", (_req, res) => {
  try {
    const log = execSync(
      'git log --oneline -30 -- content/posts/',
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    const commits = log
      ? log.split("\n").map((line) => {
          const [hash, ...rest] = line.split(" ");
          return { hash, message: rest.join(" ") };
        })
      : [];
    res.json({ commits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/history/restore — { hash }
app.post("/api/history/restore", (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ error: "Missing hash" });

    execSync(`git checkout ${hash} -- content/posts/`, {
      cwd: ROOT,
      stdio: "pipe",
    });
    res.json({ success: true, hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  Tag Manager running at http://localhost:${PORT}\n`);
});
