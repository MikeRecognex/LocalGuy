---
title: "Homelab Consolidation: Replacing 3 Models with Single 122B MoE Model on AMD Ryzen AI MAX+"
date: 2026-03-27
description: "A homelabber consolidated their inference setup from three separate models down to a single 122B mixture-of-experts model on consumer hardware (Ryzen AI MAX+ 395 with 128GB RAM), providing detailed benchmarks and practical insights on model consolidation strategy."
tags:
  - daily-digest
  - hardware
  - moe
  - benchmark
  - homelab
status: draft
---

This case study demonstrates a practical approach to optimizing personal AI infrastructure. The author moved from running three separate text models (GLM-4 Flash 30B MoE, Qwen 2.5 32B, and a smaller specialized model) to a single 122B mixture-of-experts model on a Ryzen AI MAX+ 395 CPU-GPU hybrid setup. The consolidation reduces operational complexity, improves resource utilization via shared GPU memory (96GB via Vulkan/RADV), and simplified the infrastructure stack using Proxmox with LXC containers and llama-server.

[The detailed benchmarks and configuration insights](https://www.reddit.com/r/LocalLLaMA/comments/1s4p922/consolidated_my_homelab_from_3_models_down_to_one/) offer valuable lessons for self-hosted deployments. MoE models prove particularly efficient on this hardware, activating only necessary parameters while maintaining broad capability coverage. This approach is increasingly relevant as consumer APUs (like AMD's latest offerings) blur the line between CPU and GPU, enabling meaningful LLM inference without discrete accelerators.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1s4p922/consolidated_my_homelab_from_3_models_down_to_one/) · Relevance: 8/10*
