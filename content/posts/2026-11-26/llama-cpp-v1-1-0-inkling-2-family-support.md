---
title: "llama.cpp v1.1.0 Adds Inkling 2 Family and Enhanced Audio Support"
date: 2026-11-26
description: "llama.cpp v1.1.0 introduces support for the Inkling 2 family of models optimized for local inference, plus new speculative decoding methods and extensive TTS/audio capabilities for on-device deployment."
tags:
  - apple-silicon
  - consumer-gpu
  - daily-digest
  - edge-device
  - inference-optimization
  - inkling-2
  - llama-cpp
  - open-source
  - quantisation
  - release
  - speculative-decoding
  - voice-synthesis
status: published
---

llama.cpp v1.1.0 marks a significant milestone for local LLM deployment with native support for the Inkling 2 family, including base, Mini, and DSpark variants designed specifically for resource-constrained environments. The release also introduces Domyn Edge 4B, Zaya1 8B, RAON-1-mini, and Hy4 Flash models, expanding the toolkit for practitioners targeting different hardware capabilities from edge devices to consumer laptops.

Beyond new model support, v1.1.0 refactors DFlash speculative decoding into separate draft methods and deprecates the legacy llama_batch API in favor of llama_batch_ext, improving inference efficiency and code maintainability. The expanded TTS and audio capabilities transform llama.cpp into a more complete solution for multimodal on-device applications, making it increasingly viable as the backbone for local AI systems that require both text and voice interaction without cloud dependencies.

This release demonstrates the maturation of the GGML ecosystem, with optimizations across CUDA, Metal, and OpenCL backends ensuring broad hardware compatibility. For local deployment practitioners, v1.1.0 provides battle-tested implementations of some of 2026's most efficient inference-optimized models in a single, regularly-updated package.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v1.1.0).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v1.1.0) · Relevance: 9/10*
