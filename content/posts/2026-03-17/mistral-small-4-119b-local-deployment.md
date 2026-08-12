---
title: Mistral Small 4 119B Released with NVFP4 Quantisation Support
date: 2026-03-17
description: Mistral AI releases Mistral Small 4 119B model with official NVFP4 quantisation, enabling efficient local deployment on consumer hardware. The model family is now integrated into HuggingFace Transformers with multiple quantisation variants available.
tags:
  - bullish
  - consumer-gpu
  - consumer-gpu-inference
  - developer
  - edge-computing
  - edge-inference
  - huggingface-integration
  - inference-optimization
  - inference-performance
  - intermediate
  - local-deployment
  - memory-optimization
  - mistral
  - model-quantization
  - model-size
  - open-source
  - quantization
  - release
  - showcase
status: published
---

Mistral AI has released the Mistral Small 4 119B model family, marking a significant milestone for local LLM deployment. The release includes [official NVFP4 quantisation variants](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-NVFP4), a lower-precision format optimised for NVIDIA hardware that reduces memory footprint while maintaining competitive inference performance.

The model is now available across multiple quantisation levels on HuggingFace, with official Transformers library support via [GitHub PR #44760](https://github.com/huggingface/transformers/pull/44760). This accessibility is crucial for practitioners running inference on edge devices and consumer-grade GPUs. The 119B parameter count positions this as a practical middle ground for those seeking advanced capabilities without enterprise-scale hardware requirements.

Community reception has been positive (523+ upvotes), with early adopters exploring the model's performance on local setups. The official quantisation support removes friction from the typical quant-creation workflow, allowing immediate deployment.

---
*Source: [r/LocalLLaMA](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603) · Relevance: 9/10*
