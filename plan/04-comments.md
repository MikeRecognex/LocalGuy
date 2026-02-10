# Phase 4: Giscus Comments

## What Is Giscus

Giscus is a comment widget powered by GitHub Discussions. When a reader
leaves a comment on your post, it creates (or appends to) a Discussion
in your GitHub repo. Comments are:

- Stored in GitHub Discussions (not in your content)
- Authenticated via GitHub OAuth
- Markdown-supported
- Reaction-enabled
- URL-addressable
- Moderated via GitHub repo permissions

## How It Works

```
Reader visits post
       │
       ▼
Giscus widget loads (client-side script)
       │
       ▼
Widget connects to GitHub Discussions API
       │
       ▼
Displays existing comments for this URL
       │
       ▼
Reader signs in via GitHub OAuth to comment
       │
       ▼
Comment stored as GitHub Discussion reply
       │
       ▼
No rebuild needed — comments are live
```

## Setup Requirements

1. **Public GitHub repo** (already planned)
2. **GitHub Discussions enabled** on the repo
3. **Giscus app installed** on the repo (github.com/apps/giscus)
4. **Discussion category** created: "Blog Comments"

## Configuration

Giscus is configured via `<script>` tag attributes. We'll store config
in `_data/site.json` and render it via a partial.

### `_data/site.json` additions

```json
{
  "giscus": {
    "repo": "yourusername/localguy",
    "repoId": "R_...",
    "category": "Blog Comments",
    "categoryId": "DIC_...",
    "mapping": "pathname",
    "reactionsEnabled": "1",
    "emitMetadata": "0",
    "inputPosition": "top",
    "theme": "preferred_color_scheme",
    "lang": "en"
  }
}
```

The `repoId` and `categoryId` are obtained from https://giscus.app
after configuring the repo.

### Partial: `_includes/partials/giscus.njk`

```html
{% if comments !== false %}
<section class="comments">
  <h2>Comments</h2>
  <script
    src="https://giscus.app/client.js"
    data-repo="{{ site.giscus.repo }}"
    data-repo-id="{{ site.giscus.repoId }}"
    data-category="{{ site.giscus.category }}"
    data-category-id="{{ site.giscus.categoryId }}"
    data-mapping="{{ site.giscus.mapping }}"
    data-reactions-enabled="{{ site.giscus.reactionsEnabled }}"
    data-emit-metadata="{{ site.giscus.emitMetadata }}"
    data-input-position="{{ site.giscus.inputPosition }}"
    data-theme="{{ site.giscus.theme }}"
    data-lang="{{ site.giscus.lang }}"
    crossorigin="anonymous"
    async>
  </script>
</section>
{% endif %}
```

### Integration in Post Template

The `giscus.njk` partial is included at the bottom of `post.njk`,
after the article content and before the page footer.

### Mapping Strategy: `pathname`

Giscus maps comments to posts using the URL pathname. This means:

- `/posts/my-post/` → Discussion titled "/posts/my-post/"
- If you change a post's URL, comments are orphaned
- This is the simplest and most reliable mapping

Alternative: `title` mapping (uses post title), but pathname is
more stable.

## Disabling Comments Per-Post

Set `comments: false` in frontmatter:

```yaml
---
title: "A Post Without Comments"
comments: false
---
```

The partial checks this and skips rendering the widget.

## Dark Mode Support

Giscus supports `preferred_color_scheme` as a theme option, which
automatically matches the user's system dark/light preference. This
aligns with our CSS dark mode approach.

## Moderation

- **Delete comments**: via GitHub Discussions interface
- **Lock discussions**: prevent further comments on a post
- **Block users**: via GitHub user blocking
- **No spam filters**: GitHub's own spam detection applies
- **No anonymous comments**: GitHub auth required

## Guarantees

- Comments survive site rebuilds (they live in GitHub, not the build)
- Comments are URL-addressable (each is a Discussion reply with its own link)
- No tracking cookies (GitHub OAuth is per-session)
- If Giscus service goes down, comments still exist in GitHub Discussions
- If you remove Giscus, all comments remain in GitHub Discussions

## Compared to Webmentions

| Feature              | Giscus                  | Webmentions            |
|----------------------|-------------------------|------------------------|
| Auth required        | GitHub account          | None (federated)       |
| Storage              | GitHub Discussions      | Webmention.io          |
| Moderation           | GitHub repo controls    | Manual filtering       |
| Setup complexity     | Low (one script tag)    | Medium (multiple services) |
| Audience fit         | Technical/GitHub users  | Fediverse/IndieWeb users |
| Offline resilience   | Comments survive rebuilds | Need build-time fetch |
| Cost                 | Free                    | Free                   |
