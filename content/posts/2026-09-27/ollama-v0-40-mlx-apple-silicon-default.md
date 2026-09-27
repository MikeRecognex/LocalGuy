---
title: "Ollama v0.40.0: MLX Runtime Now Default on Apple Silicon"
date: 2026-09-27
description: "Ollama 0.40.0 makes the MLX runtime the default execution engine for supported model architectures on Apple Silicon devices, improving performance and enabling more efficient local inference on Mac hardware."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - mlx
  - performance-optimization
status: draft
---

Ollama's shift to MLX as the default runtime for Apple Silicon represents a significant quality-of-life improvement for Mac-based local LLM deployment. MLX, Apple's machine learning framework optimized for Apple Silicon, provides better performance characteristics than previous backends while maintaining compatibility with existing model architectures.

This change simplifies the user experience by automatically selecting the most efficient execution path without requiring manual configuration. Models like Qwen that support MLX will automatically run on the optimized backend, reducing setup friction and improving inference speed out of the box.

For the growing community of developers running LLMs locally on MacBooks and Mac Minis, this update removes barriers to adoption and enables faster iteration cycles. The automatic optimization during the pre-release testing phase suggests a focus on stability and broad model support before the general release.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc0) · Relevance: 9/10*
