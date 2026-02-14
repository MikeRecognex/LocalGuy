---
title: "MiniMax-M2.5 230B MoE Model Released with GGUF Support for Local Deployment"
date: 2026-02-14
description: "MiniMax-M2.5, a 230B parameter mixture-of-experts model, is now available in GGUF format for local deployment with impressive performance benchmarks on consumer hardware."
tags:
  - daily-digest
  - open-source
  - gguf
  - moe
  - benchmark
status: draft
---

MiniMax-M2.5, a 230 billion parameter mixture-of-experts model, has been released and is now available for local deployment through GGUF quantizations. The model is showing impressive performance in early benchmarks, with community members already creating optimized quants for various hardware configurations including M3 Max systems with 128GB RAM.

The model's MoE architecture makes it feasible to run locally despite its large parameter count, as only a subset of parameters are active during inference. Early testing shows strong performance across coding and reasoning tasks, with [GGUF versions already available](https://huggingface.co/models?sort=modified&search=minimax+m2.5) for immediate deployment on llama.cpp, LMStudio, and other local inference frameworks.

This release represents a significant advancement in locally deployable large language models, offering performance that rivals proprietary models while maintaining the flexibility and privacy benefits of on-device inference.

---
*Source: [r/LocalLLaMA](https://huggingface.co/MiniMaxAI/MiniMax-M2.5) · Relevance: 9/10*
