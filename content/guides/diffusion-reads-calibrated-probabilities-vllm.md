---
title: "Diffusion Reads: 24 Answers in One Forward Pass, and Why I Stopped Batching Them"
date: 2026-09-25
updated: 2026-09-25
description: "A discrete diffusion model answers a whole canvas of questions in one denoise step. Batching 24 questions into that canvas ran 8.5x faster and halved the scores. The pod spec, both servers, and the run that produced AUC 0.984 on 49,536 questions for about $12."
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

An autoregressive model answers twenty-four yes/no questions in twenty-four generations, and if you want a probability rather than a word you go fishing in the logprobs for wherever it happened to commit. A discrete diffusion model denoises a fixed-width canvas of token slots **in parallel**. Seed that canvas with the exact shape of the answer, leave only the answer tokens as noise, and one denoise step returns a distribution at every slot at once.

That is not batching with extra steps. It is a different operation, and it is the closest thing local inference has to a typed decision API.

This guide is a field report from building it and running 49,536 questions through it on a rented H100. It is organised as the sequence I would follow to do it again: rent the card, build the engine, start two servers, verify, read, then scale. The interesting result is in the scaling step, and it is not the one I expected.

> [!note] What is measured here, and what is not
> Every command below was executed, and every number is traced to a raw result file, a container log line or a pod object. Where the record does not support a claim I say so in place rather than estimating. **Nothing here was run on a consumer card** — see *What this costs in VRAM*, which concludes that no consumer card is currently proven to run it.

## What you need

