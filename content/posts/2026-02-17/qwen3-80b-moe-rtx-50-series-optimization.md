---
title: "Qwen3-Next 80B MoE Achieves 39 Tokens/Second on RTX 5070/5060 Ti Dual-GPU Setup"
date: 2026-02-17
description: A community member has optimised Qwen3-Next 80B mixture-of-experts to run at 39 tokens/second on dual RTX 50-series GPUs with 32GB total VRAM, sharing previously undiscovered configuration solutions for consumer-grade hardware.
tags:
  - alibaba
  - coding
  - daily-digest
  - moe
  - qwen
status: published
---

This hands-on optimization demonstrates the practical viability of running large mixture-of-experts models on current consumer GPUs through careful configuration. Achieving 39 tokens/second on a RTX 5070 Ti + 5060 Ti setup (32GB VRAM total) is genuinely useful inference speed for real-time applications like coding assistants or interactive chatbots, while remaining accessible to individual practitioners and small teams.

The significance lies not just in the speed metric, but in the knowledge-sharing aspect: the author cracked configuration issues through "pure trial and error" and published solutions so others avoid the same pain. This is how the local LLM community advances—through practitioners documenting workarounds and optimization tricks that aren't obvious from model documentation. The approach likely covers VRAM management, kernel fusion, or batch size tuning specific to Qwen's MoE architecture.

[The full post](https://www.reddit.com/r/LocalLLaMA/comments/1r71af3/solution_found_qwen3next_80b_moe_running_at_39_ts/) is worth reading if you're deploying large models on budget hardware, as it may surface optimizations applicable to similar model architectures.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1r71af3/solution_found_qwen3next_80b_moe_running_at_39_ts/) · Relevance: 8/10*
