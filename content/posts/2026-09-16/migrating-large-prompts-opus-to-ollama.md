---
title: "Migrating Large Prompts from Anthropic to Self-Hosted Ollama"
date: 2026-09-16
description: "Developer shares practical lessons learned migrating 35KB preprompts from Claude Opus to self-hosted Ollama, documenting gotchas and workarounds for local LLM deployment."
tags:
  - daily-digest
  - ollama
  - open-source
  - context-window
status: draft
---

A developer has documented the technical challenges and solutions encountered when migrating large preprompts from Anthropic's Claude Opus to self-hosted Ollama deployments. This hands-on experience report covers the friction points that arise when moving from closed-source cloud APIs to local inference, providing practical guidance for others undertaking similar migrations.

The insight is particularly valuable because it addresses real-world constraints that developers face: context window handling, prompt formatting differences, and performance characteristics between commercial APIs and open-source models running locally. This kind of documentation helps practitioners understand not just the mechanics of self-hosting, but the actual pain points and trade-offs involved in reducing API dependencies.

[Read the full article on Hacker News](https://patrickmccanna.net/notes-on-migrating-large-prompts-away-from-anthropic-openai-to-self-hosted-llms/).

---
*Source: [Hacker News](https://patrickmccanna.net/notes-on-migrating-large-prompts-away-from-anthropic-openai-to-self-hosted-llms/) · Relevance: 9/10*
