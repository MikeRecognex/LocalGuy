---
title: "Choosing a Qwen3.8-27B Quantization and Backend: What Actually Fits"
date: 2026-09-02
updated: 2026-09-02
description: "No Q4_K_M build of Qwen3.8-27B fits in 16GB from any repository, the quant that does fit has never been quality-tested, and llama.cpp silently stops generating at ~98K context. The measured file sizes and the open bugs behind each decision."
tags:
  - qwen
  - qwen3-8-27b
  - quantization
  - gguf
  - llama-cpp
status: published
category: deployment
difficulty: intermediate
timeEstimate: "20 min"
---

Two well-circulated write-ups landed on Qwen3.8-27B within days of each other. One benchmarked quantization quality and concluded 4-bit is the sweet spot. The other showed the model running on a single 16GB card. Read together they suggest an obvious plan: run Q4_K_M on 16GB.

That plan does not work. The two articles describe different quantizations, and neither says so. This guide reconciles them against measured file sizes and the current bug tracker, so you can pick a configuration that actually loads and actually generates.

> [!warning] Verified 2 September 2026
> The headline finding since those articles ran: **on llama.cpp, this model silently stops generating somewhere between 98K and 114K context** — no error, no warning, just an immediate end-of-sequence token. That is [ggml-org/llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756), open, filed 26 August 2026 and reported against Qwen3.8-27B by name. Treat llama.cpp's usable context as **~96K, not the 262K on the model card**, regardless of quantization.
>
> This matters more, not less, now that a fork advertising 262K context on a 16GB card is circulating. It solves memory, not correctness — see *The adaptive-KV-streaming fork solves a different problem*, below.

## The two articles don't describe the same setup

