---
title: "Thinking Machines Lab Releases Inkling-Small: A 276B Total, 12B Active Open Weights Multimodal MoE Model"
date: 2026-08-03
description: "Thinking Machines Lab has released Inkling-Small, an open-weights multimodal mixture-of-experts model with 276B total parameters but only 12B active during inference, enabling efficient local deployment on consumer hardware."
tags:
  - bullish
  - consumer-gpu
  - cpu-only
  - daily-digest
  - developer
  - inference-speed
  - intermediate
  - marktechpost
  - memory-efficiency
  - model-release
  - moe
  - moe-architecture
  - multimodal
  - multimodal-models
  - open-source
  - release
  - thinking-machines-lab
mentions:
  - name: Thinking Machines Lab
    role: developer
  - name: Marktechpost
    role: publisher
status: published
---

Thinking Machines Lab has announced Inkling-Small, a significant release for local LLM practitioners seeking efficient multimodal capabilities. With 276B total parameters but only 12B active parameters during inference, this mixture-of-experts (MoE) architecture dramatically reduces computational requirements compared to dense models, making it viable for edge deployment on consumer-grade hardware.

The key advantage of this architecture lies in its sparsity: only a subset of parameters activate per token, which translates directly to lower memory footprint and faster inference speeds. This approach is particularly valuable for practitioners running models on devices with limited VRAM or CPU-only systems. Being open-weights, the model can be freely deployed, quantised, and integrated into local applications without licensing restrictions.

For local LLM enthusiasts, Inkling-Small represents the kind of efficiency-focused innovation that makes multi-billion parameter models practical. Expect strong compatibility with quantisation tools like llama.cpp and frameworks like Ollama, making this an immediate candidate for personal deployment scenarios.

---
*Source: [Google News](https://www.marktechpost.com) · Relevance: 9/10*
