# Pickora article type maps

Use the skeleton that matches the brief **Type number**. Keep chrome classes from live reviews: `pk-review-hero`, `pk-crumbs`, `pk-skip`, comparison table styles, `pk-related`, disclosure footer.

Shared blocks (every type):

1. Breadcrumbs: Home › Articles › [short title]
2. Category hub badge + H1 + dek (hub name on hero; chips go on `/articles/` card — see chips.md)
3. Intro (2 short paragraphs) + 2–3 `.pk-inline` internal links
4. `<aside class="pk-skip">` **Who should skip this**
5. **Our research method** (1 short paragraph from brief)
6. FAQ (5 Qs)
7. Affiliate disclosure line
8. Related posts suggestions

Amazon CTA button pattern:

```html
<a style="background: #FF9900; color: white; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;" href="AFFILIATE_URL" target="_blank" rel="sponsored nofollow noopener noreferrer">Check on Amazon →</a>
```

---

## Type 1 — Roundup (`Best X 2026`)

Order:

1. Shared intro + skip
2. Quick comparison table (Model / key specs / Best for / Rating only if in brief / Price band / Action)
3. Detailed reviews (numbered; Pros / Cons / Verdict / Buy if / Skip if)
4. Short buying criteria list
5. Research method
6. Final verdict awards (Best overall, Value, Budget, …)
7. FAQ + conclusion

Products: 5–8 from brief.

---

## Type 2 — Buyer guide (`How to choose an X`)

Order:

1. Shared intro + skip
2. Decision criteria (H2/H3 sections: size, power, features, budget, maintenance)
3. Common mistakes (short)
4. **Example picks** (2–4 products) with light Pros/Cons + CTA — not a full 8-model table unless brief has it
5. Simple “choose this if…” decision tree (bullets)
6. Research method
7. FAQ + conclusion

Emphasis: criteria first, products second.

---

## Type 3 — Vs (`A vs B`)

Order:

1. Shared intro + skip (who should not bother comparing)
2. Spec table side-by-side (2 columns)
3. Round-by-round: build, performance themes, noise/app/cleanup, value
4. Who should buy A / who should buy B
5. Research method
6. FAQ + conclusion with a clear winner *for named use cases* (not one false universal winner)

Products: exactly 2 from brief.

---

## Type 4 — Single pick (`Is the X worth it?`)

Order:

1. Shared intro + skip
2. What it is / who it targets
3. Specs that matter
4. What owners praise / what they complain about (paraphrase brief clusters)
5. Alternatives (1–2 from internal links or brief notes — no invented models)
6. Verdict: buy / wait / skip
7. Research method
8. FAQ + conclusion
9. Single primary CTA

Products: 1 primary; optional soft alternate links if listed in brief.

---

## Type 5 — Problem (`Best X for [use case]`)

Order:

1. Shared intro framed around the use case + skip
2. What “good for this use case” means (criteria)
3. Short comparison table (3–6 models) filtered to that use case
4. Detailed picks with use-case verdicts
5. Research method
6. FAQ + conclusion

Products: 3–6 from brief.

---

## Type 6 — Mistakes (`X buying mistakes to avoid`)

Order:

1. Shared intro + skip (who already knows this)
2. 5–7 mistakes as H3s: what people do wrong → what to do instead
3. Soft product CTAs only where the brief lists them (not a hard sell dump)
4. Mini checklist
5. Research method
6. FAQ + conclusion

Products: optional 2–3 supporting CTAs from brief.

---

## Meta / SEO snippets

- Title: `Working title – Pickora` (≤60 chars when possible)
- Meta description: 140–160 chars, Flesch-friendly, no banned hype (“miracle”, “guaranteed”, fake lab)
- `og:type`: `article`
- JSON-LD when wiring page: `Article` + `BreadcrumbList`; add `ItemList`/`Product` only from brief products; **never** `AggregateRating`

## Publish checklist (when wiring)

- [ ] `slug/index.html` from sibling review chrome
- [ ] Card on `articles/index.html`
- [ ] Category hub link if relevant
- [ ] `.pk-related` to 2–3 neighbors
- [ ] URL in `sitemap.xml`
- [ ] Row in `CONTENT-BANK.md` → status `live` + brief path
- [ ] Commit + push `main` only when user asks
