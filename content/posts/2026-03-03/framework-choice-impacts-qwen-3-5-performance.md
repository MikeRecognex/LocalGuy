---
title: "Framework Choice Critical: llama.cpp and vLLM Outperform Ollama for Qwen 3.5 Testing"
date: 2026-03-03
description: Community PSA reveals significant performance and correctness differences between local inference frameworks when running Qwen 3.5 models, with llama.cpp, transformers, vLLM, and SGLang producing correct results while Ollama shows issues with reasoning and tool use.
tags:
  - abstraction-layer-issues
  - advanced
  - agentic-ai
  - benchmarking
  - cautious
  - chain-of-thought-reasoning
  - comparison
  - inference-framework
  - llama-cpp
  - local-inference
  - model-evaluation-discrepancies
  - model-evaluation-frameworks
  - neutral
  - ollama
  - qwen-models
  - rag-pipelines
  - tool-use
  - vllm
status: published
---

A community member highlighted critical differences in how various local inference frameworks handle Qwen 3.5 models, particularly regarding chain-of-thought reasoning, tool calling, and response quality. Testing revealed that llama.cpp, transformers, vLLM, and SGLang reliably support Qwen 3.5's advanced features, while Ollama and similar wrapper frameworks showed degraded performance with broken tool calls and incomplete reasoning outputs.

This finding is crucial for practitioners because it explains discrepancies in reported results across the community and emphasizes the importance of framework selection for model evaluation. Ollama's abstraction layer, while convenient for casual users, may mask or introduce issues when running cutting-edge models with complex reasoning capabilities. Practitioners planning to deploy Qwen 3.5 for production use should prioritize lower-level frameworks that provide direct control over inference parameters and avoid potentially problematic abstraction layers.

The recommendation to use battle-tested frameworks like llama.cpp and vLLM becomes especially important when evaluating models for specific tasks like agentic RAG pipelines or tool-using applications.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rjb7yk/psa_if_you_want_to_test_new_models_use/) · Relevance: 9/10*
