---
title: "Diffusion Reads: Calibrated Probabilities in One Forward Pass, on One Card"
date: 2026-09-25
updated: 2026-09-25
description: "One denoise step of a 26B discrete diffusion model answers twenty-four independent yes/no questions, each with a probability rather than a word. The mechanism, the batching that took it from 13 to 28 questions/sec, and the arithmetic for 24GB — plus the flashinfer bug that blocks the obvious consumer card."
tags:
  - diffusion
  - vllm
  - structured-output
  - mixture-of-experts
  - vram-management
  - consumer-gpu
status: published
category: deployment
difficulty: advanced
timeEstimate: "30 min"
---

A claim worth testing: *one forward pass of a 26B model, twenty-four independent yes/no questions answered, each with a calibrated probability rather than a word.*

The instinct is that this is just batching with extra steps. It isn't. An autoregressive model answers twenty-four questions in twenty-four generations, and if you want a probability rather than a label you have to go fishing in the logprobs for the position where it happened to commit. A discrete diffusion model denoises a fixed-width canvas of token slots **in parallel**, so if you seed that canvas with the exact shape of the answer and leave only the answer tokens as noise, one denoise step gives you a distribution at every slot simultaneously. That is not a batching trick. It is a different operation, and it is the closest thing local inference has to a typed decision API.

This guide does the mechanism and the arithmetic. Everything about how it behaves comes from running it on an H100 across roughly 225,000 questions; everything about consumer cards is arithmetic from a measured 18.9 GB weight load and vendor specs, and is labelled as such, because **I have not run this on a 4090.**

