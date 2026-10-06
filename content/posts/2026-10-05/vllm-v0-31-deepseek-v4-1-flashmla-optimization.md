---
title: "vLLM v0.31.0: DeepSeek-V4.1-Flash with FlashMLA Mega Attention and Sparse MQA Logits"
date: 2026-10-05
description: "vLLM releases v0.31.0 with major performance optimizations for DeepSeek-V4.1-Flash including FlashMLA mega attention with NVFP4 compressed KV cache and sparse MQA logits, contributed by 307 contributors across 717 commits."
tags:
  - attention-kernels
  - consumer-gpu
  - daily-digest
  - deepseek-v4-1-flash
  - inference-optimization
  - kv-cache-compression
  - memory-optimization
  - quantisation
  - release
  - speculative-decoding
  - vllm
  - vram-optimization
mentions:
  - name: GitHub
    role: publisher
status: published
---

vLLM v0.31.0 brings significant inference optimizations that make recent frontier models more practical for local and resource-constrained deployments. The release focuses on DeepSeek-V4.1-Flash with FlashMLA mega attention implementations paired with NVFP4 compressed KV cache, reducing memory overhead while maintaining quality. These attention kernel improvements are complemented by sparse MQA (multi-query attention) logits fusion, which streamlines the computation graph for faster token generation.

The 717 commits from 307 contributors highlight the breadth of engineering work across multiple fronts: kernel optimization, quantization strategies, and inference scheduling. Practitioners running larger models locally will benefit from reduced VRAM requirements and improved throughput, making models that were previously marginal for certain hardware now feasible for production deployment.

This release demonstrates the rapid pace of optimization in the open-source inference ecosystem, where algorithmic improvements and compiler-level optimizations continue to push the boundaries of what's possible on fixed hardware budgets.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.31.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.31.0) · Relevance: 9/10*
