---
title: "What Actually Fits on Dual RTX 3090s: Qwen 27B and the KV Cache Math"
date: 2026-08-30
updated: 2026-08-30
description: "Why a 27B model holds 262K context on 48GB — 48 of its 64 layers have no KV cache at all — and what decode speed you should honestly expect from two 3090s."
tags:
  - qwen
  - hardware
  - quantization
  - performance-benchmark
  - vram-management
status: published
category: hardware
difficulty: advanced
timeEstimate: "25 min"
---

Two RTX 3090s give you 48GB for around the price of one current-generation card, and a 27B model with a six-figure context window is exactly the workload people buy them for. The question is what that setup genuinely delivers.

The short answer: the context claims are real and better than advertised. The speed claims usually aren't. This guide shows the arithmetic for both so you can check any number you see, including the ones here.

> [!warning] Verified 30 August 2026
> Figures below are for the Qwen3.5-27B architecture, verified against the published `config.json`. **Qwen3.5 has been superseded twice** — by Qwen3.6-27B (April 2026) and Qwen3.8-27B (August 2026). Both keep the same 64-layer hybrid architecture, so the memory arithmetic carries over unchanged; the throughput situation has improved substantially. Build against the current model, not 3.5.

## The thing that makes this work isn't quantization

Qwen3.5-27B is routinely described as a dense 27B model. The FFN is dense — it isn't a mixture of experts — but the attention stack is not what "dense transformer" implies:

| | |
|---|---|
| Total layers | 64 |
| **Full attention layers** | **16** |
| **Gated DeltaNet (linear attention) layers** | **48** |
| Pattern | `full_attention_interval: 4` — three linear, then one full, repeated |
| KV heads / head dim | 4 / 256 |
| Native context | 262,144 |

Verify it yourself:

```bash
curl -sL https://huggingface.co/Qwen/Qwen3.5-27B/raw/main/config.json \
  | python3 -c "import json,sys; c=json.load(sys.stdin)['text_config']; \
    lt=c['layer_types']; print(len(lt),'layers |',lt.count('full_attention'),'full |',lt.count('linear_attention'),'linear')"
# 64 layers | 16 full | 48 linear
```

Linear-attention layers carry a **fixed-size recurrent state instead of a KV cache that grows with context**. Three quarters of this model's layers cost the same at token 200,000 as at token 1. That is the entire reason long context fits on consumer hardware, and it's an architectural property — no amount of quantization would have got you there.

## The KV cache arithmetic

Only the 16 full-attention layers cache:

```
KV elements per token = 2 (K and V) × 4 kv_heads × 256 head_dim × 16 full-attn layers
                      = 32,768 elements  →  64 KiB/token at FP16
```

| Context | FP16 KV | FP8 KV |
|---|---|---|
| 170,000 | 11.14 GB | 5.57 GB |
| 262,144 (native max) | 17.18 GB | 8.59 GB |

> [!note] These are decimal GB (10⁹), compared against a nominal "48GB"
> `nvidia-smi` reports a 3090 as 24576 MiB, so two cards are 48 **GiB** — about 51.5 GB decimal. Sizing decimal cache figures against a binary card budget understates your headroom by roughly 7%, which is the safe direction to be wrong in: every "fits" verdict below still holds with room to spare. In binary the same two rows are 10.38 and 16.00 GiB. The [VRAM guide](/guides/how-much-context-fits-vram/) works in GiB throughout.

Against a Q4_K_M weight file of **16.74 GB** (measured, `unsloth/Qwen3.5-27B-GGUF`), on 48GB total with roughly 44–45GB usable after CUDA context and activations:

| Configuration | Total | Fits? |
|---|---|---|
| Q4_K_M + 170K @ FP16 KV | 27.9 GB | yes, ~17 GB spare |
| Q4_K_M + 262K @ FP16 KV | 33.9 GB | yes |
| Q4_K_M + 262K @ FP8 KV | 25.3 GB | yes, room for concurrency |

