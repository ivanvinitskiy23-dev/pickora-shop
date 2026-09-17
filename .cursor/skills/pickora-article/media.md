# Pickora article media (free)

One **cover** per article is required for publish. In-body product photo grids are optional and usually unnecessary (tables + text match live guides).

## Required asset

| Role | Size | Path | HTML use |
|---|---|---|---|
| Cover | ~1200×670 (16:9), WebP, **under 250 KB** | `wp-content/uploads/YYYY/MM/{slug}-cover.webp` | Hero, `og:image`, Twitter image, articles hub card |

Optional: `{slug}-cover-768.webp` for srcset mid size.

## Free sources (priority order)

1. **Your photo** — drop file in `briefs/media-inbox/` (jpg/png/webp). Agent renames, converts to WebP if needed, moves to uploads.
2. **Generate in Cursor** — user says `обложку` / `generate cover`. Agent uses Cursor **GenerateImage** (aspect `16:9`), then saves/converts into the uploads path above. Prompt must show product *context* (kitchen, desk, pet home), not fake logos or readable brand packaging text.
3. **Reuse a related Pickora upload** — only for temporary drafts; do not publish a roundup that steals another article’s unique cover without user OK.

## Banned

- Hotlinking `images-na.ssl-images-amazon.com` (or any Amazon CDN) as permanent site media
- Scraping / downloading Amazon gallery without Associates image-use compliance
- Random Google Images / stock with unclear license
- Fake “lab test” photos or fake UI screenshots as proof of testing
- Oversized PNG/JPEG over 250 KB left uncompressed on publish

## Naming

```
wp-content/uploads/2026/09/how-to-choose-a-microwave-2026-cover.webp
```

Pattern: `{slug}-cover.webp` under year/month matching publish date.

## Brief fields

Fill in the brief before publish:

```markdown
## Media
- **Cover source:** owner photo | generate | path
- **Cover file:** briefs/media-inbox/...  OR  (generate)
- **Alt text:** …
- **Final uploads path:** (agent fills after place)
```

## Agent steps when placing media

1. Ensure folder `wp-content/uploads/YYYY/MM/` exists.
2. Prefer helper: `python scripts/place-article-cover.py --slug {slug} --source {path}` (needs Pillow for WebP).
3. Or produce WebP cover ≤250 KB another way; if none, keep optimized source and flag user to compress.
4. Set descriptive `alt` from brief (no keyword stuffing).
5. Wire absolute `https://pickora.shop/wp-content/uploads/...` in meta + body imgs (match sibling pages).
6. Hero img: `loading="eager"` `fetchpriority="high"` `decoding="async"` `width="1200"` `height="670"`.
7. Hub/related imgs: `loading="lazy"`.

## GenerateImage prompt recipe

Lifestyle editorial photo, no logos, no watermarks, no readable brand names on packaging, natural light, product category in real use, 16:9, clean commercial look matching Pickora (navy/blue site, not purple AI-slop gradients). Example:

> Ultra-realistic editorial photo of a modern apartment kitchen counter with a closed stainless countertop microwave beside a plate of leftovers, soft daylight, no logos, no text, 16:9

## Inbox

Owner drops raw files here: [`briefs/media-inbox/`](../../../briefs/media-inbox/). Keep `.gitkeep`; do not commit huge originals if a WebP already lives in uploads (prefer committing only final WebP).
