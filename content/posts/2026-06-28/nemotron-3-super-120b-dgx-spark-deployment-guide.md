---
title: "A Guide on How to Run Nemotron 3 Super 120B Thinking on 2 Nvidia DGX Spark"
date: 2026-06-28
description: "Practical deployment guide for running NVIDIA's large reasoning model (120B parameters) on a two-node DGX Spark cluster with distributed inference techniques."
tags:
  - advanced
  - bullish
  - context-window-expansion
  - corti
  - daily-digest
  - data-sovereignty
  - datacenter-gpu
  - deployment-guide
  - distributed-inference
  - enterprise
  - nvidia
  - quantization
  - tensor-parallelism
  - tutorial
mentions:
  - name: Corti
    role: publisher
  - name: Hacker News
    role: publisher
status: published
---

For organizations with access to enterprise GPU clusters, [this deployment guide for Nemotron 3 Super 120B](https://corti.com/serving-nemotron-super-120b-with-a-1m-token-context-on-a-2-node-dgx-spark-cluster/) provides essential practical knowledge for running cutting-edge reasoning models on self-hosted infrastructure. The 120B parameter Nemotron model represents a new class of sophisticated local-deployable models, and the guide specifically covers scaling to 1M token context windows—crucial for complex enterprise workflows.

The two-node DGX Spark configuration demonstrates how distributed inference techniques enable organizations to self-host models that would traditionally require cloud API subscriptions. By orchestrating computation across multiple GPUs and nodes, teams can achieve production-grade performance while maintaining data sovereignty and control. This is particularly important for regulated industries where model outputs must remain on-premises and audit trails must be verifiable.

This guide bridges the gap between experimental model fine-tuning and production deployment at scale. For enterprises considering multi-model strategies or building internal foundation model infrastructure, understanding tensor parallelism, batch optimization, and context window management across distributed systems is essential. The Nemotron 3 Super 120B represents the capability frontier for self-hosted reasoning, and accessible deployment guidance accelerates adoption.

---
*Source: [Hacker News](https://corti.com/serving-nemotron-super-120b-with-a-1m-token-context-on-a-2-node-dgx-spark-cluster/) · Relevance: 7/10*
