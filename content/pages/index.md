---
title: ""
layout: layouts/base.njk
permalink: /
---

<div class="hero-invader" role="img" aria-label="Local FTW">
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
  <p class="hero-text">LOCAL FTW</p>
  <p class="hero-tagline">News, guides and discovery for the local LLM community.</p>
</div>

<ul class="join-in">
  <li><a href="/bookmarks/">Bookmark</a> stories with reactions via GitHub</li>
  <li><a href="/contribute/">Comment</a> on any post — no account needed to read</li>
  <li>Write your own <a href="/contribute/">posts</a> or <a href="/guides/">guides</a></li>
</ul>

{% if collections.posts.length %}
## Recent Posts

<ul class="post-list">
{%- for post in collections.posts | recentDays(3) %}
  <li>
    <a href="{{ post.url }}">{{ post.data.title }}</a>
    <time datetime="{{ post.date | isoDate }}">{{ post.date | readableDate }}</time>
    {% if post.data.description %}<p class="summary">{{ post.data.description }}</p>{% endif %}
  </li>
{%- endfor %}
</ul>

[All Posts &rarr;](/posts/)

{%- set cloud = collections.posts | tagCloud %}
{%- if cloud.length %}

## Trending Topics

<div class="tag-cloud" role="navigation" aria-label="Trending topics">
{%- for item in cloud %}
  <a href="/tags/{{ item.tag }}/" class="tag-cloud-item" data-weight="{{ item.weight }}">{{ item.tag }}<span class="tag-count">{{ item.count }}</span></a>
{%- endfor %}
</div>
{%- endif %}
{% endif %}
