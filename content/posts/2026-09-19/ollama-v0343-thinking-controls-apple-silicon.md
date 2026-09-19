---
title: "Ollama v0.34.3: Model Thinking Controls and Expanded Apple Silicon Support"
date: 2026-09-19
description: "Ollama releases v0.34.3 with new thinking level controls for models and expanded Apple Silicon support, including Nemotron H vision models on Mac hardware."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - open-source
  - inference-servers
status: draft
---

Ollama's latest release adds critical features for production local inference. The new thinking controls API lets users configure model reasoning levels per request (low, high, max), with sensible defaults per model. This is essential for applications needing to balance latency against quality—quick answers on simple queries, deeper reasoning for complex problems. The expansion of Apple Silicon support to include Nemotron H vision models further extends Ollama's reach on consumer Mac hardware.

For Mac-based deployment, this is significant: Nemotron H models add multimodal capability to on-device inference on Apple Silicon, enabling document analysis, image understanding, and vision-language tasks without cloud dependencies. Combined with the thinking API, developers can now build sophisticated local AI applications that intelligently adjust compute allocation based on task complexity. The straightforward API for controlling these parameters makes this accessible to developers without deep ML infrastructure experience.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.34.3-rc1).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.34.3-rc1) · Relevance: 9/10*
