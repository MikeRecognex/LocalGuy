---
title: "Installing Ollama on Linux"
date: 2026-02-12
updated: 2026-02-12
description: "Get Ollama up and running on any Linux distribution in under ten minutes."
tags:
  - ollama
  - linux
status: published
category: getting-started
difficulty: beginner
timeEstimate: "10 min"
---

[Ollama](https://ollama.com) is the fastest way to run large language models locally. This guide walks you through installation on Linux, pulling your first model, and verifying everything works.

## Prerequisites

- A Linux system (Ubuntu 22.04+, Fedora 38+, or similar)
- At least 8 GB of RAM (16 GB recommended)
- curl installed

## Step 1 — Install Ollama

Run the official install script:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

This downloads the Ollama binary, installs it to `/usr/local/bin`, and creates a systemd service.

## Step 2 — Start the service

The installer usually starts the service automatically. Verify with:

```bash
systemctl status ollama
```

If it's not running:

```bash
sudo systemctl enable --now ollama
```

## Step 3 — Pull a model

Download a small model to test with:

```bash
ollama pull llama3.2:3b
```

This downloads the 3-billion-parameter Llama 3.2 model (~2 GB).

## Step 4 — Run a prompt

```bash
ollama run llama3.2:3b "Explain what a large language model is in two sentences."
```

You should see a response within a few seconds.

## Step 5 — Verify the API

Ollama exposes a local API on port 11434:

```bash
curl http://localhost:11434/api/tags
```

This returns a JSON list of installed models.

## Next steps

- Try a larger model: `ollama pull llama3.1:8b`
- Explore the [model library](https://ollama.com/library)
- Connect a UI like [Open WebUI](https://github.com/open-webui/open-webui)
