---
title: Qwen 3.5 27B Achieves 100+ Tokens/s Decode on Dual RTX 3090s with 170K Context
date: 2026-03-02
description: A developer demonstrates exceptional inference performance running Qwen 3.5 27B dense with 170K context window at 100+ tokens/second decode speed and 1500 tokens/second prefill on dual RTX 3090 GPUs, with optimizations supporting 8 simultaneous requests at 585 tokens/second throughput.
tags:
  - hardware
  - news
  - performance-benchmark
  - quantization
  - qwen
status: published
---

A significant performance breakthrough has emerged for local Qwen 3.5 deployment. [A developer on r/LocalLLaMA](https://v.redd.it/kkbjdu2x6img1) has successfully optimized the Qwen 3.5 27B dense model to achieve 100+ tokens/second decode speed with a massive 170K context window on just dual RTX 3090 GPUs—hardware that's becoming increasingly accessible in the secondhand market.

What makes this particularly noteworthy is the throughput optimization for batch processing: the setup handles 8 simultaneous requests at 585 tokens/second aggregate throughput, combined with ~1500 tokens/second prefill performance. This demonstrates that high-performance local inference isn't limited to enterprise-grade hardware anymore. The developer has committed to sharing their optimization scripts, which should significantly impact how practitioners approach quantization and inference orchestration strategies.

This development is especially relevant given the rapid iteration cycle of Qwen models and the community's focus on maximizing value from consumer-grade GPUs. The performance metrics suggest that even older generation high-end consumer cards can support production-grade multi-user inference workloads with proper optimization.

---
*Source: [r/LocalLLaMA](https://v.redd.it/kkbjdu2x6img1) · Relevance: 9/10*
