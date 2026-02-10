# Phase 7: Optional Extensions

These are not required for launch. Add incrementally.

## Search

### Pagefind (Recommended)
- Runs at build time, generates search index from static HTML
- Tiny client-side JS (~5KB)
- Add to build: `npx pagefind --site _site`
- Update build script: `"build": "npx @11ty/eleventy && npx pagefind --site _site"`

## Analytics

### Privacy-first Options
- **Plausible**: Hosted (~£9/mo) or self-hosted
- **GoatCounter**: Free for non-commercial, open source
- Both: single script tag, no cookies, GDPR-compliant

## Syntax Highlighting

- Plugin: `@11ty/eleventy-plugin-syntaxhighlight`
- PrismJS at build time (no client-side JS)
- Add a theme CSS file

## RSS Syndication (Outbound)

The RSS feed already exists at `/feed.xml`. Optional next steps:
- Auto-post new RSS items to Mastodon via IFTTT or a script
- This is outbound-only — no need for a Mastodon account for comments

## Series Support

Group posts by `series` frontmatter field:
- Create a collection that groups by series name
- Add "Previous/Next in series" navigation to post template
- Add a series landing page

## Reading Time

- Eleventy filter: words / 200 → "X min read"
- Display in post header

## Responsive Images

- `@11ty/eleventy-img` plugin
- Generates multiple sizes at build time
- Add only when image volume justifies build time cost

## Sitemap

- Template-driven `sitemap.xml`
- Lists all published posts and pages
- Good for SEO

## Priority Order

| Extension              | Priority  | Effort  | Impact  |
|------------------------|-----------|---------|---------|
| Syntax highlighting    | High      | Low     | Medium  |
| Sitemap                | High      | Low     | Medium  |
| Pagefind search        | Medium    | Low     | Medium  |
| Reading time           | Medium    | Low     | Low     |
| Series support         | Medium    | Medium  | Medium  |
| Analytics              | Low       | Low     | Low     |
| Responsive images      | Low       | Medium  | Medium  |
| RSS → Mastodon         | Low       | Medium  | Medium  |
