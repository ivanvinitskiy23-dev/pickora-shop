# AG → Article Editor handoff

Antigravity (or any writer) produces raw work. **Cursor Article Editor** reviews, edits, and gates publish.

## Dual channel (both OK)

1. **Files** under `briefs/` + `briefs/drafts/` (+ optional Studio JSON)
2. **Chat message** summarizing what landed / what changed

Never rely on chat alone if a file should exist for publish.

## Expected file set (per slug)

| File | Who | Notes |
|---|---|---|
| `briefs/{slug-or-topic}.md` | User (+ AG/Editor help) | Filled brief; **amzn.to only from user** |
| `briefs/drafts/{slug}.md` or `{slug}-draft.md` | Writer (usually AG) | Full draft body + meta suggestions |
| `briefs/drafts/{slug}.json` or `content/articles/{slug}.json` | Writer / Editor | Studio-shaped article JSON when using JSON path |
| Cover source | User photo **or** generate | Ultra-realistic; see media.md |
| Chat SMS | Either | Pointers, diffs, blockers |

## Handoff message template (RU chat OK)

```
HANDOFF → Article Editor
Slug: …
Type: 1–6
Brief: briefs/…
Draft: briefs/drafts/…
JSON: (path or none)
Cover: (path / generate / missing)
Affiliate: user-provided / missing count
Cannibalization notes: …
Ask editor: review | edit | growth packet | publish-ready check
```

## Editor must verify before “ready”

- Brief complete; chips 1–3; no invented products/prices
- Every affiliate link is user-supplied `amzn.to` (no TODO)
- Cannibalization vs live HTML + `CONTENT-BANK.md`
- Voice = research-only; no lab claims / fake quotes
- SEO: title/meta/H1/structure/FAQ (use vendor checklists)
- Cover plan ultra-realistic or real photo
- Growth packet emitted **after draft** (see growth-packet.md)
