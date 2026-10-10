# Pickora SEO checklist

Static site: `https://pickora.shop/{slug}/` · hubs under category folders · `sitemap.xml` · Studio SEO gate already enforces many fields.

## Page-level (every guide)

| Check | Target |
|---|---|
| `<title>` | Primary keyword + year/benefit · ~50–60 chars · brand optional at end |
| Meta description | Intent + who should skip · ~140–160 · one CTA “read the guide” |
| Canonical | Exact `https://pickora.shop/{slug}/` |
| One H1 | Matches search intent; may include one accent word in design |
| H2 structure | Scannable; mistakes / vs / FAQ match type 1–6 |
| Internal links | Hub category + 1–2 sibling live guides + `/articles/` when useful |
| Affiliate links | `rel="sponsored nofollow noopener noreferrer"` · `target="_blank"` |
| Schema | Article/FAQ OK · **no AggregateRating** / fake reviews |
| Cover / OG image | Local media, not Amazon CDN hotlink |
| Sitemap | Slug in `sitemap.xml` unless archived/noindex |

## Site-level

| Check | Notes |
|---|---|
| Hub pages | Clear H1, intro, links to live guides in that niche |
| `/articles/` | Chips + discoverability for mid-funnel |
| Soft archive | `noindex` + remove from hub/sitemap (Studio publish archive) |
| Crawl | After publish, optional GSC URL inspection (user) |
| Speed | Large covers → WebP/resize; avoid huge unoptimized PNG |

## Keyword framing for Pickora

Prefer:
- Commercial / mid-funnel: `best … 2026`, `how to choose …`, `… vs …`, `… buying mistakes`
- US English, Amazon shopper language
- One primary per page; secondaries in H2/FAQ — no keyword stuffing

Avoid:
- Inventing “we rank #3 for X” without GSC data
- Cannibalizing two live pages on the same primary (flag in bank priority)

## Audit output format

```
## SEO audit: /{slug}/

### Keep
- …

### Fix (do these)
1. Title → `…`
2. Meta → `…`
3. Add internal link → …

### Nice-to-have
- …

### Next 1 action
…
```

## Hand-off

- Copy/meta only → stay in Growth chat.
- Need new article body → user opens Article chat / `pickora-article`.
- Need HTML + sitemap ship → `pickora-publish` with explicit user command.
