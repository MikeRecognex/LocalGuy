---
title: "MiniMax M2.5: 230B Parameter MoE Model Coming to HuggingFace"
date: 2026-02-13
description: "MiniMax officially confirms open-source release of M2.5, a 230B parameter MoE model with only 10B active parameters, showing impressive SWE-Bench performance at 80.2%."
tags:
  - daily-digest
  - open-source
  - moe
  - benchmark
  - coding
status: draft
---

MiniMax has officially announced the open-source release of their M2.5 model, a massive 230 billion parameter Mixture of Experts (MoE) architecture that activates only 10 billion parameters during inference. The [official announcement](https://openhands.dev/blog/minimax-m2-5-open-weights-models-catch-up-to-claude) confirms the model weights will be available on HuggingFace, making this one of the largest open-source MoE models for local deployment.

The benchmark results are particularly impressive for coding tasks, with SWE-Bench Verified achieving 80.2%, Multi-SWE-Bench at 51.3%, and BrowseComp at 76.3%. These scores put it in competition with closed-source frontier models while maintaining the efficiency benefits of MoE architecture.

For local LLM practitioners, this represents a significant opportunity to run a model with frontier-level capabilities using only 10B active parameters worth of compute, dramatically reducing memory requirements and inference costs compared to dense models of similar capability.

---
*Source: [r/LocalLLaMA](https://openhands.dev/blog/minimax-m2-5-open-weights-models-catch-up-to-claude) · Relevance: 9/10*
