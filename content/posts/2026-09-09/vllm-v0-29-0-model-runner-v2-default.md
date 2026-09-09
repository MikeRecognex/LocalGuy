---
title: "vLLM v0.29.0 Advances with Model Runner V2 as Default"
date: 2026-09-09
description: "vLLM's latest release makes Model Runner V2 the default for all models, featuring CUDA graph memory profiling and improved performance across deployment scenarios."
tags:
  - daily-digest
  - vllm
  - open-source
  - gpu-optimization
status: draft
---

vLLM 0.29.0 marks a significant milestone by making Model Runner V2 (MRV2) the default inference path for all models. This consolidation represents months of optimization work and indicates the vLLM team's confidence in MRV2's stability and performance improvements. The release also adds CUDA graph memory profiling for KV cache auto-sizing, which is critical for efficient batch inference on GPUs.

For local LLM deployments using vLLM as a serving framework, this update simplifies operational decisions—practitioners no longer need to decide between inference backends. The improved memory profiling means better utilization of GPU VRAM, allowing larger batch sizes or bigger models on the same hardware. With 594 commits from 277 contributors, this release represents production-ready improvements for everyone running local inference servers.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.29.0) · Relevance: 9/10*
