---
title: "Ollama v0.40.18 Delivers Faster Inkling2 Inference on Apple Silicon"
date: 2026-11-25
description: "Ollama releases v0.40.18 with significant Metal GPU optimizations for Inkling2 model decoding and prefilling on Apple Silicon. The update includes architecture-specific kernels that boost inference speed across a range of hardware generations."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - mlx
  - speculative-decoding
status: draft
---

Ollama's latest release demonstrates the maturing ecosystem around practical local LLM deployment. Version 0.40.18 brings Inkling2-specific Metal kernels that substantially improve decode performance on Apple Silicon Macs. The optimizations include fused residual mixing, deduplicated expert gathers, and hardware generation-aware scheduling—all the low-level tuning that makes the difference between "usable" and "truly fast" inference on consumer hardware.

This release exemplifies the iterative optimization that drives local inference forward. Each generation of hardware and each new model architecture benefits from community effort to squeeze out performance without sacrificing compatibility. For Mac users specifically, these improvements mean Inkling2 models become more practical for sustained, responsive inference workloads—whether for local coding assistants or background processing tasks.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.18).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.18) · Relevance: 8/10*
