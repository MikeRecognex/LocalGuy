---
title: "DeepSeek-Coder-V2-Lite Under 5GB: 65 TPS Throughput on 6GB GPU"
date: 2026-11-12
description: "A highly optimized quantized version of DeepSeek-Coder-V2-Lite achieves 65 tokens per second throughput while fitting entirely in VRAM on a 6GB GPU. This demonstrates practical memory optimization enabling full model inference on consumer-grade hardware."
tags:
  - daily-digest
  - quantisation
  - gguf
  - benchmark
  - memory-optimization
status: draft
---

An optimized quantized version of DeepSeek-Coder-V2-Lite has been released, achieving impressive throughput of 65 tokens per second while requiring less than 5GB of VRAM. This allows the entire model to run 100% in-VRAM on modest 6GB consumer GPUs, eliminating disk I/O overhead and enabling production-grade inference speeds for coding tasks.

This achievement is significant for local deployment practitioners because it shows the practical limits of what's possible with modern quantization techniques on consumer hardware. Rather than theoretical benchmarks, this is a real-world model that developers can download and run today. The combination of sub-5GB memory footprint with desktop-class throughput makes this viable for local development environments, CI/CD pipelines, and edge deployments where API latency or cost is prohibitive.

[Read the full article on Hacker News](https://huggingface.co/AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF).

---
*Source: [Hacker News](https://huggingface.co/AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF) · Relevance: 9/10*
