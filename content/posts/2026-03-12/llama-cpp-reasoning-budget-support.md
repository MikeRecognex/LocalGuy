---
title: Llama.cpp Adds True Reasoning Budget Support
date: 2026-03-12
description: Llama.cpp has implemented full support for reasoning budgets, allowing users to control and optimize inference costs for reasoning models. This feature moves beyond previous stub implementations to provide real control over thinking token allocation.
tags:
  - cost-saving
  - hardware
  - inference-optimization
  - llama
  - llama-cpp
  - local-deployment
  - news
  - optimization-strategy
  - performance-optimization
  - reasoning
  - reasoning-budget
  - reasoning-quality
  - release
  - token-management
  - vram-management
mentions:
  - name: r/LocalLLaMA
    role: community
status: published
---

> [!tip] There is now a full guide for this
> **[Controlling Reasoning Token Budgets in llama.cpp](/guides/llama-cpp-reasoning-budget/)** — how the budget sampler actually works, the per-request JSON fields that aren't in the server README, how to interrupt a runaway thought mid-stream, and the throughput cost of setting a cap. Written against current master, which has moved on considerably since this post.

Llama.cpp has shipped a major feature that the community has been requesting: [true reasoning budget support](https://github.com/ggml-org/llama.cpp/commit/acb7c790698fa28a0fbfc0468804926815b94de3). Previously, the `--reasoning-budget` parameter was essentially non-functional, serving only to disable thinking entirely. Now users have granular control over how many thinking tokens the model allocates during inference.

This is critical for local deployment because reasoning models like o1 and Qwen3.5 can generate substantial internal thinking tokens that increase latency and VRAM usage. With proper budget control, practitioners can balance response quality against computational cost, making these powerful models viable on resource-constrained hardware. The feature enables optimization strategies like early stopping when sufficient reasoning depth is achieved.

For anyone running reasoning models locally, this update significantly improves cost-performance tradeoffs and makes the inference process more predictable and controllable.

## Putting it into practice

The flag is the easy part. What it does at sampling time is less obvious — the budget doesn't truncate generation, it forces the model to emit its own end-of-thinking tag and carry on to the answer — and there is a real throughput cost to switching it on that isn't documented anywhere upstream.

**→ [Controlling Reasoning Token Budgets in llama.cpp](/guides/llama-cpp-reasoning-budget/)** walks through server flags, the undocumented per-request fields (`reasoning_budget_tokens` and friends), the mid-stream `reasoning_end` interrupt, why `reasoning_effort` is a different mechanism entirely, and how to pick a budget without trusting the unsourced benchmark numbers circulating for this feature.

---
*Source: [r/LocalLLaMA](https://github.com/ggml-org/llama.cpp/commit/acb7c790698fa28a0fbfc0468804926815b94de3) · Relevance: 9/10*
