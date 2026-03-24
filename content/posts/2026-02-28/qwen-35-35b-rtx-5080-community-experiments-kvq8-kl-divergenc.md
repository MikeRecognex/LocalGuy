---
title: Qwen 3.5-35B RTX 5080 Benchmarks Confirm KV Q8_0 as Free Lunch, Q4_K_M Remains Optimal
date: 2026-02-28
description: Comprehensive experiments on RTX 5080 16GB confirm that KV cache quantisation to Q8_0 provides free performance gains without quality loss, while Q4_K_M remains the optimal general-purpose quantisation. The study validates configuration optimisations that improve throughput by 7% through proper batch flag usage.
tags:
  - benchmark
  - hardware
  - quantization
  - qwen
status: published
---

Following up on initial benchmarks, this [community-driven study validated critical quantisation and configuration decisions for Qwen 3.5-35B on consumer GPUs](https://www.reddit.com/r/LocalLLaMA/comments/1rg4zqv/followup_qwen3535ba3b_7_communityrequested/). The experiments confirm that reducing KV cache precision to Q8_0 delivers free performance improvements without measurable quality degradation according to KL divergence metrics—a valuable finding for practitioners running out of VRAM.

The benchmarking work also demonstrates that careful configuration tuning yields meaningful gains: enabling `--fit-on` without batch flags achieved 74.7 tokens/second, representing a 7% improvement over the initial configuration. These practical optimisations are particularly relevant for users with limited VRAM budgets trying to maximise throughput on hardware like RTX 5080 with 16GB memory.

The systematic approach to validation using KL divergence as a quality metric provides confidence in applying these optimisations to production deployments, and the open publication of methodology allows the community to verify and build upon these findings.

---
*Source: [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1rg4zqv/followup_qwen3535ba3b_7_communityrequested/) · Relevance: 9/10*
