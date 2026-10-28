---
title: "Ollama v0.40.12 Released with Liquid AI LFM3 Model Family Support"
date: 2026-10-28
description: "Ollama v0.40.12 adds support for Liquid AI's new LFM3 family of small models optimized for local agents, including 1.7B text, multimodal vision, and speech recognition variants with 256K token context windows. This release includes performance improvements targeting prompt speed and small-image detail processing."
tags:
  - daily-digest
  - ollama
  - open-source
  - lfm3
  - agents
status: draft
---

Liquid AI's LFM3 model family represents a significant step forward for local LLM deployment, offering purpose-built models for on-device inference with impressive capabilities at minimal footprint. The 1.7B base model, complemented by vision-enabled (LFM3-VL) and speech-enabled (LFM3-Audio) variants, all operate with a 256K token context window—enabling sophisticated multi-turn conversations and complex reasoning tasks without cloud infrastructure. Ollama's native integration ensures these models are accessible to practitioners through a single command.

The tri-hybrid architecture underlying LFM3 is engineered specifically for local deployment constraints: optimized for tool calling, structured output, and agentic workflows that have previously required larger models or API calls. With v0.40.12 also addressing prompt speed and small-image detail quality, this release removes practical barriers to building production-grade local AI systems. For teams prioritizing data privacy, latency, and operational autonomy, LFM3 via Ollama provides a compelling alternative to cloud-dependent solutions.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.12).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.12) · Relevance: 9/10*
