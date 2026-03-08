---
title: "Qwen 3.5 MoE Delivers 100K Context Window at 40+ TPS on RTX 5060 Ti"
date: 2026-02-26
description: "Qwen3.5's mixture-of-experts variant achieves exceptional throughput with 100,000 token context window on a single mid-range GPU, reaching 41+ tokens per second using the Vulkan backend. This demonstrates practical feasibility of ultra-long context models on consumer hardware."
tags:
  - advanced
  - backend-optimization
  - benchmark-report
  - bullish
  - consumer-gpu
  - consumer-hardware-performance
  - daily-digest
  - developer
  - hardware
  - inference-speed
  - intermediate
  - local-deployment
  - long-context-window
  - mixture-of-experts
  - moe-inference
  - moe-inference-efficiency
  - performance
  - quantisation
  - qwen
  - rlocalllama
  - showcase
  - vulkan-backend
mentions:
  - name: r/LocalLLaMA
    role: community
status: draft
---

Long context windows are increasingly valuable for local LLM applications, and Qwen3.5's mixture-of-experts variant demonstrates surprisingly efficient handling of 100,000 token contexts on a single RTX 5060 Ti (16GB). Achieving 41+ tokens per second generation speed with such a large context window on mid-range hardware is a significant engineering accomplishment that challenges previous assumptions about context scaling costs.

For local practitioners building systems that process large documents, codebases, or multi-turn conversations, this performance characteristic opens new possibilities. The ability to maintain 100K context at practical generation speeds means developers can build applications with meaningful memory of prior interactions or document context without expensive GPU clusters. The achievement is amplified by using the Vulkan backend, demonstrating that API and backend choice remains critical for optimization on consumer hardware.

This benchmark [shows measurable progress in MoE inference efficiency](https://www.reddit.com/r/LocalLLaMA/comments/1rey2ko/qwen_35_35b_moe_100k_context_40_tps_on_rtx_5060/) and validates that long-context applications are now viable targets for local deployment strategies.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rey2ko/qwen_35_35b_moe_100k_context_40_tps_on_rtx_5060/) · Relevance: 8/10*
