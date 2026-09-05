---
title: ""
layout: layouts/base.njk
permalink: /
---

<div class="landing-layout">
  <aside class="landing-sidebar" aria-label="Site branding">
    <div class="sidebar-sticky">
      <div class="hero-invader" role="img" aria-label="Local FTW pixel art">
        <div class="invader-grid">
          <span></span><span></span><span class="px"></span><span></span><span></span><span></span><span></span><span></span><span class="px"></span><span></span><span></span>
          <span></span><span></span><span></span><span class="px"></span><span></span><span></span><span></span><span class="px"></span><span></span><span></span><span></span>
          <span></span><span></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span></span><span></span>
          <span></span><span class="px"></span><span class="px"></span><span></span><span class="px"></span><span class="px"></span><span class="px"></span><span></span><span class="px"></span><span class="px"></span><span></span>
          <span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span>
          <span class="px"></span><span></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span class="px"></span><span></span><span class="px"></span>
          <span class="px"></span><span></span><span class="px"></span><span></span><span></span><span></span><span></span><span></span><span class="px"></span><span></span><span class="px"></span>
          <span></span><span></span><span></span><span class="px"></span><span class="px"></span><span></span><span class="px"></span><span class="px"></span><span></span><span></span><span></span>
        </div>
        <h1 class="hero-text">LOCAL FTW</h1>
        <p class="hero-tagline">News, guides and discovery for the local LLM community.</p>
      </div>
    </div>
  </aside>

  <div class="landing-main">

    <div class="landing-search">
      <button class="search-inline-btn" id="search-inline-trigger" aria-label="Search posts">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Search posts...</span>
      </button>
    </div>

    <ul class="join-in">
      <li><a href="/bookmarks/">Bookmark</a> stories with reactions via GitHub</li>
      <li><a href="/contribute/">Comment</a> on any post — no account needed to read</li>
      <li>Write your own <a href="/contribute/">posts</a> or <a href="/guides/">guides</a></li>
    </ul>

<div class="clinic-cta">
  <img src="/ambulogo.png" alt="AI Search" class="clinic-cta-logo" />
  <div>
    <strong>AI Search</strong> — Describe your use-case and get tailored answers drawn from our articles. <a href="/clinic/">Try it &rarr;</a>
  </div>
</div>

<div class="landing-split">

  <div class="landing-col-posts">

{% if collections.posts.length %}

## Recent Posts

<ul class="post-list">
{%- for post in collections.posts | recentDays(7) | head(7) %}
  <li>
    <a href="{{ post.url }}">{{ post.data.title }}</a>
    <time datetime="{{ post.date | isoDate }}">{{ post.date | readableDate }}</time>
    {% if post.data.tags %}<div class="post-tags">{%- for tag in post.data.tags | topicTags %}<a href="/tags/{{ tag }}/">#{{ tag }}</a>{%- endfor %}</div>{% endif %}
    {% if post.data.description %}<p class="summary">{{ post.data.description }}</p>{% endif %}
  </li>
{%- endfor %}
</ul>

[All Posts &rarr;](/posts/)

{% endif %}

{% if collections.guides.length %}
{%- set latestGuide = collections.guides | first %}
<div class="featured-guide">
  <h2>Latest Guide</h2>
  <a href="{{ latestGuide.url }}" class="guide-card">
    <span class="guide-card-title">{{ latestGuide.data.title }}</span>
    {% if latestGuide.data.difficulty %}<span class="difficulty-badge difficulty-{{ latestGuide.data.difficulty }}">{{ latestGuide.data.difficulty }}</span>{% endif %}
    {% if latestGuide.data.description %}<span class="guide-card-desc">{{ latestGuide.data.description }}</span>{% endif %}
  </a>
  <a href="/guides/" class="all-guides-link">All Guides &rarr;</a>
</div>
{% endif %}

  </div>

  <aside class="landing-col-graph" aria-label="Topic graph">
    <div class="graph-panel">
      <div class="graph-panel-head">
        <h2>Topic Graph</h2>
        <a href="/graph/">Full view &rarr;</a>
      </div>
      <div class="graph-controls">
        <div class="graph-legend" id="graph-legend"></div>
        <div class="graph-slider">
          <label for="weight-slider">Min. shared articles</label>
          <input type="range" id="weight-slider" min="2" max="8" value="4" step="1">
          <span id="weight-value">4</span>
        </div>
        <div class="graph-search">
          <label for="graph-search" class="sr-only">Find a topic</label>
          <input type="search" id="graph-search" placeholder="Find a topic…" autocomplete="off" spellcheck="false">
          <span id="graph-search-status" class="graph-search-status" role="status" aria-live="polite"></span>
        </div>
      </div>
      <div class="graph-container" id="graph-container">
        <svg id="graph-svg" width="100%" height="100%"></svg>
      </div>
    </div>
  </aside>

</div>

<div class="graph-tooltip" id="graph-tooltip"></div>

  </div>
</div>
