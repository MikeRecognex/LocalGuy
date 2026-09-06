---
title: "Running Qwen3-Omni With Audio and Vision in llama.cpp"
date: 2026-09-06
updated: 2026-09-06
description: "One mmproj carries both encoders, --image and --audio are the same flag, and speech output does not work at all. The verified commands, real file sizes and open bugs for the only open-weights omni model."
tags:
  - qwen3-omni
  - multimodal
  - audio-processing
  - llama-cpp
  - gguf
status: published
category: deployment
difficulty: intermediate
timeEstimate: "20 min"
---

llama.cpp has supported Qwen3-Omni's audio *and* vision input since April 2026. The official documentation for this consists of two lines in `docs/multimodal.md` — the repo name and the comment `# Capabilities: audio input, vision input`. There is not a single audio example anywhere in that file.

This guide fills that in: the commands that work, the file sizes that decide whether it fits, the three flag behaviours that aren't documented outside the source, and the one thing everybody assumes works that doesn't.

> [!warning] Speech output does not work in llama.cpp
> Qwen3-Omni is a Thinker-Talker model and the Talker is not implemented. You get audio **in**, not audio **out**. This is the single most common misconception about running Omni locally, and the section below explains why it is harder than it looks. If you need speech synthesis from this model, you need vLLM-Omni.

## First, the model landscape — because the search results are wrong

Qwen3-Omni-30B-A3B was released in **September 2025**. It is a 30B-total / 3B-active MoE, and as of today it is **still the newest open-weights omni model Alibaba has published.**

| Repo | Released |
|---|---|
| [`Qwen/Qwen3-Omni-30B-A3B-Instruct`](https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct) | 20 Sep 2025 |
| [`Qwen/Qwen3-Omni-30B-A3B-Thinking`](https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Thinking) | 15 Sep 2025 |
| [`Qwen/Qwen3-Omni-30B-A3B-Captioner`](https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Captioner) | 15 Sep 2025 |

**There is no Qwen3.5-Omni, Qwen3.6-Omni or Qwen3.8-Omni.** Qwen3.5 (Feb 2026), Qwen3.6 (Apr 2026) and Qwen3.8 (Aug 2026) are text-only families. Qwen's post-Omni multimodal releases have been Qwen3-VL, Qwen3-TTS and Qwen3-ASR — separate models for separate modalities, not a new omni model.

This matters because there are confident, well-ranked blog posts describing deployment of a "Qwen3.5-Omni" that does not exist. Hugging Face repos matching those names are community merges and finetunes using "Omni" as a branding word. If a guide offers you a Qwen3.8-Omni, close the tab.

Verify the release list yourself:

```bash
curl -s "https://huggingface.co/api/models?author=Qwen&search=Omni" \
  | python3 -c "import json,sys; [print(m['modelId']) for m in json.load(sys.stdin)]"
```

## What actually fits

Real byte sizes from the Hugging Face blobs API, not estimates from parameter count. Both official GGUF repos were created on **13 April 2026**, the day after support merged.

