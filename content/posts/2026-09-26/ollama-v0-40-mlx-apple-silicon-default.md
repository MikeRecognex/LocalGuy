---
title: "Ollama v0.40.0 Enables MLX Runtime by Default on Apple Silicon"
date: 2026-09-26
description: "Ollama's latest release automatically runs supported model architectures on MLX for Apple Silicon devices, improving performance for local inference. This milestone represents a major shift toward optimized on-device execution for Mac users."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - mlx
  - performance
status: draft
---

Ollama v0.40.0 marks a significant shift in how local LLM inference runs on Apple Silicon by making MLX the default runtime for supported model architectures. Previously, users had to manually configure MLX support; now it's automatic. This change reduces friction for Mac users deploying models locally and should deliver measurable performance improvements since MLX is optimized specifically for Apple's hardware.

The move underscores the maturation of edge inference on consumer hardware. By defaulting to hardware-specific optimizations like MLX, Ollama is making it easier for non-technical users to run capable models locally without performance compromises. This is particularly valuable as model sizes continue to grow—having intelligent runtime selection means better resource utilization on memory-constrained devices.

For practitioners, this release simplifies the deployment story: pull a model, run it, and get native Apple Silicon performance out of the box. As more frameworks adopt similar intelligent defaults, the gap between cloud and local inference narrows further.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc0) · Relevance: 9/10*
