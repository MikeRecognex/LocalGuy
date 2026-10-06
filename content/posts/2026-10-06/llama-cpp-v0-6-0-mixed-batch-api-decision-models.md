---
title: "llama.cpp v0.6.0 Introduces Extended Batch API and Decision Model Support"
date: 2026-10-06
description: "llama.cpp v0.6.0 adds a new llama_batch_ext API supporting mixed token/embedding inputs, introduces support for decision models like Clef, and includes GLM-5.3-Flash hybrid model support with MTP speculative decoding. These changes expand the framework's capability for complex inference patterns."
tags:
  - daily-digest
  - llama-cpp
  - open-source
  - speculative-decoding
status: draft
---

llama.cpp v0.6.0 represents a major architectural evolution for the widely-used inference framework. The introduction of the llama_batch_ext API enables mixed token/embedding inputs and support for MTP/deepstack state embeddings, allowing practitioners to implement more sophisticated inference patterns that were previously difficult to achieve. This is particularly valuable for multi-modal and complex reasoning workflows on limited hardware.

The release also brings decision model support, including Cloudflare's Clef (both text and vision variants), reflecting industry recognition that smaller, specialized models are more practical for edge deployment than monolithic general-purpose LLMs. Integrated support for the GLM-5.3-Flash 320B hybrid model alongside MTP speculative decoding provides options for balancing quality and speed. These additions position llama.cpp as increasingly essential for practitioners implementing production local inference systems.


[Read the full article on llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v0.6.0).

---
*Source: [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases/tag/v0.6.0) · Relevance: 9/10*
