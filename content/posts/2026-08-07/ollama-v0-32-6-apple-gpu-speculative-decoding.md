---
title: "Ollama v0.32.6: Faster Apple GPU Inference with Speculative Decoding"
date: 2026-08-07
description: "Ollama releases v0.32.6 with significant performance improvements for Apple Silicon users, including automatic speculative decoding via MLX engine's MTP head and improved OpenAI-compatible streaming format."
tags:
  - api-compatibility
  - apple-silicon
  - bullish
  - daily-digest
  - developer
  - inference-speed
  - intermediate
  - mlx
  - ollama
  - qwen-3-5
  - release
  - speculative-decoding
source:
  name: "Ollama release"
  url: "https://github.com/ollama/ollama/releases/tag/v0.32.6"
status: published
---

Ollama v0.32.6 brings meaningful performance optimizations for local LLM deployment on Apple devices. The MLX engine now automatically leverages model MTP heads for speculative decoding on Qwen3.5 and compatible models, enabling faster token generation without requiring manual configuration.

Additionally, the release improves streaming compatibility by matching OpenAI's wire format exactly—role information only appears on the first chunk and finish_reason on its own chunk. This makes Ollama a drop-in replacement for existing applications expecting OpenAI-compatible endpoints, reducing friction for developers migrating to local inference.

For practitioners running inference on MacBooks and Mac Studios, these improvements directly translate to faster response times and better resource utilization, making local deployment more practical for production workloads.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.6).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.6) · Relevance: 9/10*
