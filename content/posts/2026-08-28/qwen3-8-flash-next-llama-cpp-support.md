---
title: "Qwen3.8-Flash-Next Added to llama.cpp with GGUF Support"
date: 2026-08-28
description: "llama.cpp now supports Qwen3.8-Flash-Next with full GGUF architecture implementation, including low-rank hyper-connections and n-gram hash embeddings for optimized local inference."
tags:
  - daily-digest
  - llama-cpp
  - qwen
  - gguf
  - open-source
status: draft
---

The latest llama.cpp build (b10660) introduces native support for Qwen3.8-Flash-Next, Alibaba's latest efficient language model architecture. This release adds comprehensive GGUF-side plumbing including model architecture definitions and tensor support for the model's distinctive low-rank hyper-connection components and probabilistic learned embeddings (PLE) with n-gram hashing.

Qwen3.8-Flash-Next is specifically engineered for edge and local deployment scenarios, making this llama.cpp integration particularly valuable. With native GGUF support, developers can now quantize and run this model efficiently across consumer hardware without waiting for third-party converters or workarounds. The addition reflects the growing momentum around smaller, inference-optimized models that maintain strong performance while fitting comfortably on local hardware.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b10660).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b10660) · Relevance: 9/10*
