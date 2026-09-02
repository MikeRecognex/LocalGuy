---
title: "DeepSeek Harness: Open-Source Agent Framework with Plugin-Based Architecture"
date: 2026-08-31
description: "DeepSeek AI has published an open-source agent harness (dsh) built on a plugin architecture, run locally via a web UI. It is a developer preview, with compatibility-breaking changes expected."
tags:
  - agent-orchestration
  - agents
  - cordis
  - deepseek-harness
  - developer-preview
  - framework
  - manual
  - open-source
  - plugin-architecture
  - release
mentions:
  - name: GitHub
    role: publisher
status: published
origin: manual
---

DeepSeek AI has published DeepSeek Harness, an open-source agent harness with the CLI name `dsh`. It is built on top of Cordis and follows an "everything-is-a-plugin" architecture. It is written in TypeScript and licensed under MIT.

The harness runs locally via `npx @deepseek-ai/dsh web`, which serves a web interface on `127.0.0.1:3080`; the only stated prerequisite is Node.js. It can also be built from a repository checkout with pnpm. The project is explicitly marked as a **developer preview**—the README warns in bold that there will be compatibility-breaking changes, and directs users to read the included `SAFETY.md` before running it.

What the plugin model actually covers is not set out in the README, which points instead to the repository's architecture and development guides. Given the preview status, this is one to read before building against rather than to depend on.

[Read the full article on github.com](https://github.com/deepseek-ai/deepseek-harness).

---
*Source: [github.com](https://github.com/deepseek-ai/deepseek-harness) · Relevance: 7/10*
