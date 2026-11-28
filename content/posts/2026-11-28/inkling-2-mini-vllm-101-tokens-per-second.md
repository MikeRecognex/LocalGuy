---
title: "Achieving 101 Tokens/Second from Inkling 2 Mini via vLLM on GB10 Hardware"
date: 2026-11-28
description: "A developer demonstrated 101 tokens per second throughput running Inkling 2 Mini through vLLM on a GB10 device, showcasing efficient inference optimisation on constrained hardware."
tags:
  - daily-digest
  - vllm
  - benchmark
  - quantisation
  - inference
status: draft
---

A community member has achieved exceptional throughput—101 tokens per second—running the Inkling 2 Mini model via vLLM on GB10 hardware, demonstrating that sophisticated inference optimisation can extract near-API-tier performance from modest deployment targets. This benchmark is significant for practitioners seeking cost-effective local inference without sacrificing responsiveness.

The result highlights vLLM's effectiveness in batching optimisations and kernel-level performance tuning, particularly when deployed on specialised inference hardware. Achieving three-digit token-per-second rates enables real-time, conversational AI applications on edge and embedded devices, expanding the practical use cases for local LLM deployment beyond batch inference workloads.

This performance level makes local mini-model deployments competitive with cloud API latency for many applications, while retaining privacy and eliminating dependency on external services. The benchmark serves as a reference point for similar hardware configurations and encourages exploration of vLLM's advanced features like prefix caching and speculative decoding to push throughput even further.

[Read the full article on Hacker News](https://runtimenotes.com/blog/getting-101-tok-s-from-inkling-2-mini-in-vllm-on-one-gb10/).

---
*Source: [Hacker News](https://runtimenotes.com/blog/getting-101-tok-s-from-inkling-2-mini-in-vllm-on-one-gb10/) · Relevance: 8/10*
