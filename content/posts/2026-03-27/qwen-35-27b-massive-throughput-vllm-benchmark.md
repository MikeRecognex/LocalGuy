---
title: "Qwen 3.5 27B Achieves 1.1M Tokens/Second on B200 GPUs with Optimized vLLM Config"
date: 2026-03-27
description: "A developer optimized Qwen 3.5 27B to reach 1.1 million tokens per second on 96 B200 GPUs using vLLM, with detailed configurations and all settings published on GitHub. Key optimizations included distributed parallelism, reduced context windows, FP8 KV cache, and speculative decoding."
tags:
  - advanced
  - analysis
  - benchmarks
  - benchmark-report
  - bullish
  - cost-per-token
  - daily-digest
  - datacenter-gpu
  - developer
  - distributed-inference
  - enterprise
  - inference-optimization
  - inference-speed
  - intermediate
  - model-optimization
  - performance
  - production-deployment
  - quantization
  - rlocalllama
  - speculative-decoding
  - throughput-optimization
  - vllm
mentions:
  - name: r/LocalLLaMA
    role: source
status: published
---

Achieving 1.1M tokens per second with Qwen 3.5 27B represents a significant throughput milestone for practical inference deployment. The optimization journey—from 9,500 to 1.1M tokens/second—was enabled by strategic configuration changes: using 8-way distributed parallelism over 8-way tensor parallelism, reducing context window from 131K to 4K tokens, enabling FP8 KV cache quantisation, and implementing MTP-1 speculative decoding. Notably, speculative decoding alone provided the largest performance jump.

The community benefits immensely from the [published GitHub configurations](https://github.com/), allowing others to replicate these results and adapt the strategies to their hardware. For organizations serving dense inference workloads, these optimization techniques demonstrate how thoughtful configuration choices can dramatically improve throughput without requiring larger models. This is particularly valuable for production deployments where latency and cost per token directly impact service quality and profitability.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1s4hudr/qwen_35_27b_at_11m_toks_on_b200s_all_configs_on/) · Relevance: 8/10*
