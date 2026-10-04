---
title: "Ollama v0.35.0 Adds Decision Models Support via /v1/systemone API"
date: 2026-10-01
description: "Ollama releases v0.35.0 with native support for decision models through a TypeSafe Jev API-compatible endpoint, expanding local inference capabilities beyond text generation to classification, routing, and decision tasks."
tags:
  - agent-orchestration
  - agents
  - bespokeninc
  - daily-digest
  - decision-models
  - nimble
  - ollama
  - open-source
  - release
  - structured-outputs
  - typesafe
mentions:
  - name: BespokenInc
    role: developer
  - name: TypeSafe
    role: developer
status: published
---

Ollama v0.35.0 marks a significant expansion of the framework's capabilities by introducing native support for decision models through the `/v1/systemone` endpoint. This implementation follows TypeSafe's Jev API specification, enabling models to return structured outputs—choices, probabilities, and confidence scores—rather than text. Available models like Nimble from BespokenInc are now accessible through Ollama's standard interface, making decision-based inference as accessible as traditional text generation.

This development is particularly important for local inference practitioners building agent systems, content classification pipelines, and ticket triage automation. By bringing decision models into Ollama's ecosystem, the framework removes friction around deploying non-generative workloads on-device, allowing teams to consolidate diverse inference tasks on a single platform.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.0) · Relevance: 10/10*
