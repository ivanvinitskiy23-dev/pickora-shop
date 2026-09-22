---
name: pickora-publish
description: >-
  Publishes Pickora articles to the static site from a filled brief: cover media,
  slug/index.html chrome, articles hub card, sitemap, CONTENT-BANK status,
  commit/push on request. Use when the user says publish, выпусти статью, wire
  article, ship guide, or asks to put a draft live on pickora.shop.
---

# Pickora article publisher

Read first: sibling writer [../pickora-article/SKILL.md](../pickora-article/SKILL.md) and [../pickora-article/media.md](../pickora-article/media.md).

## Commands

| User says | Action |
|---|---|
| draft / черновик | Writer skill only → `briefs/drafts/{slug}-draft.md` |
| generate cover / обложку | Follow media.md → WebP under `wp-content/uploads/YYYY/MM/` |
| publish / выпусти | Full pipeline below |
| commit and push | Git commit relevant files + `git push origin main` when user explicitly asks |

## Publish pipeline (must run in order)

### 0. Gate

Abort publish if any fail:

- Brief exists and Type 1–6 set
- Brief lists **1–3 Chips** from [chips.md](../pickora-article/chips.md) (valid slugs only)
- Every affiliate URL is real (reject `TODO`, `example.com`, empty)
- Cover path exists on disk **or** user approved generate-cover in this turn
- Slug is kebab-case and folder does not already exist (unless user said overwrite)

### 1. Media

Follow [media.md](../pickora-article/media.md). Result:

- Cover: `/wp-content/uploads/YYYY/MM/{slug}-cover.webp` (also use for OG + articles card)
- Optional mid-size: `{slug}-cover-768.webp` if creating srcset
- Record final paths in the brief Media section

### 2. Write body

If no draft yet, run writer skill. Prefer existing draft in `briefs/drafts/` if present and brief unchanged.

### 3. Wire `slug/index.html`

1. Copy chrome from nearest sibling review, default:
   `best-air-fryers-of-2026-which-one-should-you-buy/index.html`
2. Replace: `<title>`, meta description, canonical, OG/Twitter, JSON-LD (`Article` + `BreadcrumbList`; `ItemList`/`Product` only from brief; **no AggregateRating**)
3. Replace hero: crumbs, badge, H1, dek
4. Replace cover `<img>` src/srcset/alt → new cover (eager + `fetchpriority="high"` + width/height)
5. Replace article body inside the text-editor widget container
6. Replace `.pk-related` cards (2–3 neighbors with real URLs + their covers)
7. Keep header/footer/nav/consent/analytics scripts intact
8. Keep disclosure footer pattern

### 4. Hubs

- Prepend a new `.pk-card` on [`articles/index.html`](../../../articles/index.html):
  - `data-categories` = brief **Chips** (space-separated slugs from [chips.md](../pickora-article/chips.md))
  - `.pk-card-tags` with 1–3 badges (first primary, rest `pk-card-tag--soft`); labels must match chips.md
  - title, excerpt, cover, link
- Homepage Latest Reviews: prepend a new `.pk-rev-card` at the top of `.pk-reviews-grid` on [`index.html`](../../../index.html). **Keep exactly 4 cards** (newest → oldest). Drop the oldest card when adding a new one.
- If category hub has an article list/cards, add a link there when an obvious slot exists; otherwise skip without inventing layout
- Add `<url>` to [`sitemap.xml`](../../../sitemap.xml) with today's `lastmod`
- If publish needs a **new chip slug** not already in `articles/index.html` filter bar + `pickora-article-filters.js`, stop and update [chips.md](../pickora-article/chips.md) first (only when ≥3 bank topics need it)

### 5. Bank + progress

- `CONTENT-BANK.md`: status → `live`, brief path filled
- `PROGRESS.md`: bump Phase 5 live count by 1; short changelog line

### 6. Ship

Only if user asked commit/push:

- Stage: new `slug/`, cover webp(s), `articles/index.html`, `sitemap.xml`, `CONTENT-BANK.md`, `PROGRESS.md`, brief updates
- Do **not** stage `План-telegram-cms.html`
- Commit message style: `Publish the {title} guide on Pickora.`
- `git push origin main`

## After publish

Tell the user:

1. Live URL `https://pickora.shop/{slug}/`
2. Wait 1–2 min for GitHub Pages
3. Hard refresh / request indexing in GSC optional

## Fail loudly

If cover missing, affiliate TODOs remain, or sibling chrome copy would wipe unrelated pages — stop and list blockers. Do not half-publish.
