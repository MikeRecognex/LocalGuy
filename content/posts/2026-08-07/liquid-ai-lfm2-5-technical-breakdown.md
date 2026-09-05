---
title: "LFM2.5-2.6B: On-Device Agentic Model With 128K Context and Tool Calling"
date: 2026-08-07
description: "Detailed technical analysis of Liquid AI's LFM2.5-2.6B with open weights, demonstrating how 128K context and tool-calling capabilities are achievable in a 2.6B parameter model optimized for local inference."
tags:
  - agentic-reasoning
  - agents
  - analysis
  - consumer-gpu
  - context-window
  - daily-digest
  - edge-device
  - lfm2-5-2-6b
  - liquid-ai
  - llama-cpp
  - long-context
  - memory-optimization
  - model-compression
  - ollama
  - open-source
  - tool-calling
mentions:
  - name: Liquid AI
    role: developer
source:
  name: "Google News"
  url: "https://news.google.com/rss/articles/CBMilAFBVV95cUxNUFhtRTlrd0FWclVzWTZXb3BHaXhjal9vT3NTZ3pSQW51emRNZG9mTGpuNlpUcUpxQjBPRnRjV2FtY0p6N3FaWVNSUlFHdDRqamplVDU4QTFpRmJKWjJUZHFJY3JiTl9vckVOT0VwQ1BWSm1JZmFPVHBCNk9mc044dWpFdklfdzZwbzQzQm5yN3JUM2tJ0gGUAUFVX3lxTE1QWG1FOWt3QVZyVXNZNldvcEdpeGNqX29Pc1NnelJBbnV6ZE1kb2ZMam42WlRxSnFCME9GdGNXYW1jSno3cVpZU1JSUUd0NGpqamVUNThBMWlGYkpaMlRkcUljcmJOX29yRU5PRXBDUFZKbUlmYU9UcEI2T2ZzTjh1akV2SV93NnBvNDNCbnI3clQza0k?oc=5"
status: published
---

LFM2.5-2.6B represents a technical milestone in bridging the capability gap between resource-constrained devices and frontier models. The model achieves agentic reasoning—multi-step planning, tool invocation, and state tracking—within a 2.6B parameter footprint, a feat made possible through careful architecture design and training methodology tailored for inference efficiency.

The 128K context window is particularly significant for local deployment, allowing practitioners to work with substantial documents, code repositories, and conversation histories without remote API calls. Open weights ensure full transparency and enable fine-tuning for domain-specific tasks, critical for organizations building proprietary local AI stacks.

For the local LLM community, this model serves as a reference point for what's achievable with modern quantization, pruning, and knowledge distillation techniques. Teams deploying Ollama, llama.cpp, or vLLM can now run sophisticated agentic applications at the edge with acceptable latency and memory profiles, making complex multi-step workflows feasible on consumer-grade hardware.

[Read the full article on Google News](https://news.google.com/rss/articles/CBMilAFBVV95cUxNUFhtRTlrd0FWclVzWTZXb3BHaXhjal9vT3NTZ3pSQW51emRNZG9mTGpuNlpUcUpxQjBPRnRjV2FtY0p6N3FaWVNSUlFHdDRqamplVDU4QTFpRmJKWjJUZHFJY3JiTl9vckVOT0VwQ1BWSm1JZmFPVHBCNk9mc044dWpFdklfdzZwbzQzQm5yN3JUM2tJ0gGUAUFVX3lxTE1QWG1FOWt3QVZyVXNZNldvcEdpeGNqX29Pc1NnelJBbnV6ZE1kb2ZMam42WlRxSnFCME9GdGNXYW1jSno3cVpZU1JSUUd0NGpqamVUNThBMWlGYkpaMlRkcUljcmJOX29yRU5PRXBDUFZKbUlmYU9UcEI2T2ZzTjh1akV2SV93NnBvNDNCbnI3clQza0k?oc=5).

---
*Source: [Google News](https://news.google.com/rss/articles/CBMilAFBVV95cUxNUFhtRTlrd0FWclVzWTZXb3BHaXhjal9vT3NTZ3pSQW51emRNZG9mTGpuNlpUcUpxQjBPRnRjV2FtY0p6N3FaWVNSUlFHdDRqamplVDU4QTFpRmJKWjJUZHFJY3JiTl9vckVOT0VwQ1BWSm1JZmFPVHBCNk9mc044dWpFdklfdzZwbzQzQm5yN3JUM2tJ0gGUAUFVX3lxTE1QWG1FOWt3QVZyVXNZNldvcEdpeGNqX29Pc1NnelJBbnV6ZE1kb2ZMam42WlRxSnFCME9GdGNXYW1jSno3cVpZU1JSUUd0NGpqamVUNThBMWlGYkpaMlRkcUljcmJOX29yRU5PRXBDUFZKbUlmYU9UcEI2T2ZzTjh1akV2SV93NnBvNDNCbnI3clQza0k?oc=5) · Relevance: 10/10*
