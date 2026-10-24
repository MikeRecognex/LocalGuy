---
title: "Ollama v0.40.10 releases NVIDIA Nemotron 3.5 Bolt with vision support"
date: 2026-10-24
description: "Ollama now supports NVIDIA's Nemotron 3.5 Bolt E4B, a compact vision-language model optimized for local inference with 128K context window and speculative decoding via DFlash draft."
tags:
  - daily-digest
  - ollama
  - vision-language
  - nvidia
  - speculative-decoding
status: draft
---

Ollama v0.40.10 introduces support for NVIDIA Nemotron 3.5 Bolt E4B, a smaller vision-language model based on Gemma 4 architecture designed specifically for fast local inference. The model supports a 128K-token context window and includes DFlash draft support for speculative decoding, enabling faster token generation through efficient draft model predictions.

This release is significant for practitioners looking to run multimodal models on consumer hardware. Nemotron 3.5 Bolt's smaller size compared to flagship vision models makes it practical for edge deployment while maintaining capability for image understanding and tool use. The inclusion of speculative decoding optimizations means users can expect meaningful latency improvements during inference.

The addition of this model to Ollama's ecosystem reinforces the framework's position as a bridge between cutting-edge model releases and practical local deployment, making state-of-the-art vision capabilities accessible without requiring expensive inference APIs.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.10).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.10) · Relevance: 9/10*
