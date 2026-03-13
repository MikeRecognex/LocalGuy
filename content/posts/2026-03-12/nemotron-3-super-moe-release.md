---
title: "Nvidia Releases Nemotron 3 Super: 120B MoE Model for Local Deployment"
date: 2026-03-12
description: Nvidia has released Nemotron 3 Super, a 120B mixture-of-experts model with only 12B active parameters, designed as an open-source alternative for agentic reasoning tasks. The hybrid Mamba-Transformer architecture offers competitive performance with reduced computational requirements.
tags:
  - advanced
  - agentic-reasoning
  - agentic-systems
  - agents
  - analysis
  - bullish
  - consumer-gpu
  - developer
  - efficient-inference
  - intermediate
  - local-deployment
  - mixture-of-experts
  - model-efficiency
  - model-quantization
  - moe
  - open-source
  - open-source-models
  - quantisation
  - release
  - self-hosting
status: published
---

Nvidia has released [Nemotron 3 Super](https://developer.nvidia.com/blog/introducing-nemotron-3-super-an-open-hybrid-mamba-transformer-moe-for-agentic-reasoning/), a 120B mixture-of-experts model that activates only 12B parameters at inference time. This open-source model combines Mamba and Transformer architectures, specifically optimized for agentic reasoning and complex task decomposition. The significantly reduced active parameter count makes it substantially more viable for local deployment than traditional 120B models.

The MoE architecture is particularly relevant for practitioners looking to run sophisticated reasoning agents on consumer hardware. By only activating a subset of experts per token, the model dramatically reduces memory footprint and compute requirements while maintaining the modeling capacity of the full parameter count. This bridges the gap between smaller models and the full-scale models available through APIs.

With quantization support through llama.cpp and other frameworks, Nemotron 3 Super becomes an attractive option for building self-hosted agentic systems that previously required cloud API calls.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rqy3cx/nemotron_3_super_released/) · Relevance: 9/10*
