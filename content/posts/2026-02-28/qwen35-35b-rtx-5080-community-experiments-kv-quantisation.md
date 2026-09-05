---
title: Qwen3.5-35B RTX 5080 Experiments Confirm KV q8_0 as Free Lunch, Q4_K_M Remains Optimal
date: 2026-02-28
description: Follow-up benchmarking of Qwen3.5-35B-A3B on RTX 5080 16GB validates community-requested configurations, achieving 74.7 tokens/second and confirming KV cache quantisation strategies.
tags:
  - advanced
  - benchmarking
  - configuration-optimization
  - consumer-gpu
  - hardware
  - inference-optimization
  - kv-cache-quantization
  - local-deployment
  - model-performance
  - performance-optimization
  - quantization
  - qwen
  - runtime-optimization
mentions:
  - name: r/LocalLLaMA
    role: publisher
source:
  name: "r/LocalLLaMA"
  url: "https://www.reddit.com/r/LocalLLaMA/comments/1rg4zqv/followup_qwen3535ba3b_7_communityrequested/"
status: published
---

Detailed follow-up benchmarking confirms that KV cache quantisation to q8_0 provides performance improvements without quality degradation—a "free lunch" optimisation for local deployments. The investigation validates Q4_K_M as the optimal quantisation level and demonstrates that proper batch configuration flags can achieve 74.7 tokens/second on consumer RTX 5080 hardware.

These experiments directly address real deployment questions: which quantisation strategies preserve quality while maximising speed, and how much performance can be extracted from mid-range consumer GPUs. The 7% performance improvement from optimised configuration flags shows that inference speed is not purely hardware-bound but also depends on runtime settings.

For practitioners deploying on RTX 5080 or similar hardware, these results provide empirically-validated configuration recipes for balancing quality and speed, reducing trial-and-error experimentation time.

[Read the full article on r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rg4zqv/followup_qwen3535ba3b_7_communityrequested/).

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rg4zqv/followup_qwen3535ba3b_7_communityrequested/) · Relevance: 9/10*
