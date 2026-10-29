---
title: "llama.cpp v0.8.0 Adds LiquidAI LFM3 Support and Experimental Streaming Audio API"
date: 2026-10-29
description: "llama.cpp releases v0.8.0 with native support for LiquidAI's LFM3 family of small models optimized for local deployment, plus new streaming audio capabilities through experimental /v1/realtime and /tts endpoints."
tags:
  - daily-digest
  - llama-cpp
  - lfm3
  - audio-processing
  - open-source
status: draft
---

llama.cpp v0.8.0 marks a significant milestone for local LLM deployment by adding first-class support for LiquidAI's LFM3 model family—a collection of small, efficient models specifically engineered for edge and local inference. The LFM3 lineup includes text-only (1.7B tokens with 256K context), vision-enabled (lfm3-vl), audio capabilities (lfm3-audio for speech recognition and text-to-speech), and an omni variant supporting multiple modalities. These models are built on Liquid's tri-hybrid architecture designed to run efficiently on resource-constrained devices.

Beyond LFM3, this release introduces experimental streaming audio APIs via new `/v1/realtime` and `/tts` endpoints in the mtmd server component, enabling real-time audio input/output capabilities for local inference workflows. The release also adds support for multiple new architectures including DeepSeek V4.1 Flash, expanding the ecosystem of models that can run locally. This positions llama.cpp as the de facto standard for running diverse model families on-device.

For practitioners, this release matters because LFM3 models fill a critical gap—they're specifically optimized for local deployment with reasonable quality-to-size tradeoffs, and the native support means zero conversion steps to start inference. The audio APIs open new possibilities for building local AI applications with real-time voice interaction without cloud dependencies.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0) · Relevance: 9/10*
