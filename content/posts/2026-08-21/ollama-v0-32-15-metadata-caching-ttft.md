---
title: "Ollama v0.32.15: Time-to-First-Token Cut in Half with Metadata Caching"
date: 2026-08-21
description: "Ollama's latest release dramatically improves time-to-first-token by caching resolved model metadata, reducing startup latency from 995ms to 524ms in benchmarks."
tags:
  - daily-digest
  - inference-optimization
  - latency-reduction
  - metadata-caching
  - ollama
  - open-source
  - performance
  - performance-benchmark
  - release
  - startup-latency
  - time-to-first-token
status: published
---

Ollama v0.32.15 delivers a crucial performance win for interactive local LLM applications: time-to-first-token (TTFT) is cut roughly in half through intelligent metadata caching. The improvements shown in benchmarks—dropping from ~995ms to ~524ms—translate directly to more responsive applications and better user experience in real-time scenarios like code completion, chat interfaces, and interactive tools.

This optimization addresses a persistent pain point in local deployment: perceived slowness during the initial model loading phase. By caching resolved metadata between requests, Ollama eliminates redundant work that was previously performed on every inference call. The release also fixes a critical bug where chat and generate operations could hang after parser errors—stability improvements that matter for production deployments.

For practitioners building applications that prioritize snappy response times, this release makes local inference significantly more competitive with API-based alternatives on user perception, even when accounting for total request latency.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.15).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.15) · Relevance: 9/10*
