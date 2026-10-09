---
title: "Saluki 27B: 2-bit Quantised Qwen Model Outperforms Original at Tool Calling"
date: 2026-10-09
description: "A new 2-bit quantised variant of Qwen3.8-27B demonstrates superior tool calling capabilities compared to the original model, showing that aggressive quantisation can preserve or improve specific task performance."
tags:
  - daily-digest
  - quantisation
  - gguf
  - open-source
  - benchmark
status: draft
---

The Saluki 27B model represents a significant advancement in quantisation techniques for local LLM deployment. By reducing the Qwen3.8-27B model to 2-bit precision, researchers achieved a substantial reduction in memory footprint and inference latency while maintaining competitive performance on standard benchmarks. Most notably, the quantised variant actually outperforms the original model at tool calling—a critical capability for agentic workloads and real-world applications.

This breakthrough challenges the conventional wisdom that aggressive quantisation necessarily degrades model capabilities. For practitioners running inference on resource-constrained hardware, this demonstrates that with careful optimisation, 2-bit quantised models can be production-ready for specific use cases. The results suggest that quantisation-aware training or post-training optimisation can align model weights more effectively for particular downstream tasks, opening new possibilities for deploying capable models on edge devices.

[Read the full article on Google News](https://news.google.com/rss/articles/CBMiyAFBVV95cUxOMkx3T2h5QkFxbDRfeDlNeWhyaVgwbktQcU5sZFhJQ3FpM1c0dHdpYXIyakhGZ1YxSzF1NTdyd09JdWRxV2hUM0NhLThra1BKSkpEOUJxZVk2UmVKRzVCUl9uX2tyV1NUMTJiOTBaZ3VXUjRPQ3RQVGxrTjhpY0x1blpTUE94V0l5Q1pqNlc0Ym9XVVVHQ25OWWVoM3ZxYmJWVFNseldqS0VTZkVZV2VkRVg3WDFRTWNtYjRUaU5EOG1JbjU5VUVYbdIByAFBVV95cUxOMkx3T2h5QkFxbDRfeDlNeWhyaVgwbktQcU5sZFhJQ3FpM1c0dHdpYXIyakhGZ1YxSzF1NTdyd09JdWRxV2hUM0NhLThra1BKSkpEOUJxZVk2UmVKRzVCUl9uX2tyV1NUMTJiOTBaZ3VXUjRPQ3RQVGxrTjhpY0x1blpTUE94V0l5Q1pqNlc0Ym9XVVVHQ25OWWVoM3ZxYmJWVFNseldqS0VTZkVZV2VkRVg3WDFRTWNtYjRUaU5EOG1JbjU5VUVYbQ?oc=5).

---
*Source: [Google News](https://news.google.com/rss/articles/CBMiyAFBVV95cUxOMkx3T2h5QkFxbDRfeDlNeWhyaVgwbktQcU5sZFhJQ3FpM1c0dHdpYXIyakhGZ1YxSzF1NTdyd09JdWRxV2hUM0NhLThra1BKSkpEOUJxZVk2UmVKRzVCUl9uX2tyV1NUMTJiOTBaZ3VXUjRPQ3RQVGxrTjhpY0x1blpTUE94V0l5Q1pqNlc0Ym9XVVVHQ25OWWVoM3ZxYmJWVFNseldqS0VTZkVZV2VkRVg3WDFRTWNtYjRUaU5EOG1JbjU5VUVYbdIByAFBVV95cUxOMkx3T2h5QkFxbDRfeDlNeWhyaVgwbktQcU5sZFhJQ3FpM1c0dHdpYXIyakhGZ1YxSzF1NTdyd09JdWRxV2hUM0NhLThra1BKSkpEOUJxZVk2UmVKRzVCUl9uX2tyV1NUMTJiOTBaZ3VXUjRPQ3RQVGxrTjhpY0x1blpTUE94V0l5Q1pqNlc0Ym9XVVVHQ25OWWVoM3ZxYmJWVFNseldqS0VTZkVZV2VkRVg3WDFRTWNtYjRUaU5EOG1JbjU5VUVYbQ?oc=5) · Relevance: 9/10*
