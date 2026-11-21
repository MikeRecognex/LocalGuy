---
title: "Inkling 2 Mini: Efficient Open-Weight Model for Local Deployment"
date: 2026-11-21
description: "Thinking Machines releases Inkling 2 Mini, a 26B parameter model with only 5.4B active parameters through looped layers, designed to run efficiently on consumer hardware like Mac Studio with ~20GB memory while supporting multimodal capabilities and tool use."
tags:
  - daily-digest
  - open-source
  - model-release
  - apple-silicon
  - memory-optimization
status: draft
---

Thinking Machines has released Inkling 2 Mini, a compact open-weight model optimized for local inference that challenges the typical size-to-capability tradeoff. With 26B total parameters but only 5.4B active through innovative looped layer architecture, it achieves strong performance while fitting comfortably on consumer hardware around 20GB memory consumption. The model scores 79.2% on SWE-Bench V2, demonstrating that efficient architectural choices can compete with much larger models.

What makes Inkling 2 Mini particularly significant for local deployment practitioners is its multimodal support, tool calling capabilities, and native thinking/reasoning features—functionality typically requiring much larger or cloud-based models. The integration into both Ollama (v0.40.17) and llama.cpp within days of release demonstrates strong ecosystem adoption. This represents a meaningful shift toward pushing inference-time reasoning and multimodal understanding to edge devices without sacrificing practical capabilities.

[Read the full article on Hugging Face Blog](https://huggingface.co/blog/inkling2mini).

---
*Source: [Hugging Face Blog](https://huggingface.co/blog/inkling2mini) · Relevance: 9/10*
