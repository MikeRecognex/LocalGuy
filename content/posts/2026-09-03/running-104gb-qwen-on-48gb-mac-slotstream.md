---
title: "Running 104GB Qwen3.8-Flash-Next on 48GB Mac at ~12 tok/s"
date: 2026-09-03
description: "A developer demonstrates running a 104GB model on a 48GB Mac using innovative slot streaming techniques, achieving practical inference speeds of ~12 tokens/second and expanding the possibilities for large model deployment on consumer hardware."
tags:
  - daily-digest
  - memory-optimization
  - apple-silicon
  - quantisation
  - open-source
status: draft
---

This is a significant breakthrough in memory-efficient inference on Apple Silicon. The slotstream technique allows loading models larger than available RAM by intelligently managing which model weights are actively loaded during inference, effectively creating a dynamic memory management system that trades compute for memory bandwidth.

For local LLM practitioners, this demonstrates that running state-of-the-art large models like Qwen3.8-Flash-Next is now feasible on consumer-grade MacBook Pro machines without quantization. Achieving 12 tokens/second on such large models is practical for many real-world applications including code generation, document analysis, and interactive Q&A systems. This approach could be adapted to other architectures and opens the door to running cutting-edge models locally without enterprise-grade hardware.

[Read the full article on Hacker News](https://github.com/carloslfu/slotstream).

---
*Source: [Hacker News](https://github.com/carloslfu/slotstream) · Relevance: 9/10*
