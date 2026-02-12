# Semantic Search — Pre-computed Embeddings

## Summary

Replace or augment Pagefind keyword search with meaning-based search. At build time, embed all posts with a small model, ship vectors as static JSON, and do cosine similarity in the browser.

## How It Works

1. **Build time**: Run a small embedding model (e.g. `all-MiniLM-L6-v2`, 80MB, any CPU) against every post's title + description. Each piece of text becomes a vector of 384 numbers — a mathematical fingerprint of its meaning.

2. **Static output**: Ship a JSON file with the site:
   ```json
   [
     { "url": "/posts/vllm-memory-leak/", "title": "...", "vec": [0.023, -0.117, ...] },
     { "url": "/posts/6x-rtx-3090/", "title": "...", "vec": [0.041, 0.089, ...] }
   ]
   ```
   ~200-300KB gzipped for ~50 posts.

3. **Query time**: Embed the user's query, then rank posts by cosine similarity. Results are meaning-based — "GPU memory" also finds posts about VRAM, OOM errors, memory allocation.

## Query Embedding Options

The user's search query also needs to be embedded at runtime. Two options:

- **Client-side model (Transformers.js)**: ~20MB download on first use, cached after. ~100ms per query. Fully static, no server.
- **Serverless function**: Single endpoint that takes a string, returns a vector. Fractions of a cent per query, ~50ms. Minimal infrastructure.

## What You Get

A search box where typing "running models on low-end hardware" surfaces posts about NAS iGPU inference, ARM CPU capabilities, and small model benchmarks — even if none contain those exact words.

## What It Costs

- Build-time dependency on an embedding model
- Either a ~20MB client download or a single serverless function
- A few hundred KB of vector data
- No GPUs, no LLM hosting, no RAG database

## Status

Parked — revisit when post volume grows and keyword search starts feeling limited.
