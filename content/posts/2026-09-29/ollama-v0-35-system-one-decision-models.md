---
title: "Ollama 0.35.0 Adds Support for Decision Models via System One API"
date: 2026-09-29
description: "Ollama releases version 0.35.0 with native support for decision models through a new /v1/systemone endpoint, enabling local deployment of specialized models for classification, routing, and structured decision tasks. This expansion beyond text generation opens new use cases for on-device AI inference."
tags:
  - api
  - bespokelabs
  - daily-digest
  - decision-models
  - model-routing
  - nimble
  - ollama
  - open-source
  - release
  - structured-outputs
mentions:
  - name: BespokeLabs
    role: developer
status: published
---

Ollama's latest release marks a significant expansion in model types supported by the popular local inference framework. The addition of decision models through the System One API enables practitioners to run specialized models locally that return structured outputs like probabilities and scores instead of generated text. This is particularly valuable for ticket triage, intelligent model routing, and content classification tasks where deterministic categorical decisions are needed.

Support for decision models means local AI workflows can now handle a broader range of ML tasks without relying on cloud APIs. The /v1/systemone endpoint follows OpenAI's TypeSafe specification, making it straightforward for developers to integrate decision models into existing applications. Models like Nimble from BespokeLabs are immediately available through Ollama's pull command, removing friction for deployment.

This release demonstrates Ollama's evolution from a text-generation-only tool to a comprehensive local inference platform. For teams building privacy-sensitive workflows or operating in environments with limited connectivity, having local access to decision models reduces latency and dependency on external services while maintaining the simplicity Ollama is known for.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.35.0) · Relevance: 9/10*
