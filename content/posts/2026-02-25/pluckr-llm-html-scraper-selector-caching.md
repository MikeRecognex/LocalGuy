---
title: "Show HN: Pluckr – LLM-Powered HTML Scraper That Caches Selectors and Auto-Heals"
date: 2026-02-25
description: An LLM-driven web scraper that uses local models to intelligently extract data from HTML, caching CSS selectors and automatically adapting to page structure changes without constant retraining.
tags:
  - adaptive-systems
  - caching-strategies
  - compute-optimization
  - consumer-gpu
  - cost-optimization
  - inference-optimization
  - llm-extraction
  - local-inference
  - local-llms
  - memory-optimization
  - practical-tools
  - selector-caching
  - web-scraping
mentions:
  - name: Pankaj3112
    role: developer
    handle: Pankaj3112
  - name: Hacker News
    role: publisher
status: published
---

Web scraping is a persistent need for local AI applications, and [Pluckr](https://github.com/Pankaj3112/pluckr) demonstrates a clever approach: use LLM inference to understand HTML structure and extract selectors, then cache those selectors for repeated use. This pattern significantly reduces compute overhead for real-world scraping pipelines while maintaining adaptability.

For local practitioners, the caching mechanism is the key innovation. Instead of running inference on every page, you extract selectors once, cache them, and fall back to LLM-based "healing" only when page structures change. This means you get the flexibility of LLM-driven extraction with the efficiency of traditional selector-based scraping, all running entirely locally without external APIs.

This project exemplifies a broader pattern in local LLM deployment: using inference strategically rather than constantly. By combining efficient caching, selector-based extraction, and intelligent fallbacks, applications can provide intelligent behavior while staying within realistic compute budgets on consumer hardware.

---
*Source: [Hacker News](https://github.com/Pankaj3112/pluckr) · Relevance: 7/10*
