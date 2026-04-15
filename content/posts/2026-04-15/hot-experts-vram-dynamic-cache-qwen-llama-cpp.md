---
title: "Dynamic Expert Cache in llama.cpp Achieves 27% Faster Inference on Large MoE Models"
date: 2026-04-15
description: "A new optimization technique for llama.cpp improves CPU+GPU token generation speed by 27% on Qwen3.5-122B through dynamic expert caching, raising practical inference rates from 15 to 23 tokens per second."
tags:
  - daily-digest
  - llama-cpp
  - moe-models
  - memory-optimization
  - cpu-gpu-offload
status: draft
---

A practical performance win for users running large Mixture-of-Experts models: [dynamic expert caching in llama.cpp](https://www.reddit.com/r/LocalLLaMA/comments/1slue0z/hot_experts_in_your_vram_dynamic_expert_cache_in/) demonstrates 27% faster token generation on Qwen3.5-122B when distributing computation across CPU and GPU hardware. The technique improves from 15 tok/s to 23 tok/s by intelligently keeping frequently-used expert layers in VRAM rather than constantly shuffling them between memory tiers.

MoE models like Qwen3.5-122B have historically been challenging to run locally due to their massive parameter count, but this optimization addresses the core bottleneck: selective expert loading. By tracking which experts fire most frequently during inference and maintaining a dynamic cache in VRAM, the implementation reduces memory bandwidth pressure and keeps the GPU busy with useful computation instead of data movement.

This is a significant contribution to the llama.cpp ecosystem, enabling practitioners without unified memory systems (like Linux/Windows desktop users) to run 100B+ parameter models at acceptable speeds. The technique is model-agnostic and applicable to any MoE architecture using llama.cpp.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1slue0z/hot_experts_in_your_vram_dynamic_expert_cache_in/) · Relevance: 9/10*
