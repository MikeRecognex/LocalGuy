---
title: "How Much Context Actually Fits in Your VRAM"
date: 2026-08-31
updated: 2026-08-31
description: "The KV cache arithmetic for any model, read straight from its config.json — plus the four architectures that break the standard formula, one of them by 57x."
tags:
  - vram-management
  - kv-cache
  - context-length
  - hardware
  - quantization
status: published
category: hardware
difficulty: intermediate
timeEstimate: "20 min"
---

"Will this model fit?" is the wrong question. The weights are the easy part — a quantised file has a size you can read off a directory listing. What actually decides whether you can run a model at the context length you need is the KV cache, and that number isn't printed anywhere. You have to compute it.

The good news: it's one formula, the inputs are all in the model's `config.json`, and the arithmetic outlives every model release. The catch is that four common architectures break the standard formula — one of them by a factor of 57.

> [!warning] Verified 31 August 2026
> Every figure below was computed from the published `config.json` of the named model, fetched at the date above. The script in this guide reproduces all of them, so you can re-run it against any model rather than trusting this table.

## The formula

Each token you generate appends a key and a value vector to the cache, in every layer that uses attention:

```
KV bytes per token = 2 (K and V) × kv_heads × head_dim × layers × bytes_per_element
```

Multiply by your context length and you have the cache size. At FP16, `bytes_per_element` is 2.

Three of those four inputs come straight out of `config.json`. The fourth is the one people get wrong.

### Getting `head_dim` right

Many configs simply don't include `head_dim`. When it's absent, derive it:

```
head_dim = hidden_size / num_attention_heads
```

Note it's `num_attention_heads` in that division, but `num_key_value_heads` in the formula above. Mixing them up is the single most common error, and on a GQA model it inflates your estimate by the GQA ratio — 4x, 8x, sometimes more.

### Why `kv_heads` is what matters

The gap between `num_attention_heads` and `num_key_value_heads` is grouped-query attention, and it is the reason modern models are usable at long context at all:

| Model | Attn heads | KV heads | KV per token |
|---|---|---|---|
| Phi-3-mini-4k | 32 | **32** (MHA) | 384 KiB |
| Mistral-7B-v0.3 | 32 | 8 | 128 KiB |
| Qwen2.5-7B-Instruct | 28 | 4 | 56 KiB |

Phi-3-mini is multi-head attention — every attention head keeps its own K and V. Had it used 8 KV heads instead of 32, its cache would drop from 384 to 96 KiB/token. That is the whole GQA trick, and it's why a 3.8B model can be more memory-hungry per token than a 7B one.

## Do it automatically

This reads any public model on the Hub and handles the special cases below:

```python
import json, sys, urllib.request

def load(model):
    url = f"https://huggingface.co/{model}/raw/main/config.json"
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8"})
    return json.loads(urllib.request.urlopen(req).read())

def kv_bytes_per_token(cfg, dtype_bytes=2):
    c = cfg.get("text_config", cfg)
    layers = c["num_hidden_layers"]

    # MLA (DeepSeek-style): one compressed latent per layer, not per head
    if "kv_lora_rank" in c:
        per_layer = c["kv_lora_rank"] + c.get("qk_rope_head_dim", 0)
        return per_layer * layers * dtype_bytes, "MLA"

    # Hybrid: only full-attention layers hold a cache that grows with context
    types = c.get("layer_types")
    caching = types.count("full_attention") if types else layers

    heads = c["num_attention_heads"]
    kv_heads = c.get("num_key_value_heads") or heads
    head_dim = c.get("head_dim") or c["hidden_size"] // heads
    kind = "MHA" if kv_heads == heads else "GQA"
    if types:
        kind = f"hybrid {kind} ({caching}/{layers} layers cache)"
    return 2 * kv_heads * head_dim * caching * dtype_bytes, kind

if __name__ == "__main__":
    cfg = load(sys.argv[1])
    bpt, kind = kv_bytes_per_token(cfg)
    c = cfg.get("text_config", cfg)
    native = c.get("max_position_embeddings", 0)
    print(f"{sys.argv[1]}  [{kind}]")
    print(f"  KV cache: {bpt/1024:.0f} KiB/token at FP16")
    for ctx in sorted({8192, 32768, 131072, native} - {0}):
        print(f"  {ctx//1024:>4}K context: {bpt*ctx/1024**3:6.2f} GiB"
              + ("   <- native max" if ctx == native else ""))
```

