# Pickora Article Agent

Use this repo chat for **articles only** when you want drafts published to the live static site.

## Skills to follow

1. [`.cursor/skills/pickora-article/SKILL.md`](.cursor/skills/pickora-article/SKILL.md) — write from a research brief
2. [`.cursor/skills/pickora-article/chips.md`](.cursor/skills/pickora-article/chips.md) — article filter chips / multi-tags
3. [`.cursor/skills/pickora-article/media.md`](.cursor/skills/pickora-article/media.md) — covers and image rules (free)
4. [`.cursor/skills/pickora-publish/SKILL.md`](.cursor/skills/pickora-publish/SKILL.md) — wire HTML, hubs, sitemap, commit/push

## Your commands (say these in chat)

| Command (RU / EN) | What the agent does |
|---|---|
| `черновик из brief …` / `draft from brief …` | Writes draft only (no site files) |
| `обложку для …` / `generate cover for …` | Creates cover via Cursor image tool, saves under uploads |
| `положи моё фото` + path | Converts/places your file as the article cover |
| `выпусти статью …` / `publish article …` | Full wire: page + media + articles hub + sitemap + bank status |
| `закоммить и запушь` / `commit and push` | Ships to `origin main` (GitHub Pages) |

## Preconditions before `выпусти`

- Filled brief in `briefs/` (not `_TEMPLATE.md`) including **Chips** (1–3 allowed slugs)
- Real `amzn.to` links (no `TODO`)
- Cover decided: your photo in `briefs/media-inbox/` **or** `generate cover` **or** path already in brief

## Do not

- Scrape Amazon
- Publish without a brief
- Hotlink Amazon CDN images as permanent site media
- Invent lab tests or fake testimonials
- Touch Telegram CMS plans or unpaid social URL invention
