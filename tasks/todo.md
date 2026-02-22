# The Local LLM Clinic — RAG-Powered Q&A Feature

## Implementation

- [x] Install dependencies (`@upstash/vector`, `@upstash/redis`)
- [x] Create `scripts/clinic-index.js` — indexing script with `--dry-run` support
- [x] Create `api/clinic/_ratelimit.js` — Upstash Redis rate limiting (5/IP/hour) + abuse webhook
- [x] Create `api/clinic/ask.js` — main API endpoint (validate → rate limit → vector search → Groq → response)
- [x] Create `content/pages/clinic.md` — clinic page markup
- [x] Create `js/clinic.js` — client-side form handling, response rendering, rate limit display
- [x] Add `.clinic-*` styles to `css/style.css`
- [x] Add "Clinic" nav link to `_includes/partials/header.njk`
- [x] Add conditional `js/clinic.js` load to `_includes/layouts/base.njk`
- [x] Add `clinic:index` npm script to `package.json`

## Verification

- [x] `npm run clinic:index -- --dry-run` shows 100 published posts
- [x] `npm run build` succeeds
- [x] `/clinic/` page renders in built output
- [ ] `npm run clinic:index` upserts vectors to Upstash (needs env vars)
- [ ] `curl -X POST /api/clinic/ask -d '{"question":"..."}' ` returns answer + sources (needs env vars)
- [ ] 6th request from same IP returns 429
- [ ] Rate limit counter updates in UI
- [ ] Deploy to Vercel, set env vars, test live

## Remaining Steps (Manual)

1. Set environment variables in Vercel dashboard:
   - `UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `GROQ_API_KEY`
   - `CLINIC_ABUSE_WEBHOOK` (optional)
2. Run `npm run clinic:index` to populate vector DB
3. Deploy to Vercel
4. Test live endpoint
