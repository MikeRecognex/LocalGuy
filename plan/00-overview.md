# Local-first Publishing Pipeline

## Overview

Obsidian is the canonical source of content. GitHub is the synchronisation
boundary. Eleventy is a pure renderer. Vercel is stateless delivery.
Discussions live outside the content repo (GitHub Discussions via Giscus).

## Core Principles

- Writer-first workflow (Obsidian as single source of truth)
- No backend servers
- Free hosting (Vercel)
- Own your content (plain Markdown, portable)
- Comments via GitHub Discussions (Giscus) — no moderation burden

## Anti-Goals

- No traditional CMS
- No backend database
- No user accounts on the site itself
- No adtech or tracking pixels
- No Mastodon/IndieWeb identity (for now)

## Architecture

```
┌─────────────────────────────────────────────────┐
│  1. Authoring          Obsidian vault            │
│                        (Markdown + frontmatter)  │
├─────────────────────────────────────────────────┤
│  2. Sync               Obsidian Git plugin       │
│                        → single public GitHub    │
│                          repo                    │
├─────────────────────────────────────────────────┤
│  3. Build              Eleventy (11ty)           │
│                        - CommonMark + wikilinks  │
│                        - callout conversion      │
│                        - strict lifecycle        │
│                          enforcement             │
├─────────────────────────────────────────────────┤
│  4. Presentation       Static HTML/CSS           │
│                        Medium-style reading      │
├─────────────────────────────────────────────────┤
│  5. Comments           Giscus                    │
│                        → GitHub Discussions      │
│                        (readers auth via GitHub)  │
├─────────────────────────────────────────────────┤
│  6. Hosting            Vercel                    │
│                        (auto-deploy on push)     │
└─────────────────────────────────────────────────┘
```

## Data Flow

```
Write in Obsidian
       │
       ▼
Obsidian Git plugin commits + pushes
       │
       ▼
GitHub repo receives push
       │
       ▼
Vercel detects push, runs Eleventy build
  - validates frontmatter (status must be "published")
  - converts wikilinks → standard links
  - converts callouts → HTML
  - generates HTML, RSS, JSON feed
       │
       ▼
Static site live on Vercel CDN
       │
       ▼
Readers comment via Giscus widget
  → stored in GitHub Discussions
  → survives site rebuilds
  → no data in the content repo
```

## Key Decisions (Settled)

| Decision              | Choice                                    |
|-----------------------|-------------------------------------------|
| Repo structure        | Single public repo                        |
| Comment system        | Giscus (GitHub Discussions)               |
| Commenter auth        | GitHub OAuth (tech audience)              |
| Social layer          | None for now (optional RSS syndication)   |
| Content sync          | Obsidian Git plugin                       |
| Content lifecycle     | Strict: draft → published → archived      |
| Obsidian syntax       | Wikilinks + callouts converted at build   |
| Comments scope        | Every post by default, opt-out via frontmatter |
| Existing work         | Evolve current project                    |

## Expected Operating Costs

| Item         | Monthly Cost |
|--------------|-------------|
| Hosting      | £0 (Vercel free tier) |
| Comments     | £0 (GitHub Discussions) |
| Domain       | £0–£10/year (optional) |

## Implementation Phases

| Phase | Name                        | Document                |
|-------|-----------------------------|-------------------------|
| 1     | Vault & Project Structure   | `01-vault-structure.md` |
| 2     | Eleventy Build Pipeline     | `02-eleventy-build.md`  |
| 3     | Templates & Presentation    | `03-presentation.md`    |
| 4     | Giscus Comments             | `04-comments.md`        |
| 5     | Hosting & Deployment        | `05-hosting.md`         |
| 6     | Obsidian Git Setup          | `06-obsidian-git.md`    |
| 7     | Optional Extensions         | `07-extensions.md`      |
| 8     | Implementation Sequence     | `08-sequence.md`        |
