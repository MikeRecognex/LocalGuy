---
title: "Qwen 3.5 397B emerges as top-performing local coding model"
date: 2026-03-21
description: "Users report that Qwen 3.5 397B significantly outperforms competing local models including GPT-OSS 120B and Nemotron 120B for code generation tasks, despite slower inference speeds."
tags:
  - advanced
  - benchmark
  - benchmark-report
  - bullish
  - code-generation
  - code-quality
  - coding
  - consumer-gpu
  - daily-digest
  - developer
  - intermediate
  - large-models-on-consumer-hardware
  - local-models
  - model-accuracy
  - model-comparison
  - model-scaling
  - quantization
  - qwen
  - rlocalllama
mentions:
  - name: r/LocalLLaMA
    role: community
status: draft
---

Qwen 3.5 397B has emerged as a standout performer for local code generation workloads. Community members who tested the model against smaller variants (122B, 35B, 27B) and competing implementations like GPT-OSS 120B, StepFun 3.5, and the newly released Super Nemotron 120B report that the larger Qwen model delivers substantially better knowledge retention and fewer bugs in generated code.

While the 397B variant trades inference speed for code quality, it represents a significant milestone for practitioners who can allocate sufficient VRAM or use aggressive quantization strategies. This benchmark result validates that model scale remains critical for coding tasks in local deployment scenarios, and suggests that developers with adequate hardware should prioritize larger, fully-loaded models over speed-optimized smaller alternatives when code correctness is paramount.

For local LLM enthusiasts, this validates the ongoing trend of pushing model boundaries on consumer hardware—particularly relevant as quantization techniques like Q4 and Q5 make 397B models increasingly viable on high-end consumer GPUs and multi-GPU setups.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rzaqjn/qwen_35_397b_is_the_best_local_coder_i_have_used/) · Relevance: 9/10*
