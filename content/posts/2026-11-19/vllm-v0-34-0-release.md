---
title: "vLLM v0.34.0 Released With Extensible KV Cache and 10 New Models"
date: 2026-11-19
description: "vLLM 0.34.0 introduces extensible KV cache that dynamically sizes based on available memory and adds support for 10 new models, delivering improved efficiency and broader model coverage for local deployment."
tags:
  - daily-digest
  - vllm
  - memory-optimization
  - inference-engine
  - open-source
status: draft
---

vLLM's latest release brings a critical improvement for resource-constrained local deployments: extensible KV cache now automatically sizes itself based on actual free memory after warmup, rather than using fixed allocations. This means most models can now utilize larger caches without risk of OOM errors, directly translating to better throughput and lower latency for inference workloads on consumer and edge hardware.

The addition of 10 new model variants expands the ecosystem of well-optimized models available for self-hosted inference, including specialized models like Nemotron-3.5-Transcribe for audio processing. For practitioners managing diverse inference workloads on local infrastructure, this release reduces the friction of model support while delivering measurable performance gains through smarter memory management.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.34.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.34.0) · Relevance: 9/10*
