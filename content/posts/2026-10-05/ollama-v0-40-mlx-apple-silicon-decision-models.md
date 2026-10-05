---
title: "Ollama v0.40.0: MLX Runtime Now Default on Apple Silicon with Decision Model Support"
date: 2026-10-05
description: "Ollama's latest release automatically routes supported model architectures to the MLX runtime on Apple Silicon devices, improving performance. The release also introduces support for decision models, expanding the types of AI workloads suitable for local deployment."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - mlx
  - performance-optimization
status: draft
---

Ollama v0.40.0 represents a significant step forward for local inference on Apple Silicon Macs. The release makes MLX the default runtime for supported model architectures, eliminating the need for manual configuration and delivering better performance out of the box. Users running models like Qwen 3.8, Gemma 4, and Qwen 3.6 will automatically benefit from this optimization without any code changes.

Beyond performance improvements, this release adds first-class support for decision models—a new category of smaller, specialized models that can make structured decisions without generating free-form text. This is particularly valuable for local deployment scenarios where you need deterministic outputs for tasks like classification, routing, or rule-based decisions while maintaining full privacy and offline operation.

For practitioners looking to deploy LLMs on consumer Apple hardware, this release removes friction from the setup process and expands the practical use cases beyond traditional chat and text generation workloads.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc3).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc3) · Relevance: 9/10*
