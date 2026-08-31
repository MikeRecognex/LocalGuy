# Manual URL trigger — step-by-step setup

Adds a second way to start the content workflow: hand it one specific URL, on
demand, instead of waiting for the `15 12 * * *` cron and hoping your link wins one
of the five slots.

The local half (`scripts/queue-url.js`, the `queue-url` skill) is already built and
committed. This document is the half that has to be done by hand in the n8n Cloud
editor.

**Time:** about 30 minutes. **Risk:** you are editing the workflow that publishes
the site's daily content. Part 1 takes a backup before anything else — don't skip it.

---

## Contents

- [What you are building](#what-you-are-building)
- [Part 1 — Back up the workflow](#part-1--back-up-the-workflow-do-this-first)
- [Part 2 — Check for drift](#part-2--check-for-drift)
- [Part 3 — Add the Webhook trigger](#part-3--add-the-webhook-trigger)
- [Part 4 — Add the Shape Manual Article node](#part-4--add-the-shape-manual-article-node)
- [Part 5 — Wire the connections](#part-5--wire-the-connections)
- [Part 6 — Fix the prompt node](#part-6--fix-the-prompt-node)
- [Part 7 — Mark manual drafts](#part-7--mark-manual-drafts)
- [Part 8 — Activate and get the URL](#part-8--activate-and-get-the-url)
- [Part 9 — Fill in .env](#part-9--fill-in-env)
- [Part 10 — Test](#part-10--test)
- [Troubleshooting](#troubleshooting)
- [Rollback](#rollback)
- [Known limitations](#known-limitations)

---

## What you are building

The workflow today:

```
Daily 1215pm Trigger ─┬─→ RSS Read  (Google News) → Parse Google News ─┐
                      ├─→ HFNode    (Hacker News) ───────────────────  ┤
                      ├─→ RSS Read1 (HF blog) ────→ Code in JavaScript1┤
                      ├─→ RSS Read2 (llama.cpp) ──→ Code in JavaScript2┼→ Merge All Feeds
                      ├─→ RSS Read3 (Ollama) ─────→ Code in JavaScript3┤        │
                      ├─→ RSS Read4 (vLLM) ───────→ Code in JavaScript4┤        │
                      └─→ RSS Read5 (Simon W.) ───→ Code in JavaScript5┘        │
                                                                                ↓
                                                       Deduplicate & Prepare for AI
                                                                          ↓
                                             Code in JavaScript  (builds the prompt)
                                                                          ↓
                                                    HTTP Request  (calls Claude)
                                                                          ↓
                                                   Format Obsidian Markdown
                                                                          ↓
                                                     Prepare GitHub Payload
                                                                          ↓
                                                           Create a file
```

What you're adding — two new nodes joining an existing one:

```
Webhook (Manual URL) ──→ Shape Manual Article ──→ Deduplicate & Prepare for AI
                                                   (everything downstream reused)
```

Adding a second trigger is safe. n8n only executes the branch descending from
whichever trigger fired, so a cron run never touches the webhook nodes and vice versa.

### Two constraints that dictated this design

Worth understanding before you start, because both fail in confusing ways.

**1. The join point is not negotiable.** `Format Obsidian Markdown` contains this:

```js
const originalArticles = JSON.parse(
  $('Deduplicate & Prepare for AI').first().json.articles_text
);
```

It looks that node up **by name**. If the manual branch joined further downstream,
that node wouldn't have executed and the reference fails. So the manual branch must
route *through* `Deduplicate & Prepare for AI`.

**2. The relevance filter is not a node — it's prompt text.** It's tempting to
assume `Deduplicate & Prepare for AI` does the filtering. It doesn't; it dedupes by
title and builds a JSON blob. The actual selection happens inside the prompt in
`Code in JavaScript`:

> Select the **TOP 5** most important stories … Return ONLY a valid JSON array of **5 objects**

Send one manual article through that and you are asking the model to pick 5 from a
list of 1 and return 5 objects. It will comply by **inventing four**. This pipeline
already has a documented history of fabricating publisher domains, so this is a
realistic failure, not a theoretical one — and the output goes straight to a public
repo. **Part 6 is the step that prevents it. Do not skip it.**

---

## Part 1 — Back up the workflow (do this first)

1. Open n8n Cloud and the workflow **`Daily Local LLM News → Obsidian`**.
2. Top-right menu (the `⋯`) → **Download**. This saves a `.json` export.
3. Move it somewhere you'll find it:

```bash
mkdir -p ~/Backups
mv ~/Downloads/Daily*Local*LLM*News*.json ~/Backups/n8n-daily-news-$(date +%Y%m%d).json
ls -la ~/Backups/n8n-daily-news-*.json
```

This is your rollback point. If anything goes wrong you can import it and be back
where you started.

## Part 2 — Check for drift

The copy in `n8n/daily-local-llm-news.json` is a local, gitignored export — last
refreshed **31 August 2026**, which is what the code in this guide was built against.
If the live workflow has changed since, instructions below that say "replace this
node" could silently revert your later edits.

Compare your fresh backup against it:

```bash
cd /Users/michaeldoyle/Scratch/LocalGuy
python3 - <<'PY'
import json, glob, os
live = sorted(glob.glob(os.path.expanduser('~/Backups/n8n-daily-news-*.json')))[-1]
old  = 'n8n/daily-local-llm-news.json'
def nodes(p):
    return {n['name']: n.get('parameters', {}).get('jsCode', '') for n in json.load(open(p))['nodes']}
a, b = nodes(old), nodes(live)
print('comparing against:', live, '\n')
for name in sorted(set(a) | set(b)):
    if name not in a:   print(f'  NEW in live:      {name}')
    elif name not in b: print(f'  GONE from live:   {name}')
    elif a[name] != b[name]: print(f'  *** CHANGED ***   {name}')
    else:               print(f'  unchanged:        {name}')
PY
```

### Reading the output

The one line that matters is the one for **`Code in JavaScript`**. That is the node
Part 6 asks you to overwrite, so it's the only place where a stale copy could
destroy work you've done since 2 August.

- **`unchanged`** — your live node still matches the repo. When you reach Part 6 you
  can paste its code over the top without losing anything.
- **`*** CHANGED ***`** — you have edited that node since. Do **not** paste over it.
  Part 6 ends with a short list of exactly what its code adds, so you can apply those
  additions to your own version by hand.

Any other node showing `CHANGED`, `NEW` or `GONE` is fine to ignore for now — nothing
in this guide overwrites them wholesale.

Nothing to do in n8n for this part. Once you've read the output, continue to Part 3.

## Part 3 — Add the Webhook trigger

1. In the editor, click **+** (top right) to open the node panel.
2. Search **Webhook**, add it. It appears as a trigger node.
3. Rename it to **`Webhook (Manual URL)`** — double-click the title in the node's
   detail view.
4. Set these parameters:

| Field | Value |
|---|---|
| HTTP Method | `POST` |
| Path | `manual-url` |
| Authentication | **Header Auth** |
| Respond | **Immediately** |

**Respond = Immediately** matters. A full run takes a while (page fetch → Claude →
GitHub commit); the CLI only needs confirmation the job was accepted. Leave it on
the default and the CLI sits there until the whole run finishes or the request
times out.

5. Next to **Authentication**, click **Create new credential**. Type is **Header
   Auth**. Two fields:

   - **Name:** `x-manual-queue-secret`
   - **Value:** the secret already in your `.env`:

```bash
grep N8N_MANUAL_WEBHOOK_SECRET .env | cut -d= -f2
```

   Name the credential something like `LocalGuy manual queue` and save.

   The header name must match exactly — `scripts/queue-url.js` sends
   `x-manual-queue-secret` and nothing else.

## Part 4 — Add the Shape Manual Article node

1. Add a **Code** node. Rename it to **`Shape Manual Article`**.
2. Set **Mode** to **Run Once for All Items** (usually the default).
3. Replace the entire contents with:

```js
const payload = $input.first().json.body || $input.first().json;

const url = (payload.url || '').trim();
if (!/^https?:\/\//i.test(url)) {
  throw new Error('Manual queue: missing or invalid url: ' + JSON.stringify(payload.url));
}

let title = (payload.title || '').trim();
let snippet = (payload.note || '').trim();

// Best-effort page fetch. The AI has nothing but these fields to work from,
// so a real title and description materially improve the draft.
try {
  const html = String(await this.helpers.httpRequest({
    url,
    timeout: 15000,
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; LocalGuyBot/1.0)' },
  }));

  if (!title) {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (m) title = m[1].replace(/\s+/g, ' ').trim().slice(0, 200);
  }

  const desc =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i) ||
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
  if (desc) {
    snippet = [snippet, desc[1].replace(/\s+/g, ' ').trim().slice(0, 600)]
      .filter(Boolean)
      .join(' — ');
  }
} catch (e) {
  console.log('Manual queue: could not fetch page, continuing on title alone: ' + e.message);
}

if (!title) title = new URL(url).hostname;

// Must match the shape the feed parsers emit, since this feeds the same node.
return [{
  json: {
    title,
    url,
    source: 'Manual',
    published: new Date().toISOString(),
    selftext_snippet: snippet || null,
  },
}];
```

Three things about this node:

- **It fetches the page.** The AI step never opens the article — it writes from
  title and snippet alone. Pulling the real `<title>` and meta description is what
  makes the draft resemble the actual thing. If the fetch fails it logs and carries
  on rather than aborting.
- **`source: 'Manual'` is load-bearing.** It passes untouched through
  `Deduplicate & Prepare for AI` and is what Parts 6 and 7 branch on. No change to
  the dedupe node is needed anywhere.
- **The output shape must match the feed parsers**, because it feeds the same node
  they do.

## Part 5 — Wire the connections

Drag from each node's output dot to the next node's input dot:

1. `Webhook (Manual URL)` → `Shape Manual Article`
2. `Shape Manual Article` → **`Deduplicate & Prepare for AI`**

`Deduplicate & Prepare for AI` now has two incoming connections — one from
`Merge All Feeds`, one from `Shape Manual Article`. That's correct and expected.

**Change nothing else.** The cron's existing wiring stays exactly as it is.

Note you are joining **`Deduplicate & Prepare for AI`**, not `Merge All Feeds`. The
merge node's inputs are reserved for the cron's feeds — don't add an eighth.

> Checkpoint: `Daily 1215pm Trigger` should still connect to all seven feed branches
> (`RSS Read`, `RSS Read1`–`RSS Read5`, `HFNode`), and `Merge All Feeds` should still
> connect to `Deduplicate & Prepare for AI`. If you accidentally detached something,
> undo (Cmd-Z) before continuing.

## Part 6 — Fix the prompt node

This is the step that stops four invented posts.

Open the node named literally **`Code in JavaScript`** — the default name, never
renamed. It sits between `Deduplicate & Prepare for AI` and `HTTP Request`, and it
builds the Claude prompt. Replace its entire contents:

```js
const input = $input.first().json;
const articles = input.articles_text;
const list = input.articles || [];

// A manual run arrives as exactly one hand-picked item.
const isManual = list.length === 1 && list[0].source === 'Manual';

const task = isManual
  ? `TASK: Write ONE post about the single article above. It was picked by hand, so do not judge whether it is worth covering — cover it. Return a JSON array containing exactly ONE object with ALL of these fields:`
  : `TASK: Select the TOP 5 most important stories about LOCAL LLM deployment. For each, return a JSON object with ALL of these fields:`;

const closing = isManual
  ? `Only use what is in the article entry above. If the title and snippet do not tell you something, leave it out — do not infer version numbers, benchmark figures, dates or company names that are not present.

Return ONLY a valid JSON array containing exactly 1 object. No wrapping object, no markdown fences, no commentary outside the array.`
  : `Return ONLY a valid JSON array of 5 objects. No wrapping object, no markdown fences, no commentary outside the array.`;

const body = {
  model: "claude-haiku-4-5-20251001",
  max_tokens: 16000,
  messages: [
    {
      role: "user",
      content: `You are a senior AI/ML engineer curating a daily digest about deploying and running LLMs locally (on-device, self-hosted, edge inference).

Here are today's collected articles:

${articles}

${task}

- source_index: The "index" number of the article you are writing about. This MUST match exactly one of the index values from the list above. This is critical for linking to the correct source.
- slug: URL-safe slug (lowercase, hyphens, no special chars, max 60 chars). Example: "llama-cpp-adds-mcp-support"
- title: Clear headline (plain text, properly capitalised)
- description: 1-2 sentence summary for RSS feeds and meta descriptions (plain text, no markdown)
- tags: Array of 2-4 lowercase tag strings. Tags MUST be specific technical topics like "llama-cpp", "hardware", "quantisation", "ollama", "benchmark", "fine-tuning", "mlx", "open-source", "mcp", "agents", "memory-optimization", "vllm", "gguf", "apple-silicon", "amd", "nvidia", "rag", "context-window", "speculative-decoding". Do NOT use generic category tags like "developer", "bullish", "intermediate", "analysis", "showcase", "case-study", "beginner", "advanced", "tutorial", "news", "opinion".
- source_name: Copy the "source" value of that article exactly as it appears in the list above. Do not invent or reword it.
- relevance_score: 1-10 rating
- body_markdown: 2-3 paragraphs of markdown. Explain what happened and why it matters for local LLM practitioners. Do NOT include any links to the source article in body_markdown — the source link will be added automatically. Do NOT include any frontmatter or YAML — only the post body.

IMPORTANT: Do NOT return source_url. Return source_index instead — the exact index number from the article list above. The system will resolve the correct URL automatically.

Prioritise:
- New model releases optimised for local/edge deployment
- Performance breakthroughs (quantisation, inference speed, memory reduction)
- New tools/frameworks (Ollama, llama.cpp, vLLM, MLX, ExLlama updates)
- Practical deployment guides and benchmarks
- Hardware developments relevant to local inference

${closing}`
    }
  ]
};

return [{ json: { requestBody: JSON.stringify(body) } }];
```

### What this changes on the cron path

Two lines, both deliberate. Verified by executing the live node and this one against
identical input and diffing the resulting prompt — nothing else differs:

| | Was | Now |
|---|---|---|
| Source list | "collected articles from Google News, Hacker News, and Reddit r/LocalLLaMA" | "collected articles" |
| `source_name` | `Short source name (e.g. "r/LocalLLaMA", ...)` | `Copy the "source" value of that article exactly` |

Reddit hasn't been a feed since April; the workflow now reads Google News, Hacker
News, the Hugging Face blog, Simon Willison, and the llama.cpp / Ollama / vLLM
release feeds. Naming three sources — one of them retired — invited the model to
label posts from memory. Pointing it at each item's own `source` field removes the
guesswork. `model` and `max_tokens` are untouched.

The **tags** instruction is preserved verbatim, including the expanded technical tag
list and the ban on generic category tags.

### If you have edited this node since 31 August

The code above was rebuilt on an export taken that day. Re-run the Part 2 drift check
first; if `Code in JavaScript` reports `CHANGED` again, apply these four edits to your
version by hand rather than pasting:

1. Add at the top:
   ```js
   const input = $input.first().json;
   const articles = input.articles_text;
   const list = input.articles || [];
   const isManual = list.length === 1 && list[0].source === 'Manual';
   ```
2. Pull the `TASK:` paragraph into a `task` variable with two branches.
3. Pull the final `Return ONLY…` paragraph into a `closing` variable with two branches,
   adding the "do not infer version numbers" clause to the manual branch.
4. Interpolate `${task}` and `${closing}` where those paragraphs used to be.

`isManual` requires **both** exactly one article **and** `source === 'Manual'`, so it
cannot fire on a cron run.

## Part 7 — Mark manual drafts

So you can tell hand-picked drafts from cron ones.

### 7a. `Format Obsidian Markdown` — two additions

Find the frontmatter array near the end of the node and add the `origin` line:

```js
      const markdown = [
        '---',
        `title: "${safeTitle}"`,
        `date: ${today}`,
        `description: "${safeDesc}"`,
        'tags:',
        tagsYaml,
        'status: draft',
        ...(originalArticle?.source === 'Manual' ? ['origin: manual'] : []),   // <-- add this line
        '---',
```

### Two more one-liners, higher up in the same node

Both were found by running this end to end, and both matter.

**Around line 40**, where `sourceName` is resolved. `Shape Manual Article` sets
`source: 'Manual'`, and Part 6 tells the model to copy that value — so without this
the post reads *"Read the full article on Manual"*. Replace:

```js
      const sourceName = story.source_name || originalArticle?.source || 'Unknown';
```

with:

```js
      const isManualItem = originalArticle?.source === 'Manual';
      let sourceName = story.source_name || originalArticle?.source || 'Unknown';
      if (isManualItem) {
        const m = String(sourceUrl).match(/^https?:\/\/(?:www\.)?([^/:?#]+)/i);
        sourceName = m ? m[1] : 'source';
      }
```

Derive it, don't ask the model. Two constraints: this must sit **below** the
`const sourceUrl = ...` line, and `sourceName` must be `let`, not `const`.

Match the host with a regex rather than `new URL(...)` — n8n's Code sandbox does
not expose the `URL` constructor, so the constructor version throws and silently
falls back, printing `Source: [source]`. Confirmed by running it.

**Around line 65**, the tag builder. A hand-picked post is not part of the daily
digest. Replace:

```js
      const tags = ['daily-digest'];
```

with:

```js
      const tags = [originalArticle?.source === 'Manual' ? 'manual' : 'daily-digest'];
```

Both leave the cron path byte-identical.

### Back in the loop

Then, a few lines below, add `manual` to the pushed object:

```js
      output.push({
        json: {
          filename,
          filepath,
          title: story.title,
          markdown,
          manual: originalArticle?.source === 'Manual',   // <-- add this line
        }
      });
```

### 7b. `Prepare GitHub Payload` — replace entirely

```js
  const items = $input.all();
  const output = [];

  for (const item of items) {
    output.push({
      json: {
        github_path: item.json.filepath,
        commit_message: (item.json.manual ? "Add draft (manual): " : "Add draft: ") + item.json.title,
        markdown: item.json.markdown,
      }
    });
  }

  return output;
```

## Part 8 — Activate and get the URL

1. **Save** the workflow.
2. Toggle it **Active** (top right). Production webhooks return 404 while inactive.
3. Open `Webhook (Manual URL)` and copy the **Production URL**. It looks like:

```
https://<your-instance>.app.n8n.cloud/webhook/manual-url
```

> **Production, not Test.** The Test URL (`/webhook-test/...`) only listens while
> you have the editor open with "Listen for test event" clicked, and it fires once.
> Copying the Test URL is the most common mistake here.

## Part 9 — Fill in .env

`.env` already has the secret and a commented placeholder. Fill it in:

```bash
cd /Users/michaeldoyle/Scratch/LocalGuy
# replace the host with your own
sed -i '' 's|^# N8N_MANUAL_WEBHOOK_URL=.*|N8N_MANUAL_WEBHOOK_URL=https://YOUR-INSTANCE.app.n8n.cloud/webhook/manual-url|' .env
grep -c 'N8N_MANUAL_WEBHOOK_URL=https' .env    # expect 1
```

`.env` is gitignored (`.gitignore:7`). Never commit it.

## Part 10 — Test

Use a real article you'd genuinely publish — this commits to the public repo.

```bash
node scripts/queue-url.js add "https://example.com/article" --title "A real headline"
node scripts/queue-url.js list
node scripts/queue-url.js run 1
```

Expected output: `-> #1 https://... accepted`.

Now verify, in order. **Check each before moving on.**

| # | Where | Expect |
|---|---|---|
| 1 | CLI | `accepted`, not an error |
| 2 | n8n → **Executions** | one new execution, status Success |
| 3 | That execution → `Shape Manual Article` | one item out, real `title`, `source: "Manual"` |
| 4 | That execution → `Format Obsidian Markdown` | **1 item out — not 5** |
| 5 | `git pull` | one new file in `content/posts/<today>/` |
| 6 | The file | has `status: draft` **and** `origin: manual` |
| 7 | Commit message | starts `Add draft (manual):` |

**Step 4 is the one that matters.** Five items means Part 6 didn't apply — stop,
delete the drafts it created, and re-check that node.

```bash
git pull --quiet && grep -rl 'origin: manual' content/posts | tail -3
```

The draft is `status: draft`, so nothing appears on the site until you change it to
`published` yourself.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `404` from the webhook | Workflow inactive, or Test URL used | Activate; use the Production URL |
| `403` / `401` | Header name or secret mismatch | Credential name must be exactly `x-manual-queue-secret`; re-copy the value from `.env` |
| CLI hangs, then times out | Webhook **Respond** isn't "Immediately" | Change it in the Webhook node |
| `Missing N8N_MANUAL_WEBHOOK_URL...` | `.env` not filled in | Part 9 |
| Execution fails in `Format Obsidian Markdown` with a `$(...)` error | Manual branch bypasses `Deduplicate & Prepare for AI` | Re-wire per Part 5 |
| **Five drafts from one URL** | Part 6 not applied | Re-paste the prompt node; delete the invented posts |
| Draft title is a bare hostname | Page fetch failed (paywall / JS-rendered) | Pass `--title` and `--note` when queueing |
| `Manual queue: missing or invalid url` | Webhook body not reaching the node | Check the execution's Webhook node output for a `body` property |

## Rollback

If the daily cron breaks, restore the Part 1 backup:

1. n8n → **Workflows** → **Import from File**, select `~/Backups/n8n-daily-news-*.json`.
2. Re-activate.

Then confirm the cron recovers by counting drafts per day:

```bash
git log --format='%ad %s' --date=short | grep 'Add draft' | awk '{print $1}' | uniq -c | head
```

Normal output is roughly 10 drafts/day. Nothing on the day after a change means the
workflow is failing — check n8n's execution history rather than git.

## Known limitations

- **No dedupe against published posts.** Queue a URL you've already covered and
  you'll get a second post about it. The `queue-url` skill greps `content/posts`
  first; the raw CLI does not.
- **Sources that block scraping produce worthless drafts.** Reddit returns 403 to
  non-browser clients, so `Shape Manual Article` gets nothing and the model writes
  from the title alone. Verified: it does not invent numbers or versions, but it
  will produce confident, content-free filler about things it knows nothing about.
  **Check the draft before keeping it, and prefer URLs that actually fetch.**
- **Manual posts are tagged `manual`**, which needs 3+ posts before it gets a tag
  page — expect no `/tags/manual/` until then.
- **The AI never reads the article** — only the title and meta description. A thin
  source page produces a thin draft. That's inherent to the pipeline, not to this
  change.
- **No retry.** A failed dispatch leaves the entry `pending`; run it again.
