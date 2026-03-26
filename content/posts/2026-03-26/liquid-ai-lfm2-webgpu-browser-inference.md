---
title: "Liquid AI's LFM2-24B Achieves 50 Tokens/Second in Web Browser via WebGPU"
date: 2026-03-26
description: "Liquid AI has demonstrated their LFM2-24B mixture-of-experts model running at 50 tokens/second in a web browser on M4 Max hardware using WebGPU. The 8B variant achieves over 100 tokens/second, showcasing practical edge inference in browser environments."
tags:
  - daily-digest
  - moe
  - webgpu
  - edge-inference
  - performance
status: draft
---

Liquid AI has achieved a significant milestone with [LFM2-24B running in web browsers](https://v.redd.it/9wsr6hcw29rg1) via WebGPU, delivering 50 tokens/second on M4 Max hardware. The mixture-of-experts architecture with 24B total parameters and only 2B active parameters demonstrates how modern model designs can achieve fast inference on consumer devices. The 8B variant pushes even further, exceeding 100 tokens/second, making real-time interaction feasible entirely in-browser.

This breakthrough has profound implications for local deployment: users can now run capable language models directly in their browsers without relying on cloud infrastructure or backend servers. WebGPU support across browsers is expanding, making this approach increasingly accessible. The open demo and source code availability on Hugging Face Spaces enables practitioners to experiment with browser-based inference immediately, accelerating adoption of true edge LLM deployment patterns.

---
*Source: [r/LocalLLaMA](https://v.redd.it/9wsr6hcw29rg1) · Relevance: 8/10*
