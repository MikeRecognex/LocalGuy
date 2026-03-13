---
title: Llama.cpp Adds True Reasoning Budget Support
date: 2026-03-12
description: Llama.cpp has implemented full support for reasoning budgets, allowing users to control and optimize inference costs for reasoning models. This feature moves beyond previous stub implementations to provide real control over thinking token allocation.
tags:
  - bullish
  - consumer-hardware
  - cost-optimization
  - developer
  - inference-optimization
  - intermediate
  - llama-cpp
  - local-deployment
  - news
  - optimization-strategy
  - performance-optimization
  - reasoning-budget
  - reasoning-models
  - reasoning-quality
  - release
  - rlocalllama
  - token-management
  - vram-management
mentions:
  - name: r/LocalLLaMA
    role: community
status: published
---

Llama.cpp has shipped a major feature that the community has been requesting: [true reasoning budget support](https://github.com/ggml-org/llama.cpp/commit/acb7c790698fa28a0fbfc0468804926815b94de3). Previously, the `--reasoning-budget` parameter was essentially non-functional, serving only to disable thinking entirely. Now users have granular control over how many thinking tokens the model allocates during inference.

This is critical for local deployment because reasoning models like o1 and Qwen3.5 can generate substantial internal thinking tokens that increase latency and VRAM usage. With proper budget control, practitioners can balance response quality against computational cost, making these powerful models viable on resource-constrained hardware. The feature enables optimization strategies like early stopping when sufficient reasoning depth is achieved.

For anyone running reasoning models locally, this update significantly improves cost-performance tradeoffs and makes the inference process more predictable and controllable.

---
*Source: [r/LocalLLaMA](https://github.com/ggml-org/llama.cpp/commit/acb7c790698fa28a0fbfc0468804926815b94de3) · Relevance: 9/10*
