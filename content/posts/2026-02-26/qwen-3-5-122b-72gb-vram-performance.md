---
title: "Qwen3.5 122B Achieves 25 tok/s on 72GB VRAM Setup"
date: 2026-02-26
description: "Users report exceptional performance running Qwen3.5 122B across three 3090s with 72GB total VRAM, reaching 25 tokens/second with full GPU loading. The model demonstrates strong inference speed and practical viability for enthusiasts with mid-range hardware stacks."
tags:
  - benchmarking
  - bullish
  - consumer-gpu
  - consumer-hardware-deployment
  - cost-effective-ai
  - developer
  - hardware
  - hobbyist
  - inference-optimization
  - intermediate
  - llama
  - llm-deployment
  - local-ai-applications
  - local-deployment
  - local-llm-applications
  - model-accessibility
  - model-configuration
  - model-optimization
  - model-performance
  - multi-gpu-inference
  - news
  - performance
  - quantization
  - qwen
  - showcase
mentions:
  - name: r/LocalLLaMA
    role: community
source:
  name: "r/LocalLLaMA"
  url: "https://i.redd.it/f624mg43aslg1.jpeg"
status: published
---

A significant milestone for local LLM practitioners: Qwen3.5 122B can run efficiently on consumer-grade hardware when distributed across multiple GPUs. Users report 25 tokens per second throughput with the full model and context loaded into VRAM, with the key breakthrough being proper configuration to avoid infinite "but wait" loops that plagued early deployments.

This performance metric matters because it proves that state-of-the-art 120B+ parameter models are now accessible to enthusiasts with ~$2000-3000 in GPU hardware (three RTX 3090s), not just enterprise deployments. The model's speed makes it practical for real-world applications beyond simple testing, opening possibilities for locally-hosted coding assistance, analysis, and creative tasks without relying on commercial APIs.

The community is actively sharing [optimization techniques and configurations](https://i.redd.it/f624mg43aslg1.jpeg) to help others replicate these results, indicating strong momentum for practical Qwen3.5 deployments on consumer hardware.

---
*Source: [r/LocalLLaMA](https://i.redd.it/f624mg43aslg1.jpeg) · Relevance: 9/10*
