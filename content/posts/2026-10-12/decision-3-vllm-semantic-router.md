---
title: "vLLM Releases Decision 3.0: Open Semantic Router Decision Models"
date: 2026-10-12
description: "vLLM's Semantic Router introduces Decision 3.0, a collection of open multimodal decision models ranging from 0.6B to 27B parameters, optimized for routing and decision-making in local agent systems."
tags:
  - agent-orchestration
  - agents
  - daily-digest
  - decision-3-0
  - edge-device
  - multimodal
  - multimodal-models
  - open-source
  - release
  - semantic-routing
  - vllm
mentions:
  - name: MarkTechPost
    role: publisher
status: published
---

Decision 3.0 represents a critical toolchain addition for building local AI agents without cloud dependencies. These open, multimodal models span a 0.6B to 27B parameter range, enabling practitioners to select appropriate model sizes for their hardware constraints while maintaining semantic routing capabilities. This addresses a key gap in self-hosted agent architectures where routing decisions have previously required either large general-purpose models or proprietary cloud APIs.

The multimodal aspect is particularly valuable for local deployments, as agents increasingly need to process both text and vision inputs for decision-making tasks. By releasing multiple model sizes, vLLM enables edge deployments to maintain full inference locally—crucial for privacy-sensitive applications and environments with limited or unreliable connectivity.

For practitioners building local agent systems, Decision 3.0 models offer a production-ready solution for the routing layer, complementing larger foundation models in an agentic stack. The open-source nature ensures compatibility with local serving frameworks like vLLM itself, making integration straightforward for on-device deployments.

[Read the full article on MarkTechPost](https://news.google.com/rss/articles/CBMirAFBVV95cUxOcHhJU0xfZTRrRlloeW9LX0NjWHJsRlowY0tBYVdKbER1MUh3MjNabXB1dGs3dkUzcFNlOC1Md080WTgzMlZ4bUtJWHEyQUpXTWFrckstaWF5RjR3RU9xZHI4SmItVzZpdEl2dkdUTS00NUxrbm9XdHI0a1RVZy1QR3BYWjJHYUU1U1h6TjJXYzF6bHFhcEU2RDVSR2g3V3E3UkgzOE1HVmFjdDZo0gGsAUFVX3lxTE5weElTTF9lNGtGWWh5b0tfQ2NYcmxGWjBjS0FhV0psRHUxSHcyM1ptcHV0azd2RTNwU2U4LUx3TzRZODMyVnhtS0lYcTJBSldNYWtySy1pYXlGNHdFT3FkcjhKYi1XNml0SXZ2R1RNLTQ1TGtub1d0cjRrVFVnLVBHcFhaMkdhRTVTWHpOMldjMXpscWFwRTZENVJHaDdXcTdSSDM4TUdWYWN0Nmg?oc=5).

---
*Source: [MarkTechPost](https://news.google.com/rss/articles/CBMirAFBVV95cUxOcHhJU0xfZTRrRlloeW9LX0NjWHJsRlowY0tBYVdKbER1MUh3MjNabXB1dGs3dkUzcFNlOC1Md080WTgzMlZ4bUtJWHEyQUpXTWFrckstaWF5RjR3RU9xZHI4SmItVzZpdEl2dkdUTS00NUxrbm9XdHI0a1RVZy1QR3BYWjJHYUU1U1h6TjJXYzF6bHFhcEU2RDVSR2g3V3E3UkgzOE1HVmFjdDZo0gGsAUFVX3lxTE5weElTTF9lNGtGWWh5b0tfQ2NYcmxGWjBjS0FhV0psRHUxSHcyM1ptcHV0azd2RTNwU2U4LUx3TzRZODMyVnhtS0lYcTJBSldNYWtySy1pYXlGNHdFT3FkcjhKYi1XNml0SXZ2R1RNLTQ1TGtub1d0cjRrVFVnLVBHcFhaMkdhRTVTWHpOMldjMXpscWFwRTZENVJHaDdXcTdSSDM4TUdWYWN0Nmg?oc=5) · Relevance: 8/10*
