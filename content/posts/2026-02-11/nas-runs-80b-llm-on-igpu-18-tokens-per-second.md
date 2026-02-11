---
title: "NAS System Achieves 18 tok/s with 80B LLM Using Only Integrated Graphics"
date: 2026-02-11
description: "A community member successfully runs an 80B parameter language model on a NAS system's integrated GPU at 18 tokens per second, demonstrating efficient local inference without discrete graphics cards."
tags:
  - daily-digest
  - hardware
  - optimization
  - igpu
  - performance
status: draft
---

A LocalLLaMA community member has achieved remarkable performance running an **80B parameter LLM at 18 tokens per second** on a NAS system using only integrated graphics, with no discrete GPU required. This breakthrough demonstrates that high-performance local LLM inference is possible on systems not traditionally designed for AI workloads.

The achievement is particularly significant because it challenges conventional wisdom about hardware requirements for large model inference. By leveraging integrated GPU capabilities and optimization techniques, this setup proves that substantial LLM performance can be extracted from modest hardware configurations, opening new possibilities for cost-effective local deployment.

This development is especially valuable for practitioners seeking to [consolidate AI capabilities into existing infrastructure](https://www.reddit.com/r/LocalLLaMA/comments/1r1lkfw/my_nas_runs_an_80b_llm_at_18_toks_on_its_igpu_no/). The ability to run large models on NAS hardware means users can combine storage, networking, and AI inference in a single system, reducing complexity and cost while maintaining impressive performance for local LLM applications.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1r1lkfw/my_nas_runs_an_80b_llm_at_18_toks_on_its_igpu_no/) · Relevance: 8/10*
