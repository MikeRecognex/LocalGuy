---
title: "Ollama Adds Local Text-to-Speech, 100x Faster Than Real-Time on Apple Silicon"
date: 2026-10-26
description: "Ollama now supports local text-to-speech generation on Apple Silicon Macs with Phonon models, achieving 100x faster than real-time performance. This enables private, on-device speech synthesis without cloud dependencies."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - speech-generation
  - inference-optimization
status: draft
---

Ollama has integrated local text-to-speech capabilities with its 0.40.11 release, introducing Phonon speech models that generate audio on Apple Silicon Macs at 100x faster than real-time speeds. This advancement eliminates the need for cloud-based speech services while maintaining exceptional performance, making it practical for real-time conversational AI applications running entirely on-device.

The integration includes streaming support through the OpenAI-compatible `/v1/audio/speech` endpoint, enabling seamless integration into existing applications. Audio generation happens locally with zero network latency or privacy concerns, making this ideal for sensitive applications requiring on-device processing.

For practitioners building local LLM applications, this means you can now create end-to-end local inference pipelines that include text generation, voice output, and potentially voice input—all without leaving your device or connecting to external APIs. The 100x real-time performance on Apple Silicon makes interactive voice-based applications genuinely practical.

[Read the full article on Hacker News](https://ollama.com/blog/speech-models).

---
*Source: [Hacker News](https://ollama.com/blog/speech-models) · Relevance: 9/10*
