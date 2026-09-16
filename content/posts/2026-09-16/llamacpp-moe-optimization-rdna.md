---
title: "llama.cpp Broadens MoE Optimization Heuristics for AMD RDNA3.5"
date: 2026-09-16
description: "llama.cpp release b10997 improves Mixture-of-Experts performance on AMD's latest architecture with refined tile heuristics and verified correctness on Ryzen AI MAX+."
tags:
  - daily-digest
  - llama-cpp
  - amd
  - open-source
status: draft
---

The latest llama.cpp build extends MoE (Mixture-of-Experts) optimization support to AMD's RDNA3.5 architecture, broadening the ncols_opt tile heuristic to improve performance with sparse model architectures. The change has been validated on AMD Ryzen AI MAX+ hardware, demonstrating correctness and performance improvements for this emerging edge AI platform.

This advancement matters for local deployment because MoE models are increasingly efficient for on-device inference, and AMD's latest processors offer compelling value for practitioners building local AI applications. Expanded hardware support in llama.cpp directly translates to more deployment options and better performance extraction from consumer and professional hardware.

[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b10997).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/b10997) · Relevance: 8/10*
