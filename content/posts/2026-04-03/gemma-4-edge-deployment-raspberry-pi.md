---
title: "Gemma 4 2B Successfully Runs on Raspberry Pi 5"
date: 2026-04-03
description: "The Gemma 4 E2B 2B variant runs viably on Raspberry Pi 5 with 8GB RAM using llama.cpp, extending local LLM capabilities to ultra-low-power edge devices."
tags:
  - daily-digest
  - edge-deployment
  - hardware
  - raspberry-pi
  - gemma
status: draft
---

Gemma 4's smallest variant (E2B, 2B parameters) has been successfully deployed on Raspberry Pi 5 with 8GB memory using the latest llama.cpp build. This development extends viable local inference to ultra-low-power platforms, demonstrating that modern quantized models can operate on single-board computers with practical performance.

The deployment uses [Potato OS](https://github.com/slomin/potato-os), a purpose-built operating system for Pi-based LLM inference, compiled with the latest llama.cpp optimizations. While inference speed on such constrained hardware remains limited compared to GPU-accelerated systems, this achievement validates the viability of distributed edge inference for battery-powered and always-on devices in homes and IoT environments.

For local LLM practitioners, this confirms a key vision: deployable AI models across the entire spectrum from cloud to edge. The 2B parameter target, combined with aggressive quantization, opens possibilities for embedded applications, autonomous devices, and scenarios where cloud connectivity is unreliable.

---
*Source: [r/LocalLLaMA](https://v.redd.it/fxjr1y5yytsg1) · Relevance: 7/10*
