---
title: "Ollama v0.40.15: CUDA In-Process Loading and MiMo Support"
date: 2026-11-04
description: "Ollama release improves CUDA library handling on Linux and adds support for MiMo V2.6 models, streamlining deployment and expanding compatible model ecosystem."
tags:
  - container-deployment
  - cuda-acceleration
  - daily-digest
  - deployment-ergonomics
  - mimo-v2-6
  - model-support
  - nvidia
  - ollama
  - open-source
  - release
mentions:
  - name: GitHub
    role: publisher
status: published
---

Ollama continues iterating on deployment ergonomics with improvements to CUDA library management and expanded model support. The in-process CUDA library loading on Linux eliminates external dependencies, simplifying containerization and reducing configuration friction for NVIDIA GPU users—the largest local deployment segment.

These seemingly minor improvements have outsized impact on real-world usability. Removing dependency management headaches makes local deployment more reliable for operations teams and reduces support burden. Continued model support expansion keeps Ollama's ecosystem aligned with emerging open-weight models, ensuring users can immediately leverage new releases without waiting for explicit integrations.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.15-rc0).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.15-rc0) · Relevance: 8/10*
