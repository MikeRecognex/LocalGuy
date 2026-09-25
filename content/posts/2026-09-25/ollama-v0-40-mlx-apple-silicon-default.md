---
title: "Ollama v0.40.0 Makes MLX the Default Runner for Apple Silicon"
date: 2026-09-25
description: "Ollama's latest release shifts to MLX as the default inference engine for Apple Silicon devices, enabling better performance for supported model architectures. This change simplifies local LLM deployment on Mac hardware."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - mlx
  - performance-optimization
status: draft
---

Ollama v0.40.0 represents a significant shift in the local inference landscape for Apple users. By making MLX the default runner for Apple Silicon devices, the project is prioritising native performance over generic implementations. This means users can now run models like Qwen3.8 with optimized metal acceleration out of the box, without manual configuration.

The move reflects the maturity of MLX as an inference engine and acknowledges that Apple Silicon's specialized architecture requires purpose-built tooling. For practitioners deploying on M-series chips, this update removes friction from the setup process while potentially improving inference speed and memory efficiency. The transition will be gradual during the RC phase, with additional models being enabled as testing progresses.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc0) · Relevance: 9/10*
