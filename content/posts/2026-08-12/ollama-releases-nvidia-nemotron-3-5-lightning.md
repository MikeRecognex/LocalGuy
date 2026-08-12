---
title: "Ollama Releases NVIDIA Nemotron 3.5 Lightning for Agent Execution"
date: 2026-08-12
description: "Ollama v0.32.9 now includes NVIDIA's Nemotron 3.5 Lightning, a 30B MoE model with only 3B active parameters optimized for on-device agent execution. This lightweight model is designed for frameworks like OpenClaw and Hermes Agent, making powerful agentic AI accessible on local hardware."
tags:
  - agent-orchestration
  - agents
  - daily-digest
  - edge-device
  - moe-architecture
  - nemotron-3-5-lightning
  - nvidia
  - ollama
  - open-source
  - openclaw
  - release
  - tool-calling
status: published
---

NVIDIA has released Nemotron 3.5 Lightning as an open-source model specifically engineered for local agent execution on edge devices. As a 30-billion parameter mixture-of-experts model with only 3 billion active parameters, it achieves remarkable efficiency without sacrificing capability. The model is built to power agentic frameworks like OpenClaw and Hermes Agent, addressing a critical gap in local AI deployment where most models are optimized for conversation rather than tool calling and reasoning.

The availability through Ollama v0.32.9 makes this a significant milestone for practitioners building on-device AI agents. The MoE architecture means you get the reasoning quality of a large model while maintaining the inference speed and memory footprint of a much smaller system. This is particularly valuable for developers who need reliable agent behavior without cloud dependencies or the latency of API calls.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.9).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.32.9) · Relevance: 9/10*
