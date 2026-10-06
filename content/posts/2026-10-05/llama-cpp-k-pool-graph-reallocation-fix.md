---
title: "llama.cpp Fixes K-Pool Graph Reallocation: Preventing Decode-Time Performance Regressions"
date: 2026-10-05
description: "llama.cpp release b11412 fixes an unexpected graph reallocation issue in k-pool models that was causing decode-time performance degradation, particularly affecting recent models like Qwen and GLM variants."
tags:
  - daily-digest
  - inference-speed
  - latency-mitigation
  - llama-cpp
  - memory-management
  - memory-optimization
  - performance-optimization
  - release
status: published
---

llama.cpp continues its steady cadence of optimization and bug fixes with b11412, addressing a critical performance issue in k-pool models where the computation graph was being unexpectedly reallocated during decoding. K-pool models (used in recent Qwen and GLM variants) require careful cache management, and this fix prevents the inference engine from rebuilding its execution graph on every token generation step, which was causing significant latency spikes.

The root cause involved conditional branching on cache state flags that changed between prefill and decode phases, forcing unnecessary graph reconstruction. By properly tracking and reusing the graph shape across both phases, this fix eliminates redundant allocations and delivers more consistent generation speeds. This is particularly important for interactive applications where users notice even small variations in token latency.

For developers running cutting-edge models locally with llama.cpp, staying current with releases in the b114xx range is critical as the project addresses edge cases and performance bottlenecks discovered during real-world deployment of newer architectures.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b11412).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b11412) · Relevance: 8/10*
