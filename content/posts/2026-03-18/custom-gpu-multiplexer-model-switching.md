---
title: "Custom GPU Multiplexer Achieves 0.3ms Model Switching on Legacy Hardware"
date: 2026-03-18
description: "A developer built a custom Linux kernel module that multiplexes six GPUs through a single PCIe slot, enabling model hot-swapping in under 0.3 milliseconds using repurposed Bitcoin mining hardware."
tags:
  - daily-digest
  - hardware
  - performance-optimization
  - inference
status: draft
---

A community member has developed an innovative hardware solution addressing a practical constraint of local multi-model deployments: switching between loaded models with minimal latency. Using repurposed Bitcoin mining GPUs and a custom Linux kernel module, they achieved sub-millisecond model switching (0.3ms) across six GPU dies multiplexed through a single PCIe slot—a significant engineering accomplishment.

This work is particularly relevant for local inference serving scenarios where multiple specialized models need to be available for different tasks. Rather than maintaining separate GPU allocations for each model (wasting VRAM), this multiplexing approach allows rapid context-switching between loaded models. The use of legacy hardware (K80s and Bitcoin mining rigs) demonstrates the potential for cost-effective local infrastructure by repurposing existing compute hardware.

For organizations building local inference platforms, this demonstrates that creative hardware solutions can overcome apparent limitations. The approach could enable efficient multi-model serving in resource-constrained environments, whether in edge datacenters, research labs, or organizations seeking to minimize capital expenditure on local ML infrastructure.

---
*Source: [r/LocalLLaMA](https://i.redd.it/snxv2h5s4ppg1.jpeg) · Relevance: 7/10*
