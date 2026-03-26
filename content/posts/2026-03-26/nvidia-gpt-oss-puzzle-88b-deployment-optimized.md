---
title: "NVIDIA Releases GPT-OSS-Puzzle-88B, a Deployment-Optimized Model"
date: 2026-03-26
description: "NVIDIA has released gpt-oss-puzzle-88B, a compressed version of OpenAI's 120B model using their Puzzle neural architecture search framework. The model is specifically optimized for efficient local deployment while maintaining competitive performance."
tags:
  - daily-digest
  - model-release
  - quantisation
  - optimization
  - open-source
status: draft
---

NVIDIA has unveiled [gpt-oss-puzzle-88B](https://huggingface.co/nvidia/gpt-oss-puzzle-88B), a deployment-optimized large language model derived from OpenAI's gpt-oss-120b. Using Puzzle, NVIDIA's post-training neural architecture search (NAS) framework, this model achieves significant size reduction while maintaining performance—a critical breakthrough for local deployment scenarios where memory and compute resources are constrained.

This release demonstrates the industry's shift toward practical optimization techniques that go beyond simple quantization. The model represents a sweet spot for practitioners running inference on consumer-grade hardware, striking a balance between capability and resource efficiency. With 88B parameters compressed from 120B, this approach validates that thoughtful architecture search during post-training can yield models suitable for edge devices and self-hosted infrastructure without the typical quality penalties of naive compression.

---
*Source: [r/LocalLLaMA](https://huggingface.co/nvidia/gpt-oss-puzzle-88B) · Relevance: 9/10*
