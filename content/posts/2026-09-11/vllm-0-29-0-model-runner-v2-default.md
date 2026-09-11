---
title: "vLLM 0.29.0: Model Runner V2 Becomes Default for All Models"
date: 2026-09-11
description: "vLLM 0.29.0 makes Model Runner V2 the default inference engine across all models, completing a major architectural shift. The release includes CUDA graph memory profiling for KV cache auto-sizing and improvements to batch-sharding, significantly enhancing performance and memory efficiency for local deployments."
tags:
  - daily-digest
  - vllm
  - memory-optimization
  - inference-speed
  - open-source
status: draft
---

vLLM 0.29.0 marks a significant milestone in local LLM inference by making Model Runner V2 (MRV2) the default backend for all models. This architectural shift, which began with pooling models in earlier versions, consolidates performance improvements that have been validated across diverse use cases. The 594 commits from 277 contributors demonstrate the broad community engagement in optimizing inference pipelines.

Key improvements in this release directly benefit local deployment scenarios. CUDA graph memory profiling for KV cache auto-sizing enables more efficient memory management, reducing the overhead of key-value cache allocation during inference. Batch-sharding enhancements allow better distribution of computational work across available hardware resources, whether on consumer GPUs or edge devices. These optimizations are critical for running larger models on resource-constrained hardware without sacrificing throughput.

For practitioners deploying LLMs locally, this release represents a maturation of vLLM as a production-ready inference engine. The standardization on MRV2 means users can rely on consistent performance characteristics across different model architectures and hardware configurations, making it easier to plan deployments and predict resource requirements.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0) · Relevance: 9/10*
