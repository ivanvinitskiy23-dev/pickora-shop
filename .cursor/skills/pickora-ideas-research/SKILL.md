---
name: pickora-ideas-research
description: >-
  Runs Pickora.shop Ideas Research: proposes product shortlists and Creative
  handoff packets for Amazon-affiliate Ideas pins by filter
  (work|kitchen|home|travel|beauty|gifts|leisure). Use when the user asks for
  Ideas Research, визуальные идеи, a product shortlist, a pin idea packet, or
  a categories filter lifestyle set — not for image generation, pins.json
  publish, article drafts, Growth SEO, or Ideas Creative execution.
---

# Pickora Ideas Research

**Mode:** Ideas Research only. Separate from Article, Growth, and Ideas Creative.

You turn a **filter** (+ optional vibe/scene hint) into a product shortlist, then a **chat handoff packet** the owner pastes into Ideas Creative. You do **not** generate images, edit `content/pins.json`, or write article guides.

## When to use

| Use this skill | Hand off elsewhere |
|---|---|
| Filter → product shortlist → Creative packet | Image gen / pin frame → [../pickora-ideas-creative/SKILL.md](../pickora-ideas-creative/SKILL.md) |
| “What products fit this kitchen scene?” | Article draft / publish → pickora-article / pickora-publish |
| New Ideas pin concept (not live yet) | Traffic, boards, GSC → pickora-growth |

## Filters (locked)

User starts with **one** filter id from `content/pins.json` (not `all`):

| id | Label |
|---|---|
| `work` | Work & Study |
| `kitchen` | Kitchen & Dining |
| `home` | Home & Comfort |
| `travel` | Travel & EDC |
| `beauty` | Self-Care & Beauty |
| `gifts` | Gifts & Gadgets |
| `leisure` | Leisure & Hobby |

Optional: short vibe/scene hint (e.g. “weekday night ramen for one”, “sunlit desk, no clutter”).

## Hard rules

1. **No Amazon scrape.** Do not claim to scrape Amazon, pull live prices, ratings, or inventory.
2. **No invented affiliate links.** Never invent `amzn.to` (or any affiliate URL). ASIN optional and only if the user/owner already knows it — never fabricate.
3. **No invented photos.** Do not invent image URLs or claim product shots exist.
4. **No AggregateRating / lab claims.** No “we tested”, fake stars, or fake testimonials.
5. **Ideas funnel first.** Primary path: Pinterest → `https://pickora.shop/categories/#{slug}` → Amazon CTAs on site. Do **not** treat guide-pin → article as the primary Ideas Research output.
6. **No Creative execution here.** Do not generate images. Do not publish or edit `pins.json`.
7. **No articles.** Do not draft buyer guides or `briefs/` content in this mode.
8. **Public copy = English.** Site/pin title + descriptions in EN. Chat with the owner may be short RU.
9. **Products = brand + model name.** Shortlist rows must be specific enough to buy later (not “nice kettle”).

## Vibe philosophy

Human, achievable DIY lifestyle — the viewer feels they can recreate the scene by buying the products.

| Aim for | Avoid |
|---|---|
| Lived-in, recreatable home/desk/kitchen | AI-slop luxury porn, empty marble mansions |
| Soft natural light, real textures | Purple glow, neon cyber haze |
| Products readable as shoppable objects | Fake Amazon UI, unreadable brand packaging |
| Warm, hallmark-lite mood (see Creative) | Stock “perfect influencer” emptiness |

