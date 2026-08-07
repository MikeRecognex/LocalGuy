---
title: "Ollama v0.32.6: Qwen3.5 Speculative Decoding and OpenAI-Compatible Streaming"
date: 2026-08-07
description: "Ollama releases v0.32.6 with optimized Qwen3.5 performance on Apple GPUs via MLX speculative decoding and improved OpenAI API compatibility for streaming responses. This update accelerates inference on consumer Apple hardware while maintaining API parity with cloud-based LLM services."
tags:
  - daily-digest
  - ollama
  - speculative-decoding
  - apple-silicon
  - inference-optimization
status: draft
---

Ollama v0.32.6 brings significant performance improvements for local inference, particularly for users running models on Apple Silicon. The release introduces automatic speculative decoding for Qwen3.5 through the MLX engine, which uses the model's MTP head to predict and validate multiple tokens in parallel, resulting in faster generation speeds without sacrificing quality.

Additionally, the streaming endpoint now fully matches OpenAI's wire format specification, improving compatibility with existing applications and libraries designed for cloud-based APIs. This means developers can drop Ollama into existing OpenAI-compatible codebases with minimal changes, making local deployment a genuine alternative to cloud services for price-sensitive and latency-critical applications.

These updates underscore Ollama's focus on making local LLM inference practical and performant on consumer hardware, particularly the ubiquitous Apple Silicon Macs found in many developer and enterprise environments.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.6).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.6) · Relevance: 9/10*
