---
title: "vLLM 0.34.0 Ships Extensible KV Cache and 10 New Model Support"
date: 2026-11-17
description: "vLLM 0.34.0 introduces extensible KV cache enabled by default, dynamically sizing memory based on actual free resources after warmup, plus support for 10 new models including Mistral Large 4 and MiniMax-M3.1-Flash optimized for efficient inference."
tags:
  - daily-digest
  - vllm
  - memory-optimization
  - open-source
status: draft
---

vLLM 0.34.0 ships a major improvement to key-value cache management with extensible KV cache now enabled by default. Rather than pre-allocating fixed cache sizes, the new approach measures actual free memory after model warmup and dynamically sizes the cache accordingly. This results in more models fitting within resource constraints and better throughput for memory-constrained deployments, a critical optimization for edge and consumer hardware.

The release also adds support for 10 new models including Mistral Large 4, MiniMax-M3.1-Flash, and Nemotron-3.5-Transcribe, expanding the roster of models optimized for efficient local inference. For practitioners deploying multiple model variants or experimenting with different architectures on fixed hardware budgets, this combination of intelligent memory management and broader model coverage directly reduces operational friction and improves inference density.

[Read the full article on vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.34.0).

---
*Source: [vLLM release](https://github.com/vllm-project/vllm/releases/tag/v0.34.0) · Relevance: 10/10*
