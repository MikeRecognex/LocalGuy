---
title: "Ollama v0.35.1 Brings Clef Decision Model Support"
date: 2026-10-03
description: "Ollama 0.35.1 adds native support for Cloudflare's Clef and Clef Flash decision models through the /v1/systemone API, enabling multimodal local inference for decision-making workloads."
tags:
  - clef
  - clef-flash
  - daily-digest
  - decision-models
  - document-analysis
  - model-architecture
  - multimodal-inference
  - ollama
  - open-source
  - privacy-compliance
  - release
mentions:
  - name: GitHub
    role: publisher
status: published
---

Ollama's latest v0.35.1 release brings native support for Cloudflare's Clef decision models, marking a significant expansion of what workloads can be run entirely on-device. The implementation uses the /v1/systemone API and supports both Clef (27B) and Clef Flash (9B), both of which are multimodal—accepting images alongside text inputs.

The multimodal capability is particularly noteworthy for local deployment, as it enables practitioners to build applications that process images and text jointly within a single inference call, maintaining data privacy throughout. This unlocks use cases in document analysis, visual classification, and context-aware decision routing that previously required cloud APIs.

Ollama's rapid adoption of new model architectures demonstrates how the local inference ecosystem is maturing beyond language-only models. By providing first-class support for decision models alongside traditional LLMs, Ollama enables developers to build more sophisticated on-device AI systems with minimal infrastructure complexity.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.1).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.1) · Relevance: 9/10*
