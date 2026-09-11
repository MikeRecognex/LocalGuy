---
title: "PaddleOCR-VL on Apple Silicon: Crop to Blocks, Keep the Model Resident"
date: 2026-09-11
updated: 2026-09-11
description: "Two findings from re-OCRing 412 degraded scans on a 16GB M1 Pro. Feed the model a whole page and it invents fluent, well-formed, entirely wrong text. Call it through llama-mtmd-cli instead of a resident llama-server and the same 12 crops take 7,351 seconds instead of 98."
tags:
  - paddleocr
  - ocr
  - apple-silicon
  - llama-cpp
  - multimodal-ai
  - document-processing
status: published
category: deployment
difficulty: intermediate
timeEstimate: "25 min"
---

PaddleOCR-VL is a 0.9B multilingual OCR model that [landed in llama.cpp in February](/posts/paddleocr-vl-llama-cpp-multimodal-ocr/). It is very good, it runs on a laptop, and there are two ways to use it that will waste your week.

This guide is a field report from re-OCRing 412 pages of badly scanned 2012-era government exhibits on a MacBook Pro with an M1 Pro and 16GB of unified memory. The finished run took 97 minutes. The first configuration I tried would have taken 140 hours and produced text I could not have trusted.

> [!warning] The failure mode here is silent, and that is the whole problem
> A bad 2012 Acrobat text layer produces character noise you can *see* and score: `rn` for `m`, `1` for `l`, dropped diacritics. A VLM hallucination reads perfectly. It has correct grammar, plausible names, sensible numbers, and no artefact anywhere that a downstream checker can catch. If you feed this model whole pages, you do not get worse OCR. You get **confident fiction that passes every smell test you have.**

## The setup

| | |
|---|---|
| Machine | MacBook Pro 18,3, M1 Pro, **16GB unified memory**, macOS 26.2 |
| llama.cpp | build **8680** (`15f786e65`), Homebrew |
| Model | `PaddleOCR-VL-1.6-GGUF.gguf` **0.87 GiB** |
| Projector | `PaddleOCR-VL-1.6-GGUF-mmproj.gguf` **0.82 GiB** |
| Resident | **~1.7 GiB** before KV cache |
| Rasteriser | `pdftoppm -r 300 -png` |

1.7 GiB is the number that makes this interesting. It fits anything, including a base M1 Air, and it leaves room to run the segmentation in the same process.

## Rule 1: never send it a whole page

PaddleOCR-VL is an **element-level** model. It expects a text block, a table, or a formula. Hand it a full letter-size page at 300 dpi and the preprocessor downscales the image to the vision tower's input size, which takes 10pt body text below the threshold where glyph strokes survive.

The model does not then return garbage, and it does not return an error. It returns fluent, well-formed, plausible prose that is not on the page.

This is worth dwelling on, because it inverts how people normally reason about OCR quality. The usual mental model is that OCR degrades gracefully: as input quality drops, character error rate rises, and you can threshold on confidence. A generative VLM does not degrade that way. Past the legibility cliff it stops transcribing and starts **generating conditioned on a blurry prior**, and the output is indistinguishable from a good transcription unless you have the source page in front of you.

So the rule is structural, not a tuning parameter: **segment first, OCR second, always.**

## The segmenter

You do not need a layout model for this. A projection profile is enough for single-column scanned text, and it runs in milliseconds.

```python
import numpy as np
from PIL import Image

def segment(path):
    """Return (PIL image, [(x0,y0,x1,y1), ...]) for text blocks."""
    im = Image.open(path).convert("L")
    a = np.array(im)
    H, W = a.shape
    ink = (a < 190).astype(np.uint8)

    # Blank the page furniture before projecting. These four constants are
    # the whole trick: printed page numbers, footer datestamps, the rotated
    # Bates stamp down the right edge and the binding shadow on the left
    # are all "ink", and all of them merge bands together if left in.
    ink[: int(0.06 * H), :] = 0      # header
    ink[int(0.93 * H) :, :] = 0      # footer
    ink[:, int(0.97 * W) :] = 0      # rotated stamp, right edge
    ink[:, : int(0.02 * W)] = 0      # binding margin

    rows = ink.sum(axis=1)
    on = rows > max(2, 0.001 * W)
    gap = int(0.02 * H)              # split on vertical gaps > 2% of page height

    segs, start, run = [], None, 0
    for i, v in enumerate(on):
        if v:
            if start is None:
                start = i
            run = 0
        elif start is not None:
            run += 1
            if run > gap:
                segs.append((start, i - run))
                start, run = None, 0
    if start is not None:
        segs.append((start, len(on) - 1))

    out = []
    for y0, y1 in segs:
        if y1 - y0 < 12:             # drop specks
            continue
        xs = np.where(ink[y0 : y1 + 1].sum(axis=0) > 0)[0]
        if len(xs) == 0:
            continue
        out.append((int(xs[0]), int(y0), int(xs[-1]), int(y1)))
    return im, out
```

