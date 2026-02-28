---
title: "Krasis: Hybrid CPU/GPU MoE Runtime Achieves 3,324 Tokens/Second Prefill on RTX 5080"
date: 2026-02-28
description: New open-source runtime optimises mixture-of-experts models by splitting prefill to GPU and decode to CPU, enabling larger MoE models to run on single consumer GPUs with dramatic throughput improvements.
tags:
  - advanced
  - consumer-gpu
  - cpu-only
  - developer
  - framework
  - hardware
  - hybrid-runtime
  - inference-speed
  - intermediate
  - memory-optimization
  - mixture-of-experts
  - model-scaling
  - moe
  - moe-model-deployment
  - open-source-ai
  - performance-optimization
  - release
  - resource-constrained-deployment
  - showcase
  - workload-distribution
mentions:
  - name: Krasis
    role: developer
  - name: r/LocalLLaMA
    role: publisher
status: published
---

Krasis introduces a novel hybrid CPU/GPU runtime architecture specifically optimised for mixture-of-experts models, splitting the expensive prefill phase to GPU while routing decode operations to CPU with system RAM augmentation. This asymmetric approach achieves 3,324 tokens/second prefill throughput on a single RTX 5080, demonstrating that intelligent workload distribution can overcome traditional hardware constraints.

The key insight is recognising that prefill and decode have fundamentally different computational characteristics. Prefill is compute-dense and benefits from GPU parallelism, while decode is memory-bound and can be handled efficiently by CPU with sufficient RAM. By leveraging both processors and system memory strategically, Krasis enables running much larger MoE models locally than previously feasible on single-GPU consumer setups.

This represents a significant advance in local deployment flexibility, particularly for MoE architectures which have been difficult to run on resource-constrained hardware. The open-source availability enables the community to optimise further and adapt the approach to different hardware configurations.

[Read the full article on r/LocalLLaMA](https://i.redd.it/3bt68udk33mg1.png).

---
*Source: [r/LocalLLaMA](https://i.redd.it/3bt68udk33mg1.png) · Relevance: 9/10*
