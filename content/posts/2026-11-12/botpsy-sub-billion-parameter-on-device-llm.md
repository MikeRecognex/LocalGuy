---
title: "BotPsy: On-Device Personal Assistant with Sub-Billion-Parameter Model"
date: 2026-11-12
description: "Tether releases BotPsy, an 800-million-parameter language model optimized for on-device inference that claims to outperform models 2.5x its size. The model demonstrates that efficiency-focused architectures can deliver competitive quality for local deployment."
tags:
  - daily-digest
  - quantisation
  - benchmark
  - open-source
  - memory-optimization
status: draft
---

Tether has unveiled BotPsy, an 800-million-parameter agentic language model specifically designed for on-device deployment. According to the release, BotPsy outperforms models with 2-2.5x more parameters, suggesting that modern techniques like efficient attention, quantization-aware training, and architecture optimization can yield competitive results in a fraction of the traditional parameter count.

For local LLM practitioners, this validates the value of deployment-optimized models over simply quantizing larger general-purpose models. BotPsy's design prioritizes inference speed and memory efficiency from the ground up rather than as an afterthought. With 800M parameters, the model fits comfortably on mobile devices, edge processors, and consumer laptops, making it practical for applications requiring local inference without sacrificing significant capability. This represents an important trend: purpose-built small models increasingly outperform naively quantized larger models.

[Read the full article on Hugging Face Blog](https://huggingface.co/blog/qvac/botpsy).

---
*Source: [Hugging Face Blog](https://huggingface.co/blog/qvac/botpsy) · Relevance: 9/10*
