# Content schemas (простыми словами)

Редактируемые данные сайта лежат в JSON. Админка потом будет менять эти файлы; скрипты пересобирают HTML в `admin-lab/site/`.

| Файл | Что это на сайте | Кто правит |
|------|------------------|------------|
| `content/home.json` | Latest Reviews (ровно 4) + Top picks (Reader’s selection / карусель) | Home в админке |
| `content/pins.json` | Доска Ideas на `/categories/` + товары в попапе | Pins |
| `content/products.json` | Карточки категорий на `/products/` + товары внутри хабов | Products |
| `content/seo/*.json` | title / description хабов | SEO |
| `content/articles/*.json` | Обзоры (Phase 3) | Articles |

## badge (Latest Reviews)

`none` | `updated` | `must-read` | `editors-pick` | `hot` | `new`

## pin filter ids

`work` | `kitchen` | `home` | `travel` | `beauty` | `gifts` | `leisure`

## Важно

- Popular Categories на главной (4 плитки) — **не** в этих JSON.
- LIVE publish в GitHub — только после «можно в бой».
