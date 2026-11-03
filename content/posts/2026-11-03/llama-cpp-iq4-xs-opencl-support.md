---
title: "llama.cpp Adds IQ4_XS Quantization with OpenCL Support"
date: 2026-11-03
description: "llama.cpp releases support for IQ4_XS quantization across multiple backends including OpenCL, enabling efficient inference on mobile and edge devices through improved compression techniques."
tags:
  - daily-digest
  - llama-cpp
  - quantisation
  - opencl
  - edge-inference
status: draft
---

The addition of IQ4_XS quantization support in llama.cpp with optimized OpenCL kernels represents a significant advancement in memory-efficient inference. IQ4_XS builds on earlier quantization schemes to achieve better compression-to-quality tradeoffs, making it possible to run larger models on devices with severe memory constraints like smartphones, Raspberry Pi clusters, and embedded systems.

The OpenCL implementation enables this quantization scheme to run efficiently across diverse hardware: Qualcomm Adreno GPUs (common in mobile), discrete AMD GPUs, and integrated GPUs in consumer devices. With specialized kernels for different compute patterns (AOS, SOA, tiled operations), practitioners can now deploy increasingly capable models on edge hardware without sacrificing too much inference quality—a critical capability for privacy-first, latency-sensitive applications.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b12069).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b12069) · Relevance: 9/10*
