---
title: "Why Your Docker Container Is 1.2GB When It Should Be 80MB"
date: 2026-05-24
description: "Practical guide to dramatically reducing Docker container sizes for AI applications, with techniques directly applicable to containerized local LLM deployments."
tags:
  - daily-digest
  - optimization
  - deployment
  - containerization
status: draft
---

Container bloat is a significant pain point for deploying local LLMs in production environments. [This article explores why Docker containers often end up 10-15x larger than necessary](https://sandeepbansod.medium.com/why-your-docker-container-is-1-2gb-when-it-should-be-80mb-7b443a90f60f) and provides actionable techniques for optimization, from multi-stage builds to proper base image selection.

For local LLM operators, container size directly impacts deployment efficiency—smaller images mean faster startup times, reduced storage requirements, and easier distribution across edge devices. The principles covered (removing build artifacts, optimizing layer caching, using distroless images) are particularly relevant when deploying models via container orchestration on resource-constrained hardware.

These optimization techniques can reduce typical local LLM container sizes from several gigabytes down to under 500MB, making on-device deployment more practical for teams running multiple model instances or serving inference at scale.

---
*Source: [Hacker News](https://sandeepbansod.medium.com/why-your-docker-container-is-1-2gb-when-it-should-be-80mb-7b443a90f60f) · Relevance: 8/10*
