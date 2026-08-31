---
name: write-guide
description: Turn a published LocalGuy news post into a researched, verified guide in the guides section, and cross-link the two. Use when the user supplies a post URL or slug and asks for a guide, deep-dive, or how-to based on it. Trigger phrases - write a guide for, guide from this post, deep dive on this post, turn this post into a guide.
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Agent, WebFetch, WebSearch, AskUserQuestion
argument-hint: "<post URL or slug>"
---

# Write a guide from a post

Input: `$ARGUMENTS` — a post URL (`https://www.lftw.dev/posts/<slug>/`), a bare slug, or a local path.

The news posts are short, auto-generated, and frozen at their publish date. A guide earns its place only if it adds something the post does not have: verified mechanism, undocumented interfaces, what changed since the post ran, and honest costs. If the research doesn't produce that, **do not write a guide** — see step 4.

Run steps 1–8 in order. Stop after step 8 for review. Do not commit or push.

---

## Step 1 — Resolve the post

Extract the slug from `$ARGUMENTS` and find the file:

```bash
find content/posts -name "<slug>.md"
```

If that misses, grep `content/posts` for the title. Read the post in full. Note its **date** — the gap between then and today is where most of the guide's value comes from.

Confirm `status: published` in the frontmatter. If it's a draft, tell the user and ask whether to continue.

## Step 2 — Read the site's current conventions

Do not rely on remembered conventions; read them:

- `content/guides/guides.json` — layout and permalink
- `content/pages/guides.njk` — the **valid category list** (currently `getting-started`, `hardware`, `models`, `deployment`; treat the file as authoritative)
- Any existing file in `content/guides/` — frontmatter schema and house style
- `css/style.css`, search `data-callout` — which Obsidian callout types are styled

## Step 3 — Research (delegate to a subagent)

Launch a `general-purpose` subagent. Isolating this matters: raw research is long and mostly discarded.

Give it the post's primary source links and adapt this brief:

> Research task — RESEARCH ONLY, do not write any files.
>
> I am writing a how-to guide based on a news post dated `<POST DATE>` about `<TOPIC>`. Today is `<TODAY>`. Verify against primary sources — upstream repo, official docs, issue tracker, release notes. Use `gh api` for GitHub rather than scraping.
>
> 1. What did the referenced commit/PR/release actually change? Get the real commit message, PR number, author, date, files touched.
> 2. **What has changed since `<POST DATE>`?** Defaults, flag names, precedence rules, removed or renamed fields, follow-up PRs that reworked it. Write the guide against current upstream, not against the post. This is the highest-value question here.
> 3. Exact interface: flag names, accepted values, defaults, env vars, config keys, API fields. Note anything real but **absent from the official docs** — that's the most useful thing you can find.
> 4. What is the actual mechanism? Not the marketing description — what the code does.
> 5. What does it cost? Performance, memory, compatibility, features it silently disables.
> 6. Compatibility: which models/platforms/versions, and which downstream tools do *not* have it yet.
> 7. Open issues, known bugs, unmerged PRs that people might mistake for available.
> 8. Real published benchmarks, if any exist.
>
> Report concisely. **CRITICAL:** separate (a) facts verified from primary sources with URLs, from (b) things you could not verify. Do not fill gaps with plausible-sounding invention — if you cannot confirm a flag name, a value, or a number, say so explicitly. If you find benchmark figures, trace them to a primary source; SEO aggregators and AI content farms recycle invented numbers, and naming them as unreliable is a useful finding in itself. A short accurate brief beats a long confident one.

## Step 4 — Decide whether a guide is warranted

Gate before writing. A guide is warranted if research produced **at least three** of:

- a mechanism that contradicts the obvious assumption
- interfaces that work but aren't in the official docs
- material drift since the post date
- a real cost or trade-off nobody documents
- non-obvious compatibility limits
- caveats that would cost a reader an afternoon

If not, **stop and report back**: say what was researched, what turned up, and why it doesn't clear the bar. A thin guide is worse than no guide — the guides section is small and every page should justify itself. Offer alternatives (update the post in place, or hold until upstream moves).

## Step 5 — Verify the load-bearing claims yourself

