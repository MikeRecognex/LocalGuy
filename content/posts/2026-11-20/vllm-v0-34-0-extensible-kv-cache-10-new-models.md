---
title: "vLLM v0.34.0 Released with Extensible KV Cache and 10 New Models"
date: 2026-11-20
description: "vLLM 0.34.0 introduces extensible KV cache enabled by default, dynamically sizing cache from available memory post-warmup for improved throughput, alongside support for 10 new models including Mistral Large 4 and MiniMax-M3.1-Flash."
tags:
  - consumer-gpu
  - daily-digest
  - edge-device
  - inference-optimization
  - inference-throughput
  - kv-cache-optimization
  - llm-serving
  - memory-optimization
  - nemotron-3-5-transcribe
  - release
  - vllm
status: published
---

vLLM's latest release brings significant performance improvements for self-hosted LLM inference through its extensible KV cache feature, which is now enabled by default. This advancement allows the system to dynamically allocate KV cache based on actual available memory after warmup, enabling most models to operate with larger caches and improved throughput compared to previous fixed-size allocations.

Beyond cache improvements, v0.34.0 adds support for 10 new models including Mistral Large 4, MiniMax-M3.1-Flash, and Nemotron-3.5-Transcribe, expanding the ecosystem of models compatible with vLLM's high-performance inference engine. With contributions from 412 developers (120 new), this release represents substantial community-driven improvements to one of the most widely-used serving frameworks for local and self-hosted LLM deployments.

This update is particularly valuable for practitioners running inference on resource-constrained hardware, as dynamic KV cache allocation reduces memory waste while maintaining or improving serving speed—a critical optimization for edge devices and consumer-grade GPUs.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.34.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.34.0) · Relevance: 9/10*
