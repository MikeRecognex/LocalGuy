---
title: "Ollama Adds NVIDIA Nemotron 3.5 Super Vision-Language Model Support"
date: 2026-10-16
description: "Ollama v0.40.5 now supports NVIDIA's Nemotron 3.5 Super, a 120B-parameter hybrid Mamba-2/Transformer mixture-of-experts model optimized for local deployment. The model pairs efficient inference with advanced capabilities in coding, reasoning, and document understanding."
tags:
  - agents
  - benchmark
  - consumer-gpu
  - daily-digest
  - inference-optimization
  - mixture-of-experts
  - nemotron-3-5-super
  - nvidia
  - ollama
  - release
  - vision-language-model
status: published
---

NVIDIA's Nemotron 3.5 Super represents a significant milestone for local LLM deployment, combining frontier capabilities with practical efficiency. With 120B total parameters but only 12B active per token through its mixture-of-experts design, the model achieves strong performance on coding, reasoning, and tool-use tasks while remaining viable for consumer hardware deployments.

Ollama's integration in v0.40.5 makes this model immediately accessible to local deployment practitioners. The model pairs a hybrid Mamba-2/Transformer backbone with a C-RADIO vision encoder, enabling multimodal reasoning without sacrificing inference speed. This represents the convergence of open-weight frontier models with practical deployment infrastructure.

For practitioners, this release demonstrates that sophisticated agent-capable models can now run locally with proper quantization and inference optimization. The availability through Ollama means users can deploy enterprise-grade vision-language capabilities on-device without cloud dependencies, a crucial development for privacy-conscious and latency-sensitive applications.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.5).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.5) · Relevance: 9/10*
