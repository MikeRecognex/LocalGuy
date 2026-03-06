---
title: "Qwen 3.5 122B A10B GGUF Quantization Achieves 99.9% KL Divergence"
date: 2026-03-06
description: "Unsloth has released optimized GGUF quantizations of Qwen 3.5's largest models, including the 122B-A10B and 35B-A3B variants with near-perfect quality preservation. This represents a significant milestone in making frontier-scale models viable for local deployment."
tags:
  - daily-digest
  - quantisation
  - qwen
  - llama-cpp
  - performance
status: draft
---

Unsloth has published final GGUF benchmarks for Qwen 3.5's largest open-source variants, achieving 99.9% KL divergence—meaning the quantized models are virtually indistinguishable from originals in practice. The 122B-A10B and 35B-A3B quantizations represent months of optimization work focused on the best size-to-quality tradeoff for local inference.

For practitioners running large models on consumer hardware, this breakthrough matters significantly. Achieving 99.9% KL divergence at aggressive quantization levels means you can run state-of-the-art 122B parameter models with minimal quality loss, making frontier capabilities accessible without enterprise-grade GPUs. The work is now available in [llama.cpp-compatible GGUF format](https://www.reddit.com/r/LocalLLaMA/comments/1rm3e2h/final_qwen35_unsloth_gguf_update/), enabling deployment across virtually any platform.

This follows the broader Qwen 3.5 release trend of delivering progressively more efficient quantizations, making these models the practical standard for local deployment in early 2026.

---
*Source: [r/LocalLLaMA](https://i.redd.it/9vw1iichx8ng1.png) · Relevance: 10/10*
