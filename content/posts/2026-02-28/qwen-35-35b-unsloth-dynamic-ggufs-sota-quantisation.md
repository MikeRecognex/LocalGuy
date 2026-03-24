---
title: Qwen 3.5-35B Unsloth Dynamic GGUFs Achieve SOTA Quantisation Benchmarks
date: 2026-02-28
description: Unsloth released state-of-the-art dynamic quantisations for Qwen 3.5-35B across nearly all bit depths, backed by 150+ KL Divergence benchmarks and 9TB of GGUFs. The release also fixes a critical tool calling chat template bug affecting all quantisation uploaders.
tags:
  - advanced
  - benchmark
  - bug-fix
  - consumer-gpu
  - evaluation-metrics
  - local-deployment
  - model-formats
  - model-performance-tradeoffs
  - model-quantisation
  - model-quantization
  - open-source
  - performance-benchmarking
  - quantisation
  - qwen
  - release
  - tool-calling-bug-fix
mentions:
  - name: Unsloth
    role: developer
  - name: r/LocalLLaMA
    role: publisher
status: published
---

Unsloth has released optimised quantisations for Qwen 3.5-35B that represent significant progress in making larger models practical for local deployment. The Unsloth Dynamic quants achieve state-of-the-art performance metrics across nearly all bit depths, with comprehensive research backing the release through over 150 KL Divergence benchmarks and a total of 9TB of GGUF variants.

What makes this release particularly valuable for practitioners is the empirical rigour—the team benchmarked extensively to demonstrate quality preservation across different quantisation levels, enabling users to make informed trade-offs between model quality and inference speed. Additionally, [the release fixes a critical tool calling chat template bug](https://www.reddit.com/r/LocalLLaMA/comments/1rgel19/new_qwen3535ba3b_unsloth_dynamic_ggufs_benchmarks/) that was affecting all quantisation uploaders, improving compatibility across the ecosystem.

For local LLM practitioners, this represents a solid foundation for deploying Qwen 3.5-35B at scale on consumer hardware, with the benchmark data providing transparency into quality/performance trade-offs.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rgel19/new_qwen3535ba3b_unsloth_dynamic_ggufs_benchmarks/) · Relevance: 9/10*
