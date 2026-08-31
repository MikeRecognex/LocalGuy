# Manual URL trigger — n8n Cloud setup

Lets you hand the daily workflow a specific URL on demand instead of waiting for
the `15 12 * * *` cron. Local side is `scripts/queue-url.js`; this file is the
half that has to be pasted into n8n Cloud.

**Why a webhook and not the API:** n8n's public REST API manages workflows and
reads executions, but has no endpoint that starts a run with a payload. A
Webhook trigger node is the supported way to do this.

## How it joins the existing workflow

```
Daily 1215pm Trigger ─→ 3 feed nodes ─→ Merge All Feeds ─┐
                                                          ├─→ Deduplicate & Prepare for AI
Webhook (Manual URL) ─→ Shape Manual Article ────────────┘         │
                                                                   ↓
                                            Code in JavaScript → HTTP Request
                                            → Format Obsidian Markdown
                                            → Prepare GitHub Payload → Create a file
```

Two things forced this join point rather than something further downstream:

1. **`Format Obsidian Markdown` calls `$('Deduplicate & Prepare for AI')` by name.**
   If the manual branch skipped that node, the reference would resolve against a
   node that never executed and the run would fail. So the manual branch must
   route *through* it.
2. **`Deduplicate & Prepare for AI` is where `articles_text` is built**, which is
   the only thing the AI step ever sees.

Adding a second trigger is safe: n8n only runs the branch descending from
whichever trigger fired, so the cron path is unchanged.

> [!warning] The relevance filter is not in the dedupe node
> It's in the prompt — `Select the TOP 5 most important stories` … `Return ONLY a
> valid JSON array of 5 objects`. Sending one manual article through that prompt
> asks the model for five stories out of one, which is how you get four
> hallucinated filler posts. **Step 3 below is not optional.**

---

## 1. New node — `Webhook (Manual URL)`

Type: **Webhook**

| Setting | Value |
|---|---|
| HTTP Method | `POST` |
| Path | `manual-url` |
| Authentication | **Header Auth** |
| Respond | **Immediately** |

Create the Header Auth credential with:

- Name: `x-manual-queue-secret`
- Value: a long random string — generate with `openssl rand -hex 32`

Then put that same value, and the node's **Production** URL, into `.env`:

```
N8N_MANUAL_WEBHOOK_URL=https://<your-instance>.app.n8n.cloud/webhook/manual-url
N8N_MANUAL_WEBHOOK_SECRET=<the random string>
```

`.env` is gitignored (`.gitignore:7`). Use the Production URL, not the Test URL —
the Test URL only listens while you have the editor open on "Listen for test event".
Production requires the workflow to be **Active**.

Respond "Immediately" matters: the full run takes a while, and the CLI only needs
to know the webhook accepted the job.

## 2. New node — `Shape Manual Article`

Type: **Code**, mode **Run Once for All Items**.
Connect: `Webhook (Manual URL)` → this node → `Deduplicate & Prepare for AI`.

The AI step never fetches the article — it writes from the title and snippet
alone. So this node pulls the page's `<title>` and meta description to give it
something real to work from.

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

`source: 'Manual'` is load-bearing — it survives untouched through
`Deduplicate & Prepare for AI` and is what steps 3 and 4 branch on. No change to
the dedupe node is needed.

## 3. Edit — `Code in JavaScript` (the prompt)

Replace the whole node with this. The only change is that the task block now
branches on whether the batch is a single manual article.

```js
const input = $input.first().json;
const articles = input.articles_text;
const list = input.articles || [];

const isManual = list.length === 1 && list[0].source === 'Manual';

const task = isManual
  ? `TASK:
Write ONE post about the single article above. It was selected by hand, so do not
judge whether it is worth covering — cover it. Return a JSON array containing
exactly ONE object with ALL of these fields:`
  : `TASK:
Select the TOP 5 most important stories about LOCAL LLM deployment. For each, return a JSON
object with ALL of these fields:`;

const closing = isManual
  ? `Return ONLY a valid JSON array containing exactly 1 object. No wrapping object, no
markdown fences, no commentary outside the array.`
  : `Return ONLY a valid JSON array of 5 objects. No wrapping object, no markdown fences, no
commentary outside the array.`;

