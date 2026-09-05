---
title: I made Karpathy's Autoresearch work on CPU
date: 2026-03-15
description: A developer successfully optimized Karpathy's Autoresearch project to run on CPU-only systems, removing GPU dependency. This breakthrough makes advanced research automation accessible to users without GPU hardware.
tags:
  - Alvaro-Cintas
  - hardware-setup
  - hardware-checking
  - ollama-configuration
  - llmfit
mentions:
  - name: Andrej Karpathy
    role: creator
    handle: "@karpathy"
  - name: bopalvelut-prog
    role: developer
  - name: Hacker News
    role: publisher
source:
  name: "LinkediIn"
  url: "https://www.linkedin.com/posts/alvaro-cintas_the-1-problem-with-local-ai-is-now-solved-activity-7436432703836717056-59Qn?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAEr_pgBj8d-O1H4DHGB1EGZ09GUmRXYwmw"
status: published
---
https://www.linkedin.com/posts/alvaro-cintas_the-1-problem-with-local-ai-is-now-solved-activity-7436432703836717056-59Qn?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAEr_pgBj8d-O1H4DHGB1EGZ09GUmRXYwmw

🚨 The #1 problem with local AI is now solved.  
  
There’s a new tool called llmfit that checks your hardware and tells you which models will run well before you download anything.  
  
So instead of guessing and hitting out-of-memory errors…it gives you a ranked list based on your machine.  
  
What it does (in one command):  
  
→ scans your setup (RAM / CPU / GPU / VRAM)  
→ evaluates models for quality, speed, fit, and context  
→ selects the best quantization automatically  
→ labels what’s ideal vs okay vs borderline  
  
The part I like most: it handles MoE models correctly.  
  
Example: Mixtral 8x7B has ~46.7B total params, but only ~12.9B are active per token, and llmfit accounts for that (a lot of tools still don’t).  
  
100% Opensource.

---
*Source: [LinkediIn](https://www.linkedin.com/posts/alvaro-cintas_the-1-problem-with-local-ai-is-now-solved-activity-7436432703836717056-59Qn?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAEr_pgBj8d-O1H4DHGB1EGZ09GUmRXYwmw)) · Relevance: 8/10*
