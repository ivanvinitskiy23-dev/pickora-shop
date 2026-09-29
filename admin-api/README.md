# Pickora Admin API (Cloudflare Worker)

Studio: https://pickora.shop/pk-studio/  
API: https://pickora-admin-api.pickara-admin.workers.dev

GH Pages stays public. Worker = auth, D1 drafts, media (D1), Publish → GitHub.

## Secrets

| Name | Purpose |
|------|---------|
| `OWNER_LOGIN` | Owner Studio login |
| `OWNER_PASSWORD` | Owner password |
| `GITHUB_TOKEN` | Fine-grained PAT, Contents R/W on `pickora-shop` |

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd C:\Users\Qwiqly\Documents\pickora-siteV1\admin-api
npx.cmd wrangler secret put GITHUB_TOKEN
npx.cmd wrangler d1 execute pickora-admin --remote --file=schema.sql
npx.cmd wrangler deploy
```

## Publish

| Route | Effect |
|-------|--------|
| `POST /api/publish/home` | `content/home.json` + `index.html` + top-picks |
| `POST /api/publish/pins` | `content/pins.json` + `categories/index.html` |
| `POST /api/publish/products` | `content/products.json` + hub + category cards |
| `POST /api/publish/article` | JSON + hub card + sitemap + `{slug}/index.html` |
| `GET /api/publish/snapshots` | Last publish snapshots |
| `POST /api/publish/rollback` | Restore draft from snapshot + re-publish |

## Other

- `GET /api/health` — `hasGithub`, `hasOwner`, `hasDb`
- `GET /api/audit`, `POST /api/links/check`
- `GET/POST /api/team` — roster / invites (multi-admin)
- `GET /api/status` — digest counts
- `GET /api/media/list`, media upload/get/delete

Rollback stores draft JSON in `publish_snapshots` and re-runs publish (new GitHub commits).
