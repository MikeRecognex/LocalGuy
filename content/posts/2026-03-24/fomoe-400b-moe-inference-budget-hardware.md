---
title: "FOMOE: Running 397B Parameter Qwen3.5 MoE at 5-9 tok/s on $2,100 Desktop Hardware"
date: 2026-03-24
description: "Fast Opportunistic Mixture of Experts (FOMOE) enables inference of massive 397-billion parameter models using Q4_K_M quantization on dual $500 consumer GPUs with 32GB RAM, solving the memory bottleneck of MoE models through intelligent flash-backed weight streaming."
tags:
  - daily-digest
  - mixture-of-experts
  - memory-optimization
  - quantization
  - budget-hardware
source:
  name: "r/LocalLLaMA"
  url: "https://www.reddit.com/r/LocalLLaMA/comments/1s1wgph/run_qwen35_flagship_model_with_397_billion/"
status: published
---

FOMOE (Fast Opportunistic Mixture of Experts) breakthrough enables local inference of massive 397-billion parameter flagship models on consumer hardware by solving a fundamental MoE constraint: the enormous memory overhead of keeping all expert weights loaded. Traditional MoE inference requires hundreds of gigabytes of VRAM, but FOMOE leverages the key insight that only a sparse subset of experts activate per token—enabling intelligent caching with NVMe backing to dramatically reduce peak memory requirements.

With quantization down to Q4_K_M, the approach delivers 5-9 tokens/second on a dual-GPU setup ($500 RTX 40-series per GPU) with 32GB system RAM and standard NVMe storage—totaling approximately $2,100 for a complete system. [Read more about FOMOE's architecture](https://github.com/pmerolla/fomoe) and implementation details. This fundamentally changes the economics of local frontier-model inference, making capabilities previously exclusive to data centers accessible to individual researchers and developers with modest budgets.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1s1wgph/run_qwen35_flagship_model_with_397_billion/) · Relevance: 9/10*