| | |
|---|---|
| Engine | vLLM with [PR #57250](https://github.com/vllm-project/vllm/pull/57250), unmerged |
| Model | `RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic`, 27.2 GB |
| GPU | Compute capability **9 or 10**. In practice an H100 — read Step 1 before you rent anything |
| Client machine | Runs the sidecar locally. A laptop is fine |
| Budget | About **$3.49/hr**, and the whole exercise below came to roughly $12 |

## Step 1 — Rent a card that is not Blackwell

This step exists because getting it wrong cost three pods and most of an afternoon.

The obvious read of the memory requirement — 27.2 GB of weights, so rent something with 32 GB or more — puts you straight onto Blackwell silicon, and **every Blackwell chip is compute capability major 12**. flashinfer hard-codes its supported majors:

```
(EngineCore pid=1552)   File ".../flashinfer/jit/fused_moe.py", line 74, in gen_cutlass_fused_moe_sm120_module
(EngineCore pid=1552)   File ".../flashinfer/compilation_context.py", line 124, in get_nvcc_flags_list
(EngineCore pid=1552) RuntimeError: No supported CUDA architectures found for major versions [12].
```

I read the first crash loop as out-of-memory and escalated to a bigger card. A 96 GB RTX PRO 6000 failed **identically** to a 32 GB RTX 5090. No amount of VRAM was ever going to fix a hard-coded list.

> [!warning] A crash loop that restarts faster than you can read it is not a diagnosis
> The first 5090 pod re-ran `pip install` on every restart cycle, which flooded the log stream and buried the traceback. I spent two pods theorising about memory because I never actually saw the error. The fix was to make the container hold itself open after the failure — a trailing `sleep` in the command — so the last 200 lines survive long enough to read.

An H100 is major 9, explicitly supported, and an FP8 checkpoint avoids NVFP4 entirely. The pod that produced every number below:

```json
{
  "name": "diffgemma-clean",
  "gpu": {"id": "NVIDIA H100 80GB HBM3", "count": 1, "minCudaVersion": "12.8"},
  "cloud": "SECURE",
  "dataCenterIds": ["US-NE-1", "EUR-NO-1", "AP-IN-1"],
  "image": "runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404",
  "disk": 120,
  "ports": ["8000/http"],
  "env": {
    "HF_HOME": "/workspace/hf",
    "VLLM_USE_PRECOMPILED": "1",
    "DIFFCFG": "{\"canvas_length\": 320}",
    "MODEL": "RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic"
  }
}
```

Four details in there are load-bearing:

**Pin the data centres.** One pod in `EUR-IS-3` could not resolve `github.com` at all, which looks exactly like a broken container command and is not. Naming three regions and wrapping the clone in a retry turned an unexplainable failure into a non-event.

**One HTTP port, not two.** `8000/http` is all you need, because the second server runs on your own machine — Step 4 explains why you have no choice about that.

**Budget 120 GB of disk.** The container clones vLLM, builds it, and downloads 27.2 GB of weights.

**Expect the catalogue price to be wrong.** RunPod's capacity listing quoted $2.69/hr for an H100 80GB HBM3; the pod object came back at **$3.49/hr**. The same gap showed on both Blackwell cards ($0.69 → $0.99 on the 5090, $1.69 → $2.09 on the RTX PRO 6000). Price your run off the pod, not the catalogue.

There is no template and no network volume here. Nothing is reused between pods, so every cold start rebuilds — which makes Step 2 part of your startup time rather than a one-off.

## Step 2 — Build vLLM inside the pod

The PR isn't merged, so it gets built from source. The saving grace is `VLLM_USE_PRECOMPILED=1`, which skips the CUDA compile entirely and installs in seconds rather than the better part of an hour.

This is the container command, as run:

```bash
bash -lc 'set -x
export HF_HOME=/workspace/hf VLLM_USE_PRECOMPILED=1
cd /workspace
[ -d vllm/.git ] || git clone --filter=blob:none https://github.com/vllm-project/vllm.git vllm
cd /workspace/vllm || { echo FATAL_NO_REPO; sleep 120; exit 1; }
git rev-parse --verify pr >/dev/null 2>&1 || git fetch origin pull/57250/head:pr
git checkout pr
[ -f /workspace/.installed ] && echo INSTALL_CACHED || {
  pip install -e . > /workspace/pip.log 2>&1 && touch /workspace/.installed || {
    echo FATAL_PIP; tail -20 /workspace/pip.log; sleep 120; exit 1; }; }
echo STEP_VLLM
vllm serve "$MODEL" --host 0.0.0.0 --port 8000 \
    --diffusion-config "$DIFFCFG" --max-logprobs 32 --max-model-len 8192 \
    --enable-prefix-caching --max-num-seqs 256 --gpu-memory-utilization 0.90 2>&1 | tail -200
echo VLLM_EXITED
sleep 300'
```

Note `git fetch origin pull/57250/head:pr && git checkout pr` rather than `gh pr checkout` — there is no `gh` in the image.

> [!danger] `--filter=blob:none` will silently cost you the PR's new files
> A partial clone fetches blobs lazily, and combined with a PR ref that means **files the PR adds may never materialise on disk**. This is what killed three separate attempts to run the sidecar on the pod: the file was simply absent, and the one time I worked around it with `git show pr:<path> > ss.py` the redirect produced an empty file and the server exited in 43 ms with status 0. If you intend to use anything from the PR beyond the installed package, clone without the filter.

The `sleep 300` and the `FATAL_*` markers are not decoration. A container that exits immediately on failure takes its logs with it.

## Step 3 — Start vLLM

The serve command is inside the container command above; pulled out, it is:

```bash
vllm serve RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic \
    --host 0.0.0.0 --port 8000 \
    --diffusion-config '{"canvas_length": 320}' \
    --max-logprobs 32 \
    --max-model-len 8192 \
    --enable-prefix-caching \
    --max-num-seqs 256 \
    --gpu-memory-utilization 0.90
```

**`canvas_length` bounds the answer, not the state.** 320 slots holds a couple of dozen `q0: yes` rows with room to spare. Your document rides in the prompt, bounded by `--max-model-len`. This separation is the quietly useful part of the whole architecture: the canvas stays tiny while the context carries as much material as you can afford.

**`--max-model-len 8192` is the real value**, not a placeholder. With 80 GB and `--gpu-memory-utilization 0.90` there was headroom for far more, but the workload here is one clause pair per request.

**`--max-logprobs` must be at least the `top_logprobs` you ask for.** 32 covers 20.

**`--enable-prefix-caching` is not optional** when many questions share a state. The shared prefix is computed once instead of once per read.

## Step 4 — Run the sidecar on your own machine

Here is the piece that makes the technique usable, and the piece I would have most wanted spelled out.

Raw vLLM will denoise a canvas you hand it, but it will not build the canvas, work out which slot each question is answered at, seed the noise, pin the template, fold the label logprobs into a probability, or average over noise draws. The PR ships a reference server that does all of it: `examples/features/diffusion_reads/structured_server.py`.

It exposes a decision API:

| route | what it does |
|---|---|
| `POST /v1/systemone` | the decision endpoint — `{model, state, questions}`, where each question is `{type, instructions, criteria}` with `type` one of `noul` / `choice` / `score` |
| `POST /v1/chat/completions` | the same thing, OpenAI-shaped, schema as a system message |
| `POST /v1/raw/chat/completions` | pass-through to vLLM |
| `GET /health` | health |

A `noul` (boolean) question returns `{"noul": p}`, plus `stderr` and `agreement` across noise draws. Draws default to `"auto"`, up to 4, stopping early once they agree within 0.1.

**It runs locally, pointed at the pod over the proxy:**

```bash
python tools/structured_server.py \
  --upstream https://<podId>-8000.proxy.runpod.net \
  --model     RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic \
  --tokenizer RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic \
  --canvas 320 --host 127.0.0.1 --port 8011
```

> [!warning] The sidecar on the pod was tried three times and abandoned
> RunPod's second HTTP port would not route to it. Combined with the partial-clone problem in Step 2, the co-located arrangement never worked, and running the sidecar locally is the arrangement every measured number below came from. It costs you a round trip per read over the public internet — budget for that, because it is a real part of the latency.

`--canvas` here must match the server's `canvas_length`. Request widths round up to a multiple of `--canvas-step` (default 16).

### The one constraint you cannot design around

**Every label must be exactly one token.** The sidecar finds where a question is answered by tokenizing the template with each label in turn and checking that the token count is unchanged and exactly one position differs. If a label is multi-token, or two labels for the same question land on different slots, there is no single distribution to read and it fails loudly rather than guessing.

So choose label alphabets accordingly, and map richer options client-side:

- `yes` / `no` for booleans
- `A`, `B`, `C` for multiple choice, with the option text in the prompt
- `1`–`9` for ordinal scores — above nine you switch to letters, because `10` is two tokens

Twenty-six options is the practical ceiling.

### Keep the question ids short

The answer template is one `id: label` row per question and it has to fit the canvas. Real keys like `X3|C1|conflict` are long enough that a dozen questions overflow it; the server then packs rows into a tighter format, the label stops being a single token, and you get a **422**. Send `q0`…`qN` and map back locally.

## Step 5 — Wait for it properly

Cold start is around **380 seconds** from pod creation to first answer — that figure recurred four times in the logs, with a spread of 360 to 410 s and two outliers at 980 s. It covers the clone, the PR fetch, `pip install`, the weight download and the model load, so it is a pod-lifecycle number rather than a vLLM one.

Poll for it; don't sleep and hope:

```bash
POD=https://<podId>-8000.proxy.runpod.net
up=0
for i in $(seq 1 120); do
  [ "$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$POD/v1/models")" = "200" ] \
    && { up=1; echo "up after $((i*10))s"; break; }
  sleep 10
done
[ "$up" = 1 ] || { echo NEVER_UP; exit 2; }
```

Then verify the **sidecar** with a POST, not a GET. A bare `GET /` can answer before the tokenizer has finished loading:

```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST \
  http://127.0.0.1:8011/v1/systemone -H 'Content-Type: application/json' \
  -d '{"model":"jev-latest","state":{"a":"x"},
       "questions":{"q":{"type":"noul","instructions":"ok?"}}}'
```

> [!caution] Cloudflare 1010 will 403 anything that is not curl
> RunPod's proxy sits behind Cloudflare, which rejects urllib's default User-Agent with `error code: 1010`. curl works, Python does not, and the failure looks like an auth problem. Set a User-Agent on every client that talks to the pod — **including the sidecar itself**, which makes its own upstream calls and needs the same patch:
> ```python
> headers={"Content-Type": "application/json",
>          "User-Agent": "your-tool/1.0"}
> ```

## Step 6 — Scale up, and the thing I got wrong

Here is the result worth the guide.

The first full-scale run managed **13.3 questions/sec** at 32 client workers, one question per request. Two independent changes were available, and it matters that they are independent:

| configuration | rate |
|---|---|
| 32 workers, 1 question per read | **13.3 q/s** |
| 192 workers, 1 question per read | **28 q/s** |
| 24 workers, **12 pairs = 24 questions per read** | **235–249 q/s** |

Batching is roughly **8.5× faster** than the fastest unbatched configuration. A read denoises the whole canvas in one forward pass, so every question in it is answered for very nearly the cost of one. It is the entire point of the architecture.

**And I stopped using it, because the scores were wrong.**

The tell was three cells that should have agreed and didn't. All three are the same wording, so wording cannot explain the gap:

| cell | mean score on planted conflicts | configuration |
|---|---|---|
| `nai51` | **0.855** | 1 question per read |
| `viro87` | 0.375 | batched, 24 per read |
| `horizon116` | 0.421 | batched, 24 per read |

Recall told the same story:

| | recall at >0.30 |
|---|---|
| batched cells | 31/69 = 0.449 |
| the one unbatched cell | 6/7 = 0.857 |

Twenty-four questions share one canvas and are filled in a single denoise pass, so they can interfere — which is *exactly the mechanism that makes batching fast*. You are not running 24 independent reads cheaply. You are running one joint read and slicing it.

> [!danger] Never mix batch sizes inside a comparison
> One cell of that run scored unbatched while every other cell batched at 24, and I compared them as if they were one configuration. Re-running everything in a single configuration moved recall from 0.487 to **0.842**, and a headline finding about input phrasing — drafting style mattering **2.81×** — collapsed to **1.13×** and had to be withdrawn. The comparable figure for the autoregressive engine I was benchmarking against is 1.31×, so the corrected conclusion is the opposite of the published one: this model is *less* phrasing-sensitive, not three times more.

### What I cannot tell you

Two honest limits on the finding above, both of which a reader could otherwise over-read.

**The clean re-run changed two things, not one.** It went to one question per read *and* dropped a second question type from each request. The justification was sound — with one question per request there is no joint read for a second type to interfere with — but it means 0.487 → 0.842 cannot be attributed to batch size alone from this data. Batching is the likely cause given the mechanism and the three-cell comparison. It is not the proven one.

**Nothing here tests independent states.** Every batched read in this work packed questions about *the same document* into one canvas. Whether unrelated documents interfere when they share a canvas is completely untouched by this work, and the mechanism does not settle it either way.

The one differential effect that was measured: **ranking survives batching, absolute scores do not.** The `horizon116` house cell scored AUC 0.996 while batched, even as its absolute scores roughly halved. So:

> [!tip] A defensible rule from this run
> **Batch when you only need the ordering. Measure before you batch if you intend to threshold.** Triage a list, rank candidates, surface the top N — batch it and take the 8.5×. Fire an alert at p > 0.7 — don't.

## What it actually does well

The full clean run: 49,536 questions — every clause pair of three contracts in four wordings — 76 planted contradictions and 49,460 innocent pairs, one question per read at 192 workers, in about thirty minutes.

```
AUC              0.9840   (mixed-config run had said 0.9643)
recall >0.30     64/76 = 0.842   (mixed-config run had said 0.487)
in top 5%        75/76 = 0.987
median rank      0.145%   worst 97.82%
```

False positives on three clean contracts — 245 clauses, 10,783 pairs — came to **4 scores above 0.70, or 1.63 per 100 clauses**, with only 2 pairs in the 0.30–0.70 referral band.

So it ranks superbly and grades poorly. The ordering is excellent; the absolute number is not calibrated to any fixed band you can set once and trust.

> [!warning] A confident miss is possible, and it does not look like uncertainty
> One genuine planted contradiction scored **0.000** — not 0.4, not "unsure" — and sat 1617th of 1653, 98% of the way down the list. It was a double negative: a clause choosing California law against *"The parties do not intend the law of any jurisdiction other than Delaware to apply."* The same question type was caught 11 times out of 12 elsewhere, mean score 0.913. Remove that single pair and the worst-placed conflict in the entire run sits at 4.36%.

Two diagnostics are worth keeping per answer, and one caveat about them:

- **`label_mass`** — how much probability landed on legal labels at all. Low mass means the model wanted to say something that wasn't an allowed answer, and your tidy normalised probability is a renormalisation of a bad read. **A low-mass read and a low-probability answer are indistinguishable if you only keep the final number, and they mean opposite things.**
- **`argmax_is_label`** — was the single most likely token at that slot even a legal answer?

The caveat: the sidecar returns both, and **my scorer discarded them**, keeping only the probability. So I cannot tell you whether the 0.000 miss above was a low-mass read — the data to check is gone. Keep them. That is a recommendation learned by not having it, not a diagnosis.

One more cell worth recording: the run logged **56 unanswered questions** out of 1,653 in exactly the cell containing that catastrophic miss, against 0 in every other cell of the clean run (56 of 60,319 overall, 0.09%). Nothing in the record connects the two and I am not claiming a link — but if you build this, count your unreadable answers per cell and look at any cell that stands out.

## What this costs in VRAM

This is where the published version of this guide was wrong, so it gets stated carefully.

Three checkpoint sizes exist for this model and it is easy to quote the wrong one:

| checkpoint | size | status |
|---|---|---|
| `google/diffusiongemma-26B-A4B-it` (bf16) | 51.7 GB | never run |
| `RedHatAI/...-FP8-dynamic` | **27.2 GB** | **what was actually served** |
| `nvidia/...-NVFP4` | 18.9 GB | never served a single request |

Measured at load, on an 80 GB H100 at `--gpu-memory-utilization 0.90`:

```
INFO [fp8.py:522]             Using VLLM_CUTLASS Fp8 MoE backend
INFO [default_loader.py:430]  Loading weights took 7.37 seconds
INFO [model_runner.py:419]    Model loading took 25.83 GiB memory and 30.155612 seconds
INFO [gpu_worker.py:645]      Available KV cache memory: 43.52 GiB
INFO [kv_cache_utils.py:2404] GPU KV cache size: 207,036 tokens,
                              Maximum concurrency for 8,192 tokens per request: 25.27x
```

**25.83 GiB resident for weights, 43.52 GiB left for KV cache.** That log is from an H100 pod sharing this model, `--max-model-len` and `--gpu-memory-utilization`, but carrying `--enforce-eager` and lacking the diffusion and prefix-caching flags — the clean-run pod's own startup log was never captured.

### No consumer card is proven to run this

At 25.83 GiB resident the FP8 checkpoint **does not fit a 24 GB card at all** — not tightly, not with a trimmed context. And the one consumer card with the memory, the 32 GB RTX 5090, is compute capability 12 and hits the flashinfer wall from Step 1.

| card | VRAM | verdict |
|---|---|---|
| H100 80GB | 80 GB | **measured working** |
| RTX PRO 6000 | 96 GB | Blackwell — flashinfer, measured failing |
| RTX 5090 | 32 GB | memory fits; Blackwell — measured failing |
| RTX 4090 | 24 GB | **too small at 25.83 GiB** |
| RTX 3090 | 24 GB | too small, and Ampere cannot execute FP8 natively |

There is one untested escape worth knowing about, and it is a genuine hypothesis rather than a recipe. vLLM already excludes flashinfer for this model of its own accord:

```
INFO [config.py:284] DiffusionGemma uses mixed causal/bidirectional attention within a batch;
                     setting use_non_causal=True to exclude FlashInfer from auto-selection.
```

If the dependency is avoidable in the paths that matter, forcing `VLLM_ATTENTION_BACKEND=FLASH_ATTN` on a 5090 might sidestep it — and the hard-coded major-version list is a packaging limitation rather than a hardware one, so a newer wheel may simply fix it. **I never tried either.** If you do, that result is worth more than anything else in this guide.

## Known rough edges

- **Sampling parameters are rejected outright.** `temperature`, `seed`, `min_p`, `logit_bias` and `allowed_token_ids` all return **400**. They don't apply to a read-only denoise. For reproducibility, fix the seed canvas rather than passing `seed`.
- **`think` made results worse.** The sidecar can let the model write N tokens in a thought channel before the read. On 187 pairs it took AUC from 0.999 to **0.869**. Two reasons: the noise draws of one decision share a single thought, so a large batch makes one thought cover every question in it; and the model never emits its close tag, so the thought is always truncated rather than finished.
- **Multi-token labels fail late** — either a schema error at template resolution, or a 422 once row-packing pushes a label over the line.
- **Weights re-download on every cold pod.** `HF_HOME=/workspace/hf` points at ephemeral container disk, and no network volume was used. A network volume is the obvious fix and was not tried.

## What was not tested

Stated plainly, because the list is as useful as the results:

- **bf16 weights** — only the FP8 checkpoint was ever served
- **`steps` above 1** — every number here is a single denoise step. More steps were never run, so "one step is enough" is an untested default, not a finding
- **`samples` above the automatic ceiling of 4**
- **Cross-document batching** — see above
- **Run-to-run stability** — no repeat run, so there is no standard deviation on any figure here
- **Committing tokens** (`--no-read-only`) — reads only, throughout
- **Whole-document state** — the canvas bounds the answer rather than the state, so the entire contract could ride in the prompt. That is the arrangement this architecture makes possible and it was never exercised

## What it cost

**$6.49** of GPU time is confirmed billed across 12 pods through 19:00 on the day of the run. The final two runs fall outside that billing read and were never separately reconciled, so the frequently quoted **~$12 total is an estimate rather than a billing figure**. The $3.49/hr rate is real — it is the `cost` field on the H100 pod object.

For an eight-and-a-half-hour afternoon that included three dead Blackwell pods, a full 49,536-question evaluation and a re-run of the same after discovering the batching problem, that is the shape of the bill to expect.

## Next steps

- [vLLM PR #57250](https://github.com/vllm-project/vllm/pull/57250) — the implementation, and `examples/features/diffusion_reads/structured_server.py`
- The release this model came from: [DiffusionGemma: The Developer Guide for Local Deployment](/posts/diffusiongemma-developer-guide-local-deployment/)
- [MoE Expert Offload](/guides/moe-expert-offload-arithmetic/) — the residency-versus-traffic arithmetic behind a 26B model with 4B active
- [How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/) — for sizing `--max-model-len` by arithmetic rather than by trial
- [What Actually Fits on Dual RTX 3090s](/guides/qwen-27b-dual-3090-context-math/) — the KV cache method this guide's memory section leans on
