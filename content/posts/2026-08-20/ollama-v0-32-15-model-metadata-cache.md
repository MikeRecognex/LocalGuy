---
title: "Ollama v0.32.15 Adds Model Metadata Cache to Reduce Per-Request Overhead"
date: 2026-08-20
description: "Ollama releases v0.32.15 with a new model metadata cache feature designed to reduce per-request overhead and improve inference efficiency. This update includes desktop onboarding improvements and MLX framework updates."
tags:
  - daily-digest
  - ollama
  - performance
  - open-source
  - inference
status: draft
---

Ollama has released v0.32.15 with a significant performance optimization: a model metadata cache that reduces per-request overhead. This is a critical improvement for local LLM deployments where reducing latency between requests can substantially impact user experience and resource utilization. The metadata caching approach minimizes repeated filesystem and model introspection operations.

Beyond the metadata cache, this release includes MLX framework updates and enhanced desktop application onboarding. For practitioners running Ollama on resource-constrained devices or serving multiple concurrent requests, the reduced overhead from metadata caching translates directly to better throughput and lower latency. This incremental performance work exemplifies the ongoing optimization effort in the Ollama ecosystem.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.15).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.15) · Relevance: 8/10*
