# Pickora Pinterest playbook

## Two products (do not mix)

| Product | What it is | Pinterest destination | Amazon |
|---|---|---|---|
| **Ideas pins** (`content/pins.json` → `/categories/`) | Visual lifestyle boards — **not** guides | `https://pickora.shop/categories/#{pin-slug}` | `amzn.to` / affiliate CTAs **on the site pin popup** |
| **Guide pins** (optional, separate) | Promo for a live article | `https://pickora.shop/{article-slug}/` | CTAs inside the article |

**Primary Pickora model = Ideas pins.** Site Ideas = mirror of Amazon product sets. Same creative goes to Pinterest with a link/tag back to **that pin on pickora.shop**, where affiliate links live. People leave Pinterest → land on the Ideas pin → click through to Amazon.

- Ideas pins are **independent of articles**. Do not treat Wave-D-style “pin → article only” as the Ideas rule.
- If an Ideas pin happens to match a niche that has a guide (e.g. microwaves), you *may* also surface the guide — optional, not required.
- Never put bare `amzn.to` as the Pinterest outbound for Ideas: destination stays on pickora.shop so disclosure + cookie path stay on-site.

## Why Pinterest for Pickora

- Visual niches (desk, kitchen, travel, gifts) match Ideas boards.
- Long shelf life for evergreen lifestyle creatives.
- Goal (Ideas): **Pinterest → `/categories/#{slug}` → Amazon CTA on site**.

## Account setup (user does once)

- [ ] Pinterest Business profile
- [ ] Claim website `pickora.shop` (meta tag or HTML file — only with user’s real verification)
- [ ] Rich Pins / URL metadata working (OG on `/categories/` + pin hash open)
- [ ] Boards named by lifestyle intent (Work, Kitchen, Travel…), aligned with Ideas filters

Do **not** invent the user’s profile URL. Ask for it.

## Board map (start — Ideas)

| Board (EN) | Maps to Ideas filter | First pin targets |
|---|---|---|
| Work & Study | `work` | desk / monitor / keyboard Ideas |
| Kitchen & Dining | `kitchen` | air fryer / coffee / cookware Ideas |
| Home & Comfort | `home` | lighting / comfort Ideas |
| Travel & EDC | `travel` | pack / power Ideas |
| Gifts & Gadgets | `gifts` | gift-ready product sets |

1–2 boards first is better than 10 empty ones. Guide-oriented boards (e.g. “Air Fryer Buying Guides”) are optional and separate from Ideas.

## Pin formats (Ideas)

| Format | Idea | Image brief |
|---|---|---|
| Lifestyle set | Mood board + 2–4 products in scene | Vertical 1000×1500, room context, readable title |
| Single hero | One hero product in use | Product + environment, small Pickora mark |
| Gift stack | “Desk upgrade under $X” | Layered products, clear price band if claimed on site |

**Aspect:** 2:3 (e.g. 1000×1500). Brand colors: navy `#15223B`, blue `#2075D2`, light bg — not purple glow spam. OG landscape covers for articles are a different asset — do not reuse as Ideas pin art without a 2:3 crop.

## Pin copy template (Ideas)

```
Title (≤100 chars, front-load mood/niche):
{Scene / benefit} — {niche} | Pickora Ideas

Description (≤500 chars):
{Hook}. Shop the look (affiliate links on site): {https://pickora.shop/categories/#{pin-slug}}
{2–4 hashtags max, niche-specific}
```

Rules:
- Destination = **Ideas pin URL** (`/categories/#{slug}`), not Amazon, not article (unless this is explicitly a Guide pin pack).
- Product names / claims must match what’s on the live pin popup.
- Hashtags: 2–4 relevant, not 20 junk tags.
- Affiliate disclosure lives on site; pin can say “links on Pickora” if needed.

## Weekly cadence (realistic solo)

| Day | Action |
|---|---|
| Mon | 2–3 Ideas pins (same creative family or one board) |
| Wed | 2 Ideas pins, second filter/niche |
| Fri | Repin/refresh; check outbound to `/categories/` |
| Anytime | After new pin published in Studio → same-day Pinterest post with `#slug` URL |

Consistency > volume. 5–10 quality Ideas pins/week beats 50 spam.

## Idea sources

1. Live rows in `content/pins.json` / Studio Pins
2. New lifestyle scenes you add to Ideas (independent of CONTENT-BANK articles)
3. Pinterest search autocomplete for mood + niche (“japandi desk setup”, “small kitchen gadgets”)
4. Optional: live guide slugs only when doing a **Guide pin** pack

## Image generation brief (for Cursor / designer)

When asking for a pin image, specify:
- Size 1000×1500
- Headline text (exact)
- Subline (optional)
- Niche visual (desk / kitchen / travel / gift)
- Pickora wordmark small, not overpowering
- No fake Amazon UI, no scraped product CDN photos as permanent assets

## Anti-patterns

- Linking Pinterest straight to `amzn.to` (skips site disclosure + trust)
- Treating Ideas pins as “must promote articles”
- Confusing article OG 16:9 covers with Ideas 2:3 creatives
- Duplicate title+image spam across boards same day
- Empty boards with only 1 pin
- Inventing Pinterest profile/board URLs
- Claiming “guaranteed viral”
