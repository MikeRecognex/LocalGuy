---
title: "Ollama v0.40.17 Releases with Inkling 2 Mini Support"
date: 2026-11-22
description: "Ollama adds native support for Thinking Machines' new Inkling 2 Mini 26B model, enabling efficient local inference on consumer hardware with 20GB memory requirements on Mac."
tags:
  - daily-digest
  - ollama
  - open-source
  - apple-silicon
status: draft
---

The release of Ollama v0.40.17 brings official support for Inkling 2 Mini, a 26B parameter model with only 5.4B active parameters thanks to its looped layer architecture. This represents a significant practical advancement for local deployment, as the model can run on consumer Macs with approximately 20GB of memory while maintaining strong performance—achieving 79.2% on SWE-Bench V and supporting multimodal capabilities including image understanding, tool calling, and extended thinking.

Inkling 2 Mini exemplifies the trend of architecture-level innovations designed specifically for on-device inference. By using looped layers to reduce active parameter count without sacrificing capability, this model achieves better performance-per-token than its size suggests, making it accessible to users with mid-range hardware.

Ollama's rapid integration of new models into its simple pull-and-run interface democratizes access to these advances. This release demonstrates how emerging open-weight models optimized for local deployment are now being immediately supported by the most user-friendly serving framework, accelerating adoption of local inference across developers and organizations.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.17).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.17) · Relevance: 9/10*