const body = {
  model: "claude-haiku-4-5-20251001",
  max_tokens: 16000,
  messages: [
    {
      role: "user",
      content: `You are a senior AI/ML engineer curating a daily digest about deploying and
running LLMs locally (on-device, self-hosted, edge inference).

${isManual ? 'Here is an article selected by hand for coverage:' : "Here are today's collected articles from Google News, Hacker News, and Reddit r/LocalLLaMA:"}

${articles}

${task}

- source_index: The "index" number of the article you are writing about. This MUST match
exactly one of the index values from the list above. This is critical for linking to the
correct source.
- slug: URL-safe slug (lowercase, hyphens, no special chars, max 60 chars). Example:
"llama-cpp-adds-mcp-support"
- title: Clear headline (plain text, properly capitalised)
- description: 1-2 sentence summary for RSS feeds and meta descriptions (plain text, no
markdown)
- tags: Array of 2-4 lowercase tag strings relevant to the story (e.g. "llama-cpp",
"hardware", "quantisation", "ollama", "benchmark", "fine-tuning", "mlx", "open-source",
"mcp", "agents", "memory-optimization")
- source_name: Short source name (e.g. "r/LocalLLaMA", "Hacker News", "Google News")
- relevance_score: 1-10 rating
- body_markdown: 2-3 paragraphs of markdown. Explain what happened and why it matters for
local LLM practitioners. Do NOT include any links to the source article in body_markdown —
the source link will be added automatically. Do NOT include any frontmatter or YAML — only
the post body.

IMPORTANT: Do NOT return source_url. Return source_index instead — the exact index number
from the article list above. The system will resolve the correct URL automatically.

${isManual ? 'Write only about the article given. Do not invent additional stories.' : `Prioritise:
- New model releases optimised for local/edge deployment
- Performance breakthroughs (quantisation, inference speed, memory reduction)
- New tools/frameworks (Ollama, llama.cpp, vLLM, MLX, ExLlama updates)
- Practical deployment guides and benchmarks
- Hardware developments relevant to local inference`}

${closing}`
    }
  ]
};

return [{ json: { requestBody: JSON.stringify(body) } }];
```

## 4. Edit — `Format Obsidian Markdown`

Two small changes so manual drafts are auditable.

**a.** Find the frontmatter array near the end and add the `origin` line:

```js
      const markdown = [
        '---',
        `title: "${safeTitle}"`,
        `date: ${today}`,
        `description: "${safeDesc}"`,
        'tags:',
        tagsYaml,
        'status: draft',
        ...(originalArticle?.source === 'Manual' ? ['origin: manual'] : []),   // <-- add
        '---',
```

**b.** In the same loop, add `manual` to the pushed object:

```js
      output.push({
        json: {
          filename,
          filepath,
          title: story.title,
          markdown,
          manual: originalArticle?.source === 'Manual',   // <-- add
        }
      });
```

## 5. Edit — `Prepare GitHub Payload`

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

## 6. Test before trusting it

1. Save, and make sure the workflow is **Active** (Production webhooks 404 otherwise).
2. `node scripts/queue-url.js add <some url> --title "..."`
3. `node scripts/queue-url.js run 1`
4. In n8n, open **Executions** and confirm one run, one item through
   `Format Obsidian Markdown` — **not five**. If you see five, step 3 didn't take.
5. `git pull` and check the new file has `origin: manual` and `status: draft`.

Drafts land in `content/posts/<today>/` with `status: draft`, so nothing publishes
until you flip the status yourself.

## Known rough edges

- **Tag.** Manual drafts still get the `daily-digest` tag from the existing tag
  builder. Harmless, but inaccurate — change `const tags = ['daily-digest']` in
  `Format Obsidian Markdown` if it bothers you. It affects tag pages, so check the
  3-post threshold before splitting the tag.
- **Dedupe against existing posts.** There is none. Queue a URL you've already
  covered and you'll get a second post about it.
- **Paywalled or JS-rendered pages** return little useful HTML, so the fetch in
  step 2 falls back to hostname. Pass `--title` and `--note` for those.
