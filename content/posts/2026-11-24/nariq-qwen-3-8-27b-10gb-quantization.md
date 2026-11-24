---
title: "NariQ: BF16-Level Qwen 3.8 27B Compressed to 10GB GGUF"
date: 2026-11-24
description: "New quantization approach achieves BF16-equivalent quality Qwen 3.8 27B in just 10GB, enabling viable deployment on memory-constrained systems."
tags:
  - daily-digest
  - quantisation
  - gguf
  - open-source
status: draft
---

NariQ's quantization of Qwen 3.8 27B to 10GB while maintaining BF16-level quality represents a major efficiency milestone in model compression. Getting a 27-billion parameter model under 10GB—suitable for many consumer GPUs and Apple Silicon configurations—while preserving the quality characteristics of the full-precision version significantly expands the hardware where this capable model can run.

This breakthrough combines multiple quantization techniques optimized specifically for Qwen's architecture, demonstrating the value of model-specific optimization over one-size-fits-all quantization schemes. The GGUF format ensures broad compatibility with inference frameworks like llama.cpp and Ollama, making the quantized model immediately useful across the ecosystem.

For local deployment practitioners, models at this compression/quality tradeoff point unlock new possibilities. A 27B model at 10GB fits comfortably on mid-range consumer GPUs (3070/4070) and even higher-end M-series Macs, making it viable for production inference workloads that would otherwise require expensive hardware or cloud services. This represents the practical frontier of what's achievable in local deployment today.

[Read the full article on Hacker News](https://huggingface.co/nari-labs/Qwen3.8-27B-NariQ-GGUF).

---
*Source: [Hacker News](https://huggingface.co/nari-labs/Qwen3.8-27B-NariQ-GGUF) · Relevance: 9/10*
