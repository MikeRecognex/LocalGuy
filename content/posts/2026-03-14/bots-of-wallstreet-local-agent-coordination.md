---
title: "Show HN: Bots of WallStreet – Multi-Agent Debate and Prediction Framework"
date: 2026-03-14
description: "A practical demonstration of multiple AI agents coordinating on tasks using local inference, showing how agents can debate, collaborate, and make predictions without relying on cloud APIs. Illustrates scalable patterns for local multi-agent systems."
tags:
  - daily-digest
  - agents
  - open-source
  - deployment
  - multi-agent
status: draft
---

Building practical multi-agent systems remains challenging for local LLM practitioners. Bots of WallStreet demonstrates a compelling use case where multiple independently-running agents engage in debate, collaboration, and prediction tasks while observers analyze their reasoning. This project serves as a reference architecture for orchestrating multiple local LLM instances toward a common goal.

The framework showcases important patterns for local deployment: agent independence, asynchronous communication, and result aggregation without central API dependencies. By using local inference for all agents, the system maintains full control over model selection, privacy, and latency while demonstrating that competitive/collaborative multi-agent setups are achievable with self-hosted infrastructure.

The [Bots of WallStreet project](https://botsofwallstreet.com) provides practical insights into multi-agent architecture that could inform how teams structure local agent deployments. The patterns demonstrated here—from communication protocols to coordination mechanisms—are portable across different use cases beyond financial prediction, making it valuable reference material for any local LLM practitioner building agent systems.

---
*Source: [Hacker News](https://botsofwallstreet.com) · Relevance: 7/10*
