---
name: queue-url
description: Queue a URL for the n8n workflow to draft a post from, and dispatch it on demand instead of waiting for the daily cron. Use when the user supplies an article URL and wants it written up, queued, or run now. Trigger phrases - queue this url, queue this for n8n, write this up, draft a post from this link, run the queue, what's in the queue.
allowed-tools: Bash, Read, WebFetch
argument-hint: "<url> | list | run [id|--all]"
---

# Queue a URL for n8n drafting

Input: `$ARGUMENTS` — a URL to queue, or `list`, or `run <id>` / `run --all`.

The daily workflow fires on cron at 12:15. This path lets a hand-picked URL go
through the same drafting and GitHub-commit nodes on demand. Local queue is
`n8n/url-queue.json` (gitignored); dispatch POSTs to a Webhook trigger in n8n Cloud.

## Routing

| `$ARGUMENTS` | Do |
|---|---|
| a URL | step 1, then 2 |
| empty, or `list` | step 3 only |
| `run <id>` / `run --all` | step 4 only |
| `remove <id>` | `node scripts/queue-url.js remove <id>` |

## Step 1 — Add it, with a real title

Do **not** just pass the bare URL. The AI step in n8n never fetches the article —
it writes the post from the title and snippet alone. A weak title produces a weak
or invented post.

`WebFetch` the URL first and establish:

- the actual headline
- one or two sentences on what the thing genuinely is or does
- whether it is even about local LLM deployment

> [!danger] If the page won't fetch, do not queue it
> Reddit returns 403 to non-browser clients, and it is not alone. The n8n side
> fetches with the same kind of headers and gets the same 403, so the model ends up
> with a title and nothing else.
>
> Observed result: it does **not** invent version numbers or benchmark figures — the
> prompt forbids that and the prohibition holds — but it produces fluent,
> confident, entirely content-free prose about things it has no information on. That
> draft is not salvageable by editing. It has to be deleted.
>
> So: if `WebFetch` fails, say so plainly and ask the user for a real description, or
> for a different URL. Do not queue on the strength of a de-slugged URL.

Then:

```bash
node scripts/queue-url.js add "<url>" --title "<real headline>" --note "<what it is, 1-2 sentences>"
```

> [!warning] Don't queue something the site has already covered
> There is no dedupe against published posts. Before adding, check:
> ```bash
> grep -rl "<distinctive phrase or domain>" content/posts | head
> ```
> If it's already covered, tell the user and ask before queueing a second post.

## Step 2 — Ask before dispatching

Adding and running are deliberately separate. Adding is free; running spends an
Anthropic API call and commits a file to the public repo.

Report what was queued and its id, then ask whether to run it now. Don't dispatch
unprompted.

## Step 3 — List

```bash
node scripts/queue-url.js list
```

## Step 4 — Run

```bash
node scripts/queue-url.js run <id>      # or --all
```

If it reports missing `N8N_MANUAL_WEBHOOK_URL` / `N8N_MANUAL_WEBHOOK_SECRET`, the
n8n side isn't set up — point the user at `docs/n8n-manual-url-setup.md` and stop. Do
not invent a webhook URL.

A 404 from n8n almost always means the workflow is not **Active**, or the Test URL
was used instead of the Production one.

On success the draft is committed to GitHub by n8n, not by us. Tell the user to
`git pull` in a minute. Then verify:

```bash
git pull --quiet && grep -rl "origin: manual" content/posts | tail -3
```

The draft lands in `content/posts/<today>/` with `status: draft` and
`origin: manual`. It does **not** publish until the status is flipped by hand.

## Step 5 — Read the draft against the source

Do not just report that it landed. Open it and check the claims against what you
established in step 1. The recurring failure is **overclaiming**, not fabrication:
the model takes a single demonstration and generalises it into a capability.

Real example — a post about one generated Snake game came back asserting the model
"can handle complex agentic reasoning", plus a closing paragraph about rate limits
and reproducibility that appeared nowhere in the source.

So check specifically:

- Does every named figure, model, and piece of hardware appear in the source?
- Does any sentence generalise a single result into a general capability?
- Is the final paragraph drawing conclusions the source never drew?

Say what you found. Offer to tighten it — the fix is usually deleting a clause and
a paragraph, not rewriting.

## Step 6 — Report

State the queue id, the title used, whether it was dispatched, where the draft
landed, and what you changed or would change.

The draft is `status: draft`, so nothing is public until the user flips it. Say so —
it lowers the stakes of an imperfect draft.

Never commit or push. The user does that.
