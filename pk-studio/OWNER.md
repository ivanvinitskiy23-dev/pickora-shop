# Pickora Studio — инструкция владельцу

Админка: [https://pickora.shop/pk-studio/](https://pickora.shop/pk-studio/)  
API: Cloudflare Worker `pickora-admin-api`.

## Вход

1. Открой `/pk-studio/`.
2. Логин owner (секрет Cloudflare `OWNER_LOGIN` / `OWNER_PASSWORD`).
3. Сессия в `sessionStorage` (Bearer), ~12 часов.

## Модули

| Раздел | Что делает | Live publish |
|---|---|---|
| Главная | 4 Latest Reviews + Top picks | Publish → Home |
| Pins | Categories board | Publish → Pins |
| Товары | Хабы + карточки в `/home-kitchen/` и др. | Publish → Products |
| Статьи | Блоки → SEO-шлюз → Preview → Publish | Publish → Article |
| Медиа | Upload → WebP → путь `/wp-content/uploads/…` (через GitHub) | сразу в репо при токене |
| SEO / Status | Сканер Amazon-ссылок, digest | — |
| Команда | Invite/remove админов (только owner) | — |
| Publish / Rollback | Снимки последних 5 publish | Rollback пересобирает модуль |

## Статья (типовой путь)

1. **+ Новый черновик** → Settings (slug, hub **Articles** или тематический, chips, cover).
2. Блоки: Intro / Table / Product / FAQ / Verdict.
3. Amazon: `https://amzn.to/…` **или** `https://link.amazon/…`.
4. **SEO ready** (красные blockers должны быть пусты).
5. **Превью** → проверка.
6. **Publish** (нужен `GITHUB_TOKEN` на Worker).

Обложки можно класть в `covers-inbox/` локально и грузить через Studio.

## Lab vs Live

- **Lab** (`admin-lab/site/`, localhost:8765): локальный preview без боя.
- **Products → «Проверить офлайн»**: Worker собирает HTML текущего хаба (реальный chrome с live/GitHub + те же карточки, что Publish). Без коммита в Git. Нужен логин в Studio.
- **Live**: GitHub Pages после Publish из Studio.

Команды lab (из корня репо):

```bash
python scripts/admin-render/render_all.py
npx --yes serve admin-lab/site -p 8765
```

Статья в lab:

```bash
node scripts/admin-render/render_article_lab.mjs --slug how-to-choose-a-microwave-2026
```

## Секреты (не в git)

- `OWNER_LOGIN`, `OWNER_PASSWORD` — wrangler secrets  
- `GITHUB_TOKEN` — Contents R/W на репо pickora-shop  

## Rollback

Publish → Snapshots → Rollback. Восстанавливает draft в D1 и заново публикует модуль.

## Безопасность

- `/pk-studio/` в `robots.txt` Disallow + `noindex` meta.
- CORS: только pickora.shop (+ localhost lab).
- Мутации API требуют Authorization Bearer.
