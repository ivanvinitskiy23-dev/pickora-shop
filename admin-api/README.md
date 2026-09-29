# Pickora Admin API (Cloudflare Worker)

Публичный сайт остаётся на GitHub Pages. Этот Worker — API Studio: auth, cloud drafts (D1), media, Publish → GitHub.

Studio UI: https://pickora.shop/pk-studio/  
API: https://pickora-admin-api.pickara-admin.workers.dev

## Lab (локально)

```powershell
cd C:\Users\Qwiqly\Documents\pickora-siteV1
python -m http.server 8765
# другой терминал
python scripts\admin-local-api.py
```

UI: http://127.0.0.1:8765/pk-studio/

## Deploy Worker

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd C:\Users\Qwiqly\Documents\pickora-siteV1\admin-api
npm install
npx.cmd wrangler login
npx.cmd wrangler d1 execute pickora-admin --remote --file=schema.sql
npx.cmd wrangler secret put OWNER_LOGIN
npx.cmd wrangler secret put OWNER_PASSWORD
npx.cmd wrangler secret put GITHUB_TOKEN
npx.cmd wrangler deploy
```

### Секреты

| Secret | Значение |
|--------|----------|
| `OWNER_LOGIN` | логин Studio (например `qwiqlyowner@pickora`) |
| `OWNER_PASSWORD` | пароль Studio |
| `GITHUB_TOKEN` | GitHub PAT с Contents read/write на репо `pickora-shop` |

`GITHUB_REPO` / `GITHUB_BRANCH` заданы в `wrangler.toml` `[vars]`.

Health: `/api/health` → `hasGithub: true` после токена.

### Publish flow

1. Articles wizard → Save → SEO gate → **SEO ready**
2. Studio → **Publish** → Выложить на GitHub
3. Worker пишет: `content/articles/{slug}.json`, карточку в `articles/index.html`, URL в `sitemap.xml`
4. Полная страница `{slug}/index.html` — в доработке (фон-агент / Cursor publish skill)

Rollback: revert коммита Publish в GitHub → Pages пересоберёт.

Auth: `POST /api/login`, `GET /api/me`, `POST /api/logout`.  
Publish: `POST /api/publish/article` `{ "slug": "…" }`.  
Audit: `GET /api/audit`. Links: `POST /api/links/check`.
