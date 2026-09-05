---
title: "Liquid AI Releases LFM2.5-DSpark Draft Models with 3.18x Faster Decoding"
date: 2026-08-21
description: "Liquid AI introduces speculative decoding models that achieve up to 3.18x faster inference without changing model outputs, significantly improving local LLM performance."
tags:
  - daily-digest
  - edge-device
  - gguf
  - inference-optimization
  - inference-speed
  - lfm2-5-dspark
  - liquid-ai
  - local-deployment
  - performance
  - release
  - speculative-decoding
mentions:
  - name: Liquid AI
    role: developer
source:
  name: "Google News"
  url: "https://news.google.com/rss/articles/CBMixgFBVV95cUxPaTZGR0xHWUhVSV9NT21WcHNDY00wZ2R4Q0NLM0YzTU53R0k1NWt4U0FDOEhZVDBoMlNqSUdWU3Q0ZjIxaXhNSGV4T2RvXzcyMmtqZHJrM29sLXk0bWlLVktvRUdPTEZsa29yVlJqVnJPeDdVTXktM3dndVlPU29GM2d6WTdsak1DNmVFMVpEbGptcUFYZnNsa2gyVjJDUTJ3emIwUzR0bGZyYTNLT1Ewb1MtY3dpS0Z4WlRKbXB2bW1rQTh0VWfSAcsBQVVfeXFMTWhsbW9CRUJUSndzUGFaYWJsbWZYUElDVmRxYnJPQnZJTGxfdG5ianRpTURXdTltLU9VTGhDRko0eXd1RG1NQkZoTGI2b0N5YzFLSlpPZGtBSF9xQWk0VDk4S2FkVERsY0daZjZlOW5vSlZ3ellmU0FpMFRtZnRrUXZBVW9BdEpLX01kUjNKRjVuR3BPblFWTXdtT3FBSzdCaUk4WE5aQW9ITzdLVmdEUEhwVUNWelFyRjAxVndjVUF3UklCbnNwQ0RsQU0?oc=5"
status: published
---

LFM2.5-DSpark models introduce a game-changing approach to inference acceleration through speculative decoding, achieving up to 3.18x faster token generation without requiring model retraining or output modification. This technique uses lightweight draft models to predict upcoming tokens, which the main model then validates in parallel—a proven method for dramatically reducing latency in local deployments.

The fact that outputs remain unchanged is critical for production systems. Teams can drop in these models as direct replacements for existing inference pipelines, immediately unlocking substantial speed improvements without recalibration or quality concerns. This makes DFlash2's speculative decoding accessible to practitioners who lack the resources for custom optimization.

For local deployment scenarios—whether running on edge devices, embedded systems, or resource-constrained servers—this represents a meaningful path to inference latency parity with cloud APIs while maintaining full data control.

[Read the full article on Google News](https://news.google.com/rss/articles/CBMixgFBVV95cUxPaTZGR0xHWUhVSV9NT21WcHNDY00wZ2R4Q0NLM0YzTU53R0k1NWt4U0FDOEhZVDBoMlNqSUdWU3Q0ZjIxaXhNSGV4T2RvXzcyMmtqZHJrM29sLXk0bWlLVktvRUdPTEZsa29yVlJqVnJPeDdVTXktM3dndVlPU29GM2d6WTdsak1DNmVFMVpEbGptcUFYZnNsa2gyVjJDUTJ3emIwUzR0bGZyYTNLT1Ewb1MtY3dpS0Z4WlRKbXB2bW1rQTh0VWfSAcsBQVVfeXFMTWhsbW9CRUJUSndzUGFaYWJsbWZYUElDVmRxYnJPQnZJTGxfdG5ianRpTURXdTltLU9VTGhDRko0eXd1RG1NQkZoTGI2b0N5YzFLSlpPZGtBSF9xQWk0VDk4S2FkVERsY0daZjZlOW5vSlZ3ellmU0FpMFRtZnRrUXZBVW9BdEpLX01kUjNKRjVuR3BPblFWTXdtT3FBSzdCaUk4WE5aQW9ITzdLVmdEUEhwVUNWelFyRjAxVndjVUF3UklCbnNwQ0RsQU0?oc=5).

---
*Source: [Google News](https://news.google.com/rss/articles/CBMixgFBVV95cUxPaTZGR0xHWUhVSV9NT21WcHNDY00wZ2R4Q0NLM0YzTU53R0k1NWt4U0FDOEhZVDBoMlNqSUdWU3Q0ZjIxaXhNSGV4T2RvXzcyMmtqZHJrM29sLXk0bWlLVktvRUdPTEZsa29yVlJqVnJPeDdVTXktM3dndVlPU29GM2d6WTdsak1DNmVFMVpEbGptcUFYZnNsa2gyVjJDUTJ3emIwUzR0bGZyYTNLT1Ewb1MtY3dpS0Z4WlRKbXB2bW1rQTh0VWfSAcsBQVVfeXFMTWhsbW9CRUJUSndzUGFaYWJsbWZYUElDVmRxYnJPQnZJTGxfdG5ianRpTURXdTltLU9VTGhDRko0eXd1RG1NQkZoTGI2b0N5YzFLSlpPZGtBSF9xQWk0VDk4S2FkVERsY0daZjZlOW5vSlZ3ellmU0FpMFRtZnRrUXZBVW9BdEpLX01kUjNKRjVuR3BPblFWTXdtT3FBSzdCaUk4WE5aQW9ITzdLVmdEUEhwVUNWelFyRjAxVndjVUF3UklCbnNwQ0RsQU0?oc=5) · Relevance: 9/10*
