---
title: "M5 Max Delivers 1.7x Faster Inference Than M3 Max on Qwen 3.5 Models"
date: 2026-03-28
description: "Comprehensive benchmarks comparing Apple's M5 Max and M3 Max chips show significant performance gains across Qwen 3.5 model variants (27B dense, 35B MoE, 122B MoE), with the newer chip delivering 1.4x to 1.7x faster token generation using the oMLX framework."
tags:
  - daily-digest
  - benchmark
  - hardware
  - mlx
  - apple-silicon
status: draft
---

Hardware performance metrics are critical for local LLM deployment decisions, and [recent benchmarks comparing M5 Max vs M3 Max](https://www.reddit.com/gallery/1s5np41) provide concrete data for practitioners considering MacBook upgrades. Testing on identical 16" MacBook Pros with 128GB unified memory showed the newer M5 Max chip delivering 1.7x faster token generation on Qwen 3.5-35B (134.5 vs 80.3 tokens/sec) and 1.4x improvement on the larger 122B variant (65.3 vs 46.1 tokens/sec).

These results matter because they quantify the real-world performance delta between generations. For practitioners running inference-heavy workloads locally, the M5 Max's superior GPU architecture and memory bandwidth translate to meaningful reductions in latency and processing time. At 20,000+ token context windows, these gains compound significantly, making hardware refresh decisions much clearer for serious local LLM users.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/gallery/1s5np41) · Relevance: 8/10*
