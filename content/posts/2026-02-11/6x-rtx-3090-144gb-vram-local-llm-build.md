---
title: "Community Member Builds 144GB VRAM Local LLM Powerhouse"
date: 2026-02-11
description: "A LocalLLaMA community member showcases a custom-built system with 6x RTX 3090 GPUs providing 144GB of VRAM, featuring modified drivers with P2P support for high-performance local LLM inference."
tags:
  - daily-digest
  - hardware
  - multi-gpu
  - custom-build
  - performance
status: draft
---

A LocalLLaMA community member has completed an impressive high-performance build featuring **6x Gigabyte RTX 3090 Gaming OC** cards, delivering a total of 144GB of VRAM for local LLM inference. The system runs on an ASRock ROMED-2T motherboard with an EPYC 7502 CPU and 64GB of DDR4 memory in octa-channel configuration, with all GPUs operating at full PCIe 4.0 16x speeds.

The build incorporates **modified TinyGrad NVIDIA drivers with P2P (peer-to-peer) communication enabled**, achieving impressive intra-GPU bandwidth of 24.5 GB/s. This configuration represents a significant advancement for local deployment, as P2P communication allows GPUs to directly transfer data between each other without going through system memory, dramatically improving performance for large model inference.

This type of custom build demonstrates the growing sophistication of [community hardware solutions](https://i.redd.it/ju0ed5uceuig1.jpeg) for running massive models locally. With 144GB of combined VRAM, this system can handle the largest open-source models available, including full-precision versions of models that typically require significant quantization on consumer hardware.

---
*Source: [r/LocalLLaMA](https://i.redd.it/ju0ed5uceuig1.jpeg) · Relevance: 8/10*
