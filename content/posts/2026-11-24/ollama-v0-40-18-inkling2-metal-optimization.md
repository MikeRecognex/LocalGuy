---
title: "Ollama v0.40.18: Inkling 2 Metal Optimization and Performance Improvements"
date: 2026-11-24
description: "Latest Ollama release brings significant Metal backend optimizations for Inkling 2, plus vLLM-inspired architecture improvements for faster inference on Apple Silicon."
tags:
  - apple-silicon
  - daily-digest
  - inference-optimization
  - inference-speed
  - inkling-2
  - metal-optimization
  - mlx
  - ollama
  - release
  - speculative-decoding
  - vllm
status: published
---

Ollama's v0.40.18 release ships substantial performance improvements for Apple Silicon users, with new Inkling 2-specific Metal kernels that accelerate decode, prefill, and speculative decoding phases. These optimizations are hand-tuned for Apple's GPU architecture and include gated implementations for different GPU generations and model size classes, ensuring efficient utilization across the Mac product line.

The release also incorporates architectural improvements inspired by vLLM's design patterns, particularly around tensor helper functions and model setup routines. This convergence of inference frameworks around best practices indicates the ecosystem is crystallizing around proven optimization techniques—benefiting end users through improved compatibility and performance.

For Mac-based local LLM deployments, this represents the kind of incremental but cumulative improvement that makes inference faster and more practical. When combined with other Ollama updates to llama.cpp version bumping and MLX optimizations, v0.40.18 positions Ollama as the most capable local LLM runtime for Apple Silicon, reducing the gap between cloud-based and self-hosted performance.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.18).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.18) · Relevance: 9/10*
