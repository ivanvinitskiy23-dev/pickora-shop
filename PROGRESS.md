# Pickora.shop Refactoring Progress

**Last calibrated:** 2026-08-13 (disk scan of 19 HTML pages vs `report.html` / `plan.html`)  
**Rule:** checkboxes reflect files on disk, not chat claims. A task stays `[ ]` until the artifact exists and is wired.

## Phase Status
- [x] Phase 0: Legal Protection & Amazon Compliance (core 0.1–0.4)
- [x] Phase 1: Technical & Mobile Performance (core 1.1–1.4) — residual UI/nav risk remains
- [ ] Phase 2: SEO, Schema.org, & GA4 measurement floor
- [ ] Phase 3: Interlinking, UX & E-E-A-T Content
- [ ] Phase 4: Repo Cleanup & Infrastructure
- [ ] Phase 5 (plan.html): Content scale 4 → 25–30 articles — **not started, do not start ads**
- [ ] Phase 6 (plan.html): Promotion / paid traffic — **blocked until Phases 2–3**

---

## Task List

### Phase 0: Legal & Compliance
- [x] 0.1 `rel="sponsored nofollow noopener noreferrer"` + `target="_blank"` on **57/57** `amzn.to` links
- [x] 0.2 `.pk-disclosure-footer` before `<footer>` on **19/19** pages
- [x] 0.3 Privacy Policy, Affiliate Disclosure, Terms, Contact pages exist
- [x] 0.4 Cookie banner + Consent Mode v2 (`pickora-consent.js`) + GA4 `G-Q4SCHBR4QM` + `pickora-analytics.js` (`affiliate_click`) on **19/19**
- [ ] 0.5 FTC residual: soften unproven claims (`100 hours of testing`, named testimonials like `Marcus V.`)
- [ ] 0.6 Replace placeholder social URLs (`facebook.com/`, `instagram.com/`, `twitter.com/`, `tiktok.com/`) or hide icons
- [ ] 0.7 Newsletter form still posts to Hostinger Reach / WP — subscribers can be lost (plan.html §1.4)

### Phase 1: Technical & Performance
- [x] 1.1 Global overflow reset + `/about/` 320px grid fix
- [x] 1.2 Image compression + `loading` attributes (75 imgs: 13 eager / 62 lazy / 0 missing)
- [x] 1.3 Broken Elementor `local-95/132/160/193` CSS **absent**; jquery-migrate removed from site HTML
- [x] 1.4 WCAG 44×44 tap-target CSS on all pages
- [ ] 1.5 **UI freeze / visual QA:** mobile overlay nav was rewritten 3 times and still regressed (legal navy leak, articles title, categories empty gap). Needs a one-pass device check at 390 / 768 / 1280 after any CSS inject
- [ ] 1.6 Two uploads still ≥500KB; review `srcset` still lists 2560w `-scaled` masters
- [ ] 1.7 Confirm LCP on `/products/` (original audit: 23s / 10.45MB) with a fresh throttled run — not re-measured this session

### Phase 2: SEO & Analytics floor (NEXT — do this before content scale)
- [x] 2.1 Create `robots.txt` and `sitemap.xml` (17 indexable URLs; author + uncategorized omitted)
- [ ] 2.2 Meta descriptions on remaining **10/19** pages (all 4 review articles lack them) + Open Graph + Twitter Cards on **0/19**
- [ ] 2.3 JSON-LD Schema.org on **0/19** (Article, Product, Review, FAQ, BreadcrumbList, Organization)
- [x] 2.4 Affiliate click + scroll tracking exists in `assets/js/pickora-analytics.js` (verify in GA4 DebugView)
- [ ] 2.5 Add `404.html`; confirm favicon; submit sitemap to Google Search Console + Bing
- [ ] 2.6 `noindex` orphan `/author/ivanvinitskiy23gmail-com/` and `/category/uncategorized/`

### Phase 3: UX, Linking & Content
- [ ] 3.1 Related Posts block on 4 review articles
- [ ] 3.2 Breadcrumbs (visible + BreadcrumbList schema)
- [ ] 3.3 Contextual inline links between reviews / hubs
- [ ] 3.4 Rewrite AI-sounding copy; “premium” still appears **141** times across HTML
- [ ] 3.5 Fix social links (see 0.6) + orphan noindex (see 2.6)

### Phase 4: Cleanup & infra
- [ ] 4.1 Reduce unused WP plugin/theme payload (`wp-content` still **~224 MB**)
- [ ] 4.2 Cloudflare Pages `_headers` (security + cache)
- [ ] 4.3 Optional: migrate hosting GitHub Pages → Cloudflare Pages (plan.html §1.5)

---

## Disk facts (2026-08-13 scan)

| Item | Count / result |
|---|---|
| Site HTML pages | 19 |
| `amzn.to` links with full rel + `_blank` | 57 / 57 |
| Pages with disclosure + consent + analytics JS | 19 / 19 |
| Pages with OG / JSON-LD / related posts / breadcrumbs | 0 / 19 |
| Pages with meta description | 9 / 19 |
| `robots.txt`, `sitemap.xml` | **present** (17 URLs; orphans omitted) |
| `_headers`, `404.html` | **missing** |
| Uploads images | 728 files, **61.7 MB** (2 still >500KB) |
| `wp-content` total | **~224 MB** |
| CNAME | `pickora.shop` present |

Hubs with meta description: home, about, articles, products, categories, 4 legal/contact.  
**Money pages without meta description:** air fryers, pet cameras, robot vacuums, earbuds (+ category/author/hub leftovers).

---

## Execution order (do not skip)

1. ~~**2.1** robots.txt + sitemap.xml~~ **done**  
2. **2.2** meta + OG on 4 review articles, then remaining pages  
3. **2.3** JSON-LD on 4 reviews + Organization on home  
4. **2.5–2.6** 404.html + noindex orphans  
5. **1.5** freeze visual QA (phone 390 / tablet 768 / desktop 1280)  
6. **3.1–3.4** related posts, breadcrumbs, links, copy  
7. **4.1–4.2** dead assets + `_headers`  
8. Only then plan.html Phase 5–6 (new articles, then traffic)

---

## Change Log

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
