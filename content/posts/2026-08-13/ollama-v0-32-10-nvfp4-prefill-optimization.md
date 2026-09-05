---
title: "Ollama v0.32.10: Faster Prefill Performance on NVFP4 Models with System Config Support"
date: 2026-08-13
description: "Ollama releases v0.32.10 with significant prefill speed improvements on NVFP4 quantized models (7-8% faster) and adds system-level configuration file support for easier multi-device deployment."
tags:
  - daily-digest
  - deployment-strategy
  - inference-speed
  - model-quantization
  - muse-glimmer
  - nvfp4
  - ollama
  - performance-optimization
  - quantisation
  - qwen-3-6
  - release
source:
  name: "Ollama release"
  url: "https://github.com/ollama/ollama/releases/tag/v0.32.10-rc1"
status: published
---

Ollama's latest release (v0.32.10) brings meaningful performance improvements to quantized model inference, particularly for NVFP4-formatted models. The optimization in prefill processing yields 7-8% speed improvements on popular models like Qwen 3.6 and Muse Glimmer, achieved by compiling float-to-int multiplication operations into a single kernel. Additionally, the release defaults repeat penalties to 1.0 (off) unless explicitly configured, bringing better alignment with other inference engines.

A notable quality-of-life improvement is the addition of system-level configuration file support, allowing administrators to set default parameters via INI files with CLI > ENV > model-presets > INI precedence. This makes managing multiple deployments across different machines significantly easier. For practitioners running local inference at scale, these updates provide both measurable speed gains and better operational tooling.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.10-rc1).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.10-rc1) · Relevance: 9/10*
