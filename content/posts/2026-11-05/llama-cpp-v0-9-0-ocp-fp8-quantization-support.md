---
title: "llama.cpp v0.9.0 Adds OCP FP8 Quantization and Flash Attention Improvements"
date: 2026-11-05
description: "llama.cpp releases v0.9.0 introducing OCP FP8 E4M3 quantization support and a new flash_attn_ext_rows operation for efficient multi-sequence inference. The release also adds support for four new model architectures and audio generation capabilities."
tags:
  - audio-generation
  - batch-inference
  - consumer-gpu
  - daily-digest
  - edge-device
  - flash-attention
  - fp8-quantization
  - inference-optimization
  - llama-cpp
  - quantisation
  - release
status: published
---

llama.cpp v0.9.0 represents a significant advancement in quantization options and inference efficiency. OCP FP8 E4M3 quantization provides another avenue for reducing model memory footprint while maintaining reasonable accuracy, giving operators more flexibility in deploying models on resource-constrained hardware. The new flash_attn_ext_rows operation specifically improves the efficiency of unified KV caches for multi-sequence (batch) inference scenarios.

These improvements matter because they directly address real deployment challenges: fitting larger models into limited VRAM and handling concurrent inference requests efficiently. With support for four additional architectures and audio generation capabilities, this release broadens llama.cpp's applicability across different model families and use cases. For practitioners optimizing deployments on consumer GPUs, mobile devices, or server infrastructure, these additions provide immediate practical benefits.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v0.9.0).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v0.9.0) · Relevance: 9/10*
