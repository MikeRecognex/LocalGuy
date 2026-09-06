---
title: "Qwen3 Audio and Vision Support Now Available in llama.cpp"
date: 2026-04-13
description: "Qwen3-Omni and Qwen3-ASR models now run natively in llama.cpp with full audio and vision input support. This enables truly multimodal local inference with Alibaba's frontier-competitive model architecture."
tags:
  - audio-processing
  - bullish
  - consumer-gpu
  - daily-digest
  - developer
  - ease-of-deployment
  - intermediate
  - llama-cpp
  - llama-cpp-integration
  - local-inference
  - model-quantization
  - multimodal
  - multimodal-ai
  - news
  - on-device-ai
  - privacy-preserving-ai
  - qwen3
  - real-world-applications
  - release
source:
  name: "ggml-org/llama.cpp"
  url: "https://github.com/ggml-org/llama.cpp/pull/19441"
updated: 2026-09-06
status: published
---

> [!note] Updated 6 September 2026
> Nearly five months on, this remains current — because **Qwen3-Omni-30B-A3B is still the only open-weights omni model there is.** Qwen3.5, Qwen3.6 and Qwen3.8 are all text-only families; there is no Qwen3.5-Omni or Qwen3.8-Omni, whatever the SEO pages tell you.
>
> Two corrections to how this reads today: llama.cpp gives you audio and vision **input** only — speech **output** (the Talker) is still unimplemented and only at the planning stage. And the GGUFs referenced below landed the day *after* this was written, not alongside it.
>
> For the working commands, real file sizes, and the open bugs, see [Running Qwen3-Omni With Audio and Vision in llama.cpp](/guides/qwen3-omni-audio-vision-llama-cpp/).

The llama.cpp project has successfully integrated support for [Qwen3-Omni and Qwen3-ASR models](https://github.com/ggml-org/llama.cpp/pull/19441), enabling both vision and audio input on consumer hardware. Pre-quantized GGUF versions of Qwen3-Omni 30B A3B (Thinking and Instruct variants) are now available, removing compilation barriers for end users.

Qwen3-Omni represents a significant multimodal capability leap—the model can process images, audio, and text simultaneously, competing with frontier proprietary systems. Having native llama.cpp support means users can run these models locally without complex dependency chains or custom builds. The availability of high-quality quantized versions further democratizes access.

This positions local practitioners to build sophisticated applications with vision, audio, and text reasoning entirely on-device. Real-world use cases span accessibility features, real-time video analysis, voice interaction, and privacy-preserving document processing—all now feasible without cloud infrastructure.

---
*Source: [r/LocalLLaMA](https://github.com/ggml-org/llama.cpp/pull/19441) · Relevance: 9/10*
