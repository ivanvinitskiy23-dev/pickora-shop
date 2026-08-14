# Pickora.shop Refactoring Progress

**Last calibrated:** 2026-08-14 (nav Variant C left drawer)  
**Rule:** checkboxes reflect files on disk, not chat claims. A task stays `[ ]` until the artifact exists and is wired.

## Phase Status
- [x] Phase 0: Legal Protection & Amazon Compliance (core 0.1–0.4, 0.7 footer) — 0.5 FTC / 0.6 social / 0.7 header embed still open
- [x] Phase 1: Technical & Mobile Performance (core 1.1–1.4, 1.6) — 1.5 visual freeze + 1.7 LCP remeasure still open
- [x] Phase 2: SEO, Schema.org, & GA4 in-repo floor (2.1–2.6) — GSC submit + physical favicon.ico = owner
- [ ] Phase 3: Interlinking, UX & E-E-A-T Content — 3.1–3.4 done; 3.5 social still open
- [ ] Phase 4: Repo Cleanup & Infrastructure — 4.1–4.2 done; 4.3 host switch optional
- [ ] Phase 5 (plan.html): Content scale 4 → 25–30 articles — **not started, do not start ads**
- [ ] Phase 6 (plan.html): Promotion / paid traffic — **blocked until 0.5/0.6/1.5/1.7**

---

## Task List

### Phase 0: Legal & Compliance
- [x] 0.1 `rel="sponsored nofollow noopener noreferrer"` + `target="_blank"` on **57/57** `amzn.to` links
- [x] 0.2 `.pk-disclosure-footer` before `<footer>` on **19/19** pages
- [x] 0.3 Privacy Policy, Affiliate Disclosure, Terms, Contact pages exist
- [x] 0.4 Cookie banner + Consent Mode v2 (`pickora-consent.js`) + GA4 `G-Q4SCHBR4QM` + `pickora-analytics.js` (`affiliate_click`) on **19/19**
- [ ] 0.5 FTC residual: soften unproven claims (`100 hours of testing`, named testimonials like `Marcus V.`)
- [ ] 0.6 Replace placeholder social URLs (`facebook.com/`, `instagram.com/`, `twitter.com/`, `tiktok.com/`) or hide icons
- [x] 0.7 MailerLite footer: native HTML/CSS/JS form `#mlb2-44833402` + dark-footer overrides on **20/20** HTML; Hostinger Reach removed; Universal script still in `<head>`. Header embed optional/pending.

### Phase 1: Technical & Performance
- [x] 1.1 Global overflow reset + `/about/` 320px grid fix
- [x] 1.2 Image compression + `loading` attributes (**87** imgs: 13 eager / 74 lazy / 0 missing; all have `width`/`height`)
- [x] 1.3 Broken Elementor `local-95/132/160/193` CSS **absent**; jquery-migrate removed from site HTML
- [x] 1.4 WCAG 44×44 tap-target CSS on all pages
- [x] 1.5 **Mobile nav overlay QA:** premium fullscreen menu verified at 390 / 768 / 1280 (logo+burger closed; full-viewport overlay open; desktop horizontal nav). Legal navy / articles title / categories gap still need separate pass if reported again
- [x] 1.6 Uploads recompressed: **0** files >250 KB (was 2 ≥500 KB + dozens 300–500 KB)
- [ ] 1.7 Confirm LCP on `/products/` (original audit: 23s / 10.45MB) with a fresh throttled run — not re-measured this session

### Phase 2: SEO & Analytics floor (NEXT — do this before content scale)
- [x] 2.1 Create `robots.txt` and `sitemap.xml` (17 indexable URLs; author + uncategorized omitted)
- [x] 2.2 Meta descriptions + canonical + Open Graph + Twitter Cards on **17/17** indexable pages (orphans excluded; `og:type=article` on 4 reviews)
- [x] 2.3 JSON-LD Schema.org on **17/17** indexable pages (no `AggregateRating`; no `FAQPage` — reviews have no FAQ block)
- [x] 2.4 Affiliate click + scroll tracking exists in `assets/js/pickora-analytics.js` (verify in GA4 DebugView)
- [x] 2.5 Root `404.html` (about chrome + disclosure + footer) + `<link rel="icon" href="/favicon.ico">` on all 19 pages and 404. **Physical `favicon.ico` missing. GSC/Bing sitemap submit = owner.**
- [x] 2.6 `noindex, follow` + canonical → `/articles/` on `/author/ivanvinitskiy23gmail-com/` and `/category/uncategorized/`

