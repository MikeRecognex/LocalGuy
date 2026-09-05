---
title: "DFlash Doubles Token Generation Speed of Qwen3.5 27B on Mac M5 Max"
date: 2026-04-15
description: "New DFlash support in oMLX 0.3.5 RC1 achieves 2x speedup for Qwen3.5 27B inference on Apple Silicon, reaching 22 T/S from 9 T/S using speculative decoding with draft models."
tags:
  - advanced
  - apple-silicon
  - bullish
  - daily-digest
  - developer
  - draft-model-speculation
  - dynamic-flash-attention
  - inference-speed
  - intermediate
  - llm-performance
  - local-inference-optimization
  - mlx
  - mlx-support
  - omlx
  - on-device-ai
  - performance
  - real-time-inference
  - release
  - showcase
  - speculative-decoding
mentions:
  - name: oMLX
source:
  name: "r/LocalLLaMA"
  url: "https://www.reddit.com/gallery/1sltncp"
status: published
---

A significant performance breakthrough for Mac users: [DFlash support in oMLX 0.3.5 RC1](https://www.reddit.com/gallery/1sltncp) has demonstrated a 2x speedup for local Qwen3.5 27B inference on Apple Silicon. Initial benchmarks show generation speed improving from 9 to 22 tokens per second on an M5 Max with 128GB unified memory, using speculative decoding with a draft model from the Hugging Face ecosystem.

This is a major win for on-device development workflows, particularly for developers building applications on MacBook Pros who need reasonable inference latency without cloud dependencies. DFlash (dynamic flash attention) combined with draft model speculation represents the cutting edge of optimization techniques for local inference, and native MLX support brings these techniques directly to the Apple Silicon ecosystem where they're most effective.

For practitioners running Qwen models locally on Mac hardware, upgrading to oMLX 0.3.5 RC1 and leveraging the DFlash + draft model pattern could unlock nearly real-time token generation for many practical applications.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/gallery/1sltncp) · Relevance: 9/10*