**170K on dual 3090s is not a stretch — it's comfortable, at full FP16 KV, with no quantization of the cache required.** The frequently-quoted 170K figure undersells the hardware; the architecture's native limit is 262K and that fits too.

Now the counterfactual that shows why this matters. Had all 64 layers been full attention:

```
2 × 4 × 256 × 64 × 2 bytes × 170,000 = 44.6 GB   ← KV cache alone
```

Plus 16.74 GB of weights. It would not fit, on any KV quantization scheme, at any context near that length. The hybrid architecture isn't a footnote to the story — it *is* the story.

> [!tip] Doing this for a different model?
> The same arithmetic generalises, but four architectures break the standard formula — including one that overestimates by 57x. **[How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/)** has the formula, a script that reads any model's `config.json`, and a verified table across six architectures.

> [!note] The recurrent state isn't free, it's just constant
> The 48 Gated DeltaNet layers hold roughly 75 MB per sequence at FP16, independent of context length. Irrelevant for one stream; at eight concurrent sequences it's around 0.6 GB, which you should budget but won't notice.

## What decode speed to actually expect

Single-stream decode is bound by weight bandwidth: every token requires streaming the whole model. A 3090 has ~936 GB/s.

```
Streamed bytes ≈ 16.74 GB weights − ~1.3 GB input embedding table (gathered, not streamed) ≈ 15.7 GB

One 3090, theoretical:     936 / 15.7  =  59.6 t/s
Two 3090s, TP=2, theory:   936 / 7.85  = 119.2 t/s
```

So a claim of 100+ t/s single-stream is asking for **84% of the two-card theoretical ceiling** — essentially perfect bandwidth efficiency, before paying anything for the interconnect. Real measurements on this exact model and hardware:

| Source | Engine | Single-stream decode |
|---|---|---|
| [BAEM1N/llm-bench](https://github.com/BAEM1N/llm-bench) | llama.cpp, Q4_K_M, 3090×2 | **41.4 t/s** |
| same | vLLM GPTQ, 3090×2 | **19.3 t/s** |

That 41.4 is about 70% of the *single*-card roofline, which is the expected result: llama.cpp splits by layer rather than tensor-parallel, so at batch=1 only one card's bandwidth is working at a time.

> [!warning] Treat any unattributed 100+ t/s figure as unproven
> Single-stream 100+ t/s on this class of model and hardware is reachable, but only with speculative decoding (see below), and mostly on predictable content like code. A bare "100+ tokens/sec" with no engine, no quantization, no draft method and no prompt length attached is not a number you can plan against. Ask which of those five things it's missing.

### Why the second card helps less than you'd hope

Tensor parallelism splits each layer across both GPUs, which halves the bytes per card but adds two all-reduce collectives per layer — **128 round trips per token** at 64 layers. Each carries only ~10 KB, so this is latency-bound, not bandwidth-bound, and on PCIe-connected Ampere the latency largely eats the bandwidth win at batch=1.

The 3090 is the last consumer NVIDIA card with an NVLink bridge connector (~112.5 GB/s versus ~31.5 GB/s for PCIe 4.0 x8), so it can help here — but published dual-3090 recipes run PCIe-only and explicitly disable NVLink-specific NCCL paths, so don't treat a bridge as mandatory.

Tensor parallelism pays off properly at **batch**, where the weight read is amortised across concurrent sequences. Prefill and throughput are where two cards shine:

| Workload | 3090×2 measured |
|---|---|
| Prefill @ 16K, vLLM | **2,845 t/s** |
| Prefill @ 16K, llama.cpp | 1,799 t/s |

If you see ~1,500 t/s prefill quoted for this setup, that's conservative rather than optimistic.

### The way to actually reach 100+ t/s

Speculative decoding — MTP, or the newer DFlash/DFlash2 — drafts several tokens and validates them in one weight pass, breaking the bandwidth roofline that caps ordinary decode. Published single-3090 results for the same 27B architecture show 46 t/s without it and 121–133 t/s with it.

Two things worth knowing before you plan on this:

1. **Acceptance rate is content-dependent.** Reported dual-3090 numbers split roughly 71 t/s on prose versus 89 t/s on code with MTP, and 78 versus 128 with DFlash. Your prose workload will not see the code number.
2. **It was not a working option in early 2026.** The Gated DeltaNet kernels were crashing — [vLLM #34948](https://github.com/vllm-project/vllm/issues/34948) (*CUDA Illegal Memory Access in GDN Kernel*, February, still open) and [#36010](https://github.com/vllm-project/vllm/issues/36010) (*Qwen3.5-27B Batch Inference very slow / not working*, filed 4 March 2026). Speed claims from that window predate a usable speculative decoding path.

## The long-context trap on llama.cpp

If you are chasing a six-figure context specifically, this one will cost you a day:

> [!danger] llama.cpp silently returns empty output past ~130K on this architecture
> [ggml-org/llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756) (open, filed 26 August 2026) reports **silent instant-EOS beyond roughly 130K context, deterministic at ≥174K**, on the 64-layer Qwen3.5-hybrid — on both CUDA and CPU. The suspected cause is DeltaNet recurrent-state degradation compounding with layer depth. There is no error and no warning; the model simply returns nothing.

The VRAM fits. The engine doesn't, yet. **Test your actual target context with a retrieval check before building on it** — a fact planted at the start of a 170K prompt, retrieved at the end. Don't infer working long context from a successful model load.

## What changed since early 2026

Anything written about this setup before roughly April 2026 is describing a different landscape:

- **Speculative decoding matured.** The single biggest change, and the only route to triple-digit single-stream decode.
- **TurboQuant KV quantization didn't exist.** First requested in [vLLM #38201](https://github.com/vllm-project/vllm/issues/38201) on 26 March 2026, with hybrid-model support landing in April. Its 3-bit mode substantially increases how many concurrent long-context streams fit, at roughly 25% per-stream throughput cost.
- **TP=2 on int4 needed a fix.** Marlin sub-tile padding ([vLLM #40361](https://github.com/vllm-project/vllm/pull/40361)); without it, loading crashes with `GPTQ_MARLIN_MIN_THREAD_N (64) > out_features`.
- **Context parallelism arrived, and is still rough** — `--decode-context-parallel-size` exists but carries open output-drift and prefix-caching issues.
- **The model is two generations old.** Qwen3.6-27B and Qwen3.8-27B are architecture-compatible successors.

## Choosing a configuration

Start from what you're optimising for, not from someone else's headline:

| If you want | Do this |
|---|---|
| Maximum context, single user | vLLM, TP=2, FP8 KV. 262K fits with room to spare. |
| Fastest single-stream | vLLM with speculative decoding (MTP or DFlash). Expect large variance by content type. |
| Multi-user throughput | vLLM, TP=2, continuous batching. This is where the second card genuinely doubles output. |
| Simplest setup | llama.cpp — but expect ~41 t/s, no tensor-parallel benefit at batch=1, and **stay under 130K context**. |

Then measure, on your own prompts:

```bash
vllm bench serve --model <model> --dataset-name random \
  --random-input-len 8192 --random-output-len 512 --max-concurrency 1
```

Single-stream and batch numbers answer different questions, and prompt length changes both. A benchmark that doesn't state concurrency and input length isn't telling you enough to act on.

## Next steps

- The same maths for any model: [How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/)
- Model card and config: [Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B) — and check the current 27B before committing
- Cross-platform measurements with stated methodology: [BAEM1N/llm-bench](https://github.com/BAEM1N/llm-bench)
- Long-context correctness issue: [llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756)
- The post that prompted this guide: [[qwen-35-performance-breakthrough-170k-context|Qwen 3.5 27B Achieves 100+ Tokens/s Decode on Dual RTX 3090s]]