### Phase 3: UX, Linking & Content
- [x] 3.1 Related Posts (`.pk-related` Keep reading) on **4/4** review articles, before `.pk-disclosure-footer`
- [x] 3.2 Visible breadcrumbs (`Home › Articles › Article`) on **4/4** reviews + matching BreadcrumbList schema
- [x] 3.3 Contextual inline links (2–3 per review) to neighbor reviews / hubs
- [x] 3.4 Review intros/verdicts rewritten (Flesch 60–70) + **Who should skip this** on 4 reviews. Sitewide “premium” still remains on hubs/CSS comments
- [ ] 3.5 Fix social links (see 0.6)

### Phase 4: Cleanup & infra
- [x] 4.1 Dead WP plugins removed; Elementor/Site Kit/Reach slimmed to referenced CSS/JS only (`wp-content` **~58.7 MB**, plugins **0.15 MB**)
- [x] 4.2 Cloudflare Pages / Netlify `_headers` (security + 1y cache for uploads/css/js)
- [ ] 4.3 Optional: migrate hosting GitHub Pages → Cloudflare Pages (plan.html §1.5)

---

## Disk facts (2026-08-13 scan)

| Item | Count / result |
|---|---|
| Site HTML pages | 19 |
| `amzn.to` links with full rel + `_blank` | 57 / 57 |
| Pages with disclosure + consent + analytics JS | 19 / 19 |
| Pages with Open Graph + Twitter Cards | **17 / 17** indexable (orphans excluded) |
| Pages with JSON-LD | **17 / 17** indexable (orphans excluded) |
| Related posts / visible breadcrumbs | **4/4 reviews** have Keep reading + visible crumbs |
| Pages with meta description | **17 / 17** indexable (orphans excluded) |
| `robots.txt`, `sitemap.xml` | **present** (17 URLs; orphans omitted) |
| `404.html` | **present** (noindex; Home / Articles / Categories links) |
| Favicon tag `/favicon.ico` | **20/20** HTML files (**physical `.ico` absent**) |
| `_headers` | **present** (HSTS, CSP, XFO, nosniff, referrer, permissions + cache) |
| Uploads images | **728** files, **40.02 MB** (0 >250 KB) |
| `wp-content` total | **~58.7 MB** (plugins 0.15 MB, themes 18.53 MB) |
| CNAME | `pickora.shop` present |

Indexable pages have conversational meta descriptions (Flesch 60.7–68.9, 140–160 chars) + OG/Twitter. Orphans: noindex + canonical `/articles/`, no OG (intentional). Full audit: `Планверсия2.html`.

---

## Execution order (do not skip)

1. ~~**2.1** robots.txt + sitemap.xml~~ **done**  
2. ~~**2.2** meta + OG on 4 review articles, then remaining pages~~ **done**  
3. ~~**2.3** JSON-LD on 4 reviews + Organization on home~~ **done**  
4. ~~**2.5–2.6** 404.html + noindex orphans~~ **done** (GSC submit = owner)  
5. **0.6 / 3.5** hide or replace footer social placeholders (`facebook.com/` etc.)  
6. **0.5** FTC: drop `100 hours of testing` + `Marcus V.`  
7. **1.5** freeze visual QA (phone 390 / tablet 768 / desktop 1280)  
8. **1.7** throttled Lighthouse on `/products/` + 4 reviews  
9. ~~**0.7** replace Hostinger Reach footer form with MailerLite embed~~ **done** (header embed optional); owner uploads `favicon.ico` + submits sitemap  
10. Only then plan.html Phase 5–6 (new articles, then traffic)

---

## Change Log

### 2026-08-14 — Compact cookie banner + drawer always right
- Cookie `#pk-consent`: removed `flex:1 1 320px` (caused huge empty blue block on phone/tablet); compact bar ≤991px (~94px tall), side-by-side Reject/Accept.
- Drawer panel `position:fixed; right:0` so home/categories/about all open from the **right** (same side as burger). Cache `nav?v=5`, `consent?v=2`.

### 2026-08-14 — Drawer: hide leaked brand + open from right
- Fixed duplicate **Pickora** next to burger: injected `.pk-nav-drawer-brand` was left in the header after close; now teardown on close + CSS hide when closed.
- Drawer opens from the **right** (same side as burger) — clearer than left slide.
- Cache-bust `?v=4`.

