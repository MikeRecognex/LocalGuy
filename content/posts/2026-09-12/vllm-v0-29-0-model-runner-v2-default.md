---
title: "vLLM v0.29.0 Released: Model Runner V2 Now Default for All Models"
date: 2026-09-12
description: "vLLM's latest release makes Model Runner V2 the default inference engine across all model architectures, completing a major architectural upgrade that includes CUDA graph memory profiling and improved batch-sharding capabilities."
tags:
  - daily-digest
  - vllm
  - performance
  - inference-optimization
status: draft
---

vLLM v0.29.0 represents a significant milestone with 594 commits from 277 contributors. The major highlight is making Model Runner V2 (MRV2) the default inference backend for all models, completing a rollout that began with pooling models. This architectural change has been thoroughly tested and refined through incremental deployment.

MRV2 brings substantial improvements to local LLM inference, including CUDA graph memory profiling for automatic KV cache sizing and enhanced batch-sharding support. These optimizations directly improve throughput and memory efficiency during on-device inference, critical metrics for self-hosted deployments with constrained resources.

For practitioners running local LLM services, this update means better out-of-the-box performance without manual tuning, faster context processing, and more predictable resource utilization across different model architectures.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0) · Relevance: 9/10*
