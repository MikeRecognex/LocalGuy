---
title: "Ollama v0.40.9 adds native speech synthesis with Phonon on Apple Silicon"
date: 2026-10-24
description: "Ollama now supports speech generation via Phonon on Apple Silicon Macs, enabling audio output from text and chat models through streaming OpenAI-compatible endpoints."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - audio
  - open-source
status: draft
---

Ollama v0.40.9 adds native speech synthesis capabilities through Phonon, enabling users to generate speech directly on Apple Silicon Macs. The implementation includes both command-line support and OpenAI-compatible `/v1/audio/speech` endpoints for streaming audio generation, allowing both interactive use and integration into applications.

This expansion into multimodal output is particularly important for local inference practitioners building on macOS. Previously, speech synthesis typically required external APIs or separate specialized services. Native support within Ollama means users can build complete end-to-end applications—from text generation to audio output—entirely on-device, maintaining privacy and eliminating latency from API round-trips.

The timing is significant as it positions Apple Silicon Macs as viable platforms for sophisticated multimodal workflows, complementing the existing text and vision capabilities already present in the Ollama ecosystem.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.9).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.9) · Relevance: 8/10*
