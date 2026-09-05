---
title: Qwen3.5-397B Achieves 282 tok/s on 4x RTX PRO 6000 Blackwell Through Custom CUTLASS Kernel
date: 2026-03-15
description: A developer achieved a 5x performance improvement on the massive Qwen3.5-397B model by building a custom CUTLASS kernel to fix SM120's broken MoE GEMM tiles, reaching 282 tokens/second on Blackwell GPUs. This breakthrough demonstrates significant optimization potential for running large models locally with multi-GPU setups.
tags:
  - advanced
  - benchmarking
  - custom-kernel-development
  - datacenter-gpu
  - docker-deployment
  - flashinfer
  - hardware
  - inference-optimization
  - kernel-optimization
  - large-model-inference
  - llama
  - llm-deployment
  - local-deployment
  - moe-optimization
  - multi-gpu-inference
  - performance-optimization
  - quantization
  - tutorial
mentions:
  - name: FlashInfer
    role: project
  - name: r/LocalLLaMA
    role: publisher
source:
  name: "r/LocalLLaMA"
  url: "https://www.reddit.com/r/LocalLLaMA/comments/1rtrdsv/55_toks_how_i_got_qwen35397b_running_at_speed/"
status: published
---

A developer in the LocalLLaMA community has achieved a remarkable performance breakthrough with the Qwen3.5-397B model, reaching 282 tokens per second on 4x RTX PRO 6000 Blackwell GPUs. The optimization journey involved identifying and fixing a critical bottleneck in NVIDIA's SM120 architecture where MoE GEMM tiles were broken, resulting in a 5x speedup from an initial 55 tok/s baseline.

The optimization process progressed through multiple stages: moving from WSL2 to native Linux (55→119 tok/s), then applying driver and configuration optimizations (119→142 tok/s), and finally implementing the custom K=64 CUTLASS kernel (142→282 tok/s). [The complete work](https://www.reddit.com/r/LocalLLaMA/comments/1rtrdsv/55_toks_how_i_got_qwen35397b_running_at_speed/) includes a PR submitted to FlashInfer and a pre-built Docker image, making it accessible to other practitioners.

For local LLM operators, this breakthrough is significant because it shows that even with cutting-edge hardware constraints, custom kernel optimization can unlock dramatically better performance for massive models. This opens up viable local inference paths for 397B parameter models that were previously impractical, shifting the economics of self-hosted deployment.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rtrdsv/55_toks_how_i_got_qwen35397b_running_at_speed/) · Relevance: 10/10*
