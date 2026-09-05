---
title: "Turning Spoken Commands into JSON Tool Calls on iPhones"
date: 2026-06-22
description: "A developer demonstrates running local voice-to-JSON inference on iOS devices, enabling on-device speech recognition and structured output generation without cloud dependencies."
tags:
  - bullish
  - daily-digest
  - developer
  - edge-device
  - edge-inference
  - intermediate
  - ios
  - mobile
  - mobile-inference
  - showcase
  - speech-recognition
  - structured-output
  - structured-outputs
  - tool-calling
  - wildedge
mentions:
  - name: Wildedge
    role: publisher
  - name: Hacker News
    role: source
source:
  name: "Hacker News"
  url: "https://blog.wildedge.dev/posts/in-app-voice-assistant"
status: published
---

Running LLMs locally on mobile devices remains one of the most challenging deployment scenarios, but this implementation demonstrates practical progress on iOS. By converting voice commands directly into structured JSON outputs on-device, the approach eliminates round-trips to cloud APIs and enables responsive, privacy-preserving voice interfaces without network overhead or latency concerns.

This matters significantly for local LLM practitioners building consumer applications. The ability to perform both speech recognition and semantic understanding (converting natural language to tool calls) entirely on a phone opens possibilities for offline-capable voice assistants, accessibility tools, and control interfaces that respect user privacy by default. Structured output generation—converting speech to JSON—is particularly valuable for integration with existing mobile app architectures and backend services.

Read the full implementation details at [wildedge.dev](https://blog.wildedge.dev/posts/in-app-voice-assistant) to understand the technical trade-offs and model selection strategies for iOS deployment.

---
*Source: [Hacker News](https://blog.wildedge.dev/posts/in-app-voice-assistant) · Relevance: 8/10*
