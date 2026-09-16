---
title: "Qwen3.8-Flash-Next Non-Uniform Quantization Runs on Dual RTX3090s"
date: 2026-09-16
description: "Qwen3.8-Flash-Next achieves efficient local deployment through non-uniform quantization (GSQ-RCO), enabling the model to run on two consumer-grade RTX3090 GPUs."
tags:
  - daily-digest
  - quantisation
  - vllm
  - nvidia
status: draft
---

A community member has released a quantized version of Qwen3.8-Flash-Next that successfully runs on dual RTX3090 GPUs, utilizing non-uniform quantization techniques (GSQ-RCO-GGUF) to reduce memory footprint without proportional quality loss. This achievement represents meaningful progress in making frontier-class models accessible on mid-range consumer hardware.

For local deployment practitioners, this demonstrates the practical effectiveness of advanced quantization strategies beyond basic uniform schemes. The dual RTX3090 configuration represents an attainable hardware target for many organizations and researchers, making this quantized checkpoint particularly valuable for production deployments where memory efficiency directly impacts throughput and latency.

[Read the full article on Hacker News](https://huggingface.co/pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF).

---
*Source: [Hacker News](https://huggingface.co/pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF) · Relevance: 8/10*
