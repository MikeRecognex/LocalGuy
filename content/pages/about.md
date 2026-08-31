---
title: "About LocalFTW"
layout: layouts/page.njk
permalink: /about/
---

## The Short Version

LocalFTW is a community site dedicated to running AI on your own terms — your hardware, your data, your rules. It covers local LLMs, on-device inference, self-hosted AI tools, and everything in between.

## Who's Behind This

I'm Mike Doyle. I work in fintech, where I've spent years building technology that has to meet strict regulatory and compliance standards. That experience gave me a sharp appreciation for where your data lives and who controls it.

About four years ago I started exploring what was possible with local language models. What began as curiosity turned into a genuine conviction: the most interesting AI work isn't happening in the cloud — it's happening on people's own machines, on their own terms.

## Why This Site Exists

The local AI space moves fast. Important developments are scattered across Reddit threads, Hacker News comments, GitHub repos, and X posts. There's no shortage of information, but there's a real shortage of curation.

LocalFTW pulls together the news, guides, and projects that matter to people running AI locally — no marketing fluff, no hype cycles, no "10 AI tools that will change your life" listicles.

## How the Content Is Made

Two kinds of content, made two different ways. The difference matters if you're deciding how much weight to put on something here.

**News posts are drafted automatically.** A daily workflow pulls from Hacker News, Google News, the Hugging Face blog, Simon Willison's blog, and the release feeds for llama.cpp, Ollama and vLLM. A language model then writes a short summary of the items it picks — working from each item's headline and the source's own description, not from the full article. Drafts are reviewed before they go live, and every post carries its source link and its date. They're a record of what was reported at the time, not independent reporting, and they aren't updated as things change.

**Guides are written and verified by hand.** Claims are checked against primary sources — upstream code, commits, issue trackers, model configs — and each guide states the date it was verified. Where a guide and an older post disagree, the guide is the current one.

The workflow that drafts the posts, prompt included, is [in the repo](https://github.com/MikeRecognex/LocalGuy/blob/main/docs/n8n-manual-url-setup.md).

## What Drives This

Three things:

**Privacy and data sovereignty.** When you run a model locally, your prompts, your documents, and your data never leave your machine. For anyone working with sensitive information — in regulated industries or otherwise — that's not a nice-to-have, it's a requirement.

**Cost and independence.** API calls add up. Vendors change terms, raise prices, and deprecate models. Running your own infrastructure means you control your costs and your roadmap.

**The satisfaction of building.** There's something deeply rewarding about getting a model running on your own hardware, tuning it for your use case, and knowing exactly how every piece works. That tinkering spirit is what this community runs on.

## How It's Built

LocalFTW is built the way it preaches — local-first. Guides are written in Obsidian, everything is versioned with Git, built with Eleventy, and deployed as static HTML to Vercel. No database, no CMS, no tracking scripts. The site itself is open source on [GitHub](https://github.com/MikeRecognex/LocalGuy).

## Get Involved

This is a community effort. You can [contribute a post](/contribute/), react to articles to [bookmark](/bookmarks/) them, or open an issue on GitHub to start a conversation.

## Disclosure

I am the founder of Revyzor, a commercial product in the local LLM space. Revyzor is never given preferential coverage here. Any post that mentions it says so at the point of mention.
