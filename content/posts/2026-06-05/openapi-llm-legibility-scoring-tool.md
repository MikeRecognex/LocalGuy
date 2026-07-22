---
title: "Show HN: CLI for Scoring OpenAPI for LLM Legibility"
date: 2026-06-05
description: "A new CLI tool evaluates OpenAPI specifications for their compatibility and usability with LLMs, enabling developers to optimize API designs for tool use, function calling, and local agent deployment."
tags:
  - agent-orchestration
  - agents
  - api-design
  - bullish
  - daily-digest
  - developer
  - function-calling
  - hacker-news
  - intermediate
  - mcp
  - open-source
  - showcase
  - tools
mentions:
  - name: Hacker News
    role: publisher
status: published
---

The jentic-api-scorecard provides an automated scoring system for evaluating how well OpenAPI specifications work with language models. This tool addresses a real pain point: APIs designed for humans often translate poorly to LLM function calling and tool use, resulting in confused agents and failed inference.

For developers building local LLM agents that need to interact with external APIs, this scoring mechanism helps identify schema problems before deployment. Issues like unclear parameter descriptions, missing examples, or poor naming conventions can cause LLMs to misuse APIs—a particularly frustrating problem when running agents locally where you can't rely on API rate limiting or fallback mechanisms. Better API design for LLM legibility means more reliable agentic behavior.

This fits into the broader ecosystem of tools helping teams deploy production agentic systems on-device. Whether you're using llama.cpp with tool calling, Ollama with function definitions, or building custom inference with local models, ensuring your API contracts are LLM-friendly is essential for reliability. [Check out the tool on GitHub](https://github.com/jentic/jentic-api-scorecard) to start optimizing your API surfaces for local agent deployment.

---
*Source: [Hacker News](https://github.com/jentic/jentic-api-scorecard) · Relevance: 7/10*
