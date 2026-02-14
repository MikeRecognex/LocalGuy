---
title: "GPT-OSS 120B Uncensored Model Released in Native MXFP4 Precision"
date: 2026-02-14
description: "An uncensored version of GPT-OSS 120B has been released featuring native MXFP4 precision training, offering 117B parameters with MoE architecture for efficient local deployment."
tags:
  - daily-digest
  - open-source
  - moe
  - quantization
  - uncensored
status: draft
---

A new uncensored version of GPT-OSS 120B has been released, featuring 117 billion total parameters with a mixture-of-experts architecture using 128 experts and top-4 routing, resulting in approximately 5.1 billion active parameters during inference. The model supports 128K context length and is notable for being trained in native MXFP4 precision rather than being post-training quantized.

The native MXFP4 precision is particularly significant for local deployment as it maintains model quality while offering the memory efficiency benefits typically associated with quantization. This approach represents a new direction in model training where efficiency considerations are built into the training process rather than applied afterwards.

For local LLM practitioners, this release offers a powerful alternative to heavily censored models while maintaining efficient resource usage through its MoE architecture and native low-precision training. [The full release details and download links are available in the community discussion](https://www.reddit.com/r/LocalLLaMA/comments/1r3zuuf/gptoss_120b_uncensored_aggressive_release_mxfp4/).

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1r3zuuf/gptoss_120b_uncensored_aggressive_release_mxfp4/) · Relevance: 8/10*
