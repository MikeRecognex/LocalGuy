---
title: "GLM-5 Released: 744B Parameter MoE Model Targeting Complex Tasks"
date: 2026-02-12
description: Zhipu AI releases GLM-5, a massive 744B parameter MoE model with 32B active parameters, designed for complex systems engineering and long-horizon agentic tasks with significant performance improvements over GLM-4.5.
tags:
  - glm
  - open-source
  - moe
  - agents
status: published
---

Zhipu AI has officially released GLM-5, a massive mixture-of-experts model targeting complex systems engineering and long-horizon agentic tasks. The model represents a significant scale-up from GLM-4.5, expanding from 355B parameters (32B active) to 744B parameters while maintaining the same 32B active parameter count through improved MoE architecture.

The model is specifically designed for advanced reasoning and coding tasks, with the company emphasizing that scaling remains one of the most important approaches to improving AGI intelligence efficiency. Early community feedback suggests strong performance on complex problem-solving tasks, though the model has generated some discussion around new guardrails implemented in the system.

For local deployment practitioners, GLM-5's release is particularly significant as [Unsloth has already released GGUF quantized versions](https://huggingface.co/unsloth/GLM-5-GGUF), making it accessible for self-hosted deployment despite its large parameter count. The MoE architecture means only 32B parameters are active during inference, making it more feasible for local deployment than its total parameter count might suggest.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/gallery/1r22hlq) · Relevance: 9/10*