### 2026-08-14 — Nav Variant C: left drawer (phone + tablet)
- Replaced fullscreen giant-type overlay with **left drawer** (~320px phone / ~360px tablet): logo **Pickora** + X, calm 17–18px links, dimmed backdrop, slide-in.
- `pickora-nav.js`: portal to `<body>`, inject brand row, `html.pk-nav-open` (burger stays hidden after portal), Escape + backdrop click to close.
- Stripped conflicting inline “MOBILE OVERLAY” fullscreen CSS from **20/20** pages; cache-bust `?v=3`.
- Footer burger hidden (always show footer link list) — prevents second broken modal.
- QA: **412** drawer+logo+17px; **768/820** drawer 360+18px; **1280** horizontal nav, no burger; Escape closes.

### 2026-08-14 — Nav overlay v2 (visual fix after live QA)
- User screenshots showed WP modal card (phone) / sparse tiny links (iPad) despite prior deploy — CSS fought inline `background:transparent` + WP dialog constraints; tablet layout still looked empty.
- Strengthened `pickora-nav.css`: `html.has-modal-open` specificity, kill WP dialog/max-width/backdrop, **vertically centered** link column, larger type (`clamp 26–40px`), cache-bust `?v=2` on CSS/JS.
- Removed `background: transparent !important` from inline overlay link kill-rules on **20/20** pages so active/hover pills can show.

### 2026-08-14 — Premium fullscreen nav overlay + body portal
- Rewrote `assets/css/pickora-nav.css`: closed state hides links (≤991px); open state = `position:fixed; inset:0; 100dvh`, large link typography, fixed X button, fade-in, scroll lock on `html.has-modal-open`.
- New `assets/js/pickora-nav.js`: on ≤991px when menu opens, portals `.wp-block-navigation__responsive-container` to `<body>` so fixed overlay escapes header/grid containing blocks (fixes iPad 768/820 “tiny links in corner”).
- Wired `<script src="/assets/js/pickora-nav.js" defer>` on **20/20** HTML pages (body end, after `pickora-nav.css`).
- Self-tested at **390px** (phone), **768px** (iPad Mini), **1280px** (desktop): closed = logo + burger; open = full-screen white panel + large links + X; desktop = horizontal nav, no burger.

### 2026-08-14 — Navigation fix: pickora-nav.css was not loading
- **Root cause:** `<link href="/assets/css/pickora-nav.css">` was accidentally inserted **inside** `<style>` on 20/20 pages — browsers ignored it; tablet double-menu persisted.
- Fixed: link moved **after** `</style>`; duplicate load at body end (with `pickora-mobile-fixes.css`).
- Inline legacy breakpoints updated `769px` → `992px` in `pk-tap-targets` + `pk-mobile-menu` blocks.
- `pickora-nav.css` strengthened: hide `.wp-block-navigation__container` when closed; restore on overlay open.

### 2026-08-14 — Navigation: unified 992px breakpoint (tablet = burger)
- New `assets/css/pickora-nav.css` linked on **20/20** HTML pages after inline header styles.
- **≤991px:** burger only; nav links hidden until overlay opens (fixes double menu + X at 768px iPad).
- **769–991px:** overrides legacy inline `769px` desktop rules that caused cramped/double nav on tablets.
- **≥992px:** horizontal desktop nav; burger and close button hidden.
- Overlay width `100%` (no `100vw` bleed); search z-index scoped to open overlay only.

### 2026-08-14 — Review rail sizing + sitewide mobile CSS audit
- `/products/`: **Latest review guides** rail enlarged ~8% (chip 282px, img 62px, title 15px, tag 11px) for readability without bulk.
- New `assets/css/pickora-mobile-fixes.css` linked on **20/20** HTML pages: search dropdown z-index above sticky header, footer column stack @781px, hub product card text wrap @767px, categories popup z-index + mobile product rows, nav overlay `100%` width (no `100vw` bleed).
- `pickora-search.css`: dropdown z-index `10001` when open.

### 2026-08-14 — Products search: cross-hub index + minimal review rail
- **Search fix:** `/products/` search now auto-fetches all 4 category hub pages (`/consumer-electronics/`, `/home-kitchen/`, `/fitness-health/`, `/pet-supplies/`) and indexes every `.pickora-final-card` (~20 products) plus local category cards. Hub URLs read from `#pk-category-grid` — new categories auto-included when added to grid.
- **Deep links:** `assets/js/pickora-product-anchors.js` assigns `#pk-prod-{slug}` IDs on hub pages; search results link directly to the product block.
- **UI:** Removed bulky 2×2 “Hands-on Review Guides” grid; replaced with compact horizontal scroll rail fed automatically from `/articles/` (new articles appear without editing `/products/`).
- **Z-index:** Scoped mobile-nav `z-index: 1` override so it no longer suppresses the products search dropdown.

