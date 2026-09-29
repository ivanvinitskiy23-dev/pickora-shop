# Pickora Admin API (Cloudflare Worker)

Публичный сайт остаётся на GitHub Pages. Этот Worker — только API админки (auth).

Контент (Home / Pins / Products) пока правится через **локальный lab API** и `content/*.json`.

## Lab (сейчас основной путь)

```powershell
# Терминал 1 — превью сайта + Studio UI
cd C:\Users\Qwiqly\Documents\pickora-siteV1
python -m http.server 8765

# Терминал 2 — API
python scripts\admin-local-api.py
```

UI: http://127.0.0.1:8765/pk-studio/

## Deploy Worker (один раз)

В PowerShell (Node уже в `C:\Program Files\nodejs`):

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
cd C:\Users\Qwiqly\Documents\pickora-siteV1\admin-api
npm install
npx wrangler login
npx wrangler d1 create pickora-admin
```

Скопируйте `database_id` в `wrangler.toml` (поле `database_id`).

```powershell
npx wrangler d1 execute pickora-admin --remote --file=schema.sql
npx wrangler secret put OWNER_LOGIN
npx wrangler secret put OWNER_PASSWORD
npx wrangler deploy
```

Секреты = те же логин/пароль, что в `admin-lab/secrets/owner.local.env`.

После деплоя: https://pickora-admin-api.pickara-admin.workers.dev/api/health → `{"ok":true,"mode":"cloudflare"}`.

Секреты должны называться **ровно** `OWNER_LOGIN` и `OWNER_PASSWORD` (не сам логин/пароль в имени):

```powershell
npx.cmd wrangler secret put OWNER_LOGIN
npx.cmd wrangler secret put OWNER_PASSWORD
npx.cmd wrangler secret list
```

Auth: `POST /api/login`, `GET /api/me`, `POST /api/logout` (сессии в D1).
Content routes на Worker пока отвечают `501 use_local_lab` — пока не подключим Publish → GitHub.
