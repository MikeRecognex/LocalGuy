# Phase 6: Obsidian Git Plugin Setup

## What It Does

The Obsidian Git plugin adds git operations directly inside Obsidian:
commit, push, pull, view diffs — all without leaving the editor.

## Installation

1. Open Obsidian Settings → Community Plugins
2. Search for "Obsidian Git"
3. Install and enable

## Recommended Configuration

| Setting                     | Value                  | Why                           |
|-----------------------------|------------------------|-------------------------------|
| Auto commit interval        | 0 (disabled)           | Manual commits = clean history |
| Auto push after commit      | Yes                    | One action to publish          |
| Pull on startup             | Yes                    | Stay in sync                   |
| Commit message template     | `{{date}}: {{files}}`  | Readable commit log            |
| Show status bar             | Yes                    | See uncommitted changes        |

## Recommended Workflow

### Writing (private)
1. Create new file in `_private/drafts/`
2. Write freely — nothing here reaches GitHub

### Publishing
1. Move file from `_private/drafts/` to `content/posts/`
2. Rename to `YYYY-MM-DD-slug.md`
3. Set frontmatter `status: published`
4. In Obsidian: open command palette → "Obsidian Git: Commit all changes"
5. Plugin commits and pushes
6. Vercel rebuilds automatically
7. Post is live

### Updating
1. Edit the file in `content/posts/`
2. Commit and push via plugin
3. Site rebuilds with changes

### Archiving
1. Change `status: published` to `status: archived`
2. Commit and push
3. Post remains accessible by URL but drops from feeds and listings

## Commit Policy

- Commit only when ready to publish or update
- Don't auto-commit on a timer (creates noisy history)
- Use meaningful commit messages: "publish: post title" or
  "update: fix typo in post-name"

## Handling Conflicts

If you edit from multiple devices or the web:
- Plugin will pull before pushing
- Markdown conflicts are easy to resolve (plain text)
- Avoid editing the same file from two places simultaneously

## Alternative: Manual Git

If you prefer terminal:
```bash
git add content/posts/my-new-post.md
git commit -m "publish: My New Post"
git push
```

Both approaches trigger the same Vercel build.
