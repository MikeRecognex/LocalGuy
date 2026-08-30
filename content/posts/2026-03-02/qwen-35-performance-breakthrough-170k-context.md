---
title: "Qwen 3.5 27B on Dual RTX 3090s: 170K Context Holds, 100+ Tokens/s Claim Disputed"
date: 2026-03-02
description: "A widely shared r/LocalLLaMA video reported Qwen 3.5 27B running at 100+ tokens/second decode with a 170K context window on dual RTX 3090s. The context claim holds and is in fact understated — 262K fits. The decode figure is contradicted by independent benchmarks measuring 41.4 t/s on the same model and hardware, and the original video has never been independently verified."
tags:
  - hardware
  - news
  - performance-benchmark
  - quantization
  - qwen
status: published
---

> [!warning] Follow-up: the decode figure in this post doesn't hold up
> Independent benchmarks on this exact model and hardware measure **41.4 t/s** (llama.cpp) and 19.3 t/s (vLLM) single-stream, against the 100+ t/s reported here — and 100 t/s would be 84% of the theoretical two-card bandwidth ceiling. The 170K context claim, by contrast, is *understated*: 262K fits. **[What Actually Fits on Dual RTX 3090s: Qwen 27B and the KV Cache Math](/guides/qwen-27b-dual-3090-context-math/)** works through the arithmetic for both.
>
> The title and description of this post have been corrected. The body below is left unchanged as a record of what was originally written.

A significant performance breakthrough has emerged for local Qwen 3.5 deployment. [A developer on r/LocalLLaMA](https://v.redd.it/kkbjdu2x6img1) has successfully optimized the Qwen 3.5 27B dense model to achieve 100+ tokens/second decode speed with a massive 170K context window on just dual RTX 3090 GPUs—hardware that's becoming increasingly accessible in the secondhand market.

What makes this particularly noteworthy is the throughput optimization for batch processing: the setup handles 8 simultaneous requests at 585 tokens/second aggregate throughput, combined with ~1500 tokens/second prefill performance. This demonstrates that high-performance local inference isn't limited to enterprise-grade hardware anymore. The developer has committed to sharing their optimization scripts, which should significantly impact how practitioners approach quantization and inference orchestration strategies.

This development is especially relevant given the rapid iteration cycle of Qwen models and the community's focus on maximizing value from consumer-grade GPUs. The performance metrics suggest that even older generation high-end consumer cards can support production-grade multi-user inference workloads with proper optimization.

## What held up, and what didn't

Revisiting these numbers against published benchmarks and the model's own architecture config: the context claim is real and conservative, the prefill figure is conservative, and the headline decode number is contradicted by every independent measurement available. The interesting part turns out to be one the original report missed entirely — this model is only nominally dense, and **48 of its 64 layers carry no KV cache at all**, which is the actual reason six-figure context fits on 48GB.

One caveat on the correction itself. The only source is a Reddit video, and neither the original write-up above nor this follow-up was able to verify it directly. No optimization scripts were ever published, and no GitHub repository matching this setup exists from that period — the dual-3090 recipe ecosystem only appears from late April 2026 onward, targeting later models. So it is possible the developer stated conditions that this post's summary omitted, such as speculative decoding, a specific quantization, or code-only prompts, any of which would change how the decode figure should be read. What is disputed is **the claim as published here**: 100+ t/s single-stream, unqualified, is not supported by any independent measurement.

**→ [What Actually Fits on Dual RTX 3090s: Qwen 27B and the KV Cache Math](/guides/qwen-27b-dual-3090-context-math/)** shows the KV arithmetic, the bandwidth roofline that caps single-stream decode, why the second card barely helps at batch=1, and the open llama.cpp bug that silently returns empty output past ~130K context.

---
*Source: [r/LocalLLaMA](https://v.redd.it/kkbjdu2x6img1) · Relevance: 9/10*
