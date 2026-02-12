---
title: Running Mistral-7B on Intel NPU Achieves 12.6 Tokens/Second
date: 2026-02-12
description: A developer created a tool to run LLMs on Intel NPUs, achieving 12.6 tokens/second with Mistral-7B while using zero CPU/GPU resources, though integrated GPU still performs better at 23.38 tokens/second.
tags:
  - hardware
  - npu
  - inference
  - benchmark
status: published
---

A developer has successfully created a tool to run LLMs on Intel's Neural Processing Unit (NPU), demonstrating practical local inference on specialized AI hardware. Testing with Mistral-7B in int4 quantization on a Core Ultra processor, the NPU achieved 12.6 tokens/second decode speed with 1.8s time-to-first-token while consuming 4.8GB of memory and crucially using zero CPU/GPU resources.

While the NPU performance is respectable, comparative benchmarks show the integrated GPU still leads at 23.38 tokens/second with faster 0.25s TTFT, and even CPU inference manages 9.04 tokens/second. However, the NPU's key advantage lies in freeing up CPU and GPU resources for other tasks while maintaining decent inference speeds.

This development is significant for edge deployment scenarios where power efficiency and resource allocation matter more than raw performance. The ability to offload LLM inference to dedicated NPU hardware while keeping CPU and GPU available for other workloads opens new possibilities for [local LLM deployment architectures](https://www.reddit.com/r/LocalLLaMA/comments/1r2lheu/running_mistral7b_on_intel_npu_126_tokenss_zero/), particularly in multi-tasking environments or battery-powered devices.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1r2lheu/running_mistral7b_on_intel_npu_126_tokenss_zero/) · Relevance: 8/10*
