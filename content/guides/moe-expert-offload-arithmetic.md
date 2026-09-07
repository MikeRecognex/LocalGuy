---
title: "MoE Expert Offload: What a 35B Model Actually Costs on a 12GB Card"
date: 2026-09-07
updated: 2026-09-07
description: "92.9% of Qwen3.6-35B-A3B is routed expert weights, and only 3.1% of them are read per token — which is why a 19 GiB model runs on 12 GB at all. The roofline arithmetic for expert offload, and why the same sum that permits 50 tok/s at 8K refuses it at 128K."
tags:
  - mixture-of-experts
  - vram-management
  - cpu-inference
  - memory-bandwidth
  - llama-cpp
  - qwen
status: published
category: hardware
difficulty: advanced
timeEstimate: "25 min"
---

A claim doing the rounds: *Qwen3.6-35B-A3B on an RTX 3060 with 12GB, 50 tok/s with a 128k context.*

The instinct is to reject it. A 35B model at 4-bit is 19 GiB of weights and the card holds 12 GB. But the instinct is wrong, and the reason it's wrong is the most useful thing to understand about MoE models on small cards: **a mixture-of-experts model separates the number of weights you must store from the number you must read.** Reasoning from one to the other is what makes these claims look impossible when they aren't — and, further down, what makes a different part of this same claim impossible when it looks fine.

This guide does the arithmetic. Everything here derives from the published `config.json`, measured GGUF file sizes and vendor bandwidth specs, so you can redo it for any MoE model you're considering.

> [!note] Verified 7 September 2026
> Architecture numbers are from the published `config.json`. File sizes are real byte counts from the Hugging Face API, not estimates from parameter count. Where I project throughput, I say so and show the inputs — **I have not run this model on a 3060**, and no measured figure below is mine.

## Residency and traffic are different numbers

Every dense model collapses these into one. A dense 27B reads all 27B of its weights for every token it generates, so "what must be resident" and "what must be read per token" are the same quantity, and you can reason from tok/s back to VRAM. A guide on this site already flags what happens when people carry that habit across to MoE — [Qwen3-Omni](/guides/qwen3-omni-audio-vision-llama-cpp/) puts it as *"all 30B of weights must be resident; only the compute is sparse."*

That framing is right for a card big enough to hold the model. Below that threshold it needs one more step, because **residency is negotiable in a way that traffic is not**. Weights the model rarely reads don't have to sit in VRAM. They have to sit *somewhere you can reach*, and how fast you can reach it is what sets your ceiling.

So for any MoE model there are four numbers, not one:

| | What it governs |
|---|---|
| **Total weights** | Whether it fits on disk and in RAM |
| **Routed expert weights** | The part that is offloadable |
| **Weights read per token** | Your decode roofline |
| **Expert weights read per token** | The part of that roofline that runs at host speed |

For a 3B-active model the last number is small, and that is the whole game.

## Reading the split out of config.json

