---
title: ""
layout: layouts/base.njk
permalink: /
---

# {{ site.name }}

{{ site.description }}

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
