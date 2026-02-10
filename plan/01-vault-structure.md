# Phase 1: Vault & Project Structure

## Single Repo Layout

One public GitHub repo contains everything: Obsidian vault content,
Eleventy config, templates, and styles.

```
LocalGuy/
├── .obsidian/              # Obsidian config (gitignored)
├── content/
│   ├── posts/              # Blog posts (publishable)
│   │   └── YYYY-MM-DD-slug.md
│   ├── pages/              # Evergreen pages (publishable)
│   │   ├── about.md
│   │   └── now.md
│   └── assets/
│       └── images/         # Images referenced by posts
├── _private/               # Drafts, notes (gitignored, never published)
│   ├── drafts/
│   └── notes/
├── _includes/
│   ├── layouts/
│   │   ├── base.njk
│   │   ├── post.njk
│   │   ├── page.njk
│   │   └── note.njk
│   └── partials/
│       ├── header.njk
│       ├── footer.njk
│       ├── meta.njk
│       └── giscus.njk
├── css/
│   └── style.css
├── _data/
│   └── site.json
├── eleventy.config.js
├── package.json
├── vercel.json
├── .gitignore
└── plan/
```

## Privacy Model

| Directory     | Git tracked | Published | Notes                     |
|---------------|-------------|-----------|---------------------------|
| `content/`    | Yes         | Yes*      | *Only if status=published |
| `_private/`   | No          | No        | Gitignored, local only    |
| `.obsidian/`  | No          | No        | Gitignored                |
| `_site/`      | No          | N/A       | Build output, gitignored  |

**Important**: Since the repo is public, anything in `content/` is visible
on GitHub — including posts with `status: draft`. Drafts are excluded from
the *built site* but not from the repo. Truly private work goes in
`_private/`.

## .gitignore

```
_site/
node_modules/
.obsidian/
_private/
.DS_Store
.vercel
```

## Frontmatter Specification

```yaml
---
title: "Post Title"
date: 2026-02-09
description: "A short description for feeds and social cards."
tags:
  - indieweb
  - writing
status: published           # draft | published | archived
series: ""                  # optional: groups posts into a series
canonical_url: ""           # optional: for cross-posted content
comments: true              # optional: defaults to true, set false to disable
---
```

### Required Fields

| Field         | Type     | Purpose                                |
|---------------|----------|----------------------------------------|
| `title`       | string   | Page title, `<h1>`, Open Graph         |
| `date`        | date     | ISO date, drives sort order            |
| `description` | string   | RSS feed, OG description, meta tag     |
| `tags`        | string[] | Tag index pages, categorisation        |
| `status`      | enum     | `draft`, `published`, or `archived`    |

### Optional Fields

| Field           | Type    | Default | Purpose                         |
|-----------------|---------|---------|---------------------------------|
| `series`        | string  | `""`    | Group posts into a named series |
| `canonical_url` | string  | `""`    | For syndicated content          |
| `comments`      | boolean | `true`  | Disable Giscus on a per-post basis |
| `image`         | string  | `""`    | Hero image path for post + OG   |

### Status Lifecycle (Enforced at Build)

```
draft ──────► published ──────► archived
  │               │                │
  │  (excluded    │  (visible on   │  (excluded from
  │   from site)  │   site + feed) │   feeds, still
  │               │                │   accessible by URL)
```

- **draft**: Not built in production. Visible in dev mode.
- **published**: Built, appears in feeds, collections, and archives.
- **archived**: Built (URL still works) but excluded from feeds and
  listing pages. Content preserved, not promoted.

## Content Types

### Posts (`content/posts/`)
- Long-form articles and essays
- Filename: `YYYY-MM-DD-slug.md` (filename is canonical URL)
- Permalink: `/posts/slug/`
- Giscus comments enabled by default

### Pages (`content/pages/`)
- Evergreen: About, Now, Uses
- Not date-driven, not in feeds
- Permalink: `/about/`, `/now/`
- No comments by default

## Obsidian Configuration

- Set attachment folder to `content/assets/images/`
- Set new file location to `_private/drafts/`
- When a draft is ready, move it to `content/posts/` and set
  `status: published`

## Obsidian Syntax Handling

Obsidian-specific syntax needs conversion at Eleventy build time:

### Wikilinks: `[[page-name]]` → `[page-name](/posts/page-name/)`
- Resolved at build time via an Eleventy transform or markdown-it plugin
- Only converts links to existing published content
- Broken links logged as warnings during build

### Callouts: `> [!note]` → styled HTML divs
- Converted via a markdown-it plugin or post-processing transform
- Maps to CSS classes: `.callout.callout-note`, `.callout.callout-warning`, etc.

## Image Strategy

Same as before — images in repo, ~200KB each, CDN later if needed.

| Scenario                  | Weekly   | Yearly   |
|---------------------------|----------|----------|
| 2 posts/week, ~3 images   | ~2MB     | ~100MB   |
| 1 post/week, ~2 images    | ~600KB   | ~30MB    |