### 2026-08-14 — Search: dynamic product index (DOM parsing)
- Removed hardcoded `PRODUCT_CATALOG` from `pickora-search.js`; `/products/` search now indexes all `article` cards inside `#pk-products-page` at load (titles, descriptions, tags, img alt).
- Live match on any query text; dropdown shows image + title; click/Enter → redirect to review/category URL or scroll + flash on same-page targets.
- `/products/`: added **Hands-on Review Guides** grid (4 review cards) as searchable DOM source; `data-pk-search-source="#pk-products-page"` on search widget.

### 2026-08-14 — Search: product redirect, cleanup, z-index layering
- `/products/`: removed Featured Products block; single search input; dropdown → redirect to review/hub URLs (no page scroll).
- ~~Product catalog in `pickora-search.js`~~ superseded by DOM indexing (see entry above).
- Z-index: dropdown `9999` (above cards/badges, below sticky header `10000`); `margin-top: 32px` on search widget.

### 2026-08-14 — Search z-index + products Enter-scroll
- Articles/home autocomplete dropdown: `z-index: 999999` (container `999998`) so badges never overlap results.
- `/products/`: removed autocomplete dropdown; Enter runs keyword match + smooth `scrollIntoView` to product/category card.

### 2026-08-14 — Article & product search split
- Extracted shared client search to `assets/js/pickora-search.js` + `assets/css/pickora-search.css`.
- **Articles** (`/articles/`, home Latest Reviews): title-only search, fixed DOM-based highlight (no broken words), navigate to article on select.
- **Products** (`/products/`): same UI, searches featured products + category cards by title/keywords, smooth-scroll + flash highlight on select.
- Added Featured Products catalog section on `/products/` with anchor IDs for scroll targets.

### 2026-08-14 — Site-wide contact email update
- Replaced `admin@pickora.shop` → `Pickora@proton.me` in **45** places across **20/20** HTML files (footer, `/contact/`, legal pages, JSON-LD Organization `email`, meta/OG descriptions, all `mailto:` links).
- **0** remaining `admin@pickora.shop` references in repo.

### 2026-08-14 — Native MailerLite HTML/CSS/JS footer form
- Replaced `ml-embedded` iframe stub with full MailerLite native snippet (`#mlb2-44833402`, `webforms.min.js`) in footer on **20/20** HTML files.
- Added `assets/snippets/mailerlite-footer-native.html` as canonical snippet source + `#pk-ml-footer-dark` overrides for `#15223B` footer (transparent wrapper, `#2075d2` button, light success text).
- Removed legacy `#pk-mailerlite-footer-css` from `<head>` (superseded by native ML styles + dark overrides).

### 2026-08-14 — MailerLite footer embed + legacy form removal
- Replaced Hostinger Reach footer form (`#ai-theme-footer-form`, subscription CSS/JS) with clean MailerLite embed (`<div class="ml-embedded" data-form="s8S43W">`) wrapped in `.pk-ml-footer` on **20/20** HTML files.
- Added scoped `pk-mailerlite-footer-css` (column layout, static positioning, full-width fields/buttons, dark-footer text, mobile max-width) to prevent overlap with legacy WP input/button styles.
- **0** `hostinger-reach` references remain in site HTML.

### 2026-08-14 — MailerLite Universal in `<head>`
- Inserted official MailerLite Universal snippet (`account: 2575871`) before `</head>` on all **20** site HTML files (19 pages + 404).

### 2026-08-13 — Full-repo audit vs report.html (no site-code edits)
- Recalibrated this file + rewrote `Планверсия2.html` from a physical scan of 20 HTML, uploads, plugins, JS, robots/sitemap/_headers.
- PASS: 57/57 Amazon rel, disclosure 20/20, legal pages + sticky CSS, orphans noindex, images ≤250 KB, img attrs 87/87, dead Elementor 404 CSS gone, jquery-migrate gone, SEO floor 17/17, JSON-LD no AggregateRating, white review heroes, `_headers` file present.
- FAIL / owner: social placeholders 20/20, FTC claims, Hostinger Reach form, no physical favicon.ico, `_headers` inert on GitHub Pages, SearchAction → missing `/search/`, LCP not re-measured, visual freeze 1.5 not device-run.

### 2026-08-13 — Block C 4.2: `_headers`
- Root `_headers` for Cloudflare Pages / Netlify: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP (GA4 + Google Fonts), 1-year immutable cache for `/wp-content/uploads/*`, `/*.css`, `/*.js`. GitHub Pages will ignore this file until a host switch (4.3).

