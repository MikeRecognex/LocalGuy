---
title: "Ollama v0.40.11 Adds Native Speech Generation and D3 Decision Models"
date: 2026-10-25
description: "Ollama releases v0.40.11 with native speech generation on macOS via Phonon voices, streaming audio through OpenAI-compatible endpoints, and support for D3 decision models with vLLM and Semantic Router integration."
tags:
  - daily-digest
  - ollama
  - open-source
  - inference-optimization
status: draft
---

Ollama's latest v0.40.11 release introduces significant capabilities for local inference workflows, particularly with native speech synthesis now available on macOS. The addition of Phonon voice catalog support enables text-to-speech directly within Ollama, with streaming audio available through OpenAI-compatible `/v1/audio/speech` endpoints—making it straightforward for developers to integrate voice output into local AI applications without external dependencies.

Beyond voice capabilities, this release brings support for D3 decision models alongside vLLM and Semantic Router integration, expanding the framework's flexibility for multi-model inference pipelines. These features significantly enhance local LLM deployment for production use cases that require conversational AI with audio feedback, while maintaining the lightweight, self-hosted nature that makes Ollama attractive for edge deployment scenarios.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.11).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.11) · Relevance: 9/10*
