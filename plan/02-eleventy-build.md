# Phase 2: Eleventy Build Pipeline

## Role

Transform Markdown from Obsidian vault into static HTML with strict
content lifecycle enforcement, Obsidian syntax conversion, and feed
generation.

## Configuration (`eleventy.config.js`)

### Key Responsibilities

1. **Passthrough copy**: assets, CSS
2. **Collections**: posts (published only), all posts (including archived)
3. **Frontmatter validation**: reject posts with missing required fields
4. **Draft exclusion**: status !== 'published' excluded from production
5. **Obsidian syntax conversion**: wikilinks, callouts
6. **Feed generation**: RSS (Atom) + JSON Feed
7. **Filters**: date formatting, head, slug helpers

### Collections

```js
// Published posts — main collection for feeds and listings
eleventyConfig.addCollection("posts", function (collectionApi) {
  return collectionApi
    .getFilteredByGlob("content/posts/*.md")
    .filter(item => item.data.status === "published")
    .sort((a, b) => b.date - a.date);
});

// All built posts — includes archived (for URL preservation)
eleventyConfig.addCollection("allPosts", function (collectionApi) {
  return collectionApi
    .getFilteredByGlob("content/posts/*.md")
    .filter(item => {
      if (process.env.ELEVENTY_ENV === "production") {
        return item.data.status !== "draft";
      }
      return true; // show all in dev
    })
    .sort((a, b) => b.date - a.date);
});
```

### Frontmatter Validation

```js
// Eleventy event: validate frontmatter before build completes
eleventyConfig.on("eleventy.before", () => {
  // Log warnings for posts missing required fields
});

eleventyConfig.addLinter("frontmatter-check", function(content, inputPath) {
  if (!inputPath.includes("/posts/")) return;
  const required = ["title", "date", "description", "tags", "status"];
  const validStatuses = ["draft", "published", "archived"];
  // Check required fields exist
  // Check status is valid enum value
  // Log warnings (don't fail build, but warn loudly)
});
```

### Obsidian Syntax Conversion

#### Wikilinks

```js
// markdown-it plugin or transform
// [[page-name]] → <a href="/posts/page-name/">page-name</a>
// [[page-name|display text]] → <a href="/posts/page-name/">display text</a>
```

Options:
- **markdown-it-wikilinks** plugin (customised)
- Custom Eleventy transform that runs regex replacement on rendered HTML

#### Callouts

```
> [!note] Title
> Content here

→

<div class="callout callout-note">
  <p class="callout-title">Title</p>
  <p>Content here</p>
</div>
```

Options:
- **markdown-it-obsidian-callouts** plugin
- Custom transform on the Markdown before rendering

### Slug Normalisation

Filenames drive permalinks. The date prefix is stripped:

```
2026-02-09-my-post.md → /posts/my-post/
```

Handled via permalink in a directory data file:

```json
// content/posts/posts.json
{
  "layout": "layouts/post.njk",
  "permalink": "/posts/{{ page.fileSlug | removeDatePrefix }}/",
  "comments": true
}
```

### Build Commands

```json
{
  "scripts": {
    "dev": "npx @11ty/eleventy --serve",
    "build": "ELEVENTY_ENV=production npx @11ty/eleventy",
    "clean": "rm -rf _site"
  }
}
```

### Feeds

- **Atom feed**: `/feed.xml` — published posts only
- **JSON feed**: `/feed.json` — published posts only
- Archived posts excluded from feeds but accessible by URL

## Key Dependencies

| Package                              | Purpose                   |
|--------------------------------------|---------------------------|
| `@11ty/eleventy`                     | Static site generator     |
| `@11ty/eleventy-plugin-rss`          | RSS/Atom + JSON feeds     |
| `markdown-it-wikilinks` (or custom)  | Wikilink conversion       |
| `markdown-it-obsidian-callouts` (or custom) | Callout conversion |

## Output Structure

```
_site/
├── index.html
├── posts/
│   ├── my-post/index.html      (published)
│   ├── old-post/index.html     (archived — accessible but not listed)
│   └── ...
├── tags/
│   └── {tag}/index.html
├── about/index.html
├── now/index.html
├── assets/images/
├── css/style.css
├── feed.xml
├── feed.json
└── 404.html
```
