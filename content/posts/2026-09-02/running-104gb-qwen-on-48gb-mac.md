---
title: "Running 104GB Qwen3.8-Flash-Next on 48GB Mac with Slotstream at ~12 tok/s"
date: 2026-09-02
description: "A breakthrough demonstration of running a 104GB model on a 48GB Mac using adaptive KV streaming techniques, achieving practical inference speeds of ~12 tokens/second. This showcases innovative memory optimization for consumer hardware."
tags:
  - apple-silicon
  - context-window
  - daily-digest
  - inference-speed
  - kv-cache-optimization
  - memory-optimization
  - quantisation
  - qwen3-8-flash-next
  - showcase
  - slotstream
mentions:
  - name: Hacker News
    role: publisher
status: published
---

Running large language models on resource-constrained hardware has historically required aggressive quantisation or model pruning. This demonstration breaks that paradigm by successfully running a 104GB Qwen3.8-Flash-Next model on a 48GB Mac system, achieving approximately 12 tokens per second inference speed. The achievement leverages Slotstream, an adaptive KV streaming approach that intelligently manages key-value cache pressure without sacrificing output quality.

The practical implications are significant for local LLM practitioners. Users can now run cutting-edge models on existing Mac hardware without waiting for quantised variants to be released or relying on cloud APIs. This democratizes access to high-parameter models and opens new possibilities for privacy-focused deployments where sensitive data cannot leave the device. The technique suggests that memory optimization innovations may be more impactful than hardware upgrades for the near term.

[Read the full article on Hacker News](https://github.com/carloslfu/slotstream).

---
*Source: [Hacker News](https://github.com/carloslfu/slotstream) · Relevance: 10/10*
