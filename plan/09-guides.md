# Phase 9: Guides

Evergreen, community-editable tutorial content — separate from time-based posts.

## Overview

Guides are long-form, step-by-step tutorials that live alongside posts but serve a different purpose. Posts are time-sensitive news; guides are evergreen reference material. Guides are written in Obsidian using the same vault, stored in `content/guides/`, and rendered on the site at `/guides/`. Each guide has an "Edit this page on GitHub" link so the community can submit improvements via pull requests.

## Obsidian Workflow

### Writing a Guide

1. Create a new file in `content/guides/` in the Obsidian vault
2. Use the guide frontmatter template (below)
3. Write the guide in standard Markdown — same syntax as posts (wikilinks, callouts, code blocks all work)
4. Set `status: draft` while writing, change to `status: published` when ready
5. Commit and push — the guide appears on the site

### Guide Frontmatter

```yaml
---
title: "Installing Ollama on Linux"
date: 2026-02-12
updated: 2026-02-12
description: "Step-by-step guide to installing and configuring Ollama on Ubuntu, Debian, and Fedora."
category: getting-started
difficulty: beginner
time: "15 minutes"
tags:
  - ollama
  - linux
  - installation
status: published
---
```

### Required Fields

| Field         | Type   | Values / Purpose                                        |
|---------------|--------|---------------------------------------------------------|
| `title`       | string | Guide title                                             |
| `date`        | date   | Original publish date                                   |
| `updated`     | date   | Last updated date (shown on page, drives sort order)    |
| `description` | string | Summary for listing page and meta tags                  |
| `category`    | enum   | `getting-started`, `hardware`, `models`, `deployment`   |
| `difficulty`  | enum   | `beginner`, `intermediate`, `advanced`                  |
| `time`        | string | Estimated completion time, e.g. "15 minutes", "1 hour"  |
| `tags`        | list   | Standard tags (shared with posts)                       |
| `status`      | enum   | `draft`, `published`, `archived` (same as posts)        |

### Category Definitions

| Category          | Slug              | Description                                          |
|-------------------|-------------------|------------------------------------------------------|
| Getting Started   | `getting-started` | First steps: installation, first model, basic usage  |
| Hardware          | `hardware`        | Build guides, GPU selection, memory optimisation     |
| Models            | `models`          | Model selection, fine-tuning, quantisation, formats  |
| Deployment        | `deployment`      | Serving, APIs, Docker, networking, security          |

## File Structure

```
content/
├── posts/                    # Existing time-based posts
├── guides/                   # New: evergreen guides
│   ├── guides.json           # Directory data file (layout, permalink pattern)
│   ├── installing-ollama-linux.md
│   ├── choosing-gpu-local-llm.md
│   └── open-webui-setup.md
├── pages/
│   └── guides.njk            # Listing page at /guides/
```

## Implementation

### 1. Directory Data File (`content/guides/guides.json`)

Sets defaults for all guides — layout and permalink pattern:

```json
{
  "layout": "layouts/guide.njk",
  "permalink": "/guides/{{ page.fileSlug }}/",
  "comments": true
}
```

### 2. Guide Layout (`_includes/layouts/guide.njk`)

Extends `base.njk`. Displays:

- Title as `<h1>`
- Metadata bar: difficulty badge, estimated time, category link
- Published date + "Updated" date (if different from published)
- Guide content
- "Edit this page on GitHub" link (constructed from `page.inputPath`)
- Giscus comments (reuse existing partial)

```
┌─────────────────────────────────────────────┐
│ Installing Ollama on Linux                  │
│ Beginner · 15 minutes · Getting Started     │
│ Published 12 Feb 2026 · Updated 15 Feb 2026│
├─────────────────────────────────────────────┤
│                                             │
│ [Guide content in Markdown]                 │
│                                             │
├─────────────────────────────────────────────┤
│ ✏️ Edit this page on GitHub                  │
├─────────────────────────────────────────────┤
│ [Giscus comments]                           │
└─────────────────────────────────────────────┘
```

The "Edit on GitHub" link format:
`https://github.com/MikeRecognex/LocalGuy/edit/main/{{ page.inputPath }}`

### 3. Guides Collection (`eleventy.config.js`)

```javascript
eleventyConfig.addCollection("guides", function (collectionApi) {
  return collectionApi
    .getFilteredByGlob("content/guides/*.md")
    .filter((item) => item.data.status === "published")
    .sort((a, b) => (b.data.updated || b.date) - (a.data.updated || a.date));
});
```

Sorted by `updated` date so recently refreshed guides surface first.

### 4. Guides Listing Page (`content/pages/guides.njk`)

Permalink: `/guides/`. Grouped by category with difficulty badges:

```
┌─────────────────────────────────────────────┐
│ Guides                                      │
│                                             │
│ ## Getting Started                          │
│ ┌─────────────────────────────────────────┐ │
│ │ Installing Ollama on Linux              │ │
│ │ Beginner · 15 minutes                   │ │
│ │ Step-by-step guide to installing...     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ## Hardware                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Choosing a GPU for Local LLMs           │ │
│ │ Intermediate · 20 minutes               │ │
│ │ How to pick the right GPU...            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ## Models                                   │
│ (No guides yet)                             │
│                                             │
│ ## Deployment                               │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### 5. Filters (`eleventy.config.js`)

```javascript
// Filter guides by category
eleventyConfig.addFilter("byCategory", (guides, category) => {
  return guides.filter((g) => g.data.category === category);
});

// Map category slug to display name
eleventyConfig.addFilter("categoryName", (slug) => {
  const names = {
    "getting-started": "Getting Started",
    "hardware": "Hardware",
    "models": "Models",
    "deployment": "Deployment",
  };
  return names[slug] || slug;
});
```

### 6. CSS Additions

- `.guide-meta`: metadata bar (difficulty, time, category)
- `.difficulty-badge`: coloured badge (green=beginner, amber=intermediate, red=advanced)
- `.guide-edit-link`: styled "Edit on GitHub" link
- `.guide-card`: listing page card style (or reuse `.post-list` with additions)

### 7. Header Nav

Add "Guides" link to nav, between "All Posts" and "Contribute":

```
Start Here | All Posts | Guides | Contribute | About | Bookmarks | 🔍
```

### 8. Tag Pagination Filter

Add `"guides"` to the exclusion list in `content/pages/tags.njk` pagination filter, same as posts/allPosts.

## Community Editing Flow

1. User reads a guide and spots an error or wants to add detail
2. Clicks "Edit this page on GitHub" at the bottom
3. GitHub opens the file in the web editor with a fork prompt
4. User makes changes and submits a pull request
5. Mike reviews the PR in GitHub / Obsidian and merges if appropriate
6. Site rebuilds automatically via Vercel

## Implementation Order

1. Create `content/guides/` directory and `guides.json` data file
2. Create `_includes/layouts/guide.njk` layout template
3. Add `guides` collection + `byCategory` filter to `eleventy.config.js`
4. Create `content/pages/guides.njk` listing page
5. Add CSS for difficulty badges, guide metadata, edit link
6. Add "Guides" to header nav
7. Update tag pagination filter
8. Write 1 sample guide to verify the full pipeline
9. Build and test

## Sample Guide (for testing)

A short "Installing Ollama" guide to validate the pipeline end-to-end. Will be replaced or expanded with real content.
