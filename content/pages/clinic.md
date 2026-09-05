---
title: "AI Search"
layout: layouts/page.njk
permalink: /clinic/
description: "Describe your local AI use-case or problem, and AI Search looks through our articles to give you a tailored answer with source links."
---

<div class="clinic-container">
  <p class="clinic-intro">Describe your use-case or problem and AI Search will look through our published articles to give you a tailored answer with source links. Ten questions per hour.</p>

  <form id="clinic-form" class="clinic-form">
    <label for="clinic-question" class="sr-only">Your question</label>
    <textarea
      id="clinic-question"
      name="question"
      placeholder="e.g. What's the best way to run a 70B model on consumer hardware?"
      rows="4"
      maxlength="500"
      required
    ></textarea>
    <div class="clinic-form-footer">
      <span id="clinic-char-count" class="clinic-char-count">0 / 500</span>
      <button type="submit" id="clinic-submit" class="clinic-submit">
        Search
      </button>
    </div>
  </form>

  <div id="clinic-loading" class="clinic-loading" hidden>
    <span class="clinic-spinner" aria-hidden="true"></span>
    Searching articles and thinking&hellip;
  </div>

  <div id="clinic-error" class="clinic-error" role="alert" hidden></div>

  <div id="clinic-result" class="clinic-result" hidden>
    <div id="clinic-answer" class="clinic-answer"></div>
    <div id="clinic-sources" class="clinic-sources">
      <h3>Sources</h3>
      <ol id="clinic-source-list"></ol>
    </div>
  </div>

  <p id="clinic-remaining" class="clinic-remaining" hidden>
    <span id="clinic-remaining-count" class="clinic-remaining-count"></span> questions remaining this hour
  </p>
</div>
