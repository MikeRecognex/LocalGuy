---
title: "Final Qwen3.5 Unsloth GGUF Update with Improved Size/Quality Tradeoffs"
date: 2026-03-06
description: "Unsloth releases final GGUF quantizations for Qwen3.5-122B-A10B and Qwen3.5-35B-A3B with optimized size/KL divergence tradeoffs at 99.9% quality retention. This represents a significant milestone in making large models efficiently deployable locally."
tags:
  - daily-digest
  - qwen
  - quantisation
  - gguf
  - benchmark
status: draft
---

Unsloth has released what appears to be the final GGUF quantization update for the Qwen3.5 model family, focusing on optimal size-to-quality tradeoffs. The new quantizations for both the 122B-A10B and 35B-A3B variants maintain 99.9% KL divergence, meaning minimal quality loss despite aggressive compression.

This is crucial for local LLM practitioners because it enables running state-of-the-art large language models on consumer hardware. The 122B model can now run on high-end consumer machines with reasonable VRAM requirements, while the 35B variant becomes accessible to mid-range setups. These optimized quantizations represent months of refinement work balancing inference speed, memory footprint, and output quality—the three core constraints of edge deployment.

[Read the full article on r/LocalLLaMA](https://reddit.com/r/LocalLLaMA/comments/1rlkptk/final_qwen35_unsloth_gguf_update/).

---
*Source: [r/LocalLLaMA](https://reddit.com/r/LocalLLaMA/comments/1rlkptk/final_qwen35_unsloth_gguf_update/) · Relevance: 10/10*
