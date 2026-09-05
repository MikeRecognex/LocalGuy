---
title: "FreeToken: Edge-Native MoE Serving Engine for Consumer Hardware"
date: 2026-08-24
description: "FreeToken is a mixture-of-experts serving engine aimed at running frontier-scale open-weight models on consumer hardware, using CPU-GPU co-execution rather than a multi-GPU cluster."
tags:
  - consumer-gpu
  - daily-digest
  - edge-inference
  - freetoken
  - glm-5-2
  - memory-efficient-inference
  - memory-optimization
  - mixture-of-experts
  - moe
  - moe-inference
  - quantisation
  - release
source:
  name: "Google News"
  url: "https://news.google.com/rss/articles/CBMi1wFBVV95cUxOMHVPQzNMbWJ4VV81N2VzWmwyQm1MYTl6cHhmZXRZbmJwajhtNWZZcVg5eG14cUl4WmZrZjFEejBmWWhURjNYU2l4OFJ3MHZsMFl1M2VJU1Y5bDA2VTltWUVobU16WWl6U1ctS0pfblFESE0tYU45Y3hYUHljZFM1bFRQeHYtTVpfS005MVg4RHJiQ0NUVmxoUEE3MERDN0taTmh3T1lLSENCYWR5N0RJUFpWcXRld2NxVEw2WENzVTJlSXVrOGZ2T2VMVWtFRkxtUFpLYjN2ONIB3AFBVV95cUxPMDZ3b1U5X214ZF8zTzlsN2tZT3k3NTVhTHZzYkoxWXNDTlBvNVNzRkJsUmVKa0VjUHNxY1FQOWQ0SnNoMHJBbUliSFpvc2Y4dGt1bWZ2Um1DSUh4QW43Rm1ZTG0tOWtrUm9SNVdNTG5DOGxHN3pQclU2SGdqN2Vpcm5qNmJsamhySmRMT3VndU4zeExIMWFmN3N0MlNvWEZXZjdfeFE3SFBVeTNEa01vN2k5bVUyajI4TzdOTXNGYXFzQlZqZmRQUENiZkZDWlFVSjhIY1dGaUxqampS?oc=5"
status: published
---

FreeToken is a mixture-of-experts (MoE) serving engine built for edge-native inference — running frontier-scale open-weight models on personal and consumer hardware rather than on cluster infrastructure. Its stated target is 290B+ parameter MoE models on a gaming PC, and the supported list includes GLM-5.2, DeepSeek-V4-Flash and Qwen3.6-35B-A3B.

The approach is not single-GPU. FreeToken treats heterogeneous edge resources — GPUs, CPUs, host memory and interconnects — as one elastic pool, with bandwidth-adaptive CPU–GPU co-execution, expert caching, and dynamic reallocation of VRAM between expert caches and KV memory at runtime.

The project publishes a paper (arXiv 2608.16157) describing the bandwidth-adaptive execution scheme.

[Read the full article on Google News](https://news.google.com/rss/articles/CBMi1wFBVV95cUxOMHVPQzNMbWJ4VV81N2VzWmwyQm1MYTl6cHhmZXRZbmJwajhtNWZZcVg5eG14cUl4WmZrZjFEejBmWWhURjNYU2l4OFJ3MHZsMFl1M2VJU1Y5bDA2VTltWUVobU16WWl6U1ctS0pfblFESE0tYU45Y3hYUHljZFM1bFRQeHYtTVpfS005MVg4RHJiQ0NUVmxoUEE3MERDN0taTmh3T1lLSENCYWR5N0RJUFpWcXRld2NxVEw2WENzVTJlSXVrOGZ2T2VMVWtFRkxtUFpLYjN2ONIB3AFBVV95cUxPMDZ3b1U5X214ZF8zTzlsN2tZT3k3NTVhTHZzYkoxWXNDTlBvNVNzRkJsUmVKa0VjUHNxY1FQOWQ0SnNoMHJBbUliSFpvc2Y4dGt1bWZ2Um1DSUh4QW43Rm1ZTG0tOWtrUm9SNVdNTG5DOGxHN3pQclU2SGdqN2Vpcm5qNmJsamhySmRMT3VndU4zeExIMWFmN3N0MlNvWEZXZjdfeFE3SFBVeTNEa01vN2k5bVUyajI4TzdOTXNGYXFzQlZqZmRQUENiZkZDWlFVSjhIY1dGaUxqampS?oc=5).

---
*Source: [Google News](https://news.google.com/rss/articles/CBMi1wFBVV95cUxOMHVPQzNMbWJ4VV81N2VzWmwyQm1MYTl6cHhmZXRZbmJwajhtNWZZcVg5eG14cUl4WmZrZjFEejBmWWhURjNYU2l4OFJ3MHZsMFl1M2VJU1Y5bDA2VTltWUVobU16WWl6U1ctS0pfblFESE0tYU45Y3hYUHljZFM1bFRQeHYtTVpfS005MVg4RHJiQ0NUVmxoUEE3MERDN0taTmh3T1lLSENCYWR5N0RJUFpWcXRld2NxVEw2WENzVTJlSXVrOGZ2T2VMVWtFRkxtUFpLYjN2ONIB3AFBVV95cUxPMDZ3b1U5X214ZF8zTzlsN2tZT3k3NTVhTHZzYkoxWXNDTlBvNVNzRkJsUmVKa0VjUHNxY1FQOWQ0SnNoMHJBbUliSFpvc2Y4dGt1bWZ2Um1DSUh4QW43Rm1ZTG0tOWtrUm9SNVdNTG5DOGxHN3pQclU2SGdqN2Vpcm5qNmJsamhySmRMT3VndU4zeExIMWFmN3N0MlNvWEZXZjdfeFE3SFBVeTNEa01vN2k5bVUyajI4TzdOTXNGYXFzQlZqZmRQUENiZkZDWlFVSjhIY1dGaUxqampS?oc=5) · Relevance: 9/10*