| | [Quesma benchmark](https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/) | [Autodidacts 16GB write-up](https://www.autodidacts.io/how-to-fit-qwen3-8-27b-into-16gb-vram-run-with-llama-cpp-rtx-3080-flags-quantizations/) |
|---|---|---|
| Date | 26 Aug 2026 | 23 Aug 2026 |
| Quant actually used | BF16, Q8_0, **Q4_K_M**, UD-Q2_K_XL, UD-IQ1_M/S | **UD-IQ3_XXS** |
| Hardware | L40S 48GB, H100 80GB, H200 141GB | One 16GB card |
| Quality measured? | Yes — GPQA Diamond, IFBench, Terminal-Bench 2.1 | **No** |

The overlap between those two quant lists is empty. Quesma never tested IQ3_XXS. The autodidacts author never tested quality — his own words are *"I haven't noticed an obvious quality degradation, though there probably is one."*

And the 16GB article is explicit that Q4_K_M was **not** usable for him; he describes it as too slow with insufficient headroom. That is the sound of a model not fitting.

## What the model actually is

Three properties drive every decision below. From [the published `config.json`](https://huggingface.co/Qwen/Qwen3.8-27B/raw/main/config.json):

| | |
|---|---|
| `model_type` | `qwen3_5` — the same architecture class as Qwen3.5 |
| Layers | 64 — **16 full attention, 48 linear** (`full_attention_interval: 4`) |
| KV heads / head dim | 4 / 256 |
| Native context | 262,144 |
| `vision_config` | **present** |
| Experts | none — **dense**, not MoE |

Check it yourself:

```bash
curl -sL https://huggingface.co/Qwen/Qwen3.8-27B/raw/main/config.json \
  | python3 -c "import json,sys; c=json.load(sys.stdin); t=c.get('text_config',c); \
    lt=t['layer_types']; print(len(lt),'layers |',lt.count('full_attention'),'full |', \
    lt.count('linear_attention'),'linear | vision:', 'vision_config' in c)"
# 64 layers | 16 full | 48 linear | vision: True
```

Three consequences people get wrong:

1. **It is a vision-language model.** That is why a `--mmproj` file appears in every working command. It is a separate 0.93 GB download that must also be resident. Budget for it — most VRAM tables you'll find online do not.
2. **It is dense, so `--n-cpu-moe` does nothing here.** That flag is the standard 16GB advice for Qwen's MoE models and it is the wrong advice for this one. There are no experts to offload.
3. **There is no official Qwen3.8 4B or 8B.** The complete Qwen release list is `Qwen3.8-27B`, `Qwen3.8-2.4T-A95B`, `Qwen3.8-Flash-Next` and their FP8 variants. Third-party "Qwen3.8-2B-Distill" style repos are not Qwen releases. If a comparison table offers you a 4B, it is describing something that does not exist.

> [!note] Flash-Next is a different architecture
> `Qwen3.8-Flash-Next` is handled as a separate architecture in llama.cpp, not as `qwen3_5`. Nothing in this guide carries across to it.

## What actually fits in 16GB

These are real byte sizes from the Hugging Face file listing, not estimates from parameter count. **The same quant name differs by up to 2.5 GB between repositories**, which is enough to flip a fit verdict — so the repo you download from is part of the decision, not an afterthought.

| Quant | unsloth (UD) | bartowski | + mmproj (unsloth) | Fits 16GB? |
|---|---|---|---|---|
| Q8_0 | 27.05 GiB | 27.12 GiB | — | no |
| Q5_K_M | 18.41 GiB | 19.33 GiB | — | no |
| **Q4_K_M** | **15.33 GiB** | **16.55 GiB** | **16.20 GiB** | **no** |
| Q4_K_S | 14.30 GiB | 15.57 GiB | 15.17 GiB | marginal |
| **IQ4_XS** | **13.27 GiB** | 14.50 GiB | **14.14 GiB** | **yes** |
| Q3_K_XL | 12.24 GiB | — | 13.11 GiB | yes |
| **IQ3_XXS** | **10.18 GiB** | 11.76 GiB | **11.05 GiB** | **yes, comfortably** |
| Q2_K_XL | 9.15 GiB | — | 10.02 GiB | yes |
| IQ1_S | 5.77 GiB | — | 6.64 GiB | yes |

Reproduce the table for any repo:

```bash
curl -s "https://huggingface.co/api/models/unsloth/Qwen3.8-27B-GGUF?blobs=true" \
  | python3 -c "import json,sys; [print(f\"{f['rfilename']:46s} {f['size']/2**30:6.2f} GiB\") \
    for f in json.load(sys.stdin)['siblings'] if f.get('size') and f['rfilename'].endswith('.gguf')]"
```

**No Q4_K_M from any repository fits in 16GB** once the 0.87 GiB projector is counted — and that is before a single byte of KV cache, CUDA context or activations. The unsloth build is the closest at 16.20 GiB with mmproj, and it is still over.

Unsloth's "UD" dynamic quants run consistently 1.3–1.5 GiB smaller than the same-named quant from bartowski. If you are near a boundary, that difference decides it.

> [!tip] Working out KV cache and context headroom
> This guide deliberately stops at weight residency. For the arithmetic on how much context fits in what's left — and why only 16 of this model's 64 layers cache at all — see [What Actually Fits on Dual RTX 3090s](/guides/qwen-27b-dual-3090-context-math/) and [How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/).

## What the quality evidence actually supports

The Quesma benchmark is real primary work — the author ran it himself on L40S/H100/H200 with a llama.cpp build from 16 August 2026, across GPQA Diamond, IFBench and Terminal-Bench 2.1 at three reasoning-effort levels. That is more rigour than almost anything else published on this model.

It also has limits you need to know before leaning on it:

- **The results are published as charts, not tables.** There is no numeric result table anywhere in the article. Any precise percentage you see quoted for Qwen3.8 quantization is someone reading a figure off a plot. Treat second-hand numbers accordingly.
- **The 1-bit "collapse" rests on GPQA Diamond alone.** IFBench and Terminal-Bench results for the 1-bit quants are not shown. GPQA is four-way multiple choice, so a chance-level score is equally consistent with instruction-format breakdown as with knowledge loss.
- **IFBench does not discriminate at all** — the article states there is no change between models down to a decent 2-bit quant. It should not be cited as evidence for 4-bit.
- No per-datapoint sample sizes are given, and the build is identified by date rather than commit hash.

**The gap that matters: nothing in the 13–15 GiB band has been quality-tested.** Quesma jumped from Q4_K_M straight down to 2-bit. IQ4_XS and IQ3_XXS — the two quants that actually fit in 16GB — sit in that untested gap. IQ4_XS in particular is far closer in size to Q4_K_M than to the 2-bit quants that were shown degrading, which is *suggestive* and nothing more.

> [!warning] Do not let anyone tell you IQ4_XS quality is known
> It has not been measured on this model, by Quesma or anyone else I could find. If you need a defensible quality claim at 16GB, you will have to generate it — see below.

## Choosing a backend

| Backend | Support | State |
|---|---|---|
| **vLLM** | ROCm enabled via [PR #50068](https://github.com/vllm-project/vllm/pull/50068), merged 7 Aug 2026; noted in v0.28.0 | **The only backend verified correct at long context.** Model card lists it among the YaRN-capable frameworks for >262K |
| **Ollama** | v0.32.12, 14 Aug 2026 — day one | Easiest start, but a long open-bug list; see below |
| **llama.cpp** | Loads via the existing `qwen3_5` architecture | Widest hardware reach, **but #27756 caps usable context at ~96K** |
| **MLX** | Working 4-bit/8-bit artifacts exist under `mlx-community` | Main-branch only — the last tagged `mlx-lm` release predates the model. Vision support ([PR #1768](https://github.com/ml-explore/mlx-lm/pull/1768)) is still open |

Notably, the Qwen model card names vLLM, SGLang and TokenSpeed as the frameworks capable of extending context past 262K. **llama.cpp is not on that list.**

### The long-context trap, in detail

[llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756) is the single most expensive thing to not know about this model:

- Prefill completes cleanly, then the **first generated token is EOS**. You get `tokens_predicted: 1`, empty content, and no error of any kind.
- Onset was originally reported around 130K; a follow-up narrowed it to **98,641 tokens** on a code prompt. The failure band is roughly **98K–114K and prompt-dependent** — it is not monotonic, so a passing test at one length does not clear a shorter one.
- Reproduced on **both UD-IQ3_XXS and UD-Q4_K_M**, so changing quantization does not avoid it.
- Not fixed by KV cache type, temperature, batch size, chat template, or a fresh server.
- Reproduces on mainline CUDA, mainline CPU, and ik_llama.cpp — three separate codepaths.
- **The decisive test:** the identical 129,864-token prompt succeeds on vLLM 0.28.0 with the same weights. The weights are fine; the engine is not.

If you need genuine long context on this model today, that differential is your answer: use vLLM.

### The adaptive-KV-streaming fork solves a different problem

[RaymondHuang210129/llama.cpp-adaptive-kv-streaming](https://github.com/RaymondHuang210129/llama.cpp-adaptive-kv-streaming) has been circulating as the answer to long context on 16GB, and its own README validates on exactly this model:

| | |
|---|---|
| Branch | `feature/adaptive-kv-stream` (default), pushed 2 Sep 2026 |
| Mechanism | Block-granular KV streaming to pinned host memory with a bounded CUDA pool, via `--kv-stream-stage-mib N` |
| Validated on | `unsloth/Qwen3.8-27B-GGUF` **UD-Q3_K_XL** (12.24 GiB), RTX 5070 Ti 16GB |
| Claimed context | 262,144, Flash Attention, Q8_0 K cache / Q4_0 V cache, one slot |
| Largest concrete run cited | **122,880 tokens** at `512/512` |
| Author's own framing | "research code" |

It is a genuine fork with real CUDA work in it, and the mechanism is orthogonal to #27756 — which is precisely the problem. **#27756 is a correctness defect, not a memory one.** It reproduces on mainline CUDA, mainline CPU and ik_llama.cpp, is unaffected by KV cache type, and passes on vLLM with identical weights. The fork changes where KV tensors live; it does not touch whatever is emitting EOS.

To be exact about what I checked and what I did not: I have not run this fork. Its README makes **no mention of #27756, EOS, empty output, or Gated DeltaNet** — it does not claim to fix the defect. It is based on mainline, and the candidate upstream fix ([PR #28068](https://github.com/ggml-org/llama.cpp/pull/28068), GDN normalization from `max` to `rsqrt`) is **still open and unmerged**. So there is no reason to expect the defect to be absent, and no published evidence either way.

Note also that the largest run the README actually reports completing — 122,880 tokens — sits *inside* the 98K–114K failure band's far side, and the README reports it as a throughput result, not a correctness one. Prefill completing and streaming staying active is exactly what #27756 looks like before the empty response arrives.

The trap is that the fork removes the constraint that used to protect you. On stock llama.cpp a 16GB card runs out of VRAM well before 98K, so you never reach the cliff. Allocate 262K successfully and you walk straight off it. If you try the fork, **plant a fact at the start of a long prompt and ask for it at the end** before trusting any load that appears to succeed.

### Speculative decoding is the least stable surface everywhere

The widely-copied 16GB command enables MTP speculative decoding by default (`--spec-type draft-mtp`). Across every backend, that is the area with the most open bugs right now — including [llama.cpp#28158](https://github.com/ggml-org/llama.cpp/issues/28158), where DFlash/MTP emits an out-of-bounds token id equal to `n_vocab` (248320) on Vulkan, and Ollama issues covering MTP variants failing to run, forcing CPU offload, and running 2× slower than non-MTP on Apple Silicon.

Also worth knowing: **the MTP head is a separate file**, roughly 1.37 GB in the unsloth repo. The circulated command passes `--gpu-layers-draft all` without a draft model path; whether that silently auto-downloads the head is something I could not confirm. If you enable MTP, account for the extra file in your budget.

> [!tip] Turn speculative decoding off first when debugging
> If the model is crashing, hanging, or emitting garbage, drop `--spec-type` and `--gpu-layers-draft` before you change anything else. It is the most likely culprit and the cheapest thing to eliminate.

## Known rough edges

All open as of 2 September 2026:

| Issue | What bites |
|---|---|
| [llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756) | Silent empty output past ~98K context |
| [llama.cpp#27560](https://github.com/ggml-org/llama.cpp/issues/27560) | `llama-server` access violation on Windows/Vulkan **at default settings** |
| [llama.cpp#27431](https://github.com/ggml-org/llama.cpp/issues/27431) | Crash on unsloth UD-Q4_K_M, Vulkan/AMD |
| [llama.cpp#27335](https://github.com/ggml-org/llama.cpp/issues/27335) | Crash on M2 Ultra at defaults |
| [llama.cpp#27329](https://github.com/ggml-org/llama.cpp/issues/27329) | NVFP4 decode hangs on CUDA/Blackwell |
| [llama.cpp#27139](https://github.com/ggml-org/llama.cpp/issues/27139) | Chat-template defect — errors resolved by substituting the Qwen3.6 template |
| [ollama#17790](https://github.com/ollama/ollama/issues/17790) | `POST /v1/chat/completions` never responds; `/api/chat` works |
| [ollama#17921](https://github.com/ollama/ollama/issues/17921) | `tool_choice` ignored — forced returns text, `"none"` still calls tools |
| [ollama#17906](https://github.com/ollama/ollama/issues/17906) | Anthropic-compatible endpoint maps `xhigh`→`high`, breaking the chat template |
| [mlx-lm#1807](https://github.com/ml-explore/mlx-lm/issues/1807) | Unbounded memory growth past the prompt-cache cap, named for this model |

That Ollama OpenAI-endpoint bug deserves emphasis: `/api/chat` working while `/v1/chat/completions` hangs is exactly the failure mode that reads as "my client library is broken."

## How to choose

| If you want | Do this |
|---|---|
| To fit 16GB with the most quality available | `unsloth` **UD-IQ4_XS** (13.27 GiB) + mmproj. Untested for quality — measure it. |
| To fit 16GB with headroom for context and MTP | `unsloth` **UD-IQ3_XXS** (10.18 GiB) + mmproj. This is the configuration the 16GB article actually ran. |
| Context beyond ~96K | **vLLM.** Not llama.cpp, at any quantization, and not the streaming fork — it fixes memory, not the EOS defect. |
| Benchmarked quality with no surprises | **Q4_K_M on 24GB+.** The quant Quesma actually validated. |
| Simplest possible start | **Ollama** `qwen3.8:27b` — but use `/api/chat`, not the OpenAI-compatible endpoint. |

Then measure on your own prompts, because the quality question at IQ4_XS/IQ3_XXS is genuinely open:

```bash
# Establish a quality baseline before and after a quant change.
# Substitute a task representative of your workload — generic benchmarks
# will not tell you whether your use case survived.
llama-perplexity -m Qwen3.8-27B-UD-IQ4_XS.gguf -f your-domain-corpus.txt --ctx-size 4096
```

And before you build anything on long context, run a retrieval check rather than inferring from a successful load — plant a fact at the start of a prompt at your target length and ask for it at the end. A model that loads is not a model that generates.

## Next steps

- Model card and architecture: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Quant files and real sizes: [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF), [bartowski/Qwen3.8-27B-GGUF](https://huggingface.co/bartowski/Qwen3.8-27B-GGUF)
- The benchmark, with its methodology stated: [Quesma — Qwen3.8 27B quantizations benchmarked](https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/)
- The long-context defect: [llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756), and the candidate fix still unmerged at [PR #28068](https://github.com/ggml-org/llama.cpp/pull/28068)
- The KV streaming fork, for the memory problem only: [RaymondHuang210129/llama.cpp-adaptive-kv-streaming](https://github.com/RaymondHuang210129/llama.cpp-adaptive-kv-streaming)
- KV cache arithmetic for this architecture: [What Actually Fits on Dual RTX 3090s](/guides/qwen-27b-dual-3090-context-math/)
- The posts that prompted this guide: [[qwen3-8-quantization-benchmarks-4bit-optimal|Qwen3.8 27B Quantization Benchmarks: 4-Bit Remains Optimal Trade-off]] and [[qwen3-8-27b-16gb-vram-guide|How to Run Qwen3.8-27B on a Single 16GB Card]]
