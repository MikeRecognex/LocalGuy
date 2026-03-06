---
title: "Study Documents 135 Whisper Hallucination Phrases Generated During Silence"
date: 2026-03-06
description: "Analysis of production Whisper usage across thousands of hours reveals systematic hallucinations—confident, coherent text generation during silent segments rather than silent failures. Researchers catalogued common patterns and implemented mitigation strategies."
tags:
  - daily-digest
  - whisper
  - open-source
  - audio
  - reliability
status: draft
---

Researchers running an open-source meeting transcription bot documented a critical behavior in Whisper: during periods of silence, the model doesn't simply fail quietly—it generates confident, coherent text that never occurred. Across thousands of hours of production audio, they identified and catalogued 135 recurring hallucination phrases, revealing systematic patterns rather than random noise.

This finding is crucial for anyone deploying Whisper locally in production systems. The hallucinations aren't edge cases; they're reproducible patterns that occur at scale. The research [documents specific examples and provides datasets](https://www.reddit.com/r/LocalLLaMA/comments/1rlqfd7/we_collected_135_phrases_whisper_hallucinates/) that practitioners can use to identify and filter these issues in their own deployments. Understanding these patterns enables implementation of robust detection mechanisms.

For local audio applications—meeting bots, voice transcription pipelines, accessibility tools—this research transforms Whisper from a black-box tool to a predictable system with known failure modes. Combined with appropriate filtering, it makes Whisper substantially more reliable for production use than treating hallucinations as unknown unknowns.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rlqfd7/we_collected_135_phrases_whisper_hallucinates/) · Relevance: 9/10*
