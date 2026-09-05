---
title: "Gemma 4 MoE for Agentic Coding: Testing Open-Weight Models on AMD APU Hardware"
date: 2026-08-31
description: "Alex Ewerlof runs Gemma 4 26B MoE for coding on an AMD Ryzen 7 PRO 250 APU with 64GB of RAM, and reports that tooling closes much of the gap to proprietary models — at the cost of cold starts and slower inference."
tags:
  - agentic-coding
  - agents
  - amd
  - analysis
  - context-window
  - cpu-only
  - gemma-4-26b-moe
  - inference-speed
  - lm-studio
  - manual
  - open-source
  - unified-memory
mentions:
  - name: Alex Ewerlof
    role: developer
source:
  name: "blog.alexewerlof.com"
  url: "https://blog.alexewerlof.com/p/local-llms-for-agentic-coding"
status: published
origin: manual
---

Alex Ewerlof has written up what it's actually like to use local models for coding work, prompted by cloud pricing moving past its introductory phase. He ran Gemma 4 variants on an AMD Ryzen 7 PRO 250 APU with 64GB of RAM, driving them through LM Studio with a 150k context window. The concrete result he reports is Gemma 4 26B MoE generating a working Snake game.

His conclusion is measured rather than triumphant: open-weight models underperform the flagship proprietary ones, but in his words, "with tooling (e.g. an AI harness) you can compensate a lot." The drawbacks he names are cold-start delay and slower inference than a hosted API — the familiar cost of keeping the model on your own machine.

Worth reading for the setup detail rather than the verdict. An APU with 64GB of shared memory is a different proposition from a discrete GPU, and the combination of that hardware, a 150k context and an agent harness is a specific configuration you can compare your own against. One generated game is a demonstration, not a benchmark, so treat the capability claims as a starting point for your own testing rather than a settled result.

[Read the full article on blog.alexewerlof.com](https://blog.alexewerlof.com/p/local-llms-for-agentic-coding).

---
*Source: [blog.alexewerlof.com](https://blog.alexewerlof.com/p/local-llms-for-agentic-coding) · Relevance: 8/10*
