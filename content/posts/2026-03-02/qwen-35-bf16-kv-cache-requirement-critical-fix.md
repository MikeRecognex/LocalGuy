---
title: "Critical: Qwen 3.5 Requires BF16 KV Cache, Not FP16 for Accurate Inference"
date: 2026-03-02
description: Community member Daniel Han alerts users that Qwen 3.5 models require bfloat16 KV cache precision instead of the default float16, with perplexity measurements demonstrating the accuracy impact when using incorrect cache formats.
tags:
  - advanced
  - cautious
  - context-management
  - inference-engine
  - kv-cache-precision
  - llama-cpp
  - model-accuracy
  - model-compatibility
  - model-optimization
  - model-performance
  - news
  - optimization
  - quantization
  - qwen
mentions:
  - name: Daniel Han
    role: community member
  - name: r/LocalLLaMA
    role: source
status: published
---

A critical technical discovery highlights an important compatibility issue for local Qwen 3.5 deployment. [Daniel Han has documented](https://www.reddit.com/r/LocalLLaMA/comments/1rik253/psa_qwen_35_requires_bf16_kv_cache_not_f16/) that the Qwen 3.5 35B model requires bfloat16 KV cache precision rather than the standard float16 that inference engines like llama.cpp use by default. Users need to explicitly set `-ctk bf16 -ctv bf16` flags to maintain model accuracy.

The verification was rigorous—perplexity measurements on WikiText-2-raw demonstrated the impact of using incorrect KV cache precision, with the author specifically avoiding KL divergence metrics to ensure reproducibility. This matters significantly because KV cache represents the memory footprint bottleneck in long-context inference, and using the wrong precision can degrade output quality while sometimes appearing to save memory.

For practitioners already running Qwen 3.5 models, this is a critical configuration requirement. The discovery underscores the importance of community communication around model-specific optimization details that aren't always documented in official releases.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rik253/psa_qwen_35_requires_bf16_kv_cache_not_f16/) · Relevance: 8/10*
