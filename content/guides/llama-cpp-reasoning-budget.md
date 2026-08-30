---
title: "Controlling Reasoning Token Budgets in llama.cpp"
date: 2026-08-30
updated: 2026-08-30
description: "Cap how many tokens a reasoning model spends thinking — with server flags, undocumented per-request fields, and a mid-stream interrupt. Includes what it costs you in throughput."
tags:
  - llama-cpp
  - reasoning
  - reasoning-budget
  - inference-optimization
  - token-management
status: published
category: deployment
difficulty: intermediate
timeEstimate: "20 min"
---

Reasoning models spend tokens thinking before they answer, and locally that time is yours to pay for. llama.cpp can cap it. Since March 2026 `--reasoning-budget` accepts a real token count instead of just on/off, and a good deal has been built on top of it since.

This guide covers what the budget actually does at sampling time, how to set it per request (the fields aren't in the server README), how to interrupt a runaway thought mid-stream, and what the cap costs you in throughput.

> [!warning] Check your build
> Numeric budgets landed in [PR #20297](https://github.com/ggml-org/llama.cpp/pull/20297) on 11 March 2026, and the behaviour has moved since — request/CLI precedence was inverted, `reasoning_budget_activate_immediately` was removed, and `--reasoning-effort` only arrived in August. Everything below is written against llama.cpp master as of 30 August 2026. Advice written in spring is not safe to copy.

## What the budget actually does

The most common assumption is that a budget truncates generation. It does not. `--reasoning-budget` installs a dedicated sampler (`common/reasoning-budget.cpp`) that runs a five-state machine over the token stream:

```
IDLE -> COUNTING -> WAITING_UTF8 -> FORCING -> DONE
```

- **IDLE** — passthrough, watching for the template's start-of-thinking sequence
- **COUNTING** — decrements the remaining budget per accepted token, while also watching for a *natural* end tag
- **WAITING_UTF8** — budget hit mid-codepoint, allows extra tokens to finish the UTF-8 sequence
- **FORCING** — sets every logit except the next forced token to `-INFINITY`, walking the sequence `reasoning_budget_message + end_tag` one token at a time
- **DONE** — passthrough forever

So when the budget runs out, llama.cpp *forces the model to emit its own end-of-thinking tag* and then hands control back. Five consequences worth internalising:

1. **Generation continues.** You still pay for the answer. The budget caps thinking, not the response.
2. **Output stays well-formed.** The reasoning block is properly closed, so `reasoning_content` parsing and downstream tooling don't break.
3. **A budget that isn't reached costs nothing.** If the model closes its own thinking first, the sampler jumps straight to DONE and the forced sequence is never used.
4. **Only generated tokens count.** Prompt tokens are excluded ([#22488](https://github.com/ggml-org/llama.cpp/pull/22488)), so the budget means the same thing on turn one and turn twenty.
5. **It re-arms.** If a new start tag appears after DONE, the sampler resets and counts again ([#22323](https://github.com/ggml-org/llama.cpp/pull/22323)).

## Step 1 — Set a budget on the server

```bash
llama-server -m qwen3-14b-q4_k_m.gguf --reasoning-budget 512
```

That's it. `--jinja` is no longer required — Jinja is on by default for `llama-server` and `llama-cli` (it's disabled only for `llama-completion` and multimodal). The reasoning tags still come from the chat template, so a model without a reasoning-aware template has nothing to budget.

The full flag set:

| Flag | Values | Default | Env var |
|---|---|---|---|
| `--reasoning-budget N` | `-1` unrestricted, `0` immediate end, `N>0` token budget | `-1` | `LLAMA_ARG_THINK_BUDGET` |
| `--reasoning-budget-message MSG` | string injected before the end tag | none | `LLAMA_ARG_THINK_BUDGET_MESSAGE` |
| `-rea, --reasoning [on\|off\|auto]` | sets the `enable_thinking` template kwarg | `auto` | `LLAMA_ARG_REASONING` |
| `--reasoning-format FORMAT` | `none`, `auto`, `deepseek`, `deepseek-legacy` | `auto` | `LLAMA_ARG_THINK` |
| `--reasoning-effort LEVEL` | `default`, or e.g. `minimal`/`low`/`medium`/`high`/`xhigh`/`max` | `default` | `LLAMA_ARG_REASONING_EFFORT` |

Anything below `-1` is rejected at parse time.

> [!tip] Turning thinking off entirely: use `-rea off`, not budget 0
> `-rea off` works at the template level — the model never opens a thinking block. `--reasoning-budget 0` lets the template open one and then immediately forces it shut, which still costs you the forced tokens and keeps the sampler in the chain. Setting `enable_thinking` through `--chat-template-kwargs` is now deprecated and logs a warning; use `-rea off`.

## Step 2 — Set a budget per request

These fields are parsed by the server (`tools/server/server-schema.cpp`) but are **not listed in the server README**, so they're easy to miss:

| Field | Type | Meaning |
|---|---|---|
| `reasoning_budget_tokens` | int, `-1`..`INT32_MAX` | the canonical per-request budget |
| `thinking_budget_tokens` | int | accepted alias, `/v1/chat/completions` only |
| `reasoning_budget_message` | string | overrides `--reasoning-budget-message` |
| `reasoning_control` | bool | arms the runtime interrupt (see Step 3) |
| `reasoning_budget_start_tag` | string | raw `/completion` use |
| `reasoning_budget_end_tags` | array of string (alias `reasoning_budget_end_tag`) | raw `/completion` use; first entry is the forced sequence |

A short budget for a request you know is simple:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is 17 * 23?"}],
    "reasoning_budget_tokens": 128
  }'
```

And an unrestricted one on the same server, for a request that deserves it:

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Prove that sqrt(2) is irrational."}],
    "reasoning_budget_tokens": 8192
  }'
```

> [!warning] Precedence was inverted — check which side wins on your build
> On current master the **request wins**, and a request value of `-1` falls back to the CLI value. In the original March commit it was the other way round: the CLI won unless the CLI was `-1`. If you're reading a discussion thread from spring 2026 that says the command line takes priority, that advice is stale.

On the OpenAI-compatible path the server only forwards these fields when the chat template exposes a detectable end-of-thinking tag. If your budget appears to do nothing, that's the first thing to check — the template, not the flag.

## Step 3 — Interrupt a thought already in flight

If a model is stuck in a loop, you don't have to kill the request. Send `reasoning_control: true` with the original streaming request, then use the completion `id` from the SSE stream:

```bash
curl http://localhost:8080/v1/chat/completions/control \
  -H "Content-Type: application/json" \
  -d '{"id": "chatcmpl-abc123", "action": "reasoning_end"}'
```

This forces the sampler into FORCING for that one request, so the model closes its reasoning block and moves to the final answer. The control request is processed in parallel with the SSE stream, so the client sends it while still reading tokens. A completion that has already finished matches nothing and the call is a no-op. `reasoning_end` is currently the only supported action.

This is the mechanism behind a "skip thinking" button in a chat UI.

## `reasoning_effort` is not a budget

These get conflated constantly, particularly around GPT-OSS. They are independent mechanisms:

| | `reasoning_budget_tokens` | `reasoning_effort` |
|---|---|---|
| What it is | a logit-masking sampler in llama.cpp | a string passed into the Jinja chat template |
| Unit | tokens | a label the *model* interprets |
| Enforced by | llama.cpp | the model, or not at all |
| Guaranteed cap | yes | no |

`reasoning_effort` writes a kwarg the template renders into the prompt; whether the model honours it is entirely up to the model. The one special case: `"reasoning_effort": "none"` on the OAI path disables thinking outright.

GPT-OSS gets both. It has real start/end tags, so the token-counting sampler works on it, *and* it responds to effort levels. Use effort to shape the reasoning and a budget to bound it.

## Where the thoughts end up

`--reasoning-format` controls parsing, not generation:

- `none` — thoughts stay unparsed inside `message.content`
- `deepseek` — thoughts go to `message.reasoning_content`, including streaming deltas
- `deepseek-legacy` — keeps `<think>` tags in `message.content` *and* populates `message.reasoning_content`
- `auto` — same as `deepseek`

If you're measuring how many tokens thinking actually costs you, `deepseek` is what you want, because it gives you the reasoning separately from the answer.

## Which models this works with

A handful of templates have hardcoded tag pairs in `common/chat.cpp` — GPT-OSS, Kimi K2/K3, Ministral 3, Qwen3-Coder, Gemma 4, Cohere2-MoE, MiniMax M3, LFM2, DeepSeek V3.2, MiniCPM5 among them. Everything else, including the mainline Qwen3 family and the DeepSeek-R1 distills, goes through an auto-parser that derives the start and end tags from the Jinja template.

So this isn't a per-model allowlist. If llama.cpp can detect a reasoning mode in your template, the budget applies.

## The cost of the cap

This is the part nobody mentions. An active reasoning-budget sampler **disables backend sampling**:

```
backend sampling is not compatible with reasoning budget, disabling
```

Backend sampling keeps logit processing on the GPU. Turning it off forces a full GPU→CPU logits transfer every single token. Reported impact spans roughly 5% on CUDA to around 30% on Vulkan — the Vulkan figure (98 t/s → 70 t/s) comes from [#21784](https://github.com/ggml-org/llama.cpp/issues/21784), a build where the sampler was being created *unconditionally*. [PR #21870](https://github.com/ggml-org/llama.cpp/pull/21870) fixed that, so you no longer pay it by accident, but you do still pay it whenever the sampler is genuinely active.

The same applies to `reasoning_control: true` and to lazy grammars. Budget your budgets: a cap that saves 300 thinking tokens but taxes every remaining token by 10% may not be a win. Measure both sides.

> [!note] Tool calling
> A lazy grammar is suppressed entirely while reasoning is active ([PR #20970](https://github.com/ggml-org/llama.cpp/pull/20970)), so the model can think freely without the tool-call grammar constraining it. When the budget sampler reaches DONE, the matched end sequence is replayed into the grammar sampler, so a grammar trigger embedded in the end tag still fires. Speculative decoding is handled correctly too — draft tokens are counted against the budget.

## Choosing a number

> [!warning] Be sceptical of the benchmark numbers circulating for this feature
> There are HumanEval-style comparisons of budgeted vs. unbudgeted reasoning making the rounds. Tracing them back leads to AI-generated aggregator sites citing a single Reddit thread, with no methodology and no primary benchmark. There is, as far as I can find, **no published measurement** of quality degradation against budget size for llama.cpp. Don't tune on those numbers. Measure your own.

A method that works:

1. Run your actual workload with `--reasoning-budget -1` and `--reasoning-format deepseek`.
2. Record the token length of `reasoning_content` for every response.
3. Take the p50 and p90 of that distribution. The p90 is your candidate budget — it caps the tail without touching most requests.
4. Re-run with the budget set and diff the answers, not the reasoning. The reasoning being cut short doesn't matter if the answer is unchanged.
5. Walk the budget down until answer quality moves, then step back one.

The distribution shape is the useful output here. Reasoning-token counts are usually heavily right-skewed — a long tail of requests where the model circles — and that tail is what a budget is genuinely good at removing. If your p50 and p90 are close together, a budget buys you very little and the throughput tax isn't worth it.

## Known rough edges

- **The budget message arrives too late to be useful** ([#20632](https://github.com/ggml-org/llama.cpp/issues/20632), open). `--reasoning-budget-message` is injected at exactly token N with zero tokens remaining, so the model cannot act on it. It's a cosmetic suffix on a truncation, not a graceful wind-down. Don't design around it.
- **Premature "natural end" reports** on some models ([#25067](https://github.com/ggml-org/llama.cpp/issues/25067), open). At least part of this is the built-in WebUI sending its own reasoning parameters and overriding your server flags — test with `curl` before believing the WebUI.
- **A softer mechanism is proposed but not merged** ([PR #25961](https://github.com/ggml-org/llama.cpp/pull/25961)), which would warn the model at a fraction of the budget. It isn't available; don't plan on it.
- **Old builds have two fixed bugs worth knowing about**: a `+inf` logit bias bug ([#22717](https://github.com/ggml-org/llama.cpp/issues/22717), fixed May 2026) and a shallow-copy clone bug ([PR #23095](https://github.com/ggml-org/llama.cpp/pull/23095), fixed May 2026). If budgets behave strangely, update before debugging.

## This is llama.cpp only

Neither major wrapper exposes it yet:

- **Ollama** — open feature request, [ollama/ollama#17561](https://github.com/ollama/ollama/issues/17561)
- **LM Studio** — open feature request, [lmstudio-ai/lmstudio-bug-tracker#1974](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/1974)

If you want token-level control over thinking today, you run `llama-server` directly.

## Next steps

- Read the original commit: [`acb7c79`](https://github.com/ggml-org/llama.cpp/commit/acb7c790698fa28a0fbfc0468804926815b94de3), and the sampler in [`common/reasoning-budget.cpp`](https://github.com/ggml-org/llama.cpp/blob/master/common/reasoning-budget.cpp)
- The news post this guide expands on: [[llama-cpp-reasoning-budget-support|Llama.cpp Adds True Reasoning Budget Support]]
- Server API reference: [`tools/server/README.md`](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)
