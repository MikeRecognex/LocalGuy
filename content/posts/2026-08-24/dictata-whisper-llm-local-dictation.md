---
title: "Show HN: Dictata – Local Whisper Dictation with LLM Cleanup"
date: 2026-08-24
description: "Dictata is a new open-source tool combining local Whisper speech-to-text with LLM post-processing for high-quality dictation entirely on-device, eliminating cloud transcription dependencies."
tags:
  - daily-digest
  - whisper
  - open-source
  - edge-inference
  - privacy
status: draft
---

Dictata demonstrates a practical end-to-end local inference pipeline combining Whisper speech recognition with LLM-based cleanup and correction. By running both components locally, users achieve private dictation without sending audio to cloud services, addressing privacy and latency concerns for sensitive applications like medical dictation or confidential note-taking.

The tool showcases how composing multiple specialized local models (Whisper for speech, an LLM for grammar/coherence correction) creates capabilities rivaling cloud services while maintaining data privacy. This pattern—using smaller, focused models in sequence—is increasingly common in local deployment as practitioners discover that orchestrating multiple specialized tools often outperforms larger monolithic approaches.

For developers building privacy-preserving applications, Dictata provides a reference implementation and validates the viability of local speech processing. As open-source Whisper continues improving and lighter LLMs become available, similar multi-model pipelines will likely proliferate in applications from transcription to document processing.

[Read the full article on Hacker News](https://github.com/AntoineChatry/Dictata).

---
*Source: [Hacker News](https://github.com/AntoineChatry/Dictata) · Relevance: 7/10*