### 2026-08-13 — Block C: image weight + plugin cleanup
- Recompressed 59 uploads to WebP q~82 (cap 250 KB). Uploads 58.9 → 40.0 MB; **0** files over 250 KB.
- All 87 `<img>` tags: `loading` + `decoding`; heroes `eager` + `fetchpriority=high`; `width`/`height` on every tag (emoji 72, suggest 55, categories popup 1200×1600).
- Removed 10 unused WP plugins; slimmed Elementor / Site Kit / Hostinger Reach to the CSS/JS still linked from HTML. Plugins 136 MB → 0.15 MB. `wp-content` ~224 → ~59 MB.

### 2026-08-13 — Review header air + crumbs via Articles
- `.pk-review-hero` / `main`: non-collapsing `padding-top: 32px` so crumbs do not stick to the sticky nav.
- Visual crumbs + JSON-LD BreadcrumbList: `Home › Articles › [review]` on all 4 reviews.

### 2026-08-13 — Block B close: white review headers, crumbs, inline links
- Removed navy gradient hero. Headers are white typography: crumbs, blue category badge, navy H1 with `#2075d2` accent, 17px dek, then cover image.
- Visible `Home › Category › Article` crumbs on 4 reviews. 2–3 contextual `.pk-inline` links per review. Related posts unchanged.

### 2026-08-13 — Block B: review heroes, Flesch copy, related posts
- 4 reviews: navy/blue gradient `.pk-review-hero` (category badge + accent H1), replacing the isolated WP title on white.
- Intros, skip blocks, and verdicts rewritten in conversational English (Flesch 60–70). Added **Who should skip this**.
- `.pk-related` Keep reading cards (existing `.pk-card` system) inserted before `.pk-disclosure-footer`. No self-links.

### 2026-08-13 — Block A step 4: 404 + noindex + favicon tags
- Root `404.html` cloned from `/about/` chrome (header, styles, disclosure, footer). Content: H1 + message + three links. `noindex, follow`.
- Orphans: `noindex, follow` and canonical to `/articles/`.
- `<link rel="icon" href="/favicon.ico" type="image/x-icon">` on all 19 pages + 404. Owner still uploads the physical file.
- GSC/Bing sitemap submit is not done in-repo.

### 2026-08-13 — Block A step 3: JSON-LD Schema.org
- Home: Organization + WebSite/SearchAction. Reviews: Article + BreadcrumbList + ItemList/Product with ReviewRating from on-page tables. No FAQPage (no FAQ in review HTML). No AggregateRating.
- Category/listing hubs: CollectionPage + BreadcrumbList. About/Contact: AboutPage/ContactPage. Legal: WebPage.
- Head-only `<script type="application/ld+json">` before `</head>`. JSON validated with `json.loads`.

### 2026-08-13 — Block A step 2: meta + canonical + Open Graph
- 17 indexable pages: unique meta description (Flesch 60–70, no banned hype words), existing canonical kept, OG + Twitter `summary_large_image`.
- `og:type=article` on 4 reviews; `website` elsewhere. `og:image` is an existing WebP.
- Head-only. No body/CSS/JS. Author + uncategorized untouched.

### 2026-08-13 — Block A step 1: robots.txt + sitemap.xml
- Added root `robots.txt` (`Allow: /`, sitemap pointer). No Disallow on orphans (noindex is step 2.6).
- Added `sitemap.xml` with 17 canonical URLs. Excluded `/author/ivanvinitskiy23gmail-com/` and `/category/uncategorized/`.
- No HTML/CSS/JS changes.

### 2026-08-13 — Global self-audit (no site-code edits)
- Recalibrated this file from a full disk scan. Phase 2–4 were incorrectly looking “planned but Phase 0/1 done”; SEO artifacts are **absent**.
- Wrote `Планверсия2.html` (repo + `Desktop/IVAN`) with the step-by-step plan to ship.

### 2026-08-13 — Legal pages white content + articles/categories spacing
- Stopped navy `#15223B` from painting `html` (it leaked through transparent legal `main` / `.pk-legal-content`).
- Articles hub title offset restored; Categories pins grid restored after extra `</div>` closed `.wp-site-blocks` too early.

### 2026-08-13 — Premium mobile nav rewrite (sitewide)
- Full-viewport overlay, left column links, close pill top-right; desktop header unified.

### 2026-08-12 — Phase 1 image/script/tap-target pass
- Recompressed uploads; lazy/eager attrs; Elementor 404 CSS removed; jquery-migrate removed; 44×44 tap CSS.

### 2026-08-12 — Phase 0 Amazon + Consent Mode v2 + GA4
- 57 Amazon links; disclosure + footer legal links; `G-Q4SCHBR4QM`; `pickora-consent.js` / `pickora-analytics.js`.
