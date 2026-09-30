---
title: "Ollama v0.35.0 Adds Decision Models Support via Jev API"
date: 2026-09-30
description: "Ollama 0.35.0 introduces support for decision models through a new /v1/systemone endpoint, enabling classification, routing, and triage tasks. Decision models return structured choices and scores instead of text, expanding local inference capabilities."
tags:
  - daily-digest
  - ollama
  - agents
  - open-source
  - model-types
status: draft
---

Ollama's latest v0.35.0 release significantly expands the framework's capabilities by introducing decision model support through the TypeSafe Jev API. The new `/v1/systemone` endpoint allows local deployment of classification and routing models that return structured outputs—choices, probabilities, and confidence scores—rather than text generation, opening new use cases previously requiring specialized infrastructure.

Decision models are particularly valuable for local deployment scenarios where you need fast, structured predictions: ticket triage systems, model routing decisions, content classification, and agent decision-making pipelines. By supporting these natively in Ollama, the project enables practitioners to build complete agentic workflows entirely locally without orchestrating multiple inference frameworks or cloud APIs.

This release demonstrates the maturation of Ollama as a platform beyond simple text generation, moving toward comprehensive multi-modal and multi-task local inference. The integration of Jev-compatible models also signals standardization efforts in the open-source LLM space, making it easier to discover and deploy specialized models locally.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.0) · Relevance: 9/10*
