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

### 2026-08-13 — Sanitize & unify header/nav across all pages
- Desktop: logo left / Home–About on one horizontal row on every page (including `/articles/`).
- Removed black focus outlines and long underlines on `a:focus` / `.current-menu-item` / `aria-current`.
- Mobile overlay: single left column (`padding-left: 0`), close button top-right (`margin: 0`), no border/outline/underline on active/focus links.

### 2026-08-12 — Mobile menu column align + footer bottom gap
- Open nav: fixed full-viewport overlay (`z-index: 999999`), close button top-right, menu links in a left-aligned column (no staggered indent).
- Search (`#pk-search-system`) forced under the overlay (`z-index: 1`).
- Sticky footer: `html` navy `#15223B`, `body`/`wp-site-blocks` flex column, footer `padding-bottom: 30px` — removes white strip under the footer.

### 2026-08-12 — Hide mobile nav icons on desktop header
- Root cause: Phase 1 tap-target CSS forced `display: inline-flex !important` on burger/close buttons at all breakpoints.
- Desktop (≥769px): hide open/close icons; show inline nav. Mobile (≤768px): keep 44×44 tap targets. Header row: logo left / menu right via flex.

### 2026-08-12 — Phase 1 complete: CWV images, scripts, tap targets
- Recompressed **71** uploads >500KB (max width 1600, WebP/JPEG q≈82): **~273 MB** saved; uploads images ≈330MB → ≈59MB.
- All site HTML: hero `loading="eager" fetchpriority="high"`; below-fold `loading="lazy" decoding="async"`; explicit `width`/`height` where local files exist.
- Removed jquery-migrate; deferred head jQuery; refreshed WCAG 44×44 tap-target CSS with `!important`.
- Confirmed broken Elementor `local-95/132/160/193` CSS links absent.

### 2026-08-12 — Fix oversized vertical gaps on /articles/
- Removed stacked `padding-top: 40px` on `main`/`entry-content` plus hub `margin-top: 48px` (was ~120px+ above badge).
- Tightened search→grid spacing (`#pk-search-system` bottom 24px, grid top 8px) and collapsed Elementor section gaps.

### 2026-08-12 — Unify Products / Articles / Categories hub header spacing
- Reset WP `margin-block-start: 40px` on page content wrappers; set shared `48px` top offset for `.pk-products-hub`, `.pk-hub-header-section`, and `.pk-catalog-header` so badge→title blocks no longer jump between pages.

### 2026-08-12 — Footer bottom bar padding (stop text flush to edge)
- `.pk-footer-bottom`: added `padding: 20px 20px 32px` and `line-height: 1.4` so legal links/© are not cramped against the bottom of the navy footer.

### 2026-08-12 — Header badge, disclosure line, footer axis alignment
- Legal/Contact: fixed clipped `.pk-legal-badge` (extra top margin/padding, visible overflow).
- Global `.pk-disclosure-footer`: centered single-line styles (`max-width: 1140px`, `margin: 50px auto 40px`).
- Global `.pk-footer-bottom`: links + © on one flex row with `space-between` / `align-items: center`.

### 2026-08-12 — Sticky footer on legal pages (remove bottom white gap)
- `/privacy-policy/`, `/affiliate-disclosure/`, `/terms-of-service/`, `/contact/`: flex sticky-footer layout (`body` + `.wp-site-blocks` column, `main` grows, `footer` `margin-top: auto`, `#15223B` background) so the blue footer pins to the viewport bottom on short pages.

### 2026-08-12 — Phase 0 complete: Amazon compliance, Consent Mode v2, GA4 tracking
- Fixed **57** Amazon `<a>` links with `rel="sponsored nofollow noopener noreferrer"` + `target="_blank"`; categories popup CTAs updated to the same `rel`.
- Replaced Site Kit (`GT-MB8GRCPZ`) with GA4 `G-Q4SCHBR4QM` + Consent Mode v2 defaults on all 19 HTML pages.
- Ensured `assets/js/pickora-consent.js` and `assets/js/pickora-analytics.js` (affiliate `select_item`/`affiliate_click`, scroll depth, engaged read) load once before `</body>`.
- Verified `.pk-disclosure-footer` before footer and legal footer links (`/privacy-policy/`, `/affiliate-disclosure/`, `/terms-of-service/`, `/contact/`) on all pages.

### 2026-08-12 — Premium redesign: /about/, /articles/, single-line disclosure
- Global `.pk-disclosure-footer`: centered one-line-friendly styles (`max-width: 1200px`, `inline-block` paragraph) on all HTML pages.
- `/articles/`: removed heavy blue Shop Smart block; replaced bulky About Us with light `#f8fafc` card + soft shadow.
- `/about/`: laconic Mission/Why Us mini-cards (`#e2e8f0` borders, 16px radius); equal-height Services cards with `aspect-ratio: 16/9` images; Real Feedback as elegant light quote (`max-width: 800px`) instead of giant dark plaque.

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
