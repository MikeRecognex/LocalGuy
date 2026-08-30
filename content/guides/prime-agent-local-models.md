---
title: "Running Prime Agent on a Local Model"
date: 2026-08-30
updated: 2026-08-30
description: "Point prime-agent at Ollama or vLLM with no Prime Intellect account: the models.json schema, which compat flags matter for which backend, why to disable auto-refine on small models, and the sandbox and telemetry defaults you should change."
tags:
  - agents
  - ollama
  - vllm
  - tooling
  - open-source
  - production-deployment
status: published
category: deployment
difficulty: intermediate
timeEstimate: "30 min"
---

Most company-backed coding agents route through the company's API. [prime-agent](https://github.com/PrimeIntellect-ai/prime-agent) doesn't have to — it accepts arbitrary OpenAI-compatible providers from a config file, so an Ollama or vLLM endpoint is a first-class citizen rather than a workaround.

This guide covers getting it running against a local endpoint, and the four defaults that are wrong for that setup.

> [!warning] Verified 30 August 2026 against v0.8.1
> The project is on 0.x with five minor releases in three weeks and 100+ commits in the last 30 days. **Pin a version.** Behaviour and config keys described here can move under you.

## What you are actually installing

Three facts shape everything below.

**One tool.** The model is given a single tool, `ipython`, backed by a persistent IPython kernel. There is no `read_file`, no `write_file`, no `bash` tool schema. File edits, searches and shell calls are all Python the model writes. Subagents are a function call inside that kernel:

```python
handle = await rlm("Review the auth flow", name="auth-reviewer")
```

Note that `rlm()` returns **at admission, not with results**. The subagent reports back later via `await agent_message.send(msg, receiver_role="parent")`. If you write orchestration code expecting a return value to contain the answer, it won't.

**"Self-improving" means self-editing notes.** No training, no reinforcement learning, no weight updates. The mechanism — the "Continual Harness", in `packages/coding-agent/src/core/refinement/refinement.ts` — is an LLM call that emits JSON edits to a `harness_state.json` file. Four things can be edited (`RefinementKind`): `prompt`, `memory`, `skill`, `subagent`. The base system prompt is immutable; refinements are additive. History lands in `refinements.jsonl` so you can roll back.

**It is a rebrand of upstream `pi`.** The README's acknowledgements confirm it, and the package is still published as `@earendil-works/pi-coding-agent`, with `pi` still in the `bin` map. The local-model support you're about to use came from upstream, which is a point in its favour — it predates the rebrand and isn't a bolt-on.

## Install

```bash
curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh
```

macOS and Linux. Windows is second-class.

> [!note] Use Node 22.8.0 or newer, not what the installer checks
> `install.sh` gates on Node 20.6.0, but `package.json` declares `"engines": { "node": ">=22.8.0" }`. The installer will let you through on a Node version the package does not claim to support. Check with `node --version` first.

Config lives in `~/.prime/agent/`.

## Point it at a local endpoint

