---
title: "FreeToken: Edge-Native MoE Serving with CPU-GPU Co-Execution"
date: 2026-09-01
description: "FlashML releases FreeToken, an open-source engine for running 290B+ Mixture-of-Experts models locally on consumer hardware through bandwidth-adaptive CPU-GPU co-execution. Features include elastic memory management, expert caching, and support for DeepSeek, Qwen, and GLM models across NVIDIA RTX 30/40/50 series."
tags:
  - manual
  - open-source
  - memory-optimization
  - nvidia
  - agents
status: draft
origin: manual
---

FreeToken represents a significant shift in making frontier-scale Mixture-of-Experts models accessible on consumer hardware. Rather than treating GPU and CPU as separate execution domains, FreeToken unifies them into a single elastic inference platform with bandwidth-adaptive policies. This approach enables running massive models like DeepSeek-V4-Flash and Qwen3.6-35B locally by intelligently distributing computation and memory across heterogeneous resources—GPUs, CPUs, host memory, and interconnects—without requiring a datacenter setup.

The engine introduces several practical innovations for local deployment: full-layer double-buffered prefill streaming, global LRU expert caching, and elastic VRAM reallocation between expert caches and KV memory at runtime. A standout feature is semantic anchor checkpoints for recurrent state, which allows agentic workflows with tool calls and thinking blocks to avoid redundant context recomputation—a direct benefit for AI agents running locally. The platform ships with both a desktop GUI and CLI, and works out-of-the-box with agent frameworks like Codex, Claude Code, and DeepSeek Harness.

Supports quantisation formats including MXFP4, NVFP4, FP8, and BF16, with Anthropic and OpenAI-compatible APIs, making integration straightforward for developers familiar with cloud-based LLM tooling. This is particularly valuable for practitioners who need to run agentic or reasoning-heavy workloads privately, on-device, without bandwidth constraints or latency penalties of cloud calls.

[Read the full article on github.com](https://github.com/FlashML-org/FreeToken).

---
*Source: [github.com](https://github.com/FlashML-org/FreeToken) · Relevance: 9/10*
