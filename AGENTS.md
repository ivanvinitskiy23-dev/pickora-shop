# Pickora agents

Two focused chats. Say which mode you want at the start of a **new** chat (or use the commands below).

| Mode | Open when you want… | Skill |
|---|---|---|
| **Article** | Draft / cover / publish guides to the live static site | [pickora-article](.cursor/skills/pickora-article/SKILL.md) + [pickora-publish](.cursor/skills/pickora-publish/SKILL.md) |
| **Growth** | Traffic, SEO, Pinterest, weekly plans, keyword priority | [pickora-growth](.cursor/skills/pickora-growth/SKILL.md) |

---

## Article agent

Use this repo chat for **articles** when you want drafts published to the live static site.

### Skills

1. [`.cursor/skills/pickora-article/SKILL.md`](.cursor/skills/pickora-article/SKILL.md) — write from a research brief  
2. [`.cursor/skills/pickora-article/chips.md`](.cursor/skills/pickora-article/chips.md) — article filter chips / multi-tags  
3. [`.cursor/skills/pickora-article/media.md`](.cursor/skills/pickora-article/media.md) — covers and image rules (free)  
4. [`.cursor/skills/pickora-publish/SKILL.md`](.cursor/skills/pickora-publish/SKILL.md) — wire HTML, hubs, sitemap, commit/push  

### Commands

| Command (RU / EN) | What the agent does |
|---|---|
| `черновик из brief …` / `draft from brief …` | Writes draft only (no site files) |
| `обложку для …` / `generate cover for …` | Creates cover via Cursor image tool, saves under uploads |
| `положи моё фото` + path | Converts/places your file as the article cover |
| `выпусти статью …` / `publish article …` | Full wire: page + media + articles hub + sitemap + bank status |
| `закоммить и запушь` / `commit and push` | Ships to `origin main` (GitHub Pages) |

### Preconditions before `выпусти`

- Filled brief in `briefs/` (not `_TEMPLATE.md`) including **Chips** (1–3 allowed slugs)
- Real `amzn.to` links (no `TODO`)
- Cover decided: your photo in `briefs/media-inbox/` **or** `generate cover` **or** path already in brief

### Do not (Article)

- Scrape Amazon  
- Publish without a brief  
- Hotlink Amazon CDN images as permanent site media  
- Invent lab tests or fake testimonials  
- Touch Telegram CMS plans or invent unpaid social profile URLs  

---

## Growth agent (SEO · Traffic · Pinterest)

Open a **new chat** and say: `агент Growth` / `Growth agent` / `SEO и Pinterest`.

### Skills

1. [`.cursor/skills/pickora-growth/SKILL.md`](.cursor/skills/pickora-growth/SKILL.md) — main growth workflow  
2. [`.cursor/skills/pickora-growth/pinterest.md`](.cursor/skills/pickora-growth/pinterest.md) — pins, boards, cadence  
3. [`.cursor/skills/pickora-growth/seo.md`](.cursor/skills/pickora-growth/seo.md) — on-page / site SEO checklist  

### Commands

| Command (RU / EN) | What the agent does |
|---|---|
| `план на неделю` / `weekly plan` | SEO + Pinterest + content priorities for 7 days |
| `ключи для …` / `keywords for …` | Google + Pinterest phrases for a topic |
| `аудит SEO …` / `seo audit …` | On-page audit for a live slug |
| `пин для …` / `pin pack for …` | 3–5 pin titles/descriptions + image briefs |
| `доски` / `boards` | Board map + which live articles to pin first |
| `приоритет CONTENT-BANK` / `prioritize bank` | Rank ideas by traffic potential |
| `разбор GSC` / `analyze GSC` | Opportunities from pasted Search Console data |

### Do not (Growth)

- Invent Pinterest/profile URLs the user did not give  
- Claim fake rankings or traffic numbers  
- Scrape Amazon  
- Replace Article agent (no full `выпусти статью` pipeline here)  
- Link pins straight to `amzn.to` by default — pin → **pickora.shop article**  

### Starter prompt (paste into a new chat)

```
Агент Growth. Следуй .cursor/skills/pickora-growth/SKILL.md
Сайт: pickora.shop (Amazon affiliate, статика).
Сейчас помоги с: [план на неделю / пин для {slug} / аудит SEO {slug} / приоритет CONTENT-BANK]
```
