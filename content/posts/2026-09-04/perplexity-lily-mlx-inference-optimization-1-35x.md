---
title: "Perplexity Open-Sources Lily: 1.35x Faster Inference Than MLX on Apple Silicon"
date: 2026-09-04
description: "Perplexity releases Lily, an optimised inference framework for Apple Silicon delivering 1.35x speedup compared to MLX, expanding the tooling ecosystem for on-device LLM inference on M-series Macs."
tags:
  - daily-digest
  - apple-silicon
  - mlx
  - optimization
  - open-source
status: draft
---

Perplexity has open-sourced Lily, a new inference framework purpose-built for Apple Silicon (M1, M2, M3 series) that achieves 1.35x faster inference compared to the widely-used MLX framework. The project represents a meaningful advancement in the maturity of the Apple Silicon LLM inference ecosystem, which has historically lagged behind CUDA and ROCm optimisations.

Lily's performance gains likely stem from deeper integration with Metal Performance Shaders and ANE (Apple Neural Engine) capabilities, allowing better hardware utilisation than more generic frameworks. For the growing base of developers working on MacBook Pros and Mac Studios, this creates a viable path to faster local inference without external accelerators.

The release strengthens Apple Silicon as a serious option for local LLM development and deployment. As M-series chips continue to gain memory capacity and computational power, frameworks like Lily make them competitive alternatives to cloud inference for latency-sensitive applications, model experimentation, and privacy-first deployments.

[Read the full article on Google News](https://news.google.com/rss/articles/CBMiggFBVV95cUxPcndoT0Y1NDAyUHk3M3BiTW1SQWRHeDE3LU94MmkxMEprcEhuM0pRaTVUblRHREt2MTJ2dUt1S3RoRGFoTldsVVVlbENvMF9MTHFndFgzSll2LXo5cmpGWndhendzaWR0NHp4emVXRGJhWVdFQ01BZkRYY1Vmc3QtdTNR?oc=5).

---
*Source: [Google News](https://news.google.com/rss/articles/CBMiggFBVV95cUxPcndoT0Y1NDAyUHk3M3BiTW1SQWRHeDE3LU94MmkxMEprcEhuM0pRaTVUblRHREt2MTJ2dUt1S3RoRGFoTldsVVVlbENvMF9MTHFndFgzSll2LXo5cmpGWndhendzaWR0NHp4emVXRGJhWVdFQ01BZkRYY1Vmc3QtdTNR?oc=5) · Relevance: 8/10*