The routed-expert share is three multiplications. From [the published config](https://huggingface.co/Qwen/Qwen3.6-35B-A3B/raw/main/config.json):

| | |
|---|---|
| Layers | 40 — **10 full attention, 30 linear** (`full_attention_interval: 4`) |
| `num_experts` / `num_experts_per_tok` | **256 / 8** |
| `hidden_size` / `moe_intermediate_size` | 2048 / **512** |
| `shared_expert_intermediate_size` | 512 — there *is* an always-on shared expert |
| KV heads / head dim | 2 / 256 |
| `vocab_size`, `tie_word_embeddings` | 248,320, **false** |
| `vision_config` | **present** |

Routed expert parameters are `num_experts × 3 × hidden_size × moe_intermediate_size × layers` — the 3 being the gate, up and down projections in each expert:

```bash
curl -sL https://huggingface.co/Qwen/Qwen3.6-35B-A3B/raw/main/config.json \
  | python3 -c "
import json,sys
t=json.load(sys.stdin)['text_config']
L,H=t['num_hidden_layers'],t['hidden_size']
E,K,M=t['num_experts'],t['num_experts_per_tok'],t['moe_intermediate_size']
exp=E*3*H*M*L
print(f'routed experts  {exp/1e9:6.2f}B')
print(f'active per token {K/E*exp/1e9:6.3f}B  ({100*K/E:.1f}% of them)')
print(f'full-attn layers {t[\"layer_types\"].count(\"full_attention\")} of {L}')
"
# routed experts   32.21B
# active per token  1.007B  (3.1% of them)
# full-attn layers 10 of 40
```

Against a true total of **34.69B** parameters — derived from the 64.61 GiB BF16 file, not from the model's name — that gives:

| Component | Params | Share |
|---|---|---|
| **Routed experts** | **32.21B** | **92.9%** |
| Attention + norms | 1.31B | 3.8% |
| Embeddings (in + out, untied) | 1.02B | 2.9% |
| Shared expert | 0.13B | 0.4% |
| Router | 0.02B | 0.1% |

**Nearly the entire model is routed experts, and 96.9% of those are idle on any given token.** Everything else — 2.47B parameters — is read every token and must stay on the GPU.

Add it up as bytes-read-per-token: 1.007B of routed experts, plus the 2.47B dense part minus the input embedding table (you read one row), minus nothing else. That's **2.97B parameters read per token**, which is where the "A3B" comes from. The label is a traffic number. It was never a residency number.

## What actually fits

Real byte counts, not estimates:

| Quant | ggml-org | unsloth (UD) | bits/weight |
|---|---|---|---|
| BF16 | 64.61 GiB | 64.62 GiB | 16.00 |
| Q8_0 | 34.37 GiB | 34.37 GiB | 8.51 |
| **Q4_K_M** | **19.02 GiB** | 20.61 GiB | **4.71** |
| UD-IQ4_XS | — | 16.51 GiB | 4.09 |
| UD-Q3_K_XL | — | 15.69 GiB | 3.89 |
| UD-IQ3_XXS | — | 12.30 GiB | 3.05 |
| UD-Q2_K_XL | — | 11.45 GiB | 2.84 |

```bash
curl -s "https://huggingface.co/api/models/ggml-org/Qwen3.6-35B-A3B-GGUF?blobs=true" \
  | python3 -c "import json,sys; [print(f\"{f['rfilename']:52s} {f['size']/2**30:6.2f} GiB\") \
    for f in json.load(sys.stdin)['siblings'] if f.get('size') and f['rfilename'].endswith('.gguf')]"
```

Two things worth noting before you pick one.

**Unsloth is *bigger* than ggml-org here** — 20.61 GiB against 19.02 GiB for the same Q4_K_M name, a 1.6 GiB spread. That is the reverse of the pattern on [Qwen3.8-27B](/guides/qwen-3-8-27b-quantization-backend-choice/), where UD quants ran 1.3–1.5 GiB *smaller* than the alternative. Don't carry a repo preference between models; check the sizes each time.

**There are three extra files in this repo you may need to budget for**, and most VRAM tables ignore all of them:

| File | Size | When you need it |
|---|---|---|
| `mmproj-*-F16` | 0.84 GiB | Any image or video input — `vision_config` is present, this is a VLM |
| `mtp-*-Q4_0` | 0.99 GiB | Multi-token-prediction speculative decoding |
| `dflash-*-Q8_0` | 0.39 GiB | DFlash speculative decoding |

Splitting the 19.02 GiB Q4_K_M by the parameter shares above puts roughly **17.7 GiB in routed experts and 1.4 GiB in everything else**. That split assumes uniform bits per weight, which `_K` quants deliberately violate — they spend more precision on attention and the output head — so treat it as ±0.3 GiB. Nothing below turns on the third digit.

## On a small card, VRAM is a cache — not storage

Here is the reframe that makes expert offload make sense. You are not trying to fit 19.02 GiB into 12 GB. You are choosing what to keep in the fast tier:

- **1.4 GiB of dense weights** must be resident. They are read every token; putting them on the host would cost more than everything else combined.
- **17.7 GiB of routed experts** is a working set. Whatever fraction fits in what's left is a cache; the rest is fetched at host speed.

So the budget on a 12 GB card, calling it 11.0 GiB usable after display and CUDA context:

| | 8K context | 128K context |
|---|---|---|
| Dense weights | 1.40 GiB | 1.40 GiB |
| KV cache (FP16) | 0.16 GiB | **2.50 GiB** |
| Recurrent state, 30 linear layers | 0.06 GiB | 0.06 GiB |
| Compute buffers | 0.70 GiB | 0.70 GiB |
| **Left for expert cache** | **8.73 GiB** | **6.38 GiB** |
| **Experts resident** | **49%** | **36%** |

The KV cache is small because only 10 of 40 layers cache at all — `2 × 2 KV heads × 256 head_dim × 10 layers × 2 bytes` = **20 KiB per token**, so even 128K costs 2.50 GiB. On a conventional 40-layer transformer the same context would be several times that. (For the general formula and the architectures that break it, see [How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/).)

That cheapness is exactly why the 128K half of the claim sounds reasonable. Hold that thought.

## The decode roofline

Single-stream decode is bandwidth-bound: the time per token is the time to read the bytes. With weights in two tiers, add the tiers:

```
              dense bytes     h × expert bytes     (1−h) × expert bytes     KV bytes
seconds/tok = ───────────  +  ────────────────  +  ────────────────────  +  ────────
                BW_vram           BW_vram                BW_host            BW_vram
```

where `h` is the fraction of expert reads served from the VRAM cache. Per token this model reads **1.16 GB dense and 0.59 GB of experts**. For the hardware in the claim:

- **RTX 3060 12GB**: 192-bit GDDR6 at 15 Gbps = **360 GB/s**
- **DDR5-6000, dual channel**: 96 GB/s peak, call it **65 GB/s** realised

| | dense | experts (VRAM) | experts (host) | KV | total | **ceiling** |
|---|---|---|---|---|---|---|
| **8K**, h=49% | 3.22 ms | 0.81 ms | 4.61 ms | 0.47 ms | 9.11 ms | **110 t/s** |
| **128K**, h=36% | 3.22 ms | 0.59 ms | 5.82 ms | **7.46 ms** | 17.09 ms | **59 t/s** |

Two results fall out, and they point in opposite directions.

**At short context, 50 tok/s is entirely credible.** The ceiling is 110 t/s and 50 is 45% of it. Hybrid CPU/GPU inference lands well below roofline — the best pure-GPU dense measurement on this site is 41.4 t/s against a 59.6 t/s ceiling, [69%](/guides/qwen-27b-dual-3090-context-math/), and hybrid is worse for reasons in the next section — so 45% is an unremarkable place to land. Nothing about this claim needs debunking.

**At 128K it is not, and this doesn't depend on any efficiency assumption.** The ceiling itself falls to 59 t/s, so 50 tok/s would demand **85% of roofline** — higher than the best figure on this site for an easier, pure-GPU workload. The reason is the row nobody includes: at 128K you re-read the entire 2.50 GiB KV cache every token, and on a 360 GB/s card that alone is **7.46 ms**, more than all the expert traffic combined. Long context doesn't just consume VRAM. It consumes bandwidth, on every single token.

> [!warning] The two halves of the claim describe different runs
> "50 tok/s" and "128k context" are individually defensible and jointly not. A decode rate measured at short context does not survive being quoted next to a maximum context length. Whenever you see throughput and context in the same sentence, ask whether they were measured in the same run.

The one honest escape is speculative decoding, and it changes the picture completely: this repo ships MTP and DFlash heads, and on [dual 3090s](/guides/qwen-27b-dual-3090-context-math/) speculative decoding took a 27B from 46 t/s to 121–133 t/s. Verifying several tokens per KV pass amortises exactly the cost that dominates at 128K. If the poster is running DFlash, 50 t/s at long context is reachable — but the 0.39–0.99 GiB head comes out of the expert cache, and "50 tok/s" then describes a different configuration from the one most readers will build.

## Why letting the CPU do the work beats shipping weights to the GPU

There are two ways to run experts you can't fit, and the slower one is the obvious one.

**Stream the weights to the GPU.** Expert tensors live in host RAM and get uploaded before the `MUL_MAT_ID` that consumes them. Traffic crosses PCIe — 4.0 x16 is ~25 GB/s realised.

**Compute the experts on the CPU** (`--n-cpu-moe`). Expert weights stay in system RAM and the CPU reads them at DDR bandwidth, ~65 GB/s. Only activations cross PCIe, and an activation is a 2048-element vector — kilobytes, against hundreds of megabytes of weights.

The second is roughly 2.6× better on a normal desktop, because **DDR is faster than PCIe and the CPU sits closer to it than the GPU does**. The rule of thumb: move the activations to the weights, not the weights to the activations. This is why `--n-cpu-moe` exists and why it is the first flag to reach for.

The exception is a machine where the host memory is slow — single-channel, or DDR4 — in which case the two paths converge and neither is good. Measure your actual streaming bandwidth before assuming the 65 GB/s above; it is the single input the whole roofline is most sensitive to.

## Prefill is the number nobody quotes

Decode reads 3.1% of the experts per token. **Prefill reads nearly all of them.** A batch of 512 tokens, each routing to 8 of 256 experts, touches essentially the full set at every layer — so each chunk must pull whatever isn't cached across the slow link.

At 128K with 36% cached, that is 11.3 GiB from the host per chunk:

| Batch size | Chunks | Pure host traffic |
|---|---|---|
| `-b 512` | 256 | **47.7 s** |
| `-b 2048` | 64 | **11.9 s** |

That is bandwidth time alone, before compute, and it is a floor rather than an estimate. **Time-to-first-token on a full 128K prompt is tens of seconds at best.** A "50 tok/s" figure quoted alongside 128K implies you are waiting somewhere north of half a minute before that rate means anything.

Two consequences worth acting on:

**Raise `-b`/`-ub` for prefill.** Expert reads amortise across the batch — four times the batch, a quarter of the passes. Decode is batch-1 and cannot amortise at all, which is why the same flag that transforms prefill does nothing for generation.

**The upload isn't overlapped with compute.** [llama.cpp#28414](https://github.com/ggml-org/llama.cpp/issues/28414), open since 4 September 2026, states it directly: the scheduler uploads each expert tensor immediately before the split that consumes it, and in the single-context case that transfer doesn't overlap, so *"long-prompt prefill TTFT is dominated by this serial upload cost."* The proposed fix issues uploads one split ahead on a second stream. Until it lands, the table above is optimistic.

## Known rough edges

Expert offload is a young code path. All open as of 7 September 2026:

| Issue | What bites |
|---|---|
| [llama.cpp#27872](https://github.com/ggml-org/llama.cpp/issues/27872) | **`--fit` silently gives up when `--cpu-moe`/`--n-cpu-moe` is set** — it logs a warning, not an error, then loads with unfitted parameters and OOMs later at compute-buffer allocation. The visible failure is nowhere near the cause |
| [llama.cpp#28414](https://github.com/ggml-org/llama.cpp/issues/28414) | Host→device expert uploads are not overlapped with compute; dominates long-prompt TTFT |
| [llama.cpp#28223](https://github.com/ggml-org/llama.cpp/issues/28223) | `-ot "...=CUDA_Host"` is rejected outright — host buffer types aren't offered as `-ot` targets, and under mmap the loader downgrades them anyway. The patch reports prefill going 166 → 330 t/s cold on 2× 3090 with 40 expert layers on the host |
| [llama.cpp#28185](https://github.com/ggml-org/llama.cpp/issues/28185) | `--tensor-split` with `--n-cpu-moe` intermittently degenerates into repetitive output on long multi-turn context — reproduced from raw API calls, so not a client bug |
| [llama.cpp#27987](https://github.com/ggml-org/llama.cpp/issues/27987) | `--n-cpu-ffn` offloads layers sequentially from layer 0, which is not the best set to pick — see below |

That first one deserves emphasis. `--fit` is the flag people use *because* they are near a memory limit, and combining it with expert offload disables it without stopping.

> [!tip] Which layers you offload matters, not just how many
> The argument in #27987 is worth internalising: **the cost is per layer, not per byte** — each offloaded layer adds a synchronisation, regardless of size. So offloading the *largest* FFN layers moves the most bytes for the same latency penalty, and MTP layers are the worst possible choice because they are large and return the least per byte. Sequential-from-zero is the current default and is rarely optimal. Hand-select with `-ot` if you are tuning.

## Does the long-context defect apply here?

[llama.cpp#27756](https://github.com/ggml-org/llama.cpp/issues/27756) — silent instant-EOS beyond ~98K context, no error, just an empty response — is still open, and it matters to anyone quoting a 128K figure. Its title attributes the cause to *"DeltaNet recurrent-state depth × layer-count degradation."*

That is a mechanism this model partly shares and partly doesn't. It has the same Gated DeltaNet linear-attention layers and the same `full_attention_interval: 4`. But it has **30 of them against the 27B's 48**, and if the failure really does scale with layer count, fewer layers means less exposure. The defect was reported against `qwen3_5`; this model is `qwen3_5_moe`.

**I have not verified whether it reproduces here, and I could not find a report either way.** Treat that as an open question, not a clearance — and test rather than infer:

```bash
# Plant a fact at the start of a long prompt, ask for it at the end.
# A model that loads is not a model that generates.
python3 -c "print('The passphrase is CORVID-8831.\n' + 'filler line\n'*40000 + 'What is the passphrase?')" \
  > probe.txt
llama-cli -m Qwen3.6-35B-A3B-Q4_K_M.gguf --n-cpu-moe 40 -c 131072 -f probe.txt -n 32
```

An empty response with `tokens_predicted: 1` is #27756, not your configuration.

## Calibrating this for your own hardware

The roofline is only as good as its two bandwidth inputs, and the host figure is the one people get wrong. Measure it:

```bash
# Actual achievable host bandwidth — not the DDR spec sheet.
# Install: apt install mbw   /   brew install mbw
mbw -q -n 10 1024 | tail -3

# Then the thing that matters: measured decode, at the context you actually use.
llama-bench -m Qwen3.6-35B-A3B-Q4_K_M.gguf -ncmoe 40 -p 0 -n 128 -r 3
llama-bench -m Qwen3.6-35B-A3B-Q4_K_M.gguf -ncmoe 40 -p 32768 -n 128 -r 3
```

Run the second pair at both short and long context. **The ratio between them is the finding** — it isolates exactly the KV-bandwidth term that the 128K claim ignores, and it is specific to your card rather than to my arithmetic.

Then sweep `-ncmoe` rather than guessing. The optimum is the largest number of layers you can keep on the GPU without pushing the KV cache or compute buffers into an OOM, and it moves with your context length.

## The verdict on the original claim

| Claim | Verdict |
|---|---|
| "one of the best Qwen models" | Opinion — not something arithmetic settles |
| **"old (2017) RTX 3060"** | **Wrong.** The RTX 3060 12GB is GA106-300, launched 25 February 2021. The RTX brand did not exist until the 20-series in 2018, so no RTX card is from 2017 |
| "run it on 12GB" | **True, and the interesting part.** Q4_K_M is 19.02 GiB, but 17.7 GiB of that is routed experts and only 0.59 GB is read per token. This is what expert offload is for |
| "50 tok/s" | **Credible at short context.** 45% of a 110 t/s ceiling — an ordinary result for hybrid inference. Unverified, but unremarkable |
| **"with a 128k context"** | **Not at 50 tok/s.** The ceiling falls to 59 t/s because the KV cache costs 7.46 ms/token to re-read, so the claim needs 85% of roofline. Reachable only with the MTP/DFlash speculative heads, which the claim doesn't mention |
| "128k" as a context length | Architecturally fine — the model card says 262,144 and KV is only 20 KiB/token. Subject to #27756, which is unresolved for this architecture |

The claim is not absurd. It is two measurements from two different runs, quoted as one — plus a GPU that is four years younger than advertised.

## Next steps

- The config this all derives from: [Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- Real quant sizes: [ggml-org](https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF) and [unsloth](https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF) GGUF repos
- KV cache arithmetic for any architecture: [How Much Context Actually Fits in Your VRAM](/guides/how-much-context-fits-vram/)
- Where the roofline method and the 69%-of-ceiling figure come from: [What Actually Fits on Dual RTX 3090s](/guides/qwen-27b-dual-3090-context-math/)
- Why `--n-cpu-moe` does nothing on a dense model: [Choosing a Qwen3.8-27B Quantization and Backend](/guides/qwen-3-8-27b-quantization-backend-choice/)
- A working MoE offload configuration on a different model: [Running Qwen3-Omni with Audio and Vision on llama.cpp](/guides/qwen3-omni-audio-vision-llama-cpp/)
- Measured expert caching in the wild: [[hot-experts-vram-dynamic-cache-qwen-llama-cpp|Hot Experts in VRAM: Dynamic Expert Caching]] — 15 → 23 tok/s on a 122B-A10B, the closest measured analogue to the setup above
- Engines built around this trade: [[freetoken-edge-moe-serving-bandwidth-adaptive|FreeToken: Edge-Native MoE Serving with CPU-GPU Co-Execution]] and [[krasis-hybrid-moe-runtime-3324-tokens-per-second|Krasis Hybrid MoE Runtime]] — both currently report their own numbers, unverified here
- When offload runs out of road: [[fomoe-400b-moe-inference-budget-hardware|FoMoE: 400B MoE Inference on Budget Hardware]] — 5–9 tok/s once experts spill to NVMe
