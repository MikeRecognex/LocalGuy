# Phase 3: Templates & Presentation

## Design Philosophy

- Semantic HTML first
- Minimal, readable CSS — no frameworks
- No JavaScript required for core reading experience
- Progressive enhancement only
- Fast on slow connections
- Accessible (WCAG AA minimum)

## Template Hierarchy

```
base.njk
├── post.njk      (extends base)
├── note.njk      (extends base)
├── page.njk      (extends base)
└── tag.njk       (extends base)
```

### `base.njk` — Master Layout

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ title }} — {{ site.name }}</title>
  <link rel="stylesheet" href="/css/style.css">
  <link rel="alternate" type="application/atom+xml" href="/feed.xml">
  <link rel="alternate" type="application/json" href="/feed.json">
  {% include "partials/meta.njk" %}
</head>
<body>
  {% include "partials/header.njk" %}
  <main>
    {{ content | safe }}
  </main>
  {% include "partials/footer.njk" %}
</body>
</html>
```

### `post.njk` — Article Layout (Medium-style)

- Extends `base.njk`
- Hero image at top (from `image` frontmatter field)
- Title, author, date, estimated reading time
- Clean, wide-measure body text
- Tags displayed at bottom
- Webmentions section (replies, likes, boosts)
- Includes Open Graph and Twitter Card meta
- Microformats2 markup (`h-entry`, `e-content`, `dt-published`)

### `note.njk` — Short-form Layout

- Lighter than post — no hero, smaller heading
- Still includes microformats2 for IndieWeb compatibility
- Shows content inline, minimal chrome

### `page.njk` — Evergreen Page Layout

- No date display
- No tags
- Clean, simple presentation

## Partials

### `header.njk`
- Site name / logo
- Primary navigation (Home, Posts, Notes, About)

### `footer.njk`
- Copyright
- `rel=me` links (Mastodon, GitHub, etc.)
- Link to RSS feed

### `nav.njk`
- Responsive navigation
- Current page indicator
- No JavaScript hamburger — use CSS-only or simple `<details>`

### `meta.njk`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card meta
- Canonical URL
- JSON-LD structured data (Article schema)

### `webmentions.njk`
- Renders collected webmentions under a post
- Groups by type: replies, likes, reposts
- Discussed in detail in Phase 4

## CSS Strategy

### Approach: Single Stylesheet

One `style.css` file. No preprocessor unless complexity demands it later.

### Key Design Tokens

```css
:root {
  --font-body: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", monospace;
  --color-text: #1a1a1a;
  --color-bg: #fefefe;
  --color-accent: #0055ff;
  --color-muted: #666;
  --max-width: 42rem;
  --spacing: 1.5rem;
}
```

### Typography

- Body: 18px base, 1.6 line-height
- Headings: scale using `clamp()` for fluid sizing
- Code blocks: monospace, subtle background
- Links: underlined, accent colour, visible focus states

### Layout

- Single-column, centred, max-width ~42rem
- Generous whitespace
- Responsive without breakpoints where possible (fluid design)

### Dark Mode (Optional Enhancement)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #e0e0e0;
    --color-bg: #1a1a1a;
    --color-accent: #6da3ff;
    --color-muted: #999;
  }
}
```

## Pages to Build

| Page              | URL               | Content Source               |
|-------------------|-------------------|------------------------------|
| Homepage          | `/`               | Latest posts + intro         |
| Post              | `/posts/{slug}/`  | Individual post              |
| Note              | `/notes/{slug}/`  | Individual note              |
| Posts Archive      | `/posts/`         | All posts, reverse-chron     |
| Notes Index       | `/notes/`         | All notes                   |
| Tag Page          | `/tags/{tag}/`    | Posts/notes with that tag    |
| About             | `/about/`         | Evergreen page               |
| Now               | `/now/`           | What I'm doing now           |
| Uses              | `/uses/`          | Tools and setup              |

## Microformats2

IndieWeb requires microformats2 markup for webmentions to work properly.

### On each post (`h-entry`):

```html
<article class="h-entry">
  <h1 class="p-name">{{ title }}</h1>
  <time class="dt-published" datetime="{{ date | isoDate }}">
    {{ date | readableDate }}
  </time>
  <div class="e-content">
    {{ content | safe }}
  </div>
  <a class="u-url" href="{{ page.url }}">Permalink</a>
  <p class="p-author h-card">
    <a class="u-url p-name" href="{{ site.url }}">{{ site.author }}</a>
  </p>
</article>
```

## Decisions to Make

- [ ] Custom CSS vs minimal framework (e.g., Simple.css, Pico)
- [ ] Dark mode: auto-only or user toggle?
- [ ] Whether to include a "Now" page from the start
- [ ] Image handling: lazy loading, responsive images, or keep simple?
