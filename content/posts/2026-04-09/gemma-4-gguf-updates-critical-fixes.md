---
title: "Gemma 4 GGUF Models Updated with Critical Quantization Fixes"
date: 2026-04-09
description: "Unsloth has released updated Gemma 4 GGUF quantizations addressing kv-cache issues and other inference problems. New versions are available for both 26B and 31B model sizes."
tags:
  - daily-digest
  - gemma
  - quantisation
  - llama-cpp
  - benchmark
status: draft
---

Unsloth has pushed [updated Gemma 4 GGUF quantizations](https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF) addressing critical issues with kv-cache handling and inference stability. The updates affect both the 26B and 31B variants, with [multiple quantization levels available](https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF). Users should re-download these quantizations to ensure they're running the corrected versions.

Kv-cache optimization is crucial for inference performance as it directly impacts token generation speed and memory efficiency. These fixes are particularly important for practitioners running local inference at scale or on memory-constrained devices. The rapid iteration on quantization quality demonstrates the community's commitment to optimizing Gemma 4 for consumer hardware.

This is a timely reminder that quantized models continue to evolve post-release, and checking for updated variants can provide significant quality and performance improvements.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1sfrrgz/it_looks_like_well_need_to_download_the_new_gemma/) · Relevance: 8/10*
