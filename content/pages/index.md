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
</div>

{% if collections.posts.length %}
## Recent Posts

<ul class="post-list">
{%- for post in collections.posts | head(5) %}
  <li>
    <a href="{{ post.url }}">{{ post.data.title }}</a>
    <time datetime="{{ post.date | isoDate }}">{{ post.date | readableDate }}</time>
    {% if post.data.description %}<p class="summary">{{ post.data.description }}</p>{% endif %}
  </li>
{%- endfor %}
</ul>

[All posts &rarr;](/posts/)
{% endif %}