Then crop each band with a 20px pad and send it on its own. The pad matters: tight bboxes clip ascenders and descenders, and the model will quietly guess at the clipped line.

Two things about the constants above. First, they are tuned to one document family, and yours will differ. Second, and more usefully: **they are all easy to get visually.** Dump the bboxes as rectangles over the page PNG for half a dozen pages before you launch a long run. Every segmentation bug I hit was obvious in one glance at an overlay and invisible in the JSON.

I checked the output of this against a control page where a clean digital text layer already existed, and the block-wise OCR came back character-exact. That is one page, not a benchmark, but it is the check worth doing before committing GPU-hours: **find a page where you already know the answer.**

On this corpus the segmenter produced a median of 3 blocks per page, max 8, across 1,283 blocks total.

## Rule 2: the model must stay resident. This is a 75x effect.

Here is the part that actually cost me a day.

The obvious way to OCR a crop is to shell out to `llama-mtmd-cli`. It is the documented multimodal entry point, it takes `--image`, and it prints text to stdout. It is also completely the wrong shape for this workload, because you are making thousands of calls, not one.

I ran the same 6 pages and the same 12 crops both ways. Nothing else changed.

| Page | `llama-mtmd-cli` per crop | Resident `llama-server` |
|---|---|---|
| A (3 blocks) | 3,141 s | **17 s** |
| B (3 blocks) | 1,904 s | **4 s** |
| C (2 blocks) | 1,599 s | **22 s** |
| D (2 blocks) | 662 s | **21 s** |
| E (1 block) | 26 s | **21 s** |
| F (1 block) | 19 s | **14 s** |
| **Total** | **7,351 s** | **98 s** |

**75x**, on identical inputs. Extrapolated to the full 412-page job that is roughly 140 hours against the 97 minutes it actually took.

> [!note] I know the size of this effect. I do not know its cause.
> The tempting explanation is "the CLI reloads 1.7 GiB of weights on every call", and that is surely part of it. But look at rows E and F: **single-block pages are only about 1.3x slower**, and one weight load is exactly what they pay. The blow-up is concentrated in the *second and third* crop of a multi-block page, where individual calls went from under a second to 950, 1,110 and 1,591 seconds.
>
> That shape is consistent with memory pressure on a 16GB machine, repeated `mmap` of the same file racing page reclaim, or thermal throttling, and I did not isolate which. So take the 75x as a measured result on this hardware and this workload, and treat the mechanism as an open question. If you reproduce it on a 64GB machine, I would like to know.

The fix is to start the server once and POST to it.

```bash
llama-server \
  -m PaddleOCR-VL-1.6-GGUF.gguf \
  --mmproj PaddleOCR-VL-1.6-GGUF-mmproj.gguf \
  --host 127.0.0.1 --port 8077
```

and send each crop as base64 on the OpenAI-compatible endpoint:

```python
import base64, io, json, time, urllib.request

SERVER = "http://127.0.0.1:8077"

def ocr(crop, prompt="OCR:", n=2048):
    buf = io.BytesIO()
    crop.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    body = json.dumps({
        "messages": [{"role": "user", "content": [
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}"}},
            {"type": "text", "text": prompt}]}],
        "temperature": 0, "max_tokens": n,
    }).encode()
    req = urllib.request.Request(f"{SERVER}/v1/chat/completions", data=body,
                                 headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            d = json.load(r)
        return d["choices"][0]["message"]["content"].strip(), time.time() - t0, 0
    except Exception as e:
        return "", time.time() - t0, f"ERR {e}"
```

