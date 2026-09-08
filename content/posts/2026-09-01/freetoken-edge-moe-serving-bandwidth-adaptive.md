---
title: "FreeToken: Edge-Native MoE Serving with CPU-GPU Co-Execution"
date: 2026-09-01
description: "FreeToken is an open-source engine for running 290B+ Mixture-of-Experts models locally on consumer hardware through bandwidth-adaptive CPU-GPU co-execution, with elastic memory management, expert caching, and support for DeepSeek, Qwen and GLM models across NVIDIA RTX 30/40/50 series."
tags:
  - manual
  - open-source
  - memory-optimization
  - nvidia
  - agents
source:
  name: "github.com"
  url: "https://github.com/FlashML-org/FreeToken"
status: published
origin: manual
---

> [!tip] There is a full guide to the arithmetic underneath this
> **[MoE Expert Offload: What a 35B Model Actually Costs on a 12GB Card](/guides/moe-expert-offload-arithmetic/)** — why 92.9% of Qwen3.6-35B-A3B can live outside VRAM at all, the decode roofline that expert caching and elastic KV reallocation are each moving one term of, and how to work the same sums for your own card.

FreeToken is an edge-native Mixture-of-Experts serving engine aimed at running frontier-scale open-weight models on consumer hardware. Rather than treating GPU and CPU as separate execution domains, it unifies GPUs, CPUs, host memory and interconnects into a single elastic inference platform with bandwidth-adaptive policies. Named supported models include DeepSeek-V4-Flash, Qwen3.6-35B-A3B and GLM-5.2.

The engine's stated features for local deployment include full-layer double-buffered prefill streaming, global LRU expert caching, and elastic VRAM reallocation between expert caches and KV memory at runtime, without restarting the engine or reloading weights. It also implements semantic anchor checkpoints for recurrent state and KV caches, which lets agentic workflows with tool calls and thinking blocks avoid redundant context recomputation. It ships as both a desktop GUI and a CLI, and names Codex, Claude Code, OpenCode, OpenClaw and DeepSeek Harness as agent clients it integrates with.

Quantisation formats supported are MXFP4, NVFP4, FP8 and BF16, and the engine exposes Anthropic and OpenAI-compatible APIs. Native hardware support is listed for NVIDIA RTX 30, 40 and 50 series. The design is described in an accompanying paper, arXiv 2608.16157.

[Read the full article on github.com](https://github.com/FlashML-org/FreeToken).

**→ [MoE Expert Offload: What a 35B Model Actually Costs on a 12GB Card](/guides/moe-expert-offload-arithmetic/)** explains what an engine like this is actually buying you. The expert-cache hit rate and the KV cache are two terms in the same decode roofline, which is why global LRU caching and elastic VRAM-versus-KV reallocation are the two features worth paying attention to here — and why the same sum that permits a high tok/s figure at 8K refuses it at 128K. FreeToken's own throughput numbers are unverified here.

---
*Source: [github.com](https://github.com/FlashML-org/FreeToken) · Relevance: 9/10*
