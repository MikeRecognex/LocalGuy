---
title: "DeepSeek-Coder-V2-Lite Quantized to Under 5GB: 65 Tokens/Second on 6GB GPU"
date: 2026-11-13
description: "A community quantization achieves 65 tokens-per-second throughput running DeepSeek-Coder-V2-Lite in under 5GB on a 6GB GPU, demonstrating practical on-device coding assistance performance."
tags:
  - daily-digest
  - quantisation
  - gguf
  - benchmark
status: draft
---

This practical demonstration shows a quantized DeepSeek-Coder-V2-Lite model running entirely in VRAM on a modest 6GB GPU while delivering 65 tokens-per-second—fast enough for interactive use. The model fits in under 5GB, leaving headroom for system overhead and batch processing. This is concrete evidence that state-of-the-art coding assistance models are now deployable on common mid-range consumer GPUs.

The community GGUF quantization achieves this through aggressive but quality-preserving compression, likely combining multiple techniques (low-bit quantization, tensor merging, possibly selective layer optimization). At this throughput, the model provides near-real-time code completion and assistance, making it practical for development workflows without cloud API dependencies.

For practitioners seeking to run powerful coding models locally—whether for privacy, offline capability, or latency sensitivity—this specific configuration is a validated reference. It demonstrates that the gap between 'toy' local models and production-grade inference is closing across different use cases beyond just chat.

[Read the full article on Hacker News](https://huggingface.co/AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF).

---
*Source: [Hacker News](https://huggingface.co/AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF) · Relevance: 8/10*