Note the third return value. **Return the error alongside the text rather than raising**, record it per block, and check it before you concatenate. A failed block returns an empty string, and an empty string concatenates into your page text perfectly silently. More on this below, because there is a specific failure that produces exactly that.

## The `--jinja` trap

This one is nasty because the flag is genuinely required in one place and actively harmful in the other.

- `llama-mtmd-cli` **needs** `--jinja` to apply the chat template.
- `llama-server` **must not be given it** for this model.

Pass `--jinja` to `llama-server` and the startup log says:

```
Chat format: peg-native
```

Requests that carry an image then fail with HTTP 500 and this body:

```
Failed to parse input at pos 0
```

Three things make this expensive to diagnose:

1. **It is intermittent.** In one run it hit 4 of 650 blocks, about 0.6%. Everything else worked, so it reads like a flake rather than a configuration error.
2. **The correct OCR text is inside the error.** The model did the work. The response formatter choked afterwards. So the string you want is sitting in the 500 body, which makes it look like a serialisation bug in your own client.
3. **It is deterministic at `temperature: 0`.** Retrying the same crop against the same server reproduces it exactly. A naive retry loop spins forever on those four blocks and never tells you why.

Drop `--jinja` from the server invocation and it goes away. The final 412-page, 1,283-block run had **zero** block errors.

## What the finished run looked like

412 pages, 1,283 blocks, one resident server, 300 dpi input.

| | seconds/page |
|---|---|
| min | 2.7 |
| median | **14.4** |
| mean | 14.1 |
| max | 38.5 |

About 97 minutes wall clock on a four-year-old laptop, with no GPU beyond the M1 Pro's own, and nothing leaving the machine. That last part is usually the reason people are doing this at all.

Write one JSON per page as you go and skip pages that already have one. A run this long will be interrupted, and resuming from disk costs you five lines:

```python
done = {int(f[1:-5]) for f in os.listdir(out) if f.startswith("p") and f.endswith(".json")}
jobs = [j for j in jobs if j[1] not in done]
```

## Remaining gotchas

**Cap `max_tokens`, because table pages loop.** Dense tabular blocks send this model into repetition, emitting the same row over and over until something stops it. `max_tokens: 2048` is a reasonable ceiling for a text block and turns an unbounded hang into a truncated block you can spot by length.

**Digits are the weak spot.** On a fax header this model read `4235` where the page showed `4236`. I did not adjudicate every digit in the corpus, so I cannot give you a rate, only the direction: prose came back reliable, and **numbers are where I would concentrate any human review.** If you are OCRing account numbers, dates or amounts, sample them deliberately rather than trusting an aggregate character error rate driven by prose.

**Rasterise at 300 dpi and let the segmenter do the downscaling.** Going higher makes crops that the vision tower shrinks anyway, and it costs you rasterisation time and memory on a 16GB machine.

**`pip install gguf` is blocked by PEP 668** on a Homebrew Python, which you will hit if you need to patch GGUF metadata. Use `pipx`, a venv, or the Homebrew-provided console script, which is `gguf-set-metadata` and not `python -m gguf`.

## What I did not test

- **Multi-column layouts.** The row-projection segmenter assumes a single column. Two columns will merge into bands spanning both, which puts you back in the hallucination regime with no warning. If your documents are multi-column you need a column split first, and I have not written one.
- **Other Apple Silicon.** Everything here is M1 Pro / 16GB. The 75x in particular may be specific to being memory-constrained.
- **Comparison against a dedicated OCR engine.** I did not race this against Tesseract, Surya or a cloud API. The comparison that mattered to me was against the document's own broken text layer, which it beat decisively.
- **Accuracy at scale.** One control page came back character-exact. That is a sanity check, not an evaluation.

## The short version

1. Segment the page yourself. Never send a full page, because the failure is invention, not noise.
2. Start `llama-server` once. Never `llama-mtmd-cli` per crop.
3. No `--jinja` on the server.
4. Record a per-block return code and check it before merging, because a failed block joins silently.
5. Find one page whose correct text you already have, and check against it before you start the long run.
