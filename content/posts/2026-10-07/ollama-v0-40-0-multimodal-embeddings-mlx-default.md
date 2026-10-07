---
title: "Ollama v0.40.0 Brings Multimodal Embeddings and MLX Default on Apple Silicon"
date: 2026-10-07
description: "Ollama's latest release makes MLX the default runtime for supported models on Apple Silicon and implements native multimodal embedding support through EmbeddingGemma2Model architecture. This brings efficient text, audio, and video embeddings to on-device deployment with significantly reduced memory footprint."
tags:
  - daily-digest
  - ollama
  - apple-silicon
  - mlx
  - multimodal
status: draft
---

Ollama v0.40.0 represents a major milestone for local LLM deployment on Apple Silicon systems. The update makes MLX the default runtime for compatible model architectures, leveraging Apple's optimized machine learning framework for better performance and efficiency. This decision eliminates configuration friction for users running models like Qwen, Gemma4, and other MLX-compatible architectures.

A critical addition is native multimodal embedding support through the EmbeddingGemma2Model implementation on the MLX runner. The 24-layer bidirectional text encoder with shared vision and audio towers enables semantic search across text, images, and audio on-device—all while running in 567MB of memory. The `/api/embed` endpoint now accepts per-item media via input dicts, making it straightforward to build RAG systems and semantic search applications locally without cloud dependencies.

This release democratizes multimodal AI deployment by combining two powerful trends: Apple Silicon's computational efficiency and open-source embedding models. Developers can now build privacy-preserving search and retrieval systems that work offline across multiple media types.

[Read the full article on Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc6).

---
*Source: [Ollama release](https://github.com/ollama/ollama/releases/tag/v0.40.0-rc6) · Relevance: 9/10*
