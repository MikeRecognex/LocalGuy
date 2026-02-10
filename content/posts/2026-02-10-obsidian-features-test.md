---
title: "Testing Obsidian Features"
date: 2026-02-10
description: "A test post to verify wikilinks and callouts render correctly."
tags:
  - test
  - meta
status: published
---

This post tests Obsidian-specific syntax that gets converted at build time.

## Wikilinks

Here's a link to another post using wikilink syntax: [[hello-world]].

You can also use display text: [[on-owning-your-content|the post about content ownership]].

## Callouts

> [!note] This is a note
> Notes are useful for supplementary information that doesn't fit in the main flow.

> [!tip] Pro tip
> You can write in Obsidian using all the syntax you're used to, and Eleventy will convert it to HTML.

> [!warning] Watch out
> If you use Obsidian-only embed syntax like `![[filename]]`, it won't convert automatically. Stick to standard Markdown images.

> [!info] How this works
> The build pipeline uses `markdown-it-wikilinks` and `markdown-it-obsidian-callouts` to convert these at build time. No JavaScript required on the reader's end.

## Standard Markdown Still Works

- **Bold** and *italic* work as expected
- [Standard links](https://example.com) work too
- `inline code` and code blocks work

Everything plays nicely together.
