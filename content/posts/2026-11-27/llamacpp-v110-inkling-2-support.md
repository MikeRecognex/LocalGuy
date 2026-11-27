---
title: "Llama.cpp v1.1.0 Adds Inkling 2 Family and Enhanced Audio Support"
date: 2026-11-27
description: "Llama.cpp v1.1.0 introduces support for the Inkling 2 model family (base, Mini, and DSpark variants), improved speculative decoding, and significant audio/TTS capabilities for enhanced on-device inference workflows."
tags:
  - daily-digest
  - edge-device
  - edge-inference
  - gguf
  - inkling-2
  - llama-cpp
  - open-source
  - release
  - speculative-decoding
  - voice-synthesis
mentions:
  - name: "GitHub"
    role: "publisher"
status: published
---

Llama.cpp v1.1.0 represents a major update to the leading GGUF inference engine, adding full support for the Inkling 2 model family including the efficiency-focused Mini and DSpark variants. The release also refactors speculative decoding into separate draft methods, improving both flexibility and performance for token prediction acceleration—a critical optimization for reducing latency in local deployments.

Beyond model support, this version significantly expands audio and text-to-speech capabilities, enabling developers to build multimodal applications with on-device voice synthesis and processing. The deprecation of the legacy `llama_batch` API in favor of `llama_batch_ext` streamlines the development experience while maintaining backward compatibility for production systems.

These enhancements make llama.cpp an increasingly versatile platform for edge inference, particularly for developers building voice-enabled applications or requiring efficient token prediction for real-time interaction scenarios.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v1.1.0).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v1.1.0) · Relevance: 9/10*
