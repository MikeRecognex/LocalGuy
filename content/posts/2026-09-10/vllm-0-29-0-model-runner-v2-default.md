---
title: "vLLM 0.29.0 Makes Model Runner V2 the Default for All Models"
date: 2026-09-10
description: "vLLM 0.29.0 marks a major milestone with Model Runner V2 becoming the default inference engine across all model types, bringing CUDA graph memory profiling and batch-shard optimizations to self-hosted LLM deployments."
tags:
  - daily-digest
  - vllm
  - inference-optimization
  - open-source
  - nvidia
status: draft
---

vLLM's latest 0.29.0 release represents a significant advancement for local LLM inference, with Model Runner V2 graduating from opt-in feature to the default inference runtime for all models. This consolidation reduces technical debt and ensures consistency across diverse model architectures, while new CUDA graph memory profiling capabilities enable more efficient KV cache auto-sizing—critical for optimizing both memory footprint and throughput in resource-constrained environments.

The release also includes batch-shard improvements and welcomes 91 new contributors to the project, demonstrating the ecosystem's momentum. For practitioners running local inference servers on NVIDIA hardware, this update translates to more predictable performance characteristics and easier troubleshooting, as the unified architecture eliminates the need to choose between different execution backends.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0) · Relevance: 9/10*