```
$ python3 kvcalc.py Qwen/Qwen3-8B
Qwen/Qwen3-8B  [GQA]
  KV cache: 144 KiB/token at FP16
     8K context:   1.12 GiB
    32K context:   4.50 GiB
    40K context:   5.62 GiB   <- native max
   128K context:  18.00 GiB
```

Gated repos (Llama, Gemma) return HTTP 401 without an authenticated token — fetch those configs from a local copy instead.

> [!warning] GiB, not GB — the difference is 7%
> This guide reports **GiB** (1024³), because that's what your GPU uses: `nvidia-smi` shows a "24GB" card as 24576 MiB. Model *file* sizes are usually quoted in decimal GB (10⁹), so mixing the two silently inflates your cache estimate by 7.4%. The same 262K cache is 16.00 GiB or 17.18 GB depending only on which unit you picked. Pick one — binary is the right choice when you're budgeting against a card.

## Verified reference table

| Model | Type | KV/token | @8K | @32K | @128K | @native |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct | GQA | 56 KiB | 0.44 GiB | 1.75 GiB | 7.00 GiB | 1.75 GiB (32K) |
| Qwen3.5-27B | hybrid | 64 KiB | 0.50 GiB | 2.00 GiB | 8.00 GiB | 16.00 GiB (256K) |
| DeepSeek-V3 | MLA | 69 KiB | 0.54 GiB | 2.14 GiB | 8.58 GiB | 10.72 GiB (160K) |
| Mistral-7B-v0.3 | GQA | 128 KiB | 1.00 GiB | 4.00 GiB | 16.00 GiB | 4.00 GiB (32K) |
| Qwen3-8B | GQA | 144 KiB | 1.12 GiB | 4.50 GiB | 18.00 GiB | 5.62 GiB (40K) |
| Phi-3-mini-4k | MHA | 384 KiB | 3.00 GiB | 12.00 GiB | 48.00 GiB | 1.50 GiB (4K) |

Read that table by column, not by row: a 27B model has a *smaller* cache per token than a 3.8B one, and DeepSeek-V3 — 61 layers and 128 attention heads — is cheaper per token than Mistral-7B. Parameter count tells you almost nothing about context cost.

## The four things that break the formula

### 1. Hybrid attention — most layers don't cache at all

Qwen3.5-27B declares 64 layers, but its config carries a `layer_types` array:

```
64 layers = 16 full_attention + 48 linear_attention
```

Linear-attention layers (Gated DeltaNet, Mamba-style) hold a **fixed-size recurrent state** rather than a cache that grows with context. Three quarters of this model costs the same at token 200,000 as at token 1. Apply the standard formula across all 64 layers and you get 256 KiB/token — **4x the true 64 KiB**, and a wrong conclusion about what hardware you need.

If `layer_types` exists, count only the `full_attention` entries.

### 2. MLA — the formula overestimates by 57x

DeepSeek-V3's config reports `num_key_value_heads: 128`, identical to its attention heads. Read naively that says MHA, and the formula returns **3,904 KiB/token** — nearly 4 MiB, which would make 32K context cost 122 GiB.

It actually uses Multi-head Latent Attention, which caches a single compressed latent per layer:

```
per layer = kv_lora_rank (512) + qk_rope_head_dim (64) = 576 elements
576 × 61 layers × 2 bytes = 69 KiB/token
```

That's **57x smaller** than the naive result. The tell is a `kv_lora_rank` key in the config — if it's present, ignore the head counts entirely.

