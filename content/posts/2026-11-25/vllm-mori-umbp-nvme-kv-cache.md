---
title: "vLLM's MoRI UMBP Extends KV Cache to NVMe for Long-Context Agentic Inference"
date: 2026-11-25
description: "vLLM introduces MoRI UMBP, a technique that offloads agentic KV cache to NVMe storage, eliminating the DRAM bottleneck for long-running inference workloads. This innovation enables practical deployment of agent systems on hardware with limited GPU memory."
tags:
  - agent-orchestration
  - agents
  - consumer-gpu
  - context-window
  - daily-digest
  - kv-cache-offloading
  - long-context
  - memory-optimization
  - mori-umbp
  - release
  - vllm
mentions:
  - name: "Hacker News"
    role: "publisher"
status: published
---

vLLM's MoRI UMBP addresses a critical pain point in deploying multi-turn agentic systems: the explosive growth of KV cache as conversations extend. By intelligently offloading inactive portions of the KV cache to NVMe storage while keeping active tokens in DRAM, the technique removes the artificial constraint that limited GPU memory previously imposed on context length. This is particularly valuable for local deployment scenarios where GPU VRAM is the primary bottleneck.

For practitioners running inference engines locally, this means you can now support longer agent trajectories and more complex reasoning tasks without throwing hardware at the problem. The approach trades some latency for dramatically improved memory efficiency, making it practical to run sophisticated agentic workloads that maintain conversation history and tool-use context on devices that would otherwise exceed their memory budgets.

[Read the full article on Hacker News](https://vllm.ai/blog/2026-11-23-skip-the-dram-tier).

---
*Source: [Hacker News](https://vllm.ai/blog/2026-11-23-skip-the-dram-tier) · Relevance: 9/10*
