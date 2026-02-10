# Phase 8: Implementation Sequence

## Current State

Steps 1–5 from the original plan are already done. The site builds,
has content templates, feeds, styling, and is deployed to Vercel.

What remains is evolving the existing project to match the new
architecture.

---

### Step A: Update Content Lifecycle (Evolve Existing)

**Goal**: Strict draft/published/archived enforcement.

- [ ] Change frontmatter from `visibility` to `status` on existing posts
- [ ] Update collections in `eleventy.config.js`:
      - `posts` = published only (for feeds + listings)
      - `allPosts` = published + archived (for URL preservation)
- [ ] Add frontmatter linter to warn on missing required fields
- [ ] Add `removeDatePrefix` filter for cleaner permalinks
- [ ] Create `content/posts/posts.json` directory data file
- [ ] Update `_data/site.json` with new field names (`description`
      instead of `summary`)
- [ ] Add `_private/` directory + update `.gitignore`
- [ ] Verify: draft posts excluded from production build

**Milestone**: Lifecycle enforcement working.

---

### Step B: Obsidian Syntax Support

**Goal**: Wikilinks and callouts work in published posts.

- [ ] Research/choose markdown-it plugin for wikilinks
- [ ] Research/choose approach for callout conversion
- [ ] Install plugins and configure in `eleventy.config.js`
- [ ] Add callout CSS styles to `style.css`
- [ ] Add test content with wikilinks and callouts
- [ ] Verify: wikilinks resolve to correct URLs
- [ ] Verify: callouts render as styled HTML

**Milestone**: Write naturally in Obsidian, build correctly in Eleventy.

---

### Step C: Giscus Comments

**Goal**: GitHub Discussions-backed comments on every post.

- [ ] Push repo to GitHub (public)
- [ ] Enable GitHub Discussions on the repo
- [ ] Create "Blog Comments" discussion category
- [ ] Install Giscus app on the repo
- [ ] Get repo ID and category ID from giscus.app
- [ ] Add Giscus config to `_data/site.json`
- [ ] Create `_includes/partials/giscus.njk`
- [ ] Include Giscus partial in `post.njk`
- [ ] Test: leave a comment, verify it appears in Discussions
- [ ] Test: `comments: false` in frontmatter disables widget

**Milestone**: Comments working on all posts.

---

### Step D: Obsidian Git Plugin

**Goal**: Publish from inside Obsidian.

- [ ] Install Obsidian Git plugin in the vault
- [ ] Configure settings (manual commit, auto-push)
- [ ] Set Obsidian's default new file location to `_private/drafts/`
- [ ] Set Obsidian's attachment folder to `content/assets/images/`
- [ ] Test full workflow: write draft → move to posts → commit →
      push → Vercel rebuilds → post is live
- [ ] Verify: `_private/` stays local, never pushed

**Milestone**: Full authoring → publishing loop from Obsidian.

---

### Step E: Polish & Extensions

**Goal**: Production-ready quality.

- [ ] Syntax highlighting
- [ ] Sitemap
- [ ] robots.txt
- [ ] Callout CSS polish
- [ ] Verify: Lighthouse scores 90+ across all categories
- [ ] Optional: Pagefind search
- [ ] Optional: reading time

**Milestone**: Done.

---

## What "Done" Looks Like

When all steps are complete, you have:

1. An Obsidian vault where you write in Markdown with wikilinks
   and callouts
2. A `_private/` folder for drafts that never leave your machine
3. Obsidian Git plugin that commits and pushes with one command
4. Strict lifecycle: draft → published → archived
5. Eleventy building static HTML with feeds
6. Giscus comments backed by GitHub Discussions
7. Clean, Medium-style presentation with dark mode
8. Deployed to Vercel, auto-rebuilds on push
9. Everything in one public repo, £0/month

You write. You push. It's live. People comment via GitHub.
You own everything.
