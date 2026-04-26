---
title: "Gemini-CLI, Llama.cpp, and Qwen3.5 Running on NVIDIA Jetson TK1"
date: 2026-04-09
description: "Community members report successfully running multiple LLMs including Qwen3.5 and Gemini models via llama.cpp on NVIDIA Jetson TK1 edge devices, showcasing practical deployment on resource-constrained embedded hardware."
tags:
  - bullish
  - daily-digest
  - developer
  - edge-deployment
  - edge-device
  - edge-device-ai
  - edge-inference
  - hacker-news
  - hardware
  - hardware-optimization
  - inference-optimization
  - intermediate
  - jetson
  - llama-cpp
  - llama-cpp-inference
  - llama-cpp-optimization
  - llm-deployment
  - model-deployment
  - quantization
  - showcase
mentions:
  - name: Hacker News
    role: publisher
status: published
---

NVIDIA Jetson devices are popular targets for local LLM deployment due to their balance of capability and power efficiency. This forum discussion demonstrates that modern quantized models from Qwen and Gemini can run effectively on even the older TK1 generation hardware via llama.cpp, the widely-adopted inference engine for local deployment.

What makes this particularly valuable for the local LLM community is the practical confirmation that existing optimization techniques continue to improve older hardware's capabilities. The Jetson TK1, released over a decade ago, represents the realistic constraints many edge deployment scenarios face. Successful deployment of state-of-the-art models on such hardware validates that continuous improvements in quantization methods and inference optimization pay dividends across the entire hardware spectrum.

For practitioners considering Jetson deployment, [this discussion](https://forums.developer.nvidia.com/t/gemini-cli-zeroclaw-llama-cpp-qwen3-5-on-tk1/365653) provides real-world setup guidance and demonstrates which models are currently practical. The combination of llama.cpp's mature optimization and newer efficient model architectures makes edge deployment increasingly accessible.

---
*Source: [Hacker News](https://forums.developer.nvidia.com/t/gemini-cli-zeroclaw-llama-cpp-qwen3-5-on-tk1/365653) · Relevance: 8/10*
