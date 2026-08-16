---
title: "Ollama Adds Qwen 3.8 27B with Optimised Apple Silicon Support"
date: 2026-08-16
description: "Ollama v0.32.12 now supports Qwen 3.8 27B, a 27-billion parameter model optimised for local deployment with special tuning for Apple Silicon devices. The model delivers substantial improvements in coding, professional work, and agentic tasks while running efficiently on consumer hardware."
tags:
  - daily-digest
  - ollama
  - qwen
  - apple-silicon
  - open-source
status: draft
---

Ollama has released version 0.32.12 with integrated support for Qwen 3.8 27B, marking a significant milestone for accessible local LLM deployment. This 27-billion parameter model is specifically optimised for maximum performance and output quality on Apple Silicon devices, addressing a key pain point for M-series MacBook users seeking capable local inference without cloud dependencies.

Qwen 3.8 27B demonstrates substantial performance gains across multiple domains including code generation, professional document work, research tasks, and complex multi-step agentic workflows. At this model size, it represents an optimal balance between capability and resource consumption for on-device deployment, fitting comfortably within 16GB RAM constraints with quantisation. The official integration into Ollama's release cycle signals the maturation of production-ready local inference tooling.

For practitioners, this release enables seamless deployment via `ollama run qwen3.8:27b` with automatic model management and optimised inference kernels. The Apple Silicon optimisation is particularly noteworthy, as it demonstrates how framework-level tuning can extract substantially better throughput than generic implementations.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.12).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.12) · Relevance: 9/10*
