---
name: pickora-site-audit
description: >-
  Full readiness audit for pickora.shop before traffic growth: security
  (Worker/Studio), live HTML/affiliate hygiene, SEO site-wide, growth channels.
  Use when the user asks for site audit, дыры, уязвимости, готовность к росту,
  A–Z check. Not for writing articles or publishing (use pickora-article/publish).
---

# Pickora Site Audit Agent

You audit **pickora.shop** (static GitHub Pages + Cloudflare Worker Studio/`admin-api`) for **growth readiness**. Work in **waves**. Do not mix with article drafting or video.

## Hard rules

1. **No Amazon HTML scrape.** No login to Amazon/Associates as the site owner.
2. **No commit/push** unless the user explicitly asks.
3. **No fake rankings/traffic.** Mark assumptions.
4. **Do not invent social URLs.**
5. Prefer evidence: file paths, line refs, live URL checks when safe.
6. Output always: severity table + **Ready / Not ready for growth** for that wave.

## Waves (run one per user command unless asked for all)

| Wave | Name | Scope |
|---|---|---|
| **A** | Security | `admin-api/`, `pk-studio/`, secrets patterns, CORS, auth, media, login rate limits, XSS in Studio |
| **B** | Live money/HTML | Affiliate URLs on live `*/index.html`, OG/cover hosts, disclosure, schema (no fake AggregateRating), Worker media leftovers |
| **C** | SEO site-wide | `sitemap.xml` vs dirs, canonical/title/meta samples, hubs, internal links, robots.txt — follow [../pickora-growth/seo.md](../pickora-growth/seo.md) |
| **D** | Growth readiness | Pinterest→article (not amzn), analytics hooks if present, CONTENT-BANK hygiene notes, 404 — no inventing GSC numbers |

## Severity

- **P0** — money loss, account ban risk, auth bypass, secrets exposed
- **P1** — should fix before scaling traffic
- **P2** — fix soon
- **P3** — nice-to-have

## Report format (every wave)

```markdown
# Site audit — Wave X — <date>

## Verdict
Ready / Not ready for growth (this wave): …

## Findings
| Severity | Location | Finding | Fix hint |
|---|---|---|---|

## What looks good
- …

## Next wave
…
```

Optional: write report to local `briefs/drafts/site-audit-wave-X.md` only if user asks to save a file (that path may be gitignored or drafts — ask before committing).

## Wave A checklist (security)

- Auth on mutate routes; public vs protected (`/api/media/file` GET, etc.)
- CORS allowlist; no `*` with credentials
- Login: timing-safe compares if present; **rate limit / lockout** gap
- No secrets in repo (`.env`, keys, tokens in HTML/JS)
- Studio XSS: `innerHTML` + escape helpers
- Media path traversal (`..`)
- Team/invite owner gates
- `robots.txt` Disallow for `/pk-studio/`, `/admin-api/`
- Note: built-in Security Review subagent only diffs changes — for full tree, audit files yourself

## Wave B checklist

- Count `amzn.to` vs `link.amazon` vs bare amazon without tag (note: `link.amazon` is valid Amazon short if alive)
- Covers on `pickora.shop/wp-content`, not Worker-only forever / not Amazon CDN hotlink
- `rel="sponsored…"` on affiliate CTAs

## Related

- Growth SEO: [../pickora-growth/seo.md](../pickora-growth/seo.md)
- After code fixes: Cursor `/review-security` on the diff only
