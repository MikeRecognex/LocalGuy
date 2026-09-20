---
title: "Ollama 0.34.1 Stabilizes MLX Backend and GGUF Model Creation"
date: 2026-09-16
description: "Ollama v0.34.1 releases improved MLX memory handling for Apple Silicon, stabilizes GGUF creation workflows, and enhances repeat token detection for more reliable local inference."
tags:
  - apple-silicon
  - daily-digest
  - gguf
  - inference-stability
  - memory-management
  - mlx
  - model-optimization
  - ollama
  - open-source
  - release
status: published
---

Ollama's latest stable release brings significant improvements to its MLX backend for Apple Silicon devices, including better memory management that should reduce crashes and improve throughput on Mac hardware. The release also graduates GGUF model creation from experimental status and refines token repetition detection to require 100 consecutive repeated tokens before triggering guards, reducing false positives in production scenarios.

These changes directly benefit local LLM operators: improved Apple Silicon support addresses a major deployment platform for individuals and small teams, while GGUF tooling maturity removes friction from model optimization workflows. The repeat token improvements matter for inference stability, especially with longer generation sequences or edge cases that can cause models to loop unexpectedly.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.34.1).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.34.1) · Relevance: 9/10*