> [!info] What you need
> vLLM with [PR #57250](https://github.com/vllm-project/vllm/pull/57250) (not merged), `RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic`, and a card with compute capability 8.9 or above. Read the Blackwell section before you buy anything.

## Reading a word is not the same as reading a probability

Ask a local model a yes/no question and the usual move is to generate one token and read its logprob. Three things go wrong, and they compound.

The chat template speaks first. DiffusionGemma's template emits `<|channel>`, `thought`, `<channel|>` before anything you asked for, so a one-token cap reads a control marker and never the verdict. In practice the answer sits around **position 4** and has to be scanned for:

```python
for step in logprobs["content"]:
    tok = (step.get("token") or "").strip().lower()
    if tok not in ("yes", "no"):
        continue          # channel markers, whitespace, the model clearing its throat
    ...                   # the distribution you actually want is here
```

Then there is what the distribution means. You are reading the model's uncertainty *conditioned on having already committed to whatever came before*, at whichever position the sampler stopped. And "Yes", " yes" and "YES" are three tokens for one answer, so any single-token probability is a fraction of the real mass unless you fold spellings yourself.

None of that is fatal — this project shipped a scorer that did exactly the above and it worked. But it is reading an answer sideways. Diffusion reads let you ask directly.

## The canvas is the interface

A discrete diffusion model starts from a fixed-width array of token ids and denoises it. Nothing forces those ids to be noise. Seed the canvas with the literal text of the answer you expect, punch holes where the answers go, and one denoise step tells you what the model would put in the holes.

Concretely, for three questions the canvas starts as:

```
q0: ▓
q1: ▓
q2: ▓
```

where `▓` is a uniformly random token id from the 262,144-token vocabulary and every other position is the exact template. The read returns a probability distribution at each `▓`. Four `vllm_xargs` do the whole job:

| Argument | What it does |
|---|---|
| `diffusion_seed_canvas` | the token ids to start from, noise at answer slots |
| `diffusion_canvas_length` | this request's canvas width |
| `diffusion_max_steps` | denoise steps — **1 is the read** |
| `diffusion_read_only` | return the distribution, don't commit tokens |
| `diffusion_pinned` | positions the model may not rewrite (needed above 1 step) |

The body around them is an ordinary chat completion:

```python
body = {
    "model": model,
    "messages": [{"role": "system", "content": schema_text},
                 {"role": "user",   "content": state_text}],
    "max_tokens": len(template) + 1,
    "logprobs": True,
    "top_logprobs": 20,
    "logprob_token_ids": label_token_ids,   # see below - this one matters
    "return_tokens_as_token_ids": True,
    "vllm_xargs": {
        "diffusion_seed_canvas":   canvas,
        "diffusion_canvas_length": width,
        "diffusion_max_steps":     1,
        "diffusion_read_only":     True,
    },
}
```

### Every label has to be exactly one token

This is the constraint the whole technique rests on, and it is worth understanding before you design a schema around it.

To find where a question is answered, tokenize the answer template with every question set to its first label, then re-tokenize with one question flipped to each of its other labels, and check that (a) the token count didn't change, (b) exactly one position differs, and (c) it's the same position for all of that question's labels. If the count changes, the label was multi-token; if the position moves, the labels don't share a slot. Either way there is no single distribution to read, so fail loudly rather than guess:

```python
if len(e) != len(base):
    raise SchemaError(f"label {label!r} is not a single token")
diffs = [i for i in range(len(e)) if e[i] != base[i]]
if len(diffs) != 1 or (pos is not None and diffs[0] != pos):
    raise SchemaError("labels do not share one template slot")
```

So pick label alphabets that tokenize to one token each and map richer options client-side. `yes`/`no` for booleans; `A`, `B`, `C` for multiple choice with the option text in the prompt; `1`–`9` for ordinal scores. Twenty-six options is the practical ceiling, and above nine ordinal levels you switch to letters because `10` is two tokens.

### Ask for the label ids explicitly

`top_logprobs: 20` is not enough on its own. With a long option list most labels never rank in the top 20, and the model's mass often sits on tokens that spell the *option name* rather than the label letter — so you renormalise over whatever happened to show up and call it a probability.

`logprob_token_ids` asks for exact logprobs for specific ids at every position, which gives you every label whether or not it ranked. vLLM caps the list at 128 ids per request; a real schema needs far fewer.

### Fold the labels into a probability

```python
floor = min(top.values()) - 5.0            # labels that missed the top-k
lp    = [top.get(i, floor) for i in label_ids]
mx    = max(lp)
ex    = [math.exp(x - mx) for x in lp]
probs = [e / sum(ex) for e in ex]
```

Read-only logprobs come back at temperature 1, so the label softmax is used directly with no rescaling. For a boolean, `probs[0]` is P(yes) and that is your answer.

Keep three diagnostics with it, because they are the difference between a number you can trust and one you can't:

- **`label_mass`** — total probability on legal labels. Low mass means the model wanted to say something that wasn't an allowed answer, and your tidy normalised probability is a renormalisation of a bad read.
- **`entropy`** over the whole returned top-k, not just the labels.
- **`argmax_is_label`** — was the single most likely token at that slot even a legal answer? `false` is a red flag on that specific question.

> [!warning] A low-mass read is not a low-probability answer
> These two look identical if you only keep the final number, and they mean opposite things. One is the model saying "no"; the other is the model refusing the question and your code laundering it into a confident "no".

### Above one step, pin everything

At `diffusion_max_steps: 1` there is nothing to protect. Past that, accept/renoise is free to rewrite any unpinned position — including your template — and your carefully resolved slot positions stop meaning what you resolved them to mean. So pin every position that isn't an answer slot:

```python
free = {s["pos"] for s in slots}
xargs["diffusion_pinned"] = [p for p in range(width) if p not in free]
```

For what it's worth, more steps never helped on my task. One step is the default and it is what every scored number below came from.

## Serving it

The PR isn't merged, so you build it — but `VLLM_USE_PRECOMPILED=1` skips the CUDA compile and installs in seconds:

```bash
git clone https://github.com/vllm-project/vllm && cd vllm
gh pr checkout 57250
VLLM_USE_PRECOMPILED=1 pip install -e .
```

The datacentre configuration, which is where all the measured numbers come from:

```bash
# H100 80GB. Compute capability major 9 - this matters, see below.
vllm serve RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic \
    --diffusion-config '{"canvas_length": 320}' \
    --max-logprobs 32 \
    --enable-prefix-caching \
    --max-model-len 32768 \
    --max-num-seqs 256 \
    --port 8000
```

Three notes on that command:

**`canvas_length` bounds the answer, not the state.** 320 rows holds 24 `q0: yes` lines with room to spare. Your document lives in the prompt, bounded by `--max-model-len`. This separation is the quietly useful part: the canvas stays tiny while the context carries as much material as you can afford.

**`--max-logprobs` must be at least your `top_logprobs`.** 32 covers 20.

**`--enable-prefix-caching` is not optional** if you are asking many questions against a shared state. The document prefix is computed once instead of once per read, and without it batched reads over one document are dramatically slower.

Budget **380 seconds** from launch to first answer. Poll for it; don't sleep and hope:

```bash
until [ "$(curl -s -o /dev/null -w %{http_code} http://127.0.0.1:8000/v1/models)" = 200 ]
do sleep 10; done
```

## Batch the questions or waste the GPU

This is the single most valuable thing in this guide, and it follows directly from the mechanism rather than from tuning.

My first full-scale run managed **13 questions/sec with the GPU at ~30%** and projected 2h11m. Three changes took it to **28 questions/sec at ~90%**, and the whole 49,536-question job finished in about thirty minutes.

**1. Put many questions in one canvas.** A read denoises the whole canvas in one forward pass, so every question in it is answered jointly for very nearly the cost of one. Asking one question per request pays full per-request and per-round-trip cost for a fraction of the compute. Twelve pairs — 24 boolean questions — per read is roughly 20× fewer reads.

**2. Use short question ids.** The template is one `id: label` row per question and must fit the canvas. My real keys looked like `X3|C1|conflict`, which is long enough that a dozen questions overflow the canvas; the server then packs rows into a tighter format, the label stops being a single token, and you get a **422**. Ids are yours to choose:

```python
short = {"q%d" % i: real_key for i, real_key in enumerate(questions)}
# ... send q0..qN, map back locally
```

**3. Give it real concurrency.** 192 client workers against `--max-num-seqs 256`. At 32 workers the GPU starves regardless of batching.

> [!danger] Never mix batch sizes inside a comparison
> One cell of an early run scored at 1 question per request while every other cell batched at 24, and I compared them as if they were the same configuration. Re-running in one configuration moved recall from 0.487 to **0.842**, and a headline finding about input phrasing — a 2.81× effect — collapsed to 1.13× and had to be withdrawn. Batch size changes the joint read, so it changes the answer.

The ceiling above ~12 questions per read is your context length, not the canvas: the state has to carry everything the batch refers to.

## What this needs on a consumer card

Here is the part that decides whether the technique is usable outside a rented datacentre. **The memory arithmetic works on 24 GB. Architecture support is the real risk, and it bites on exactly the card you'd reach for first.**

### The weights are smaller than the parameter count suggests

`RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic` loads **18.9 GB of weights** — measured, from the load log. 26B total parameters, 4B active: a mixture of experts, so every weight must be resident but only a fraction computes per token.

From that 18.9 GB:

| Card | VRAM | Weights fit | Headroom |
|---|---|---|---|
| RTX PRO 6000 | 96 GB | yes | vast |
| RTX 5090 | 32 GB | yes | ~12 GB, comfortable |
| RTX 4090 / 4090D | 24 GB | yes | ~4 GB, tight but workable |
| RTX 3090 / 3090 Ti | 24 GB | no — wrong architecture | — |
| RTX 4080 / 5080 | 16 GB | no | — |

That headroom column sets `--max-model-len` and `--max-num-seqs`, and this is where diffusion reads are unusually kind to a small card: **the canvas is tiny.** A 24-question template is a few hundred tokens. All the memory pressure is the state in your prompt, which is the one thing you control directly.

### The Blackwell trap, which cost me three pods

Two attempts died on Blackwell cards. I read the crash loop as out-of-memory and asked for a bigger card, which was wrong — a 96 GB card failed **identically** to a 32 GB one. The actual error:

```
flashinfer: No supported CUDA architectures found for major versions [12]
```

flashinfer hard-codes `supported_major_versions=[9, 10]`. Every Blackwell chip is major 12. **No amount of VRAM was ever going to fix it**, and the RTX 5090 — the obvious consumer choice on the memory arithmetic — is a Blackwell card.

The H100 works because it is major 9, and because an FP8 checkpoint sidesteps NVFP4 entirely. The successful log shows both escapes:

```
Using VLLM_CUTLASS Fp8 MoE backend
use_non_causal=True to exclude FlashInfer from auto-selection
```

That second line is the interesting one: for this model vLLM excludes flashinfer of its own accord, which suggests the dependency is avoidable rather than required. Three things to try on a 5090, in order, **none of which I have tested**:

1. **Force the backend** so the flashinfer path is never selected — `VLLM_ATTENTION_BACKEND=FLASH_ATTN`, or `TORCH_SDPA` as a slower fallback.
2. **Check for a newer wheel first.** The hard-coded list is a packaging limitation, not a hardware one, and there were open PRs against the SM120/SM121 exclusions when I looked. This may simply be fixed.
3. **Build flashinfer for sm_120** — `TORCH_CUDA_ARCH_LIST=12.0 pip install --no-build-isolation flashinfer-python` — if something genuinely needs it. Long compile.

> [!caution] Don't chase NVFP4 to save memory
> When I looked, NVIDIA's own forum thread on NVFP4 in vLLM had no working recipe and several open PRs still fixing SM120/SM121 exclusions. FP8 is the supported path and the checkpoint already exists.

### Ampere needs a different plan entirely

FP8 tensor cores arrive with Ada (sm_89). A 3090 is Ampere (sm_86) and can't execute this checkpoint natively. Its options, none of them good:

- **bf16** is roughly 52 GB of weights. Doesn't fit 24 GB.
- **A 4-bit quant** — none published for this model when I looked, and quantising a multimodal MoE yourself is a project, not a step.
- **Two 3090s, `--tensor-parallel-size 2`, bf16** — 48 GB against ~52 GB. Marginal at best.

Practical conclusion: **Ada or newer.** A used 4090 is the cheapest card with a plausible path, and a 5090 is the cheapest with comfortable headroom *if* the flashinfer question resolves.

### A 24 GB serve command

This is the datacentre recipe adapted by the arithmetic above. I have not run it.

```bash
# RTX 4090, 24GB. Weights 18.9GB leaves ~4GB, so everything is trimmed.
VLLM_ATTENTION_BACKEND=FLASH_ATTN \
vllm serve RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic \
    --diffusion-config '{"canvas_length": 96}' \
    --max-logprobs 32 \
    --enable-prefix-caching \
    --max-model-len 8192 \
    --max-num-seqs 16 \
    --gpu-memory-utilization 0.95 \
    --port 8000
```

What changed from the 80 GB command, and why:

| Flag | H100 | 24 GB | Reason |
|---|---|---|---|
| `canvas_length` | 320 | 96 | still holds ~6 questions' answers; cheap but not free |
| `--max-model-len` | 32768 | 8192 | KV cache is what won't fit |
| `--max-num-seqs` | 256 | 16 | each concurrent sequence needs KV |
| `--gpu-memory-utilization` | default | 0.95 | raise until it OOMs, then back off |
| questions per read | 24 | 8–12 | must fit both a 96-row canvas and 8192 context |
| client workers | 192 | 16 | no point exceeding `max-num-seqs` |

### What to expect for speed

Measured on one H100, 192 workers, 24 questions per read:

| Questions | Wall clock | Rate |
|---|---|---|
| 1,653 | 59 s | 28 q/s |
| 3,828 | 143 s | 27 q/s |
| 6,903 | 247 s | 28 q/s |

For a 4090, reason about it rather than trusting a single ratio. A diffusion read with a long state and a short canvas is **prefill-dominated**, so it tracks compute more than memory bandwidth, and consumer cards are closer to datacentre parts on compute than their price suggests. Against that you are running an eighth of the concurrency, which is the bigger term. My rough expectation is **5–12 q/s**, putting that 6,903-question job somewhere around **10 to 25 minutes** instead of four.

That is the honest shape of it: a consumer card turns this from interactive into overnight-capable, at a fraction of the hardware cost. Nobody has measured it. If you do, the number belongs in the comments.

## Known rough edges

- **Sampling parameters are rejected outright.** `temperature`, `seed`, `min_p`, `logit_bias` and `allowed_token_ids` all return a **400**. They don't apply to a read-only denoise. Use `diffusion_seed_canvas` for reproducibility instead of `seed`.
- **Multi-token labels fail late.** Either a schema error at template resolution, or a 422 if row-packing pushes a label over the line. Keep ids and labels short and you never meet this.
- **The thought channel never closes.** There is a `think` parameter that lets the model write N tokens before the read conditions on it. Two problems: the noise draws of one decision **share a single thought**, so a large batch makes one thought cover every question in it; and the diagnostics show the model never emits its close tag, so the thought is always truncated rather than finished. Tested properly, thinking made my results *worse* — AUC 0.999 down to 0.869. If you use it, keep batches small and check `diagnostics.thought.closed`.
- **Cloudflare 1010 if you're behind a proxy.** RunPod's proxy 403s urllib's default User-Agent with `error code: 1010`. curl works; Python doesn't, until it identifies itself: `headers={"User-Agent": "your-tool/1.0"}`.
- **Verify with a POST, not a GET.** A bare `GET /` can answer before the tokenizer has finished loading.

## The verdict on the original claim

| Claim | Holds? |
|---|---|
| 24 typed answers in one forward pass | **Yes.** One denoise step, one distribution per slot, ~28 q/s on an H100. |
| A calibrated probability, not a word | **Ranks superbly, grades poorly.** AUC 0.984 across 76 known positives; the ordering is excellent, the absolute number isn't well calibrated to any fixed band. |
| Reliable enough to threshold | **No.** One genuine positive scored `0.000` — confidently wrong, not uncertain — on a double negative it otherwise handled 11 times in 12. Check `label_mass`. |
| Runs on a consumer card | **Arithmetic says yes on 24 GB, unproven.** And the obvious 32 GB card is blocked by a packaging bug, not a hardware limit. |

Use it to order a list. Be careful treating the number as a measurement.

## Next steps

- [vLLM PR #57250](https://github.com/vllm-project/vllm/pull/57250) — the diffusion reads implementation, including the reference structured server
- The release this model came out of: [DiffusionGemma: The Developer Guide for Local Deployment](/posts/diffusiongemma-developer-guide-local-deployment/)
- [What Actually Fits on Dual RTX 3090s](/guides/qwen-27b-dual-3090-context-math/) — the KV cache arithmetic this guide waves at
- [MoE Expert Offload](/guides/moe-expert-offload-arithmetic/) — why 26B parameters only cost you 18.9 GB
- [How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/) — for sizing `--max-model-len` properly rather than by trial
