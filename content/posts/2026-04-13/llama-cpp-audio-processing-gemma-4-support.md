---
title: "Audio Processing Support Lands in llama.cpp with Gemma-4"
date: 2026-04-13
description: "llama.cpp now supports speech-to-text functionality with Gemma-4 E2A and E4A models, enabling local multimodal inference on consumer hardware. This expansion brings audio capabilities to the most widely-used local LLM inference engine."
tags:
  - daily-digest
  - llama-cpp
  - audio-processing
  - multimodal
  - gemma-4
status: draft
---

A major capability expansion has arrived for local LLM inference: [llama.cpp now natively supports speech-to-text processing](https://www.reddit.com/r/LocalLLaMA/comments/1sjhxrw/audio_processing_landed_in_llamaserver_with_gemma4/) with Gemma-4's E2A and E4A models. This means practitioners can build fully local multimodal applications—combining text and audio—without relying on cloud APIs or external speech services.

This development significantly lowers the barrier for audio-based local deployments. Previously, handling audio input required either separate specialized models or cloud services. With STT now integrated directly into llama.cpp's server, users running Gemma-4 can process voice input end-to-end on their own hardware. Combined with vision support already available, this positions llama.cpp as increasingly versatile for real-world multimodal applications.

For teams building on-device assistants, call centers, or voice-enabled local tools, this removes a critical infrastructure dependency and improves privacy and latency characteristics significantly.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1sjhxrw/audio_processing_landed_in_llamaserver_with_gemma4/) · Relevance: 9/10*
