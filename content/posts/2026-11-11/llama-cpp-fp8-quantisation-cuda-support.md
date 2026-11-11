---
title: "llama.cpp Adds FP8 Quantisation Support for CUDA"
date: 2026-11-11
description: "llama.cpp releases major update adding FP8 (8-bit floating point) quantisation support with CUDA optimization, reducing model memory footprint while maintaining inference quality."
tags:
  - daily-digest
  - llama-cpp
  - quantisation
  - nvidia
  - memory-optimization
status: draft
---

The latest llama.cpp release introduces FP8 quantisation support with CUDA acceleration, a significant breakthrough for memory-constrained inference scenarios. FP8 represents a middle ground between INT8 quantisation and FP16, offering better numerical precision while reducing model size by 50% compared to full precision—critical for devices with limited VRAM.

This update enables running larger models on consumer GPUs that previously required quantisation to INT4 or INT5. The CUDA-specific optimizations ensure that FP8 operations execute efficiently on NVIDIA hardware, making it practical for production local inference. Developers can now choose between precision and performance trade-offs more granularly, allowing better model selection for their hardware constraints.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b12284).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b12284) · Relevance: 9/10*
