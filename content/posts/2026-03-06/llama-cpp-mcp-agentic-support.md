---
title: llama.cpp Merges Agentic Loop and MCP Client Support
date: 2026-03-06
description: A major pull request adding Model Context Protocol (MCP) client support with agentic loops and tool/resource/prompt capabilities has been merged into llama.cpp. This enables building AI agents with local models that can interact with external tools and systems.
tags:
  - advanced
  - agentic-loops
  - agents
  - api-independence
  - data-management
  - llama-cpp
  - local-agents
  - local-ai-agents
  - mcp
  - model-context-protocol
  - news
  - open-source
  - release
  - task-automation
  - tool-integration
mentions:
  - name: r/LocalLLaMA
    role: publisher
status: published
---

llama.cpp has merged significant new functionality supporting the Model Context Protocol (MCP), enabling local models to function as full autonomous agents. The implementation includes support for tools, resources, and prompts through MCP standards, with a new webui-mcp-proxy mode accessible via `llama-server --webui-mcp-proxy`.

This advancement is game-changing for local LLM deployment because it removes a key limitation: previously, self-hosted models could chat but struggled with complex task automation. MCP support allows locally-running LLMs to integrate with external systems, APIs, and tools without sending data to cloud services. Developers can now build genuinely autonomous local agents with full control over data flow and no dependency on commercial APIs.

[Read the full article on r/LocalLLaMA](https://github.com/ggml-org/llama.cpp/pull/18655).

---
*Source: [r/LocalLLaMA](https://github.com/ggml-org/llama.cpp/pull/18655) · Relevance: 9/10*
