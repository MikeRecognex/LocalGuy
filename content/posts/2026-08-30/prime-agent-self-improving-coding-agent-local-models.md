---
title: "Prime Agent Hits 19K Stars With One Tool and No API Key Requirement"
date: 2026-08-30
description: "Prime Intellect's prime-agent gives its model exactly one tool — a persistent IPython kernel — and points at any OpenAI-compatible endpoint, including Ollama and vLLM. The 'self-improving' label means it rewrites its own notes file, not that it trains on your work."
tags:
  - agents
  - news
  - ollama
  - open-source
  - vllm
  - tooling
status: published
---

> [!tip] There is a full guide for running this on local models
> **[Running Prime Agent on a Local Model](/guides/prime-agent-local-models/)** — the `models.json` provider config for Ollama and vLLM, which `compat` flags matter for which backend, why auto-refine should be off before you trust it on a small model, and the telemetry and sandbox defaults worth changing. No Prime Intellect account required.

[PrimeIntellect-ai/prime-agent](https://github.com/PrimeIntellect-ai/prime-agent) has picked up 19,254 stars and 2,095 forks since its 8 May 2026 launch, on the back of Prime Intellect's $130M Series A. It is MIT-licensed TypeScript, and — unusually for a company-backed agent — it needs no account with the company that publishes it.

Two design choices make it worth a look if you run models locally.

**It has one tool.** Not `read_file`, `write_file`, `bash` and twelve others — one, called `ipython`. Every action the agent takes is Python executed in a persistent kernel. Even spawning a subagent is a function call inside that kernel rather than a tool schema entry. The pitch is that a smaller model has one interface to learn instead of a large tool menu to route between.

**Local models are first-class.** `~/.prime/agent/models.json` takes arbitrary providers with a `baseUrl`, so Ollama, vLLM and LM Studio drop straight in, with per-provider `compat` flags for endpoints that deviate from the OpenAI schema. The docs name Ollama, vLLM and LM Studio explicitly.

Two things are worth reading carefully before you commit to it.

The "self-improving" framing does not mean what it usually means. There is no training, no RL, no gradients — the mechanism is an LLM call that emits JSON edits to a `harness_state.json` file holding prompt additions, memories, skills and subagent definitions. It runs automatically every 25 assistant turns by default. That is a genuinely useful feature and also an ordinary one, and on local models it is where the rough edges are: [issue #1143](https://github.com/PrimeIntellect-ai/prime-agent/issues/1143) reports the refiner failing to return valid JSON against Ollama.

And the README is blunt that the agent's permission modes "are **not** a security sandbox." Actual sandboxing is an opt-in example extension you wire up yourself. An agent whose only tool is arbitrary Python execution deserves that warning taken at face value.

Also worth knowing: it is a rebrand of [`pi` by earendil-works](https://github.com/earendil-works/pi) — the package is still published as `@earendil-works/pi-coding-agent`, and the local-model support is inherited from upstream rather than built for this release.

**→ [Running Prime Agent on a Local Model](/guides/prime-agent-local-models/)** covers the `models.json` config for Ollama and vLLM, which `compat` flags matter for which backends, why you should turn auto-refine off on small models first, and the telemetry opt-out.

---
*Source: [PrimeIntellect-ai/prime-agent](https://github.com/PrimeIntellect-ai/prime-agent) · Relevance: 8/10*
