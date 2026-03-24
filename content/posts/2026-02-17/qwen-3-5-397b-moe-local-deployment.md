---
title: Qwen 3.5-397B-A17B Now Available for Local Inference with Aggressive Quantisation
date: 2026-02-17
description: Alibaba's Qwen 3.5-397B mixture-of-experts model is now available on HuggingFace with multiple quantisation options, including a 113GB IQ2_XS variant that fits on consumer hardware. Early benchmarks show performance competitive with Gemini 3 Pro and GPT-5.2 on spatial reasoning tasks.
tags:
  - advanced
  - alibaba
  - benchmarks
  - consumer-gpu
  - consumer-hardware-deployment
  - cost-saving
  - developer-tooling
  - gemini
  - hugging-face
  - llama
  - llama-cpp
  - llama-cpp-integration
  - local-inference
  - mixture-of-experts
  - model-benchmarking
  - model-evaluation
  - model-quantisation
  - model-quantization
  - moe
  - news
  - offline-deployment
  - quantisation
  - qwen
  - release
  - spatial-reasoning
mentions:
  - name: MiniBench
    role: benchmark provider
status: published
---

Qwen 3.5-397B-A17B has arrived as a practical option for local deployment, with community members already shipping aggressive GGUF quantisations. The standout option is a smol-IQ2_XS variant at 113GB (2.46 bits per weight) with full Q8_0 attention layers, designed to fit within 128GB VRAM budgets while maintaining quality comparable to frontier closed-source models.

[Recent benchmarks on MiniBench](https://minebench.ai/) show Qwen 3.5 matching or exceeding Claude Opus 4.6 on spatial reasoning tasks, making this a genuine competitor to expensive API inference. The rapid quantisation support—including mainline llama.cpp compatibility—demonstrates the ecosystem's maturity for bringing large MoE models to consumer GPUs. For practitioners running RTX 5070/5060 stacks or similar configurations, this represents a significant capability jump without requiring multiple high-end GPUs.

The availability on HuggingChat also means you can test locally-quantised variants before downloading, helping practitioners make informed decisions about which quantisation level meets their latency and quality requirements.

---
*Source: [r/LocalLLaMA](https://huggingface.co/ubergarm/Qwen3.5-397B-A17B-GGUF) · Relevance: 9/10*