### 3. Sliding-window attention that isn't switched on

Sliding-window attention caps the cache at the window size instead of growing with context, which sounds like a large saving. Check whether it's actually enabled. Qwen2.5-7B-Instruct ships:

```json
"sliding_window": 131072,
"use_sliding_window": false,
"max_position_embeddings": 32768
```

A declared window of 131072, disabled, on a model whose context is 32768 — the field is inert. Phi-3-mini, by contrast, has a real `sliding_window` of 2047 against a 4096 context, which genuinely halves its worst case.

Never read `sliding_window` without checking `use_sliding_window`.

### 4. `max_position_embeddings` is a ceiling, not a promise

It tells you what the architecture supports, not what your engine delivers. Long-context bugs are common and often silent — the [dual-3090 guide](/guides/qwen-27b-dual-3090-context-math/) documents an open llama.cpp issue where output past ~130K comes back empty with no error at all. Treat the native max as an upper bound to be tested, never assumed.

## Budgeting the whole card

KV cache is one of four claims on your VRAM:

| Component | How to size it |
|---|---|
| Weights | The file size of the quant you downloaded — convert to GiB if the Hub quoted decimal GB |
| KV cache | The formula above × your context |
| Activations / compute buffers | ~0.5–1 GiB, grows with batch size and prefill chunk |
| CUDA context + fragmentation | ~0.5–1 GiB per GPU, unavoidable |

A practical rule: budget **1–1.5 GiB of overhead per GPU**, then spend what's left on weights and cache.

Worked example, a 24 GB card — 24576 MiB, so 24.0 GiB — with a Q4 8B model whose file is 4.7 GiB (listed as ~5.0 GB on the Hub, which is the same file):

```
24.0 GiB card
−  1.2 GiB overhead
−  4.7 GiB weights
= 18.1 GiB available for KV
```

At 144 KiB/token that's roughly 128K tokens of context — except Qwen3-8B's native max is 40K, so the model runs out of architecture before you run out of memory. Which is the useful kind of answer: your limit here isn't VRAM.

Run the same sum for Phi-3-mini at 384 KiB/token and 18.1 GiB buys you about 48K tokens — on a model capped at 4K.

## Halving it with KV quantization

The cache scales linearly with `bytes_per_element`, so FP8 halves it and 4-bit quarters it:

| Model @ 128K | FP16 | FP8 | Q4 |
|---|---|---|---|
| Qwen3.5-27B | 8.00 GiB | 4.00 GiB | 2.00 GiB |
| Mistral-7B-v0.3 | 16.00 GiB | 8.00 GiB | 4.00 GiB |

In vLLM that's `--kv-cache-dtype fp8`; in llama.cpp, `--cache-type-k` and `--cache-type-v`.

> [!note] Quantize K more cautiously than V
> The two are not equally tolerant — keys are generally more sensitive to quantization error than values, so `q8_0` keys with `q4_0` values is a more conservative trade than quantizing both hard. Test retrieval quality at your actual context length before committing; the failure mode is degraded recall, not a crash.

## Check the arithmetic against reality

The maths tells you what should fit. It does not tell you that your engine handles it correctly. Before you build on a context length:

```bash
vllm bench serve --model <model> --dataset-name random \
  --random-input-len 131072 --random-output-len 512 --max-concurrency 1
```

Then do a retrieval check — plant a specific fact at the start of a full-length prompt and ask for it at the end. A model that loads at 128K and returns fluent text is not evidence that it can *use* 128K. Silent long-context failures are the norm, not the exception.

## Next steps

- The worked case on real hardware: [What Actually Fits on Dual RTX 3090s](/guides/qwen-27b-dual-3090-context-math/)
- Any model's config: `https://huggingface.co/<org>/<model>/raw/main/config.json`
- If your bottleneck turns out to be speed rather than capacity, the constraint is memory bandwidth, not VRAM — the dual-3090 guide works through that roofline.
