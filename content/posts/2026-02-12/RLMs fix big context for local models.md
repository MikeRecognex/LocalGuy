---
title: Use Recursive  Language Models to address huge contexts for local LLM
date: 2026-02-12
description: A powerful and innovative technique for extending context windows for use in local models
tags:
  - self-hosting
  - deployment
  - cost-optimization
  - infrastructure
status: published
---
Recursive Language Models (RLMs) are an inference-time strategy that lets LLMs handle arbitrarily long prompts by treating the input not as tokens to stuff into the context window, but as data in an external environment (e.g., a Python REPL) that the model can programmatically inspect, chunk, and recursively query itself over. Instead of compressing or retrieving context heuristically, an RLM allows the model to peek into specific parts of the prompt, decompose tasks, and make recursive sub-calls on manageable snippets, effectively scaling to 10M+ token inputs while maintaining or improving quality compared to base models and summarization/retrieval agents. Across diverse long-context benchmarks, RLMs dramatically outperform standard LLM calls and common scaffolds—especially on information-dense tasks—at comparable or sometimes lower cost, though with higher variance due to recursive trajectories, showing that inference-time recursion plus symbolic interaction can extend practical context length by orders of magnitude without retraining the underlying model.


The concept is proposed and discussed here...
https://arxiv.org/abs/2512.24601

---
*Source: (https://arxiv.org/abs/2512.24601) · Relevance: 8/10*
