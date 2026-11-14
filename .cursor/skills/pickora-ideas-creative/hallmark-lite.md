# Hallmark-lite (Pickora Ideas pins)

Adapted from [Nutlope/hallmark](https://github.com/Nutlope/hallmark) anti-AI-slop discipline for **lifestyle pin photography**, not full web UI builds. Full Hallmark stays upstream; this file is the only dependency Creative must read before `GenerateImage`.

## Philosophy (Pickora)

The viewer should think: **I could set this up myself — I just need to buy these products.** Beautiful, human, achievable. Not a fantasy catalog or AI luxury porn.

## Aim for

- Lived-in rooms: real desks, counters, shelves, soft clutter that still looks intentional
- Soft natural or practical lamp light; readable product shapes matching the user’s reference photos
- 1–5 shoppable objects clearly placed in the scene (hero + supports)
- Warm, specific mood tied to the filter (`kitchen`, `work`, …) — each pin should feel like a *different* home moment, not a template recolor
- Small Pickora wordmark: visible at thumbnail, never the subject

## Ban (AI tells for pins)

| Tell | Why it fails | Fix |
|---|---|---|
| Purple / indigo glow gradients | Default AI aesthetic | Real room light; navy/blue only as tiny brand accent |
| Empty marble mansion / private jet luxury | Unachievable fantasy | Normal apartment / small kitchen / real desk |
| Fake Amazon UI, price tags, star widgets | Looks scraped / dishonest | Products in use only; CTAs live on site |
| Unreadable brand packaging / melting logos | AI artifact | Match user product photos; simplify labels if needed |
| Grotesque hands, extra fingers, warped geometry | Low-trust slop | Prefer still life / over-shoulder; regenerate if broken |
| Floating product collage on white void | Catalog, not Ideas | Put objects in a real scene |
| Giant headline text in frame (unless user asked) | Poster spam | Default = no titles; optional small name labels only on ask |
| Same desk/kitchen layout every pin | Template fingerprint | Change angle, time of day, hero product, surface materials |

## Pre-emit check (score 1–5; revise if any score under 3)

1. **Human** — could a normal person recreate this next weekend?
2. **Readable products** — would a shopper recognize the 1–5 items?
3. **Restraint** — wordmark small; no neon / purple soup
4. **Specificity** — this scene ≠ the last Ideas pin
5. **Honesty** — no fake ratings, prices, or “lab tested” props

## Upstream

- Hallmark repo: https://github.com/Nutlope/hallmark  
- Especially: `skills/hallmark/references/anti-patterns.md` (purple gradient, invented metrics, fake chrome)
- Do **not** run full Hallmark page Design flow for Ideas pins — image rules above are enough.
