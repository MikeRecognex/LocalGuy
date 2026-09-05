---
title: Running Qwen3.5-27B Across Multiple GPUs Over LAN Achieves Practical Speed for Local Inference
date: 2026-03-15
description: A practitioner successfully split Qwen3.5-27B across a 4070Ti and AMD RX6800 over LAN using llama.cpp's RPC server, achieving 13 tokens/second with 32K context—demonstrating that heterogeneous multi-GPU local setups are now viable. This shows path forward for GPU-poor practitioners seeking reasonable performance.
tags:
  - benchmarking
  - consumer-gpu
  - context-management
  - cost-saving
  - hardware
  - heterogeneous-hardware
  - heterogeneous-hardware-inference
  - inference-optimization
  - llama
  - llama-cpp-features
  - llama-cpp-rpc
  - multi-gpu
  - multi-gpu-inference
  - multi-gpu-orchestration
  - news
  - performance-optimization
  - quantization
mentions:
  - name: r/LocalLLaMA
    role: source
source:
  name: "r/LocalLLaMA"
  url: "https://www.reddit.com/r/LocalLLaMA/comments/1ru17mh/running_qwen3527b_q5_splitt_across_a_4070ti_and/"
status: published
---

A practitioner in the LocalLLaMA community discovered the power of llama.cpp's RPC server feature, achieving practical inference speeds by splitting Qwen3.5-27B Q5 quantization across a 4070Ti GPU and AMD RX6800 over LAN, reaching 13 tokens/second with a 32K token prompt. This discovery has significant implications for practitioners who are "GPU poor" but have access to multiple discrete GPUs across a home or small office network.

The approach leverages [llama.cpp's RPC server capabilities](https://www.reddit.com/r/LocalLLaMA/comments/1ru17mh/running_qwen3527b_q5_splitt_across_a_4070ti_and/) to transparently distribute model inference across heterogeneous hardware. Previously, running 27B dense models required high-end single GPUs or very low inference speeds; this technique enables mixed NVIDIA/AMD setups to achieve reasonable performance.

This is a practical breakthrough for budget-conscious deployers who can repurpose older gaming GPUs or distribute compute across existing machines. It expands the viable hardware configurations for local LLM inference significantly and demonstrates that sophisticated multi-GPU orchestration no longer requires specialized frameworks—llama.cpp now handles the complexity transparently.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1ru17mh/running_qwen3527b_q5_splitt_across_a_4070ti_and/) · Relevance: 8/10*
