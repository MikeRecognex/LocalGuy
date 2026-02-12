---
title: "Start Here"
layout: layouts/page.njk
permalink: /start-here/
---

New to local AI? This page will get you oriented.

## What is Local AI?

When you use ChatGPT, Claude, or Gemini, your prompts are sent to servers owned by those companies. They process your request, generate a response, and send it back. Your data travels through their infrastructure.

Local AI flips that model. You download an AI model and run it directly on your own computer. Your prompts never leave your machine. No internet connection required, no API costs, no third-party access to your data.

## Why Does It Matter?

**Your data stays yours.** Anything you type into a cloud AI service could be logged, used for training, or subject to a data breach. Running locally means your conversations with AI are as private as the files on your hard drive.

**No ongoing costs.** Cloud AI services charge per request. Local models run on hardware you already own. After the initial setup, every query is free.

**No internet needed.** Local models work offline. On a plane, in a secure facility, or just somewhere with bad WiFi — your AI assistant still works.

**No one can take it away.** Cloud providers deprecate models, change pricing, or shut down entirely. A model on your machine is yours permanently.

## What Can You Actually Run Locally?

More than you'd expect. Modern local models can:

- Answer questions and hold conversations
- Summarise documents and extract key points
- Write and edit text
- Generate and explain code
- Analyse data you'd never want to upload to a third party

The quality gap between cloud and local models has narrowed dramatically. For many everyday tasks, a well-chosen local model is genuinely good enough.

## What Do You Need?

You don't need a monster PC. Here's a rough guide:

- **8GB RAM**: Can run small models (3B parameters) — useful for simple tasks
- **16GB RAM**: Can run capable models like Llama 3.1 8B — good for most use cases
- **32GB+ RAM or a decent GPU**: Can run larger models with better quality and speed

If you have a reasonably modern laptop or desktop, you can get started today.

## Getting Started in 15 Minutes

The fastest path from zero to running a local model:

### 1. Install Ollama

[Ollama](https://ollama.ai) is the simplest way to run local models. One download, no configuration.

- **Mac/Linux**: Open a terminal and run `curl -fsSL https://ollama.ai/install.sh | sh`
- **Windows**: Download the installer from [ollama.ai](https://ollama.ai)

### 2. Run Your First Model

Open a terminal and type:

```
ollama run llama3.1
```

The first run downloads the model (about 4.7GB). After that it starts instantly. You now have a local AI chatbot. Type a question, get an answer — all on your machine.

### 3. Add a Web Interface

For a ChatGPT-like experience, install [Open WebUI](https://github.com/open-webui/open-webui). If you have Docker:

```
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui ghcr.io/open-webui/open-webui:main
```

Then open `http://localhost:3000` in your browser. You'll have a polished chat interface connected to your local Ollama models.

## Where To Go From Here

Once you're up and running:

- Browse our [posts](/posts/) for news, guides, and community projects
- Explore the [trending topics](/) on the homepage to find what interests you
- Try different models — `ollama run mistral` or `ollama run phi3` to compare
- Check the [Ollama model library](https://ollama.ai/library) for the full catalogue

## This Site is For You

LocalFTW covers the local AI space daily — hardware builds, model releases, deployment guides, security advisories, and community projects. Whether you just installed Ollama for the first time or you're running a multi-GPU inference server, there's something here for you.

Welcome to the community.
