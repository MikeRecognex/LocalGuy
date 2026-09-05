---
title: "Llama.cpp Fixes Metal NORM Operations for Apple Silicon"
date: 2026-08-08
description: "Llama.cpp B10321 resolves critical issues with NORM and RMS_NORM operations on Apple Silicon, fixing threadgroup synchronization for row lengths that don't align with SIMD group boundaries. This ensures reliable inference on M-series chips."
tags:
  - apple-silicon
  - daily-digest
  - gpu-optimization
  - inference-stability
  - llama-cpp
  - metal-performance
  - open-source
  - release
source:
  name: "llama.cpp release"
  url: "https://github.com/ggml-org/llama.cpp/releases/tag/b10319"
status: published
---

Apple Silicon users running local LLMs through llama.cpp will benefit from this Metal kernel fix. The issue affected NORM and RMS_NORM operations when tensor dimensions didn't align perfectly with Metal's SIMD group architecture, causing either crashes or performance degradation. The fix properly handles partial simdgroup scenarios with correct threadgroup barrier synchronization.

With M-series chips becoming increasingly popular for local inference due to their power efficiency and unified memory, metal kernel reliability is critical. This fix ensures stable inference across a broader range of model architectures and tensor dimensions on macOS and iOS devices.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b10319).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b10319) · Relevance: 8/10*