Take the 4–6 claims the guide actually rests on and confirm each against primary source directly, not through the subagent's summary. For GitHub sources:

```bash
gh api repos/<owner>/<repo>/contents/<path> --jq '.content' | base64 -d | grep -n -A5 "<thing>"
```

Anything that fails verification comes out of the guide, or goes in explicitly hedged. Drop anything from category (b) of the research brief unless you're labelling it as unverified on purpose.

## Step 6 — Write the guide

Create `content/guides/<slug>.md`. Frontmatter:

```yaml
---
title: "Verb-first, specific, searchable"
date: <TODAY>
updated: <TODAY>
description: "One sentence on what the reader can do after reading, ideally naming the non-obvious payoff."
tags:
  - <3-5 tags, reusing the source post's tags where they fit>
status: published
category: <one of the values from guides.njk>
difficulty: beginner | intermediate | advanced
timeEstimate: "N min"
---
```

Structure that works:

1. **Opening** — the problem in two or three sentences, then what the guide covers. No throat-clearing.
2. **A version/staleness callout** — `> [!warning]` naming the date the guide was verified against and what has moved since the post. Readers arrive from a months-old post; tell them immediately.
3. **What it actually does** — the corrected mental model, with the consequences enumerated. Usually the most valuable section.
4. **Numbered steps** — runnable commands, real flags, tables for interfaces.
5. **The undocumented parts** — flagged as such, with the source file that proves they exist.
6. **The cost** — what switching this on takes away.
7. **How to choose values** — see claim discipline below.
8. **Known rough edges** — open issues with numbers and links, marked open vs fixed.
9. **Ecosystem limits** — what doesn't support it yet.
10. **Next steps** — primary sources, plus a wikilink back to the post.

House style:

- Link every non-obvious claim to its primary source (commit, PR, issue, source file).
- Obsidian callouts render on the site and in Obsidian: `> [!warning]`, `> [!tip]`, `> [!note]`. Use them for things that will bite the reader, not for emphasis.
- Tables for flags and API fields. Fenced code blocks with a language for anything runnable.
- Link back to the post with a wikilink: `[[<post-slug>|<Post Title>]]`.
- If a Revyzor mention appears anywhere, it needs `{% disclosure %}` adjacent.

**Claim discipline — this is the part that matters most:**

- State the narrowest demonstrable capability. Don't inflate a verified mechanism into a broader claim about what it means.
- **Never invent numbers.** If no published benchmark exists, say so plainly, warn the reader off the unsourced figures in circulation, and give them a method to measure their own instead. A reproducible method is worth more than a borrowed number.
- Attribute every measurement, and give its conditions — a figure from a build with a since-fixed bug is not a current figure.
- Distinguish "verified in source" from "reported by users" from "I could not confirm."

## Step 7 — Cross-link the post

Edit the post file. Two links, no more:

- A `> [!tip]` callout immediately after the frontmatter, before the first paragraph — one sentence on what the guide adds, linking `/guides/<slug>/`.
- A short `## Putting it into practice` section after the body and **before** the trailing `---` / `*Source:*` line, naming two or three concrete things the guide covers.

Leave the original post text alone. It's a dated record; the callout is the correction layer.

## Step 8 — Build and verify

```bash
npx @11ty/eleventy 2>&1 | tail -5
```

Then confirm, don't assume:

```bash
ls _site/guides/<slug>/
grep -o '<slug>' _site/guides/index.html | head -1          # listed under its category
grep -c 'guides/<slug>' _site/posts/<post-slug>/index.html  # expect 2
grep -o 'data-callout="[a-z]*"' _site/guides/<slug>/index.html
grep -o 'wikilink' _site/guides/<slug>/index.html           # back-link resolved
```

A wikilink that didn't resolve renders as plain text — check for the `wikilink` class, not just the words.

## Step 9 — Report and stop

Summarise in a few lines: what the guide adds that the post doesn't, which claims you verified directly and against what, and anything you deliberately left out or hedged. Surface any judgement call the user might want to overturn — category choice, difficulty, angle.

Then stop. The user commits and pushes.

If they ask you to push afterwards: remote `origin` is the **public** repo. Stage only the guide and the post — never `.codebase-index-cache.pkl` or unrelated dirty files.
