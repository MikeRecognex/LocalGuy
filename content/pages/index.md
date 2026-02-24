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

      {%- set cloud = collections.posts | tagCloud %}
      {%- if cloud.length %}
      <div class="sidebar-section">
        <h2 class="sidebar-heading">Trending Topics</h2>
        <div class="tag-cloud" role="navigation" aria-label="Trending topics">
        {%- for item in cloud | head(15) %}
          <a href="/tags/{{ item.tag }}/" class="tag-cloud-item" data-weight="{{ item.weight }}">{{ item.tag }}<span class="tag-count">{{ item.count }}</span></a>
        {%- endfor %}
        </div>
      </div>
      {%- endif %}
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
  <img src="/ambulogo.png" alt="Local LLM Clinic" class="clinic-cta-logo" />
  <div>
    <strong>New: The Local LLM Clinic</strong> — Describe your use-case and get tailored answers drawn from our articles. <a href="/clinic/">Try it &rarr;</a>
  </div>
</div>

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
</div>
