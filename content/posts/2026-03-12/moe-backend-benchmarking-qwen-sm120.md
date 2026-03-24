---
title: "Comprehensive MoE Backend Benchmarks for Qwen3.5-397B: Real Numbers vs Hype"
date: 2026-03-12
description: A detailed benchmark of every major MoE backend for Qwen3.5-397B NVFP4 on workstation GPUs reveals actual sustained performance of 50.5 tok/s, significantly lower than commonly cited claims. The analysis uncovers kernel issues in Nvidia's own CUTLASS implementation.
tags:
  - advanced
  - benchmark
  - benchmark-report
  - cautious
  - datacenter-gpu
  - gpu-kernel-optimization
  - hardware
  - hardware-procurement
  - inference-performance
  - local-deployment
  - moe
  - moe-benchmarking
  - moe-models
  - performance-benchmarking
  - performance-validation
  - quantisation
  - rlocalllama
mentions:
  - name: r/LocalLLaMA
    role: community
status: published
---

A comprehensive [8+ hour benchmark study](https://www.reddit.com/r/LocalLLaMA/comments/1rrfqlu/i_spent_8_hours_benchmarking_every_moe_backend/) tested every major MoE inference backend for Qwen3.5-397B on workstation-grade hardware (4x RTX PRO 6000). The findings are sobering: actual sustained decode performance reaches only 50.5 tok/s, despite claims of 130+ tok/s floating around online.

The investigation reveals that Nvidia's own CUTLASS kernels have performance issues on their own workstation GPUs, suggesting broader problems in the optimization stack. This is critical for practitioners evaluating large MoE models for local deployment—claims about theoretical throughput often don't survive real-world testing. The benchmark methodology and findings provide a reality check on what's actually achievable with current hardware and software stacks.

For anyone considering 300B+ parameter models, this data-driven analysis cuts through marketing claims and provides honest expectations about performance. Understanding actual sustained throughput, not peak numbers, is essential for production planning and hardware procurement decisions.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rrfqlu/i_spent_8_hours_benchmarking_every_moe_backend/) · Relevance: 8/10*
