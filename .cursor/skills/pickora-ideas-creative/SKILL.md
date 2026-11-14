---
name: pickora-ideas-creative
description: >-
  Generates final 2:3 vibe lifestyle images for Pickora.shop Ideas pins (same
  creative for site + Pinterest), saves to ideas-inbox/, and fills EN pin
  title/description when missing. Use when the user asks to generate or
  regenerate Ideas pin art, wordmark/arrows variants, product lifestyle scenes
  from a Research handoff or a user-only prompt, or to save creatives for Studio
  upload. Not for article covers (16:9), full articles, or publishing pins.json
  unless the user explicitly asks to publish.
---

# Pickora Ideas Creative

You produce **final Ideas pin creatives** for pickora.shop: one 2:3 lifestyle image used on both the site Ideas board and Pinterest. Affiliate CTAs live on the site pin; Pinterest only deep-links to that pin.

Upstream packet / brief work: [../pickora-ideas-research/SKILL.md](../pickora-ideas-research/SKILL.md).

## When to use

- User pastes a **Research handoff packet** and asks for pin art / generate / regenerate
- User gives a **prompt only** (no Research) + product photos and wants Ideas creative
- Commands: `сгенерируй`, `regenerate`, `с wordmark`, `со стрелками`, `без текста`, `сохранить в ideas-inbox`

**Not this skill:** article drafting, article covers (16:9), Growth strategy-only chats, scraping Amazon, inventing product photos, or writing `pins.json` / `wp-content/uploads` unless the user **explicitly** says publish.

## Hard rules

1. **Format:** portrait **2:3** (preferred export ~**1000×1500**). Same file for site Ideas + Pinterest. Never treat as article cover 16:9.
2. **GenerateImage only on ask.** Call Cursor `GenerateImage` only when the user requests generate/regenerate (or an explicit variant command). Do not auto-generate “to be helpful.”
3. **Aspect for the tool:** request portrait pin framing. If the tool enum has no `2:3`, use the nearest portrait option (`3:4`) and keep composition croppable to 2:3 / 1000×1500.
4. **Input photos required.** User supplies real product photos (usually Amazon main shots) for **1–5** products. Pass them via `reference_image_paths`. Never invent or scrape product images.
5. **Save local only by default:** create `ideas-inbox/` at repo root if missing; write finals there. User uploads via Studio. Do **not** write `wp-content/uploads` or `content/pins.json` unless the user explicitly says publish.
6. **Default: no headline text in frame.** Scene + products only. Small **Pickora** wordmark always (noticeable, not dominating — see wordmark test). Arrows/labels with product names **only** if the user asks (`со стрелками`).
7. **Anti-AI-slop:** before every `GenerateImage`, read [hallmark-lite.md](hallmark-lite.md) and follow it. Human-achievable setups; no purple glow spam, fake luxury stock, fake Amazon UI, unreadable logos, or grotesque hands.
8. **Pinterest destination:** always `https://pickora.shop/categories/#{slug}` — never bare `amzn.to`. Real `amzn.to` links are for Studio upload later; Creative does not publish them by default.
9. **No Amazon scrape.** No fabricated ASINs, prices, ratings, or product photos.
10. **Language:** short **RU** with the user in chat; all public pin title/description **EN**.

## Inputs

Accept either:

| Source | What you need |
|---|---|
| **Research handoff** | Packet pasted in chat (slug, vibe, products, optional title/desc, photo notes) |
| **User-only prompt** | Allowed without Research: vibe/scene + 1–5 product photos (+ optional slug) |

If slug is missing, ask once or propose a kebab-case slug from the vibe/niche before saving files.

## Image brief (locked)

- **Scene with vibe** — lifestyle context (desk, kitchen, travel flat-lay, etc.), not a white void catalog shot.
- **Products integrated naturally** (1–5), matching user reference photos.
- **Default overlay:** small Pickora wordmark only. No big headline, no price banners, no fake UI.
- **On request — arrows/labels:** small arrows or short product-name labels; keep readable and secondary to the scene.
- **On request — без текста:** no arrows/labels; wordmark still OK unless user says strip brand too (then confirm).
- **Wordmark test:** after generate, confirm the mark is visible at pin-thumb size but does not own the frame. If it fails, regenerate with adjusted size/placement.

Brand cues (from site): navy `#15223B`, blue `#2075D2`, light clean backgrounds preferred over neon/purple gradients.

## Commands (RU / EN)

| Command | What you do |
|---|---|
| `сгенерируй` / `generate` | Build prompt from handoff or user prompt → read hallmark-lite → `GenerateImage` → save to `ideas-inbox/` |
| `regenerate` / `перегенерируй` | New variant; keep slug/products unless user changes brief |
| `с wordmark` | Ensure small Pickora wordmark (default path; regenerate if missing/weak) |
| `со стрелками` | Add small arrows/labels with product names |
| `без текста` | No headline/arrows/labels in frame (wordmark default on) |
| `сохранить в ideas-inbox` | Copy/move latest creative into `ideas-inbox/` with clear filename |

## Workflow

1. Parse Research handoff **or** user-only prompt + count product photos (1–5).
2. Confirm slug (for filename + Pinterest URL). Create `ideas-inbox/` if needed.
3. Read [hallmark-lite.md](hallmark-lite.md).
4. Draft a concrete `GenerateImage` description: vibe, setting, lighting, product placement, wordmark placement, text mode (none / arrows). Attach `reference_image_paths`.
5. Generate only after explicit user ask. Prefer filename like `{slug}-ideas.png` (or `-v2` on regenerate).
6. Save/copy final into `ideas-inbox/` (repo root). Report local path.
7. Deliver **EN title + description** if Research omitted them (see copy).
8. Stop. Remind: user uploads in Studio; Creative does not publish `pins.json` unless asked.

## Pin copy (EN, if missing)

```
Title (≤100 chars, front-load mood/niche):
{Scene / benefit} — {niche} | Pickora Ideas

Description (≤500 chars):
{Hook}. Shop the look (affiliate links on site): https://pickora.shop/categories/#{slug}
```

Never put bare `amzn.to` in the Pinterest destination field.

## Output default (chat)

Short RU reply with:

1. Local path(s) under `ideas-inbox/`
2. EN title + description (+ destination URL)
3. Text mode used (без текста / wordmark / стрелки)
4. Next step: user uploads via Studio (and supplies real `amzn.to` there)

## Do not

- Scrape Amazon
- Invent product photos or products
- Publish / write `pins.json` or site uploads without explicit ask
- Write full articles
- Confuse with article covers (16:9) or Guide-pin article destinations
- Link Pinterest Ideas creatives straight to `amzn.to`

## Related

- Research handoff: [../pickora-ideas-research/SKILL.md](../pickora-ideas-research/SKILL.md)
- Visual anti-slop: [hallmark-lite.md](hallmark-lite.md)
- Growth / Pinterest playbook: [../pickora-growth/pinterest.md](../pickora-growth/pinterest.md)
- Inbox: `ideas-inbox/` (repo root)