Shared vibe notes: both Research and Creative use **hallmark-lite** (anti-AI-slop, human DIY). Creative must read [../pickora-ideas-creative/hallmark-lite.md](../pickora-ideas-creative/hallmark-lite.md) before GenerateImage. Upstream inspiration: [Nutlope/hallmark](https://github.com/Nutlope/hallmark) (do not run full Hallmark page Design for Ideas).

## Commands (RU / EN)

| Command | What you do |
|---|---|
| `идея для {filter}` / `idea for {filter}` | Start Research: confirm filter + optional vibe → shortlist |
| `shortlist` / `шортлист` | Propose **5–8** products (brand + model; ASIN optional) |
| `пакет для Creative` / `packet for Creative` | After user picks 1–5: output full handoff packet in chat |
| `refine vibe` / `уточни вайб` | Tighten scene/vibe; refresh shortlist or packet roles |
| `ещё варианты` / `more options` | Replace 2–4 shortlist rows without resetting filter |

## Workflow

### 1. Intake

Ask only what is missing:

1. **Filter** (required): one of the seven ids above.
2. **Vibe/scene hint** (optional): one sentence.
3. Constraints if offered (budget band, must-include hero, “no Apple”, etc.).

Do not ask for `amzn.to` or photos yet — owner provides those later in Creative / Studio.

### 2. Shortlist (5–8)

Output a compact table:

| # | Brand + model | Role hint | Why it fits the scene | ASIN (optional) |
|---|---|---|---|---|
| 1 | … | hero / support / prop | one line | leave blank or owner-known |

Rules for the shortlist:

- **5–8 rows** only.
- Name real-looking, commonly sold products; if unsure, mark `verify on Amazon before buy` — still **no** invented links.
- Prefer a clear **hero** + 2–4 supports that compose one frame.
- Never claim stock, price, or rating.

Then ask the user to pick **1–5** products for the frame.

### 3. After selection → Creative handoff packet

When the user picks 1–5 products, output the **exact packet template below as a chat message** (not a file). Owner pastes it into Ideas Creative chat.

Remind:

- Affiliate links + product photos come **later** (user / Studio).
- Pinterest destination: `https://pickora.shop/categories/#{slug}` (never bare `amzn.to` as the pin outbound).

### 4. Stop

End after the packet (or after shortlist if still waiting on picks). Point to Creative skill for image + pin publish work.

## Language

| Surface | Language |
|---|---|
| Title, boardDesc, popupDesc, image prompt | **English** |
| Owner chat (status, questions) | Short RU OK |
| Optional `RU notes` block in packet | Short RU for owner only |

## Do not

- Generate or regenerate pin images
- Write or patch `content/pins.json`
- Invent `amzn.to`, ASINs, prices, ratings, or photo URLs
- Scrape Amazon or claim live Amazon data
- Draft article guides / briefs / publish HTML
- Run Growth SEO audits or weekly traffic plans as the main job
- Make guide-pin → article the primary Ideas recommendation
- Dump long essays — keep shortlist + packet scannable

## Handoff packet template (paste to Creative)

Copy this block into chat after the user selects products. Fill every `{{…}}` field. Keep product roles aligned with the 1–5 picks. `boardDesc` and `popupDesc` may be identical.

```text
=== PICKORA IDEAS → CREATIVE HANDOFF ===
Skill source: pickora-ideas-research
Next: follow ../pickora-ideas-creative/SKILL.md
Do not invent amzn.to or photos here — owner adds later.

FILTER: {{work|kitchen|home|travel|beauty|gifts|leisure}}
SUGGESTED SLUG: {{kebab-case-slug}}
PINTEREST / SITE DESTINATION:
https://pickora.shop/categories/#{{kebab-case-slug}}

VIBE (EN, 1–2 sentences):
{{human DIY lifestyle mood — achievable, not luxury porn}}

SCENE (EN, concrete frame):
{{who / where / time of day / what is happening}}

SELECTED PRODUCTS (1–5):
1. ROLE: {{hero|support|prop}} — {{Brand + exact model}} — ASIN: {{optional or TBD}}
2. ROLE: … — … — ASIN: …
3. …

EN IMAGE GENERATION PROMPT (2:3 lifestyle scene):
{{One paragraph. Vertical 2:3 composition. Natural light. Readable products in use.
Hallmark-lite warmth. No purple glow, no fake Amazon UI, no unreadable packaging,
no empty luxury mansion. Soft lived-in room the viewer could recreate.}}

EN TITLE:
{{≤ ~80 chars, mood-first, shoppable Ideas pin}}

EN boardDesc / popupDesc (same OK):
{{1–3 sentences. Scene + benefit. No ratings. No “we tested”.}}

OPTIONAL RU NOTES (owner only):
{{коротко: нюансы для Creative / что проверить на Amazon}}

OWNER TODO LATER:
- [ ] Real amzn.to per product
- [ ] Product photos if needed beyond generated scene
- [ ] Studio / pins.json publish (Creative + publish path — not Research)
=== END HANDOFF ===
```

## Example micro-flow

1. User: `идея для kitchen` + “slow Sunday coffee”
2. Agent: shortlist 6–7 coffee/kitchen products with roles
3. User: picks 3
4. Agent: filled handoff packet in chat + reminder of Creative skill + `#slug` URL
5. Stop

## Related

- Ideas Creative (images / frame / next steps): [../pickora-ideas-creative/SKILL.md](../pickora-ideas-creative/SKILL.md)
- Live Ideas data shape: `content/pins.json`
- Pinterest destination rules (Growth): [../pickora-growth/pinterest.md](../pickora-growth/pinterest.md)
- Article / publish (other modes): [../pickora-article/SKILL.md](../pickora-article/SKILL.md), [../pickora-publish/SKILL.md](../pickora-publish/SKILL.md)
- Router: `AGENTS.md`
