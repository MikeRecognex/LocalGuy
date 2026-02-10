# Phase 5: Hosting & Deployment

## Platform: Vercel (Already Configured)

The site is already deployed to Vercel at:
https://localguy-theta.vercel.app

## Current Configuration

### `vercel.json`
```json
{
  "buildCommand": "npx @11ty/eleventy",
  "outputDirectory": "_site",
  "framework": null
}
```

### Deployment Flow

```
Obsidian Git plugin pushes to GitHub
       │
       ▼
Vercel detects push to main branch
       │
       ▼
Runs: npm install → npx @11ty/eleventy
       │
       ▼
Deploys _site/ to global CDN
       │
       ▼
Site live with HTTPS
```

## Environment Variables

| Variable         | Purpose                      | Where Set        |
|------------------|------------------------------|------------------|
| `ELEVENTY_ENV`   | production vs dev mode       | Vercel dashboard |

No secrets are required for the basic build. Giscus config is public
(it's just repo IDs, which are discoverable anyway).

## Custom Domain (When Ready)

1. Buy/configure domain
2. Add to Vercel project settings
3. Point DNS (CNAME to `cname.vercel-dns.com`)
4. HTTPS is automatic
5. Update `site.url` in `_data/site.json`

## Failure Mode

- If build fails, the previous deployment stays live
- If GitHub is down, the deployed site still serves from Vercel's CDN
- Giscus comments may not load if GitHub API is down, but the
  site content is unaffected
