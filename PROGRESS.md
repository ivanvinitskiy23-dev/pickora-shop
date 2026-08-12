# Pickora.shop Refactoring Progress

## Phase Status
- [x] Phase 0: Legal Protection & Amazon Compliance
- [x] Phase 1: Technical & Mobile Performance Optimization
- [ ] Phase 2: SEO, Schema.org, & GA4 Analytics
- [ ] Phase 3: Interlinking, UX & E-E-A-T Content
- [ ] Phase 4: Repo Cleanup & Infrastructure

---

## Task List

### Phase 0: Legal & Compliance
- [x] 0.1 Mass add rel="sponsored nofollow noopener noreferrer" to Amazon links
- [x] 0.2 Add Affiliate Disclosure banner to commercial pages
- [x] 0.3 Create Privacy Policy, Disclosure, Terms, and Contact pages
- [x] 0.4 Fix footer error message & Add Cookie Banner with Consent Mode v2

### Phase 1: Technical & Performance
- [x] 1.1 Fix layout overflow (+40px on /about/) & 320px grid
- [x] 1.2 Compress heavy WebP images & add lazy/eager loading attributes
- [x] 1.3 Remove 404 Elementor CSS links & defer blocking scripts
- [x] 1.4 Increase tap targets to 44x44px (WCAG)

### Phase 2: SEO & Analytics
- [ ] 2.1 Create robots.txt and sitemap.xml
- [ ] 2.2 Add Meta Descriptions, Open Graph, and Twitter Cards
- [ ] 2.3 Add JSON-LD Schema.org markup (Product, Review, FAQ, Breadcrumbs)
- [ ] 2.4 Add affiliate link click & scroll tracking to GA4

### Phase 3: UX, Linking & Content
- [ ] 3.1 Implement "Related Posts" block
- [ ] 3.2 Add Breadcrumbs navigation
- [ ] 3.3 Add contextual inline links
- [ ] 3.4 Rewrite AI-sounding text and reduce "premium" word usage
- [ ] 3.5 Noindex orphan pages & fix social media links

### Phase 4: Cleanup
- [ ] 4.1 Remove 505MB of unused WP plugin assets
- [ ] 4.2 Add Cloudflare Pages `_headers` file

---
## Change Log

### 2026-08-12 — Hard fix /articles/ empty field (AOS + height reset)
- Root cause: `.hostinger-elementor-aos { opacity: 0 }` hid About/Shop Smart while they still occupied ~1000px.
- Forced AOS elements visible, stripped `data-aos` hooks, hard-reset `min-height`/`height` on wrappers, normalized disclosure margins.

### 2026-08-12 — Fix huge whitespace gap on /articles/
- Replaced rigid 3-column grid with `auto-fill` + `align-items: start`; forced `min-height: auto` on `main` / Elementor containers.
- Removed Shop Smart `margin-top: -400px` hack; restored normal spacing and disclosure before footer.

### 2026-08-12 — Global disclosure banner & footer legal links
- Added `pk-disclosure-footer` before `<footer>` on all 19 HTML pages.
- Added centered `pk-footer-bottom` legal links (Privacy, Disclosure, Terms, Contact) above the © 2026 line on all pages.

### 2026-08-12 — Restore consent banner & analytics scripts
- Recreated `assets/js/pickora-consent.js` (Consent Mode v2 cookie banner) and `assets/js/pickora-analytics.js` (affiliate clicks, scroll depth, engaged read) from report §3.3.
- Linked both scripts with `defer` in `<head>` and before `</body>` on all site HTML pages.

### 2026-08-12 — Homepage footer legal links
- Added centered `pk-footer-bottom` / `pk-footer-legal` nav (Privacy, Disclosure, Terms, Contact) in `index.html` footer, above the © 2026 copyright line.

### 2026-08-12 — Task 1.4: WCAG 44×44px tap targets
- Added `pk-tap-targets-inline-css` to all 15 HTML pages (after global reset): burger open/close, footer social links, and category filter buttons now meet min 44×44px hit area (report §2.5).

### 2026-08-12 — Task 1.3: Remove 404 Elementor CSS & defer head scripts
- Removed all 6 broken Elementor CSS `<link>` tags (report §2.7): `local-95` desktop/mobile, `local-132` desktop/tablet, `local-160` desktop, `local-193` desktop — from the 4 review article pages.
- Removed `jquery-migrate.min.js` from all 15 HTML pages (~13 KB saved per page, unused on static site).
- Added `defer` to `jquery.min.js` in `<head>` on all 15 pages (gtag kept `async`). Scripts no longer block first paint.

### 2026-08-12 — Task 1.2: Image compression & lazy loading
- Added `tools/compress-images.py` (Pillow): scanned `wp-content/uploads/`, recompressed 39 heavy/oversized `*-scaled.*` images to max 1200px width at quality 80–82%, target ≤250 KB; generated `-800w` / `-1200w` WebP/JPEG variants.
- **Saved ~27.3 MB** total payload (~26.7 MB on first pass for multi-MB `-scaled.webp` files; ~0.56 MB on second pass resizing remaining 2560px-wide scaled assets in `2026/06` and `2026/07`).
- Added `tools/fix-img-attributes.py`: updated **59 `<img>` tags** across 13 HTML pages — hero gets `loading="eager" fetchpriority="high" decoding="async"`; below-fold gets `loading="lazy" decoding="async"`; explicit `width`/`height` from local file dimensions for CLS prevention.

### 2026-08-12 — Task 1.1: Global reset & /about/ overflow fix
- Added `pk-global-reset-inline-css` to all 15 site HTML pages: universal `box-sizing: border-box` and `html, body { max-width: 100%; overflow-x: clip; }`.
- Fixed `/about/` `.pk-cta-wrapper` (+40px horizontal overflow): explicit `box-sizing: border-box` and `max-width: 100%`.
- Fixed `/about/` `.pk-services-grid`: `minmax(min(320px, 100%), 1fr)` prevents 320px grid blowout on narrow viewports.