[`ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF`](https://huggingface.co/ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF):

| File | Size |
|---|---|
| `Qwen3-Omni-30B-A3B-Instruct-Q4_K_M.gguf` | **17.28 GiB** |
| `Qwen3-Omni-30B-A3B-Instruct-Q8_0.gguf` | 30.25 GiB |
| `Qwen3-Omni-30B-A3B-Instruct-bf16.gguf` | 56.90 GiB |
| `mmproj-...-Q8_0.gguf` | **1.23 GiB** |
| `mmproj-...-bf16.gguf` | 2.06 GiB |

The Thinking repo has a byte-identical size profile. Reproduce for any repo:

```bash
curl -s "https://huggingface.co/api/models/ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF?blobs=true" \
  | python3 -c "import json,sys; [print(f\"{f['rfilename']:52s} {f['size']/2**30:6.2f} GiB\") \
    for f in json.load(sys.stdin)['siblings'] if f.get('size') and f['rfilename'].endswith('.gguf')]"
```

**The practical configuration is Q4_K_M + Q8_0 mmproj = ~18.5 GiB resident**, before KV cache. That wants a 24GB card, or a 32GB+ unified-memory Mac. It does not fit 16GB.

Because it is a **3B-active MoE**, the speed story is much better than 30B suggests — but the memory story is not. All 30B of weights must be resident; only the compute is sparse. This is the opposite trade from a dense 27B, and it catches people who reason from tok/s to VRAM.

> [!tip] MoE offload does apply here
> Unlike the dense Qwen3.8-27B — where `--n-cpu-moe` is [the wrong advice](/guides/qwen-3-8-27b-quantization-backend-choice/) — Qwen3-Omni genuinely is MoE, so expert offload flags are live options if you are short on VRAM.

## One mmproj holds both encoders

There is one projector file per quant level, and it carries the vision encoder *and* the audio encoder. There is no separate audio projector to download — a reasonable assumption that costs people time.

This is structural, not incidental. From `convert_hf_to_gguf.py`'s Qwen3-VL conversion path:

```python
@ModelBase.register("Qwen3OmniMoeForConditionalGeneration")
class Qwen3OmniMmprojModel(Qwen3VLVisionModel, Qwen25AudioModel):
    has_audio_encoder = True
```

It multiply-inherits from both the vision model and the audio model, consumes `thinker.audio_tower.*` and `visual.*` tensors from the same checkpoint, and writes a single projector of type `QWEN3A`. At runtime `tools/mtmd/mtmd.cpp` exposes `cap.inp_audio` and `cap.inp_vision` from that one context.

So: one `--mmproj`, both modalities, always.

## `--image` and `--audio` are the same flag

Not aliases in spirit — literally one option with two spellings. From `llama-mtmd-cli --help` on a local build:

```
--image, --audio FILE                   path to an image or audio file. use with multimodal models, use
                                        comma-separated values for multiple files
```

One entry, one description, one destination. Three consequences:

1. **Mixing modalities in one invocation is expected**, not a special case. Pass `--image photo.jpg --audio speech.wav` and both land in the same list.
2. **The file type is sniffed, not declared.** `--audio photo.jpg` works fine. Which also means a typo'd path won't tell you which modality you meant.
3. **Comma-separated values work** for multiple files: `--audio a.wav,b.wav`.

Related flags worth knowing: `-mm` is short for `--mmproj`; `-mmu`/`--mmproj-url` fetches one; `--no-mmproj-offload` keeps the projector off the GPU; `-mmdev`/`--mmproj-device` pins it.

> [!note] `--video` on newer builds
> Current master registers the option as `{"--image", "--audio", "--video"}` — a third spelling of the same flag. It is **not** present in build 8680, which is what Homebrew was shipping when this was written. Check your own `--help` before scripting against it.

## The commands

Simplest path — resolves both the model and the mmproj automatically:

```bash
llama-server -hf ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF
```

Explicit local files, one image and one audio clip in a single turn:

```bash
llama-mtmd-cli \
  -m Qwen3-Omni-30B-A3B-Instruct-Q4_K_M.gguf \
  --mmproj mmproj-Qwen3-Omni-30B-A3B-Instruct-Q8_0.gguf \
  -c 8192 \
  --audio speech.wav \
  --image photo.jpg \
  -p "Describe what you hear and what you see."
```

Omit `-p` and the CLI drops into chat mode. Omit `--mmproj` only when you are using `-hf`.

Through the server, audio goes over the OpenAI-compatible `input_audio` content part as base64 plus a `format` field — the same shape as OpenAI's own audio API.

## Gotchas that cost real time

**The architecture reports as `qwen3vlmoe`, not `qwen3omnimoe`.** This is why you may see `unknown model architecture: 'qwen3omnimoe'` from older builds or third-party conversions. If you hit it, the GGUF was converted with the wrong path or your build predates support — not a model problem.

**Audio longer than 30 seconds used to lose its tail.** The mel pipeline chunks Whisper-style, and until [#22591](https://github.com/ggml-org/llama.cpp/issues/22591) (opened 1 May 2026, fixed 7 May) the trailing partial chunk was silently dropped in both `llama-server` and `llama-mtmd-cli`. Silently — the model just answered as though the last part hadn't happened. Fixed, but if you are on an older build this is your bug.

**The WebUI microphone button was broken for two weeks in April.** [#21900](https://github.com/ggml-org/llama.cpp/issues/21900), fixed by PR #22480 on 30 April. File upload worked throughout, which made it read as a hardware permissions problem.

**Sample rate handling is unverified.** `mtmd_get_audio_sample_rate()` exists in the API and the pipeline is Whisper-style, which implies 16 kHz. I could not find a definitive resampling path in the source, and I have not tested it. Resample to 16 kHz mono yourself before assuming:

```bash
ffmpeg -i input.m4a -ar 16000 -ac 1 -c:a pcm_s16le speech.wav
```

## The open bug you should know about before you start

[**llama.cpp#27136 — "Audio not working with `ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF`"**](https://github.com/ggml-org/llama.cpp/issues/27136), opened 15 August 2026. **Open, zero comments, no maintainer triage** as of 6 September.

The reporter posts a WAV to `llama-server` via the OpenAI `input_audio` API and gets an empty response back. Their launch line includes `-ctk q4_0 -ctv q4_0 --flash-attn on`, so a quantised KV cache is a plausible culprit rather than a genuine regression in the audio path — but that is a hypothesis, not a finding, and nobody has tested it either way.

> [!warning] Not reproduced here
> This guide was assembled from primary sources — merged PRs, the conversion and argument-parsing source, the HF blobs API, and the issue tracker. The flag behaviour and build version were verified on a local llama.cpp 8680. **The 18.5 GiB model itself was not run**, so #27136 is reported, not confirmed. If you hit an empty response with audio, drop `-ctk`/`-ctv` to `f16` first and please add your result to that issue — it has had no engagement in three weeks.

Also still open: [#17422](https://github.com/ggml-org/llama.cpp/issues/17422), `llama-server` crashing during `encoding image slice`, since November 2025.

## Why there is no speech output

The Talker is not a missing feature flag. It is a structural gap in `mtmd`, tracked at [#21956 "(Planning) Support audio output in mtmd"](https://github.com/ggml-org/llama.cpp/issues/21956) — opened 15 April 2026, **still open**, 27 comments, last touched 1 September. It remains a design discussion.

Maintainer Xuan-Son Nguyen has named Omni specifically as one of the hard cases:

> Some models like the qwen-omni family or sesame CSM requires passing the embedding vectors (float values) between LLM and audio generation model, instead of passing raw token IDs

That is the crux. `mtmd`'s pipeline is built around token IDs crossing the boundary between models. Omni's Talker needs continuous embeddings from the Thinker. Supporting it means changing the interface, not adding a decoder.

**Do not be misled by Qwen3-TTS support.** [PR #26254](https://github.com/ggml-org/llama.cpp/pull/26254) merged on 4 August 2026 and added genuine `code2wav` waveform generation to `mtmd.cpp` — so llama.cpp *can* emit audio now. But that path serves Qwen3-TTS only, runs through the `llama-tts` binary, and is not wired into `llama-server`. It is not a step toward Omni's Talker. If you want text-to-speech locally, use Qwen3-TTS directly and treat it as a separate model in a pipeline.

## If llama.cpp isn't the right fit

| Backend | Audio in | Vision in | Speech out | Verdict |
|---|---|---|---|---|
| **llama.cpp** | Yes | Yes | **No** | Best consumer-hardware path; one untriaged audio bug |
| **vLLM-Omni** | Yes | Yes | **Yes** | The only complete option. GPU-heavy |
| **transformers** | Yes | Yes | Yes | Reference implementation; Qwen's own README calls MoE inference "very slow" |
| **MLX** (`mlx-vlm`) | Partial | Yes | Talker ported | Real work, but the audio path is still shaking out |
| **Ollama** | **No** | **No** | No | Unsupported |

**vLLM-Omni** is the full-fat option:

```bash
vllm serve Qwen/Qwen3-Omni-30B-A3B-Instruct --omni --port 8091
```

One non-obvious detail from [the vLLM-Omni docs](https://docs.vllm.ai/projects/vllm-omni/en/latest/user_guide/examples/online_serving/qwen3_omni/): generated audio comes back on the **second** choice, not the first.

```bash
jq -r '.choices[1].message.audio.data' response.json | base64 -d > output.wav
```

If you read `choices[0]` you get the text and conclude audio output is broken.

**MLX** has the architecture genuinely ported — `mlx_vlm/models/qwen3_omni_moe/` contains `audio.py`, `vision.py`, `thinker.py`, `talker.py` and `code2wav.py`, so the Talker is there. But the audio path has been rough: [#2099](https://github.com/Blaizzy/mlx-vlm/issues/2099) (GPU address fault when audio and video are passed together, 30 Aug, open), [#1768](https://github.com/Blaizzy/mlx-vlm/issues/1768) (audio over ~30s degenerates to special tokens, open), [#1619](https://github.com/Blaizzy/mlx-vlm/issues/1619) (multimodal RoPE delta lost during decode, open). Recently-closed ones give the flavour: a 15-second clip once triggered a **78 GB Metal allocation** because the audio attention mask was sized in raw samples rather than mel frames.

**Ollama has no support at all.** `ollama.com/library/qwen3-omni` returns 404, and [issue #12376](https://github.com/ollama/ollama/issues/12376) has been open since 23 September 2025 — nearly a year.

## How to choose

| If you want | Do this |
|---|---|
| Audio + vision understanding on a 24GB card | **llama.cpp**, `Q4_K_M` + `Q8_0` mmproj, KV cache at `f16` until #27136 is understood |
| Speech output from Omni | **vLLM-Omni**, and read `choices[1]` |
| Text-to-speech only | **Qwen3-TTS** via `llama-tts` — a separate model, and it works today |
| Speech-to-text only | **Qwen3-ASR-0.6B/1.7B** — also enabled by the same PR, and far smaller |
| Apple Silicon | **llama.cpp** for input-only. MLX has the Talker but check the open issues first |
| Anything on Ollama | Not available. Don't spend the afternoon |

Before building on it, test the modality you actually care about in isolation — audio alone, then image alone, then both. The failure modes here are silent ones: dropped audio tails, empty responses, and answers that read fluently while ignoring an input entirely.

## Next steps

- The merge that enabled this: [llama.cpp PR #19441](https://github.com/ggml-org/llama.cpp/pull/19441), *mtmd: qwen3 audio support (qwen3-omni and qwen3-asr)*, merged 12 April 2026
- Official docs, such as they are: [`docs/multimodal.md`](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md)
- GGUFs: [`ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF`](https://huggingface.co/ggml-org/Qwen3-Omni-30B-A3B-Instruct-GGUF)
- The audio-output tracking issue: [llama.cpp#21956](https://github.com/ggml-org/llama.cpp/issues/21956)
- The untriaged audio bug: [llama.cpp#27136](https://github.com/ggml-org/llama.cpp/issues/27136)
- Multi-GPU experience report (text + vision, pre-dates audio): [llama.cpp Discussion #18273](https://github.com/ggml-org/llama.cpp/discussions/18273)
- Model card and paper: [Qwen/Qwen3-Omni-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct), [arXiv:2509.17765](https://arxiv.org/abs/2509.17765)
- The post this guide came from: [[qwen3-omni-audio-vision-support-llama-cpp|Qwen3 Audio and Vision Support Now Available in llama.cpp]]
