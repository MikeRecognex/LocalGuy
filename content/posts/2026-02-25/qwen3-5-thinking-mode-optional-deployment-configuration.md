---
title: Qwen3.5 Thinking Mode Can Be Disabled for Production Inference Optimization
date: 2026-02-25
description: Users can now disable Qwen3.5's thinking capability via llama.cpp configuration, enabling optimized inference parameters for instruct mode deployments without the reasoning overhead.
tags:
  - computational-efficiency
  - configuration
  - inference-optimization
  - instruction-following
  - llama-cpp
  - llm-deployment
  - model-configuration
  - performance-optimization
  - qwen
  - release
  - sampling-parameters
  - token-generation-optimization
source:
  name: "r/LocalLLaMA"
  url: "https://www.reddit.com/r/LocalLLaMA/comments/1re1b4a/you_can_use_qwen35_without_thinking/"
status: published
---

[Qwen3.5's thinking feature can be disabled](https://www.reddit.com/r/LocalLLaMA/comments/1re1b4a/you_can_use_qwen35_without_thinking/) through llama.cpp configuration using the `--chat-template-kwargs '{"enable_thinking": false}'` flag, allowing practitioners to optimize inference for pure instruct mode without the computational overhead of reasoning chains. When running in this mode, Alibaba recommends using adjusted sampling parameters: `--repeat-penalty 1.0 --presence-penalty 1.5 --min-p 0.0 --top-k 20 --top-p 0.8 --temp 0.7`.

This configuration flexibility is crucial for practitioners deploying Qwen3.5 in production environments where latency and throughput are critical. By disabling thinking mode and using the optimized sampling parameters, users can significantly reduce token generation overhead while maintaining quality for straightforward instruction-following tasks. This exemplifies how modern local LLM deployments benefit from fine-grained configuration control, allowing the same model weights to be optimized for different operational requirements without maintaining multiple model variants.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1re1b4a/you_can_use_qwen35_without_thinking/) · Relevance: 8/10*
