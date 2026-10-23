---
title: "Ollama 0.40.9 Adds Native Speech Synthesis with Phonon on Apple Silicon"
date: 2026-10-23
description: "Ollama's latest release introduces native speech generation capabilities using Phonon, enabling text-to-speech streaming through OpenAI-compatible endpoints on Apple Silicon devices."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - open-source
  - agents
status: draft
---

Ollama v0.40.9 marks a significant expansion of multimodal capabilities by introducing native speech synthesis through Phonon integration on Apple Silicon. Users can now generate speech output directly from the CLI with `ollama run phonon`, and applications can stream audio responses through the OpenAI-compatible `/v1/audio/speech` endpoint. This addition bridges the gap between text and voice in local inference pipelines, making conversational AI applications more accessible without external TTS services.

The inclusion of speech synthesis in Ollama's core distribution represents a maturation of the local inference ecosystem. Previously, practitioners had to integrate separate speech engines or rely on cloud APIs. By bundling Phonon support alongside decision models and vLLM backends, Ollama is positioning local inference as a complete alternative to cloud-based AI services, particularly valuable for privacy-conscious applications and edge deployments where latency matters.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.9).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.9) · Relevance: 8/10*
