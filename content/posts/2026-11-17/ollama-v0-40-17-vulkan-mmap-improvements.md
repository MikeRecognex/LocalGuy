---
title: "Ollama 0.40.17 Improves Vulkan Integrated GPU and mmap Support"
date: 2026-11-17
description: "Ollama 0.40.17 enhances Vulkan support for integrated GPUs with memory-mapped file I/O optimization, alongside CLI stability improvements for model restoration and graceful restart handling."
tags:
  - daily-digest
  - ollama
  - open-source
  - gpu-optimization
status: draft
---

Ollama 0.40.17 delivers practical improvements for running models on integrated GPUs via Vulkan. The addition of mmap (memory-mapped file I/O) support for Vulkan integrated GPUs is particularly significant for laptop and desktop users who lack discrete graphics but have modern integrated graphics that can accelerate inference. This optimization reduces memory pressure and improves access patterns when moving model weights into GPU memory.

The release also stabilizes CLI restore mechanisms and graceful restart handling, addressing reliability concerns for production deployments and long-running inference services. For practitioners managing Ollama instances in production or demanding high availability, these improvements reduce operational incidents around model reloading and service restart cycles.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.17-rc1).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.17-rc1) · Relevance: 9/10*
