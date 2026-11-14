# Pickora agents

Focused chats. Say which mode you want at the start of a **new** chat (or use the commands below).

| Mode | Open when you want… | Skill |
|---|---|---|
| **Article Editor** | Review / edit drafts before live; brief help; Growth packet; publish gate (chief) | [pickora-article-editor](.cursor/skills/pickora-article-editor/SKILL.md) + [pickora-publish](.cursor/skills/pickora-publish/SKILL.md) |
| **Article (writer)** | Draft a guide from a filled brief (often Antigravity; Cursor OK if needed) | [pickora-article](.cursor/skills/pickora-article/SKILL.md) |
| **Growth** | Traffic, SEO, weekly plans, keyword priority, Guide-pin strategy | [pickora-growth](.cursor/skills/pickora-growth/SKILL.md) |
| **Ideas** | Visual Ideas pins (Pinterest + `/categories/`) — Research then Creative | [pickora-ideas-research](.cursor/skills/pickora-ideas-research/SKILL.md) → [pickora-ideas-creative](.cursor/skills/pickora-ideas-creative/SKILL.md) |

**Production split:** Antigravity = high-token research/draft/Ideas. Cursor **Article Editor** = chief editor before publish. User supplies all `amzn.to` and runs commit/push.

**Antigravity local workspace:** `antigravity/` (Researcher + Writer prompts/skills) — listed in `.gitignore`, not on GitHub. Shared handoff files stay in `briefs/` / `briefs/drafts/`.

**Ideas funnel:** Pinterest → `https://pickora.shop/categories/#{slug}` → Amazon CTAs on the site pin. Ideas are **not** article guides.

---

## Article Editor (chief)

Default Cursor mode for guides. Reviews AG (or writer) handoffs, edits for Pickora voice + SEO, checks cannibalization, emits Growth packet after draft, knows Studio JSON **and** chrome HTML publish.

### Skills

1. [`.cursor/skills/pickora-article-editor/SKILL.md`](.cursor/skills/pickora-article-editor/SKILL.md) — chief editor workflow  
2. [handoff.md](.cursor/skills/pickora-article-editor/handoff.md) — AG → Editor files + chat  
3. [growth-packet.md](.cursor/skills/pickora-article-editor/growth-packet.md) — keywords, title/meta, 3 pin angles, destination URL  
4. [studio-json.md](.cursor/skills/pickora-article-editor/studio-json.md) — JSON vs HTML publish  
5. [SOURCES.md](.cursor/skills/pickora-article-editor/SOURCES.md) + `vendor/` — installed SEO/editorial checklists  
6. [pickora-publish](.cursor/skills/pickora-publish/SKILL.md) — ship when you say publish  

Writer/chips/media still apply: [pickora-article](.cursor/skills/pickora-article/SKILL.md), [chips.md](.cursor/skills/pickora-article/chips.md), [media.md](.cursor/skills/pickora-article/media.md) (covers = **ultra-realistic**).

### Commands

| Command (RU / EN) | What the agent does |
|---|---|
| `ревью …` / `review draft …` | Full editorial + SEO + cannibalization report |
| `правь …` / `edit …` | Apply edits to draft / JSON |
| `brief из …` | Help fill brief from your links/notes (affiliate slots left for you) |
| `пакет Growth` / `Growth packet` | Keywords + title/meta + 3 pin angles + article URL |
| `готово к публикации?` / `publish-ready?` | Gate checklist |
| `обложку для …` / `generate cover for …` | Ultra-realistic cover → uploads |
| `следующий P1` / `next P1` | Propose next bank priority |
| `выпусти статью …` / `publish article …` | Full wire after gate (HTML and/or Studio JSON path) |
| `закоммить и запушь` / `commit and push` | **Only you** ask this — ships to `origin main` |

### Handoff (AG → Editor)

Files in `briefs/` + `briefs/drafts/` (+ optional JSON) **and/or** a chat HANDOFF message. See [handoff.md](.cursor/skills/pickora-article-editor/handoff.md).

### Preconditions before `выпусти`

- Filled brief (not `_TEMPLATE.md`) including **Chips** (1–3 allowed slugs)
- Real `amzn.to` from **you** only (no `TODO`)
- Cover decided: photo in `briefs/media-inbox/` **or** generate **or** path in brief (ultra-realistic)
- Editor cannibalization check vs live + `CONTENT-BANK.md`
- Growth packet already emitted for the draft

