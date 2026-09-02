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
status: published
origin: manual
---

FreeToken is an edge-native Mixture-of-Experts serving engine aimed at running frontier-scale open-weight models on consumer hardware. Rather than treating GPU and CPU as separate execution domains, it unifies GPUs, CPUs, host memory and interconnects into a single elastic inference platform with bandwidth-adaptive policies. Named supported models include DeepSeek-V4-Flash, Qwen3.6-35B-A3B and GLM-5.2.

The engine's stated features for local deployment include full-layer double-buffered prefill streaming, global LRU expert caching, and elastic VRAM reallocation between expert caches and KV memory at runtime, without restarting the engine or reloading weights. It also implements semantic anchor checkpoints for recurrent state and KV caches, which lets agentic workflows with tool calls and thinking blocks avoid redundant context recomputation. It ships as both a desktop GUI and a CLI, and names Codex, Claude Code, OpenCode, OpenClaw and DeepSeek Harness as agent clients it integrates with.

Quantisation formats supported are MXFP4, NVFP4, FP8 and BF16, and the engine exposes Anthropic and OpenAI-compatible APIs. Native hardware support is listed for NVIDIA RTX 30, 40 and 50 series. The design is described in an accompanying paper, arXiv 2608.16157.

[Read the full article on github.com](https://github.com/FlashML-org/FreeToken).

---
*Source: [github.com](https://github.com/FlashML-org/FreeToken) · Relevance: 9/10*
