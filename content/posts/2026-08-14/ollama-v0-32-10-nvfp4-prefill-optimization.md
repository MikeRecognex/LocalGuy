---
title: "Ollama 0.32.10: 7-8% Prefill Speed Gains on NVFP4 Models"
date: 2026-08-14
description: "Ollama 0.32.10 delivers significant prefill performance improvements for NVFP4 quantized models through kernel fusion optimizations, alongside updated default repeat penalty settings for improved speculative decoding."
tags:
  - consumer-gpu
  - daily-digest
  - inference-speed
  - kernel-fusion
  - model-quantization
  - modelopt
  - nvfp4
  - ollama
  - performance
  - quantisation
  - release
  - speculative-decoding
source:
  name: "Ollama release"
  url: "https://github.com/ollama/ollama/releases/tag/v0.32.10"
status: published
---

Ollama 0.32.10 introduces kernel fusion optimizations for NVFP4 (8-bit floating-point with per-channel scales) models, achieving 7-8% prefill speedup on recent ModelOpt checkpoints. The improvement comes from fusing multiply and cast operations into a single GPU kernel, reducing memory bandwidth overhead. Notably, the release also changes default repeat penalty from 1.1 to 1.0, eliminating unnecessary computation and improving compatibility with other inference engines and speculative decoding pipelines.

These refinements represent the maturation of efficient inference optimization. NVFP4 quantisation, developed by NVIDIA, preserves model quality better than INT8 while maintaining 4x memory reduction. The prefill optimizations directly impact user experience—prefill time dominates latency for long prompts and batch processing, making this improvement particularly valuable for RAG systems, multi-document analysis, and interactive applications.

For practitioners running local models on NVIDIA hardware, this update should be prioritized. The repeat penalty fix alone prevents model degradation that users might have worked around with custom configurations. Combined with ongoing llama.cpp improvements, the inference ecosystem is increasingly competitive with commercial offerings while remaining fully self-hosted and customizable.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.10).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.10) · Relevance: 7/10*