### Do not (Article Editor)

- Scrape Amazon or invent referral links  
- Publish without a brief  
- Hotlink Amazon CDN as permanent site media  
- Invent lab tests or fake testimonials  
- Run Ideas pin pipelines  
- Commit/push unless you explicitly ask  
- Touch Telegram CMS plans or invent unpaid social profile URLs  

### Starter prompt

```
Агент Article Editor (шеф-редактор). Следуй .cursor/skills/pickora-article-editor/SKILL.md
Сайт: pickora.shop. Сейчас: [ревью draft … / brief из … / пакет Growth / выпусти …]
```

---

## Article writer (draft factory)

Use when you need a **new draft from a filled brief**. Prefer Antigravity for this; Cursor can still run [pickora-article](.cursor/skills/pickora-article/SKILL.md) if needed. After draft → hand to **Article Editor**.

| Command | Action |
|---|---|
| `черновик из brief …` / `draft from brief …` | Writes draft only → `briefs/drafts/` |

AG skills for writing/SEO stay in the **Antigravity workspace** (not required in this git repo).

---

## Growth agent (SEO · Traffic · Pinterest strategy)

Open a **new chat** and say: `агент Growth` / `Growth agent` / `SEO и Pinterest`.

For **Ideas pin creatives / shortlists**, use Ideas Research / Creative instead (below). Growth may still plan cadence and boards at a high level. Guide pins use the **Growth packet** from Article Editor (article URL, not `amzn.to`).

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
| `пин для …` / `pin pack for …` | Guide-pin pack for a **live article** slug (not Ideas Research) |
| `доски` / `boards` | Board map + priorities |
| `приоритет CONTENT-BANK` / `prioritize bank` | Rank ideas by traffic potential |
| `разбор GSC` / `analyze GSC` | Opportunities from pasted Search Console data |

### Do not (Growth)

- Invent Pinterest/profile URLs the user did not give  
- Claim fake rankings or traffic numbers  
- Scrape Amazon  
- Replace Article Editor (no full `выпусти статью` pipeline here)  
- Replace Ideas Research/Creative (no Ideas shortlist / GenerateImage Ideas pipeline here)  
- Link Pinterest straight to `amzn.to` by default — Ideas pins → **`https://pickora.shop/categories/#{pin-slug}`**. Guide → article only when doing a separate article pin pack  

### Starter prompt (paste into a new chat)

```
Агент Growth. Следуй .cursor/skills/pickora-growth/SKILL.md
Сайт: pickora.shop (Amazon affiliate, статика).
Сейчас помоги с: [план на неделю / пин для {slug} / аудит SEO {slug} / приоритет CONTENT-BANK]
```

---

## Ideas agents (Visual Ideas · Pinterest)

Two **separate** chats / skill folders so instructions do not mix. Handoff = **paste the packet in chat** (no required brief file).

| Step | Chat | Skill |
|---|---|---|
| 1 | Ideas Research | [pickora-ideas-research](.cursor/skills/pickora-ideas-research/SKILL.md) |
| 2 | Ideas Creative | [pickora-ideas-creative](.cursor/skills/pickora-ideas-creative/SKILL.md) + [hallmark-lite](.cursor/skills/pickora-ideas-creative/hallmark-lite.md) |

### Flow

1. **Research:** you give a filter (`kitchen` / `work` / …) + optional vibe → agent shortlists **5–8** products (brand + model; ASIN optional) → **you** pick **1–5** → agent outputs Creative handoff packet in chat.  
2. **You** find real `amzn.to` + product photos (usually Amazon main images).  
3. **Creative:** paste packet (or your own prompt) + photos → on ask, generates **2:3** vibe scene → saves to `ideas-inbox/` → you upload via Studio.  

Creative may also run **without** Research if you bring your own prompt + photos.

### Starter prompts

**Research**

```
Агент Ideas Research. Следуй .cursor/skills/pickora-ideas-research/SKILL.md
Фильтр: kitchen
(опционально вайб: …)
```

**Creative**

```
Агент Ideas Creative. Следуй .cursor/skills/pickora-ideas-creative/SKILL.md
(вставь HANDOFF пакет и/или свои фото + «сгенерируй»)
```

### Do not (Ideas)

- Scrape Amazon or invent `amzn.to` / product photos  
- Publish `pins.json` unless you explicitly ask  
- Treat Ideas as article guides  
- Put giant headlines in the pin by default (arrows/labels only when you ask)  
