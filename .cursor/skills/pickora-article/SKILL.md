---
name: pickora-article
description: >-
  Writes Pickora.shop affiliate articles from a filled research brief. Use when
  drafting a new review, buyer guide, vs comparison, single-product verdict,
  use-case roundup, or buying-mistakes article; when the user mentions
  CONTENT-BANK, briefs/, or publishing a Pickora guide. For putting a draft
  live on the site, also use the pickora-publish skill.
---

# Pickora article writer

## When to use

User provides a filled file under `briefs/` (not `_TEMPLATE.md`) and asks for a Pickora article draft. Read the brief first, then [reference.md](reference.md) for the matching type skeleton. For covers see [media.md](media.md). To ship HTML to the site, switch to [../pickora-publish/SKILL.md](../pickora-publish/SKILL.md).

## Hard rules

1. **Research-only voice.** Never claim lab testing, “we tested for N hours,” or fake buyer quotes. Use specs + owner complaint/praise *themes from the brief*.
2. **No verbatim Amazon reviews.** Paraphrase clusters from the brief only.
3. **Affiliate CTAs:** every Amazon link must have `target="_blank"` and `rel="sponsored nofollow noopener noreferrer"`.
4. **English, Flesch ~60–70.** Short sentences. Concrete skip advice. Match tone of live guides under `best-*/index.html`.
5. **Do not invent products, ASINs, prices, or ratings** missing from the brief. If data is missing, ask or leave a clear `TODO:` — do not fabricate.
6. **Internal links:** use the URLs from the brief (and existing live hubs/reviews). Prefer `/articles/`, category hubs, and sibling guides.
7. **No AggregateRating** in schema. No fake testimonials.
8. **Do not scrape Amazon.** Only use the brief.
9. **Media:** do not hotlink Amazon CDN. Cover required before publish (see media.md).
10. **Chips / tags:** follow [chips.md](chips.md). Brief must list 1–3 allowed chip slugs. Hub category (4 big buckets) ≠ chip tags. Articles hub card uses `data-categories` + `.pk-card-tags` (multi-tag OK).

## Workflow

1. Open the brief path the user gave.
2. Confirm **Type number** (1–6). Load section map from [reference.md](reference.md).
3. Check **Media** section; if publishing, ensure cover plan exists.
4. Draft in this order:
   - Suggested `slug/`, `<title>`, meta description, OG title/description
   - **Chips** (1–3 slugs from [chips.md](chips.md)) + hub Category
   - Hero: badge (hub category), H1 with one blue accent word, dek
   - Body HTML fragment for `.elementor-widget-container` (see reference)
   - FAQ (use brief questions; invent answers only from brief facts)
   - Method note + final verdict
   - Related-post suggestions (2–3 titles + existing URLs if known)
   - Cover/alt suggestion
5. Save draft to `briefs/drafts/{slug}-draft.md` when useful.
6. If the user says **выпусти / publish**, run the pickora-publish skill (do not stop at draft).

## Voice examples (good)

- “Owner notes cluster around noise and uneven cooking — not a kitchen lab we run.”
- “Skip the dual-basket if your counter is already full.”
- “Get X if you cook for three or more. Skip it if you only reheat fries twice a week.”

## Voice examples (banned)

- “We spent 100 hours testing…”
- “Verified buyer Marcus said…”
- Copy-pasted Amazon review text

## Output default

Unless the user asks for a full `index.html`, deliver:

1. Meta block (title, description, slug, **hub Category**, **Chips** 1–3)
2. Hero block (badge, H1 HTML, dek)
3. Full article body HTML (tables, asides, headings)
4. FAQ HTML
5. Suggested related links + cover plan
6. Short “publish next steps” list (or run publish if commanded)

## Related files

- Agent entry: `AGENTS.md`
- Topic bank: `CONTENT-BANK.md`
- Brief template: `briefs/_TEMPLATE.md`
- Type skeletons: [reference.md](reference.md)
- **Chips / tags:** [chips.md](chips.md)
- Media: [media.md](media.md)
- Publish: [../pickora-publish/SKILL.md](../pickora-publish/SKILL.md)
- Live pattern: `best-air-fryers-of-2026-which-one-should-you-buy/index.html`
