---
title: "code-on-incus: Isolated Machine Environments for AI Agents"
date: 2026-07-05
description: "A new tool that provisions isolated container environments with root access for each AI agent, enabling safer sandboxed execution of agent code on local infrastructure. This addresses a critical security concern for deploying autonomous AI systems locally."
tags:
  - agent-sandboxing
  - agent-security
  - agents
  - autonomous-agents
  - bullish
  - containerization
  - daily-digest
  - deployment
  - developer
  - intermediate
  - local-deployment
  - release
  - security
mentions:
  - name: Hacker News
    role: publisher
status: published
---

The [code-on-incus project](https://github.com/mensfeld/code-on-incus) introduces a practical solution for safely running AI agents locally by providing each agent with its own isolated Incus (LXD) container environment. This approach allows agents to execute code with root privileges within a sandboxed container, preventing lateral movement and protecting the host system from malicious or buggy agent behavior.

For local LLM deployments, especially those involving autonomous agents and code execution, this tool represents an important step toward production-ready self-hosted systems. It enables developers to run sophisticated multi-agent systems on-device without the security risks typically associated with giving LLMs direct access to system resources. The isolation layer is crucial for trustworthy local deployment.

This is particularly valuable for organizations building internal AI tools, RAG systems with code execution capabilities, or research environments where agent sandboxing is essential for safety and auditability.

---
*Source: [Hacker News](https://github.com/mensfeld/code-on-incus) · Relevance: 8/10*