Create `~/.prime/agent/models.json`. For Ollama:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": false
      },
      "models": [
        { "id": "gpt-oss:20b", "reasoning": true }
      ]
    }
  }
}
```

Then:

```bash
prime-agent --model ollama/gpt-oss:20b
```

No Prime Intellect API key is involved at any point.

For vLLM, the same shape with the served port and whatever `--served-model-name` you launched with:

```json
{
  "providers": {
    "vllm": {
      "baseUrl": "http://localhost:8000/v1",
      "api": "openai-completions",
      "apiKey": "EMPTY",
      "models": [{ "id": "my-served-model-name" }]
    }
  }
}
```

`apiKey` is required by the schema even where the backend ignores it — any non-empty string works.

### The `compat` flags

These exist because "OpenAI-compatible" is a spectrum. Set them when your backend chokes on a request that works against OpenAI.

| Flag | Set it when |
|---|---|
| `supportsDeveloperRole` | Backend rejects the `developer` role — set `false` for most local servers |
| `supportsReasoningEffort` | Backend rejects `reasoning_effort` — set `false` unless you know it's handled |
| `supportsUsageInStreaming` | Streamed responses carry no usage block |
| `maxTokensField` | Backend wants `max_tokens` rather than `max_completion_tokens`, or vice versa |
| `requiresToolResultName` | Tool result messages must carry a `name` field |
| `requiresAssistantAfterToolResult` | Backend rejects a tool result as the final message |
| `requiresThinkingAsText` | Reasoning must be inlined as text, not a separate field |
| `thinkingFormat` | One of `reasoning_effort`, `deepseek`, `zai`, `qwen`, `qwen-chat-template` |
| `supportsStrictMode` | Structured-output strict mode is available |
| `cacheControlFormat` | Prompt-cache annotation dialect |

`api` accepts `openai-completions`, `openai-responses`, `anthropic-messages` or `google-generative-ai`. Per-model defaults are `contextWindow: 128000` and `maxTokens: 16384` — override both in the model entry if your served context differs, because a mismatch here surfaces as truncation rather than an error.

## Four defaults to change for local use

### 1. Turn auto-refine off until the rest works

Auto-refinement is **on by default** and fires every 25 assistant turns. From `src/core/settings-manager.ts`:

```ts
export interface AutoRefineSettings {
  enabled?: boolean;      // default: true
  turnInterval?: number;  // default: 25 assistant turns
  compact?: boolean;      // default: true
  cooldownMs?: number;    // default: 20 minutes
}
```

The refiner asks the model to emit a JSON object. Small local models are exactly the models that fail to do that reliably — [issue #1143](https://github.com/PrimeIntellect-ai/prime-agent/issues/1143) reports `/refine` failing with *"Refiner did not return a JSON object"* against Ollama. Worse, a refiner that half-succeeds writes bad guidance into `harness_state.json` that then degrades every subsequent turn.

Disable it in settings first, get a clean baseline, and re-enable deliberately. If you do enable it, `refinements.jsonl` is your rollback record — read it before trusting the state file.

### 2. Opt out of telemetry

Telemetry is **enabled by default**. Any of these turn it off:

```bash
export PRIME_AGENT_TELEMETRY=0   # or
export DO_NOT_TRACK=1            # or
prime-agent --offline
```

Or set `telemetry.enabled` to `false` in settings. If your reason for running locally is that the work shouldn't leave the machine, this is not an optional step.

### 3. Treat permission modes as not being a sandbox

The README says it directly: the permission modes are **"not a security sandbox."** For an agent whose only tool is arbitrary Python execution in a persistent kernel, that is a load-bearing warning.

Real sandboxing is an opt-in example extension at `packages/coding-agent/examples/extensions/sandbox/index.ts`, built on `@anthropic-ai/sandbox-runtime`. On Linux it needs `bubblewrap`, `socat` and `ripgrep` present. It is an example you wire up, not a flag you set.

### 4. Watch for the token clamp

`packages/ai/src/providers/simple-options.ts` carries a 32k clamp on `maxTokens`. [Issue #755](https://github.com/PrimeIntellect-ai/prime-agent/issues/755) about it is closed, but the literal is still present in `main` as of this writing and we have not confirmed whether the clamp is still applied on the path you'll hit. If you are serving a long-output configuration and see responses cut at 32k, check there first.

## Known rough edges on local models

- **Degenerate repetition loops.** [Issue #1029](https://github.com/PrimeIntellect-ai/prime-agent/issues/1029) documented a run repeating output 2,366 times; fixed in v0.8.1. Do not run an older tag.
- **Refiner JSON failures** — see above, [#1143](https://github.com/PrimeIntellect-ai/prime-agent/issues/1143).
- **74 open issues** at a 0.x version moving this fast. Search the tracker for your backend's name before assuming a failure is your config.

> [!info] What we could not verify
> The documentation names Ollama, vLLM and LM Studio but **never mentions llama.cpp's `llama-server`**. It exposes an OpenAI-compatible endpoint and there is no obvious reason it would fail, but we found no confirmation in docs, issues or tests — treat it as untested rather than supported. We also found no stated minimum Python version for the IPython kernel, and no credible data on the smallest model that drives this harness usefully. That last one is worth measuring yourself: the one-tool design is *supposed* to lower the bar for small models, and nobody appears to have published where the bar actually sits.

## Is the headline claim real?

The [accompanying paper](https://arxiv.org/abs/2608.23552) claims the approach "raises ARC-AGI-3 RHAE Best@1 from 30% to 95.5%." Commenters on [the Hacker News thread](https://news.ycombinator.com/item?id=49189075) dispute it, noting the result does not appear on the official leaderboard and raising concerns about the few-shot setup. We have not independently evaluated either position — but a claim in that range, absent from the leaderboard it references, is not one to plan a deployment around.

Judge the tool on the parts you can check yourself: it runs against your endpoint, it needs no account, and its only tool is a Python kernel. Those are all verifiable in an afternoon.

## Next steps

- Repo and README: [PrimeIntellect-ai/prime-agent](https://github.com/PrimeIntellect-ai/prime-agent)
- Provider config reference: `packages/coding-agent/docs/models.md` in the repo
- Upstream project this forks: [earendil-works/pi](https://github.com/earendil-works/pi)
- The news note that prompted this guide: [[prime-agent-self-improving-coding-agent-local-models|Prime Agent Hits 19K Stars With One Tool and No API Key Requirement]]
