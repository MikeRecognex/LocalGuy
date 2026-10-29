---
title: "NVIDIA Nemotron 3.5 Transcribe and Granary v2: On-Device Speech Recognition with Prompt Adaptation"
date: 2026-10-29
description: "NVIDIA releases Nemotron Transcribe and Granary v2, specialized speech-to-text models designed for local deployment with prompt-based domain adaptation capabilities."
tags:
  - daily-digest
  - nvidia
  - audio-processing
  - open-source
  - fine-tuning
status: draft
---

NVIDIA's Nemotron Transcribe and Granary v2 models expand the local inference toolkit into the speech domain, providing specialized multilingual ASR (automatic speech recognition) capabilities optimized for on-device deployment. Granary v2 introduces a novel approach: prompt-based domain adaptation that allows users to influence transcription behavior through text prompts rather than retraining, dramatically reducing deployment friction for specialized use cases like medical dictation, technical documentation, or domain-specific jargon.

For local LLM practitioners, this matters because end-to-end speech pipelines—voice input → local LLM processing → audio output—now become genuinely viable without cloud dependencies. The ability to adapt transcription to domain-specific vocabulary through prompts (as mentioned in the H2S Media article showing 62% error reduction on Indian doctors' dictation) means practitioners can optimize accuracy for their specific use case without the infrastructure overhead of fine-tuning or retraining. This completes the local AI loop: text, vision, and now speech, all runnable on-device.

[Read the full article on Hugging Face Blog](https://huggingface.co/blog/nvidia/nemotron-transcribe-granary).

---
*Source: [Hugging Face Blog](https://huggingface.co/blog/nvidia/nemotron-transcribe-granary) · Relevance: 8/10*
