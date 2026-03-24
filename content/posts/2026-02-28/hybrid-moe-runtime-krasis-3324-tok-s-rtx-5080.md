---
title: Krasis Hybrid MoE Runtime Achieves 3,324 tok/s Prefill on Single RTX 5080
date: 2026-02-28
description: A new hybrid CPU/GPU runtime for mixture-of-experts models delivers 3,324 tokens/second prefill performance on a single RTX 5080 by intelligently distributing prefill to GPU and decode to CPU with system RAM as auxiliary storage.
tags:
  - advanced
  - consumer-gpu
  - cpu-inference
  - hardware
  - hardware-utilization
  - hybrid-inference
  - inference-optimization
  - llm-deployment
  - memory-optimization
  - mixture-of-experts
  - moe-efficiency
  - moe-models
  - open-source
  - prefill-decode-optimization
status: published
---

A new runtime framework called [Krasis demonstrates a clever architectural approach to running large mixture-of-experts models on consumer hardware](https://github.com/brontoguana/krasis). The key innovation separates the inference workload: GPU handles the expensive prefill phase while CPU handles token generation (decode), with system RAM providing additional buffer capacity to fit larger models than would otherwise be possible.

The performance numbers are impressive—achieving 3,324 tokens/second for prefill on a single RTX 5080 represents a substantial improvement over naive implementations. By recognising that prefill and decode have different computational characteristics (prefill is GPU-bound, decode is memory-bound), the hybrid approach better utilises the available hardware resources and enables running significantly larger models on single-GPU systems.

For practitioners with MoE models, this represents a practical path to local deployment without requiring high-end multi-GPU setups. The approach is particularly valuable given the rise of efficient MoE architectures that offer strong performance-per-parameter metrics.

---
*Source: [r/LocalLLaMA](https://i.redd.it/3bt68udk33mg1.png) · Relevance: 8/10*
