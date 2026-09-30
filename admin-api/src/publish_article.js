/**
 * Pickora Admin API — Article publish helpers
 *
 * Exports:
 *   buildArticlesHubCard(draft)        -> HTML string
 *   upsertSitemapUrl(xml, path, date)  -> xml string
 *   prependHubCard(html, cardHtml)     -> html string
 *   buildArticlePage(draft)            -> HTML string (full static article page)
 *   publishArticleDraft(env, draft)    -> Promise<{ ok, urls, commits }>
 *
 * Chip labels follow chips.md (1–3 chips, first = primary, rest = soft).
 * No AggregateRating. Hub card links to article page only.
 *
 * Article page chrome cloned from live article pages (hostinger-ai-theme, DMSans font,
 * WP block nav, same sticky header + footer + external Pickora assets).
 */

import { getFile, putFile } from "./github.js";
import {
  compileBlocksToHtml,
  ensureBlueH1,
  PK_MW_GUIDE_CSS,
  escHtml,
  escAttr,
} from "./article_blocks.js";

export { compileBlocksToHtml, ensureBlueH1 };

const LIVE_HEADER_CSS = `
/* =========================================================
   Pickora — premium header + mobile navigation (sitewide)
   ========================================================= */

/* --- Sticky header bar --- */
header.site-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 10000 !important;
  background: #ffffff !important;
  width: 100% !important;
  flex: 0 0 auto !important;
  min-height: 72px !important;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06) !important;
}

header.site-header .hostinger-ai-menu-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 24px !important;
  grid-template-columns: none !important;
  width: 100% !important;
  max-width: 1140px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}

header.site-header .hostinger-ai-site-navigation-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  margin-left: auto !important;
}

header.site-header .hostinger-ai-site-navigation.wp-block-navigation {
  display: flex !important;
  align-items: center !important;
}

/* --- Desktop nav: one clean horizontal row --- */
@media (min-width: 992px) {
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) {
    display: block !important;
    position: static !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
    background: transparent !important;
  }
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) .wp-block-navigation__responsive-close,
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) .wp-block-navigation__responsive-dialog {
    display: contents !important;
  }
  header.site-header .wp-block-navigation__responsive-container-content {
    display: flex !important;
    visibility: visible !important;
    position: static !important;
    padding: 0 !important;
  }
  header.site-header .wp-block-navigation__container {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 32px !important;
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
  }
  header.site-header .wp-block-navigation-item {
    display: inline-flex !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  header.site-header .wp-block-navigation-item__content {
    display: inline-block !important;
    padding: 4px 0 !important;
    margin: 0 !important;
    white-space: nowrap !important;
    font-size: 15px !important;
    font-weight: 500 !important;
    letter-spacing: -0.01em !important;
    color: #0f172a !important;
    line-height: 1.2 !important;
  }
  header.site-header .wp-block-navigation-item__content:hover {
    color: #2075d2 !important;
  }
  header.site-header .current-menu-item > .wp-block-navigation-item__content,
  header.site-header .wp-block-navigation-item__content[aria-current="page"] {
    color: #2075d2 !important;
    font-weight: 600 !important;
    background: transparent !important;
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
  }
  header.site-header .wp-block-navigation,
  header.site-header .wp-block-navigation ul,
  header.site-header .wp-block-navigation li,
  header.site-header .wp-block-navigation a {
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
  }
}

/* --- Kill outlines / underlines / borders on ALL header + overlay nav links --- */
header.site-header .wp-block-navigation a.wp-block-navigation-item__content,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:link,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:visited,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:hover,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:active,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:focus,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:focus-visible,
header.site-header .wp-block-navigation .current-menu-item > a,
header.site-header .wp-block-navigation a[aria-current="page"],
.wp-block-navigation__responsive-container.is-menu-open a,
.wp-block-navigation__responsive-container.has-modal-open a,
.wp-block-navigation__responsive-container.is-menu-open a:link,
.wp-block-navigation__responsive-container.has-modal-open a:link,
.wp-block-navigation__responsive-container.is-menu-open a:visited,
.wp-block-navigation__responsive-container.has-modal-open a:visited,
.wp-block-navigation__responsive-container.is-menu-open a:hover,
.wp-block-navigation__responsive-container.has-modal-open a:hover,
.wp-block-navigation__responsive-container.is-menu-open a:active,
.wp-block-navigation__responsive-container.has-modal-open a:active,
.wp-block-navigation__responsive-container.is-menu-open a:focus,
.wp-block-navigation__responsive-container.has-modal-open a:focus,
.wp-block-navigation__responsive-container.is-menu-open a:focus-visible,
.wp-block-navigation__responsive-container.has-modal-open a:focus-visible {
  outline: 0 !important;
  outline-offset: 0 !important;
  border: 0 !important;
  border-bottom: 0 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  box-shadow: none !important;
  text-decoration: none !important;
  text-decoration-line: none !important;
  text-underline-offset: unset !important;
  -webkit-tap-highlight-color: transparent !important;
}

header.site-header .wp-block-navigation .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation-item__label {
  text-decoration: none !important;
  border: 0 !important;
  box-shadow: none !important;
}

header.site-header .wp-block-navigation .current-menu-item > a::after,
header.site-header .wp-block-navigation .current-menu-item > a::before,
header.site-header .wp-block-navigation a[aria-current="page"]::after,
header.site-header .wp-block-navigation a[aria-current="page"]::before,
.wp-block-navigation__responsive-container.is-menu-open .current-menu-item > a::after,
.wp-block-navigation__responsive-container.has-modal-open .current-menu-item > a::after,
.wp-block-navigation__responsive-container.is-menu-open .current-menu-item > a::before,
.wp-block-navigation__responsive-container.has-modal-open .current-menu-item > a::before,
.wp-block-navigation__responsive-container.is-menu-open a[aria-current="page"]::after,
.wp-block-navigation__responsive-container.has-modal-open a[aria-current="page"]::after,
.wp-block-navigation__responsive-container.is-menu-open a[aria-current="page"]::before,
.wp-block-navigation__responsive-container.has-modal-open a[aria-current="page"]::before {
  content: none !important;
  display: none !important;
  border: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* MOBILE OVERLAY styles moved to /assets/css/pickora-nav.css (Variant C drawer) */
/* Search stacking under sticky header */
#pk-search-system,
.pk-search-container,
.pk-search-box,
.pk-search-outer-container,
input[type="search"],
input#pk-realtime-search {
  position: relative !important;
  z-index: 1 !important;
}

/* Hub titles: keep space under sticky header (do not collapse) */
.pk-hub-header-section {
  margin-top: 56px !important;
  padding-top: 12px !important;
}
.pk-catalog-header {
  padding-top: 48px !important;
}
@media (max-width: 768px) {
  .pk-hub-header-section {
    margin-top: 36px !important;
    padding-top: 12px !important;
  }
  .pk-catalog-header {
    padding-top: 36px !important;
  }
  .pk-main-title {
    line-height: 1.15 !important;
  }
}

/* Categories board must stay visible; no flex-grown empty gap */
.pickora-pins-container {
  display: block !important;
  min-height: 0 !important;
}
.pickora-board-grid {
  display: grid !important;
}
.wp-site-blocks > .elementor-widget-container,
.wp-site-blocks > .elementor-element,
.e-con.e-flexbox-base,
.elementor-widget-container {
  flex-grow: 0 !important;
  flex-shrink: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 0 !important;
}

/* =========================================================
   Sticky footer WITHOUT painting legal content navy
   ========================================================= */
html {
  background-color: #ffffff !important;
  height: 100% !important;
}

body {
  min-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
}

body > .wp-site-blocks {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 0 auto !important;
  min-height: 100vh !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background-color: #ffffff !important;
}

main {
  flex: 1 0 auto !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
}

.entry-content,
.pk-legal-container,
.pk-legal-content,
.pk-legal-hero {
  background-color: #ffffff !important;
  color: #0f172a !important;
}

.pk-legal-content p,
.pk-legal-content li,
.pk-legal-content h2,
.pk-legal-content h3 {
  color: #0f172a !important;
}

footer,
footer.site-footer {
  flex-shrink: 0 !important;
  width: 100% !important;
  margin-top: auto !important;
  margin-bottom: 0 !important;
  padding-bottom: 30px !important;
  background-color: #15223B !important;
  box-shadow: 0 50vh 0 0 #15223B;
}

footer.site-footer > .wp-block-group.has-color-2-background-color {
  background-color: #15223B !important;
}
`;


// ---------------------------------------------------------------------------
// Chip slug → display label map (source of truth: chips.md)
// ---------------------------------------------------------------------------
const CHIP_LABELS = {
  audio:        "Audio",
  electronics:  "Electronics",
  mobile:       "Mobile",
  kitchen:      "Kitchen",
  cleaning:     "Cleaning",
  "smart-home": "Smart Home",
  fitness:      "Fitness",
  wearables:    "Wearables",
  pets:         "Pets",
  home:         "Home",
};

// ---------------------------------------------------------------------------
// buildArticlesHubCard
// ---------------------------------------------------------------------------

/**
 * Build the <article class="pk-card"> HTML for the articles hub.
 *
 * Rules (from chips.md):
 *   - data-categories: space-separated chip slugs (1–3)
 *   - First chip tag has class "pk-card-tag" (primary, no modifier)
 *   - Additional chips get class "pk-card-tag pk-card-tag--soft"
 *   - Image src: draft.coverImage (may be absolute workers.dev URL — kept as-is)
 *   - Card link: article canonical URL only (no Amazon links on hub card)
 *   - No AggregateRating
 *
 * @param {object} draft - Article draft object from D1
 * @returns {string} Full <article>…</article> HTML, indented with 8 spaces
 */
export function buildArticlesHubCard(draft) {
  const slug      = String(draft.slug     || "").trim();
  const title     = escHtml(String(draft.title || "").trim());
  const excerpt   = escHtml(String(draft.dek || draft.excerpt || draft.metaDescription || "").trim());
  const cover     = String(draft.coverImage || "").trim();
  const canonical = draft.canonical || `https://pickora.shop/${slug}/`;

  // Chips: max 3, validated against allowed set
  const rawChips = (Array.isArray(draft.chips) ? draft.chips : [])
    .filter((c) => CHIP_LABELS[c])
    .slice(0, 3);

  const dataCategories = rawChips.join(" ");

  // Build tag spans
  const tagSpans = rawChips
    .map((c, i) => {
      const label = CHIP_LABELS[c] || c;
      const cls   = i === 0 ? "pk-card-tag" : "pk-card-tag pk-card-tag--soft";
      return `          <span class="${cls}">${escHtml(label)}</span>`;
    })
    .join("\n");

  // Cover image: alt = lowercase title-ish
  const altText = escHtml(title.toLowerCase());

  // Inline cover only if we have one; otherwise use a data-placeholder
  const imgHtml = cover
    ? `<img src="${escAttr(cover)}" alt="${altText}" width="1200" height="670" loading="lazy" decoding="async">`
    : `<img src="" alt="${altText}" width="1200" height="670" loading="lazy" decoding="async" data-cover-pending="true">`;

  return `        <article class="pk-card" data-categories="${escAttr(dataCategories)}">
            <a href="${escAttr(canonical)}" class="pk-card-inner">
                <div class="pk-card-media">
                    ${imgHtml}
                    <div class="pk-card-tags">
${tagSpans}
                    </div>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">${title}</h3>
                    <p class="pk-card-excerpt">${excerpt}</p>
                    <div class="pk-card-footer">
                        <span>Read Full Guide</span>
                        <span class="pk-card-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>`;
}

// ---------------------------------------------------------------------------
// upsertSitemapUrl
// ---------------------------------------------------------------------------

/**
 * Insert or update a <url> entry in sitemap XML.
 *
 * Upsert logic:
 *   - If a <loc> matching the full URL already exists → update its <lastmod> in-place
 *   - Otherwise → prepend a new <url> block before </urlset>
 *
 * @param {string} sitemapXml  - Full sitemap XML text
 * @param {string} path        - Path string, e.g. "/best-headphones-2026/" or "best-headphones-2026"
 * @param {string} [lastmod]   - ISO date string YYYY-MM-DD; defaults to today UTC
 * @returns {string} Updated sitemap XML
 */
export function upsertSitemapUrl(sitemapXml, path, lastmod) {
  const date = lastmod || todayISO();
  // Normalise path to full URL
  const normPath = "/" + path.replace(/^\/|\/$/g, "") + "/";
  const fullUrl  = `https://pickora.shop${normPath}`;

  // Escape for regex usage
  const escapedUrl = fullUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const existingRe = new RegExp(
    `(<url>[\\s\\S]*?<loc>${escapedUrl}<\\/loc>[\\s\\S]*?)<lastmod>[^<]*<\\/lastmod>`,
    "i"
  );

  if (existingRe.test(sitemapXml)) {
    // Update existing lastmod
    return sitemapXml.replace(existingRe, `$1<lastmod>${date}</lastmod>`);
  }

  // Check if the loc exists at all (without lastmod)
  const locRe = new RegExp(`<loc>${escapedUrl}<\\/loc>`, "i");
  if (locRe.test(sitemapXml)) {
    // Already present but has no lastmod — skip to avoid duplicates
    return sitemapXml;
  }

  // New entry — prepend before </urlset>
  const newEntry = `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

  return sitemapXml.replace("</urlset>", newEntry + "</urlset>");
}

// ---------------------------------------------------------------------------
// prependHubCard
// ---------------------------------------------------------------------------

/**
 * Insert a new pk-card HTML block as the FIRST card in the articles hub grid.
 *
 * Insertion order of preference (most→least specific):
 *   1. After the [ИНСТРУКЦИЯ] instruction comment (canonical site marker)
 *   2. Before the first existing <article class="pk-card"
 *   3. Before </div> of the pk-articles-grid / pk-grid-feed div (fallback)
 *
 * @param {string} articlesIndexHtml  - Full articles/index.html text
 * @param {string} cardHtml           - The <article>…</article> block to insert
 * @returns {string} Updated HTML
 */
export function prependHubCard(articlesIndexHtml, cardHtml) {
  const NEWLINE_CARD = "\n\n" + cardHtml + "\n";

  // 1. Preferred: insert after the canonical instruction comment
  const instrRe = /(<!--\s*\[ИНСТРУКЦИЯ\][^\n]*\n)/;
  if (instrRe.test(articlesIndexHtml)) {
    return articlesIndexHtml.replace(instrRe, "$1" + NEWLINE_CARD);
  }

  // 2. Before the first <article class="pk-card"
  const cardRe = /(<article\s+class="pk-card")/;
  if (cardRe.test(articlesIndexHtml)) {
    return articlesIndexHtml.replace(cardRe, cardHtml + "\n\n        $1");
  }

  // 3. Fallback: before the closing tag of pk-grid-feed / pk-articles-grid
  const gridEndRe = /(<\/div>\s*\n\s*<\/div>\s*\n\s*<!-- \/pk-grid| pk-grid-feed|pk-articles-grid)/;
  if (gridEndRe.test(articlesIndexHtml)) {
    return articlesIndexHtml.replace(gridEndRe, NEWLINE_CARD + "\n$1");
  }

  // Last resort: append before last </main> or </body>
  const bodyRe = /(<\/main>|<\/body>)/i;
  return articlesIndexHtml.replace(bodyRe, NEWLINE_CARD + "\n$1");
}

// ---------------------------------------------------------------------------
// buildArticlePage — full static HTML for {slug}/index.html
// ---------------------------------------------------------------------------

/**
 * Render the affiliate-product cards section.
 * @param {Array<{name,url,role,price}>} links
 * @returns {string} HTML
 */
function _buildAffiliateSectionHtml(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  const cards = links
    .map((link) => {
      const name  = escHtml(String(link.name  || ""));
      const url   = escAttr(String(link.url   || "#"));
      const role  = escHtml(String(link.role  || ""));
      const price = escHtml(String(link.price || ""));
      return `    <div class="pk-aff-card">
      <div class="pk-aff-card-info">
        ${role  ? `<span class="pk-aff-card-role">${role}</span>` : ""}
        <p class="pk-aff-card-name">${name}</p>
        ${price ? `<p class="pk-aff-card-price">${price}</p>` : ""}
        <a href="${url}" class="pk-aff-btn" target="_blank"
           rel="sponsored nofollow noopener noreferrer">View on Amazon →</a>
      </div>
    </div>`;
    })
    .join("\n");
  return `<div class="pk-affiliate-section">
  <h2>Our Picks</h2>
${cards}
</div>
`;
}

/**
 * Render the FAQ section.
 * FAQ answers may contain HTML; questions are escaped.
 * @param {Array<{q,a}>} faq
 * @returns {string} HTML
 */
function _buildFaqSectionHtml(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return "";
  return `<div class="pk-faq-section">
  <h2>Frequently Asked Questions</h2>
${faq
    .map(
      (item) => `  <details class="pk-faq-acc">
    <summary class="pk-faq-q">${escHtml(String(item.q || "Question"))}</summary>
    <div class="pk-faq-a">${item.a || ""}</div>
  </details>`
    )
    .join("\n")}
</div>
`;
}

/**
 * Build JSON-LD structured data for an article page.
 * @returns {string} <script type="application/ld+json">…</script>
 */
function _buildArticleJsonLd(draft, canonical, pubDate) {
  const graph = [
    {
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: `${draft.title || ""} – Pickora`,
      description: String(draft.metaDescription || draft.dek || ""),
      inLanguage: "en-US",
      isPartOf: { "@id": "https://pickora.shop/#website" },
    },
    {
      "@type": "Article",
      headline: String(draft.title || ""),
      description: String(draft.metaDescription || draft.dek || ""),
      url: canonical,
      datePublished: pubDate,
      dateModified: todayISO(),
      author: {
        "@type": "Organization",
        name: "Pickora",
        url: "https://pickora.shop/",
      },
      publisher: {
        "@type": "Organization",
        name: "Pickora",
        url: "https://pickora.shop/",
        logo: {
          "@type": "ImageObject",
          url: "https://pickora.shop/wp-content/uploads/2026/06/cropped-EBB147B3-3B2F-4397-A012-C55F9BECCDC1-192x192.webp",
        },
      },
    },
  ];

  if (draft.coverImage) {
    graph[1].image = {
      "@type": "ImageObject",
      url: draft.coverImage,
      width: 1200,
      height: 670,
    };
  }

  if (Array.isArray(draft.faq) && draft.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: draft.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return `<script type="application/ld+json">
${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2)}
</script>`;
}

/**
 * Build a full static HTML page for a Pickora article at {slug}/index.html.
 *
 * Chrome (sticky header, nav, footer) is cloned from live article pages
 * (hostinger-ai-theme, DMSans font, WP block navigation with data-wp-* attrs,
 * same external Pickora CSS/JS assets at /assets/…).
 *
 * Draft fields used:
 *   title, metaDescription, h1, dek, coverImage, coverAlt,
 *   bodyHtml, chips, hubCategory, hubUrl, canonical,
 *   affiliateLinks (array), faq (array of {q,a})
 *
 * @param {object} draft - Published article draft
 * @returns {string} Complete HTML document
 */
export function buildArticlePage(draft, options = {}) {
  const preview     = !!(options && options.preview);
  const previewBy   = String((options && options.previewBy) || "studio");
  const slug        = String(draft.slug || "");
  const canonical   = String(draft.canonical || `https://pickora.shop/${slug}/`);
  const title       = String(draft.title     || slug);
  const metaDesc    = String(draft.metaDescription || draft.dek || "").slice(0, 160);
  // Brand blue accent on H1 (auto if author left plain text)
  const h1Html      = ensureBlueH1(draft.h1, title);
  const dek         = String(draft.dek || "");
  const coverImage  = String(draft.coverImage || "");
  const coverAlt    = String(draft.coverAlt  || title);
  const hubCategory = String(draft.hubCategory || "Articles");
  let hubUrl        = String(draft.hubUrl     || "https://pickora.shop/articles/");
  if (hubUrl && !/^https?:\/\//i.test(hubUrl)) {
    hubUrl = `https://pickora.shop${hubUrl.startsWith("/") ? "" : "/"}${hubUrl}`;
  }
  const hasBlocks   = Array.isArray(draft.blocks) && draft.blocks.length > 0;
  const bodyHtml    = hasBlocks
    ? compileBlocksToHtml(draft.blocks)
    : String(draft.bodyHtml || "");
  const hasBlockProducts = hasBlocks && draft.blocks.some((b) => b && (b.type === "product" || b.type === "cta"));
  const hasBlockFaq = hasBlocks && draft.blocks.some((b) => b && b.type === "faq");
  const pubDate     = String(draft.publishedAt || todayISO()).slice(0, 10);
  const year        = new Date().getFullYear();

  const jsonLd          = _buildArticleJsonLd(draft, canonical, pubDate);
  const affiliateSection = hasBlockProducts
    ? ""
    : _buildAffiliateSectionHtml(draft.affiliateLinks);
  const faqSection       = hasBlockFaq ? "" : _buildFaqSectionHtml(draft.faq);

  const coverHtml = coverImage
    ? `<div class="pk-article-cover-wrap">
  <img class="pk-article-cover"
       src="${escAttr(coverImage)}"
       alt="${escAttr(coverAlt)}"
       width="1200" height="670"
       loading="eager" fetchpriority="high" decoding="async">
</div>
`
    : "";

  // Chips stay on hub cards only — never under the article hero on live pages.

  const pageTitle = preview ? `[Preview] ${title} – Pickora` : `${title} – Pickora`;
  const robotsMeta = preview
    ? `<meta name="robots" content="noindex,nofollow">`
    : `<meta name="robots" content="max-image-preview:large">`;
  const baseTag = preview ? `<base href="https://pickora.shop/">\n` : "";

  const analyticsHead = preview
    ? `<!-- preview: analytics skipped -->`
    : `<!-- pk-analytics-head -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  // EU/EEA: analytics denied by default; rest of world: analytics allowed
  gtag('consent', 'default', {
    'ad_storage': 'denied', 'ad_user_data': 'denied',
    'ad_personalization': 'denied', 'analytics_storage': 'denied',
    'functionality_storage': 'granted', 'security_storage': 'granted',
    'region': ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE',
               'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
               'GB','CH','NO','IS','LI']
  });
  gtag('consent', 'default', {
    'ad_storage': 'denied', 'ad_user_data': 'denied',
    'ad_personalization': 'denied', 'analytics_storage': 'granted',
    'functionality_storage': 'granted', 'security_storage': 'granted'
  });
  try {
    var saved = JSON.parse(localStorage.getItem('pk_consent') || 'null');
    if (saved && saved.analytics_storage) { gtag('consent', 'update', saved); }
  } catch (e) {}
  gtag('js', new Date());
  gtag('config', 'G-Q4SCHBR4QM', {
    'anonymize_ip': true, 'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Q4SCHBR4QM"></script>
<!-- MailerLite Universal -->
<script>
  (function(w,d,u,l,e,r){w['_$mailerliteObject']=l;w[l]=w[l]||function(){
  (w[l].q=w[l].q||[]).push(arguments)},w[l].l=1*new Date();e=d.createElement(u),
  r=d.getElementsByTagName(u)[0];e.async=1;e.src=l;r.parentNode.insertBefore(e,r)
  })(window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
  ml('account', '2575871');
</script>`;

  const previewBanner = preview
    ? `<div id="pk-preview-banner" role="status">
  <div class="pk-preview-banner-inner">
    <strong>PREVIEW</strong>
    <span>Не опубликовано · тот же HTML, что уйдёт в Publish · без записи в GitHub</span>
    <span class="pk-preview-meta">${escHtml(slug || "no-slug")} · ${escHtml(previewBy)}</span>
  </div>
</div>
<style>
#pk-preview-banner{
  position:sticky;top:0;z-index:100000;
  background:#15223B;color:#fff;
  font-family:Montserrat,DMSans,sans-serif;
  box-shadow:0 2px 12px rgba(15,23,42,.28);
}
.pk-preview-banner-inner{
  max-width:1140px;margin:0 auto;padding:10px 20px;
  display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;
  font-size:13px;line-height:1.35;
}
#pk-preview-banner strong{
  letter-spacing:.12em;font-size:11px;background:#ff9900;color:#111;
  padding:4px 8px;border-radius:6px;
}
.pk-preview-meta{margin-left:auto;opacity:.75;font-size:12px}
body.pk-is-preview{padding-top:0}
@media (max-width:700px){
  .pk-preview-meta{margin-left:0;width:100%}
}
</style>
`
    : "";

  const bodyClass = preview
    ? "wp-singular single-post single-format-standard wp-embed-responsive wp-theme-hostinger-ai-theme pk-is-preview"
    : "wp-singular single-post single-format-standard wp-embed-responsive wp-theme-hostinger-ai-theme";

  const footerAssets = `<!-- site chrome assets -->
<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-nav.css?v=5">
<script src="https://pickora.shop/assets/js/pickora-nav.js?v=5" defer></script>
<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-mobile-fixes.css?v=2">
<script src="https://pickora.shop/assets/js/pickora-product-anchors.js" defer></script>
${
  preview
    ? ""
    : `<script src="https://pickora.shop/assets/js/pickora-consent.js?v=3" defer></script>
<script src="https://pickora.shop/assets/js/pickora-analytics.js" defer></script>`
}
<script data-wp-router-options="{&quot;loadOnClientNavigation&quot;:true}" fetchpriority="low"
        id="@wordpress/block-library/navigation/view-js-module"
        src="https://pickora.shop/wp-includes/js/dist/script-modules/block-library/navigation/view.min.js?ver=96a846e1d7b789c39ab9"
        type="module"></script>`;

  /* ── Full HTML page ─────────────────────────────────────────────────────── */
  return `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${robotsMeta}
${baseTag}<title>${escHtml(pageTitle)}</title>
<link rel="canonical" href="${escAttr(canonical)}">
<meta name="description" content="${escAttr(metaDesc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Pickora">
<meta property="og:title" content="${escAttr(title)} – Pickora">
<meta property="og:description" content="${escAttr(metaDesc)}">
<meta property="og:url" content="${escAttr(canonical)}">
${coverImage
  ? `<meta property="og:image" content="${escAttr(coverImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${escAttr(coverImage)}">`
  : `<meta name="twitter:card" content="summary">`
}
<meta name="twitter:title" content="${escAttr(title)} – Pickora">
<meta name="twitter:description" content="${escAttr(metaDesc)}">
<link rel="icon" href="https://pickora.shop/favicon.ico" type="image/x-icon">
<link rel="icon" href="https://pickora.shop/wp-content/uploads/2026/06/cropped-EBB147B3-3B2F-4397-A012-C55F9BECCDC1-32x32.webp" sizes="32x32">
<link rel="apple-touch-icon" href="https://pickora.shop/wp-content/uploads/2026/06/cropped-EBB147B3-3B2F-4397-A012-C55F9BECCDC1-180x180.webp">
${analyticsHead}
<!-- structured data -->
${preview ? "<!-- preview: json-ld skipped -->" : jsonLd}
<script id="wp-importmap" type="importmap">{"imports":{"@wordpress/interactivity":"https://pickora.shop/wp-includes/js/dist/script-modules/interactivity/index.min.js?ver=efaa5193bbad9c60ffd1"}}</script>
<style>
/* ===================================================================
   Pickora article page — critical inline CSS
   Cloned + trimmed from live article pages (hostinger-ai-theme).
   External: /assets/css/pickora-nav.css (nav drawer) +
             /assets/css/pickora-mobile-fixes.css loaded in <body>.
   =================================================================== */
*, *::before, *::after { box-sizing: border-box; }
html, body { max-width: 100%; overflow-x: clip; margin: 0; padding: 0; }
body {
  font-family: DMSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, sans-serif;
  color: #0f172a; background: #fff; line-height: 1.6;
}

/* ── Fonts — served from WP on same domain ── */
@font-face { font-family: DMSans; font-style: normal; font-weight: 400; font-display: fallback;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/DMSans-Regular.ttf') format('truetype'); }
@font-face { font-family: DMSans; font-style: italic; font-weight: 400; font-display: fallback;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/DMSans-Italic.ttf') format('truetype'); }
@font-face { font-family: DMSans; font-style: normal; font-weight: 500; font-display: fallback;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/DMSans-Medium.ttf') format('truetype'); }
@font-face { font-family: DMSans; font-style: normal; font-weight: 700; font-display: fallback;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/DMSans-Bold.ttf') format('truetype'); }
@font-face { font-family: Montserrat; font-style: normal; font-weight: 400 800; font-display: fallback;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/Montserrat-Regular.ttf') format('truetype'); }

${LIVE_HEADER_CSS}


/* skip link */
.skip-link { position: absolute; left: -9999px; z-index: 99999;
  padding: 8px 16px; background: #2075d2; color: #fff; text-decoration: none; }
.skip-link:focus { left: 8px; top: 8px; }

/* ── Layout wrapper ── */
.wp-site-blocks { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Sticky header (matches live article pages) ── */
header.site-header {
  position: sticky; top: 0; z-index: 10000;
  background: #fff; width: 100%; flex: 0 0 auto;
  min-height: 72px; box-shadow: 0 1px 0 rgba(15,23,42,0.06);
}
.hostinger-ai-menu-wrapper {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  width: 100%; max-width: 1140px; margin: 0 auto;
  padding: 20px 20px; box-sizing: border-box;
}
.hostinger-ai-site-navigation-wrapper {
  display: flex; align-items: center; justify-content: flex-end; margin-left: auto;
}
.hostinger-ai-site-title a {
  font-family: Montserrat, sans-serif; font-size: 22px; font-weight: 800;
  color: #2075d2 !important; text-decoration: none; letter-spacing: -0.03em;
}
.hostinger-ai-site-title a:hover { color: #15223B !important; }

/* Mobile burger (≤991px) */
@media (max-width: 991px) {
  .wp-block-navigation__responsive-container-open {
    display: flex !important; align-items: center; justify-content: center;
    min-width: 44px !important; min-height: 44px !important;
    padding: 10px !important; margin: -10px !important;
    background: transparent; border: 0; cursor: pointer; color: #0f172a;
  }
  .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open)
    .wp-block-navigation__responsive-container-content { display: none !important; }
}
/* Desktop nav (≥992px) — one horizontal row */
@media (min-width: 992px) {
  .wp-block-navigation__responsive-container-open,
  .wp-block-navigation__responsive-container-close { display: none !important; }
  .wp-block-navigation__responsive-container {
    display: block !important; position: static !important;
    width: auto !important; height: auto !important;
    overflow: visible !important; background: transparent !important;
  }
  .wp-block-navigation__responsive-container-content {
    display: flex !important; visibility: visible !important;
    position: static !important; padding: 0 !important;
  }
  .wp-block-navigation__container {
    display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center;
    justify-content: flex-end; gap: 32px; margin: 0; padding: 0; list-style: none;
  }
  .wp-block-navigation-item { display: inline-flex; align-items: center; margin: 0; padding: 0; }
  .wp-block-navigation-item__content {
    display: inline-block; padding: 4px 0; margin: 0;
    font-size: 15px; font-weight: 500; letter-spacing: -0.01em;
    color: #0f172a; text-decoration: none; white-space: nowrap;
    border: 0; outline: 0; box-shadow: none;
  }
  .wp-block-navigation-item__content:hover { color: #2075d2; }
  .wp-block-navigation-item__label { text-decoration: none; }
}

/* ── Article hero (matches .pk-review-hero on live article pages) ── */
main#wp--skip-link--target { padding-top: 0; padding-bottom: 0; }
.pk-review-hero {
  box-sizing: border-box; width: 100%; max-width: 760px;
  margin: 24px auto 8px; padding: 32px 24px 4px;
  background: transparent; text-align: left;
}
.pk-review-hero-inner { max-width: 720px; margin: 0; }
.pk-crumbs { margin: 0 0 18px; padding: 0; font-size: 13px; line-height: 1.4; color: #94a3b8; }
.pk-crumbs ol { display: flex; flex-wrap: wrap; align-items: center; gap: 0;
  margin: 0; padding: 0; list-style: none; }
.pk-crumbs li { display: inline-flex; align-items: center; }
.pk-crumbs li + li::before { content: "›"; margin: 0 8px; color: #cbd5e1; font-weight: 400; }
.pk-crumbs a { color: #64748b; text-decoration: none; }
.pk-crumbs a:hover { color: #2075d2; }
.pk-crumbs [aria-current="page"] { color: #94a3b8; }
.pk-review-badge {
  display: inline-flex; align-items: center; gap: 8px; margin: 0 0 14px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: #2075d2;
}
.pk-dot-blue { width: 8px; height: 8px; border-radius: 50%; background: #2075d2; display: inline-block; }
.pk-review-title {
  font-family: Montserrat, sans-serif;
  font-size: clamp(32px, 4.6vw, 52px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.12;
  color: #15223B !important; margin: 0 0 16px !important;
}
.pk-blue-text { color: #2075d2; }
.pk-review-dek { margin: 0 0 8px; max-width: 640px; font-size: 17px; line-height: 1.65; color: #475569; }

/* ── Cover image (live alignwide cover ≈ 1140) ── */
.pk-article-cover-wrap {
  max-width: 1140px; margin: 12px auto 28px;
  border-radius: 16px; overflow: hidden; padding: 0 20px; box-sizing: border-box;
}
.pk-article-cover { width: 100%; height: auto; display: block; border-radius: 16px; }

/* ── Article body: wide like live entry-content.alignwide (tables + product photos) ── */
.pk-entry-content-wrap { max-width: 1140px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }
.entry-content { max-width: 1140px; margin: 0 auto; width: 100%; }
.entry-content h2 {
  font-family: Montserrat, sans-serif; font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 800; color: #15223B; margin-top: 2.2rem; letter-spacing: -0.02em;
}
.entry-content h3 {
  font-family: Montserrat, sans-serif; font-size: clamp(17px, 2vw, 21px);
  font-weight: 700; color: #15223B; margin-top: 1.8rem;
}
.entry-content h4 { font-family: Montserrat, sans-serif; font-size: 17px; font-weight: 700; color: #15223B; margin-top: 1.4rem; }
.entry-content p { font-size: 16.5px; line-height: 1.7; color: #334155; margin: 0 0 16px; }
.entry-content li { font-size: 16px; line-height: 1.65; color: #334155; margin-bottom: 8px; }
.entry-content a { color: #2075d2; text-underline-offset: 3px; text-decoration: underline; }
.entry-content a:hover { color: #15223B; }
.entry-content ul, .entry-content ol { padding-left: 22px; margin: 0 0 16px; }
.entry-content img { max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 16px 0; }
.entry-content blockquote {
  border-left: 4px solid #2075d2; margin: 20px 0; padding: 12px 20px;
  background: #f0f7ff; border-radius: 0 8px 8px 0; color: #15223B;
}
.entry-content table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px; }
.entry-content th { background: #15223B; color: #fff; padding: 10px 14px; text-align: left; font-weight: 700; }
.entry-content td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
.entry-content tr:hover td { background: #f8fafc; }
.entry-content hr { border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0; }
/* Verdicts / callouts (used in bodyHtml) */
.pk-verdict {
  background: #f0f7ff; border-left: 4px solid #2075d2;
  padding: 14px 16px; margin: 12px 0 20px;
  border-radius: 0 10px 10px 0; color: #15223B; font-size: 15px; line-height: 1.55;
}

/* ── Affiliate product cards ── */
.pk-affiliate-section { max-width: 1140px; margin: 32px auto; padding: 0 20px; box-sizing: border-box; }
.pk-affiliate-section > h2 {
  font-family: Montserrat, sans-serif; font-size: 24px; font-weight: 800;
  color: #15223B; margin: 0 0 20px; letter-spacing: -0.02em;
}
.pk-aff-card {
  display: flex; align-items: flex-start; gap: 20px;
  border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;
  margin-bottom: 16px; background: #fff;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.pk-aff-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.08); border-color: #cbd5e1; }
.pk-aff-card-info { flex: 1; }
.pk-aff-card-role {
  display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: #2075d2; background: #eef5fc;
  padding: 4px 10px; border-radius: 999px; white-space: nowrap; margin-bottom: 8px;
}
.pk-aff-card-name { font-weight: 700; font-size: 17px; color: #15223B; margin: 0 0 6px; }
.pk-aff-card-price { font-size: 13px; color: #64748b; margin: 0 0 14px; }
.pk-aff-btn {
  display: inline-flex; align-items: center;
  background: #2075d2; color: #fff !important; text-decoration: none !important;
  font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 999px;
  transition: background 0.15s;
}
.pk-aff-btn:hover { background: #1a63b5; }
.pk-aff-btn--outline {
  background: #fff !important;
  color: #2075D2 !important;
  border: 1.5px solid #2075D2;
}
.pk-aff-btn--outline:hover { background: #dbeeff !important; }
.pk-aff-btn--amazon {
  background: #ff9900 !important;
  color: #111 !important;
}
.pk-aff-btn--amazon:hover { background: #e88b00 !important; }
.pk-aff-btn--primary { background: #2075D2; color: #fff !important; }

/* Table variants — match live pk-mw-table look */
.pk-block-table { max-width: 1140px; margin: 24px auto; padding: 0 20px; box-sizing: border-box; }
.pk-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff;
}
.pk-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  color: #15223B;
}
.pk-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
  color: #334155;
}
.pk-table--compare {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 0 !important;
}
.pk-table--compare .pk-table th {
  background: #f8fafc;
  border-bottom: 3px solid #e2e8f0;
}
.pk-table--compare .pk-table tr:nth-child(even) td { background: #fafafa; }
.pk-table--simple .pk-table { min-width: 0; box-shadow: none; }
.pk-table--simple .pk-table th,
.pk-table--simple .pk-table td {
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
  padding: 10px 8px;
}
.pk-table--simple .pk-table th { border-bottom: 2px solid #cbd5e1; }
.pk-table--striped {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 0 !important;
}
.pk-table--striped .pk-table th { background: #15223B; color: #fff; }
.pk-table--striped .pk-table tr:nth-child(even) td { background: #f8fafc; }
.pk-product-card--compact {
  grid-template-columns: 120px 1fr;
  padding: 14px;
  gap: 14px;
}
.pk-product-card--compact h3 { font-size: 1.05rem; }
@media (max-width: 600px) { .pk-aff-card { flex-direction: column; align-items: stretch; } }

/* ── Block constructor product cards ── */
.pk-product-card {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 22px;
  max-width: 1140px;
  margin: 28px auto;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  box-sizing: border-box;
}
.pk-product-media img { width: 100%; height: auto; border-radius: 10px; display: block; }
.pk-product-body h3 { margin: 0 0 10px; font-size: 1.25rem; color: #15223B; }
.pk-product-ctas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.pk-block-image { max-width: 960px; margin: 24px auto; padding: 0 20px; }
.pk-block-image img { width: 100%; height: auto; border-radius: 12px; }
.pk-block-cta { max-width: 900px; margin: 24px auto; padding: 16px 20px; text-align: center; }
.pk-cta-title { font-weight: 700; margin: 0 0 12px; }
@media (max-width: 700px) {
  .pk-product-card { grid-template-columns: 1fr; }
}

/* ── FAQ section ── */
.pk-faq-section { max-width: 900px; margin: 40px auto 8px; padding: 0 24px; box-sizing: border-box; }
.pk-faq-section > h2 {
  font-family: Montserrat, sans-serif; font-size: 24px; font-weight: 800;
  color: #15223B; margin: 0 0 20px; letter-spacing: -0.02em;
}
.pk-faq-item { border-top: 1px solid #e2e8f0; padding: 18px 0; }
.pk-faq-item:last-child { border-bottom: 1px solid #e2e8f0; }
.pk-faq-q { font-weight: 700; font-size: 16px; color: #15223B; margin: 0 0 10px; }
.pk-faq-a { font-size: 15px; line-height: 1.65; color: #475569; margin: 0; }
.pk-faq-a p { margin: 0 0 8px; }
.pk-faq-a p:last-child { margin-bottom: 0; }

/* ── Affiliate disclosure ── */
.pk-disclosure-footer {
  max-width: 1140px; width: 100%; margin: 50px auto 40px;
  padding: 0 20px; text-align: center; color: #64748b;
  font-size: 13px; line-height: 1.5; box-sizing: border-box;
}
.pk-disclosure-footer p { margin: 0; }
.pk-disclosure-footer a { color: #2075d2; text-decoration: underline; }

/* ── Site footer (dark #15223B — matches live pages) ── */
footer.site-footer { background: #15223B; color: rgba(255,255,255,0.85); padding: 48px 0 8px; }
.pk-footer-inner {
  max-width: 1140px; margin: 0 auto; padding: 0 20px;
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; box-sizing: border-box;
}
@media (max-width: 768px) { .pk-footer-inner { grid-template-columns: 1fr; gap: 28px; } }
.pk-footer-col h3 {
  font-family: Montserrat, sans-serif; font-size: 18px; font-weight: 700;
  color: #fff; margin: 0 0 12px;
}
.pk-footer-col a { display: block; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 15px; margin-bottom: 8px; }
.pk-footer-col a:hover { color: #fff; }
.pk-footer-col p { color: rgba(255,255,255,0.7); font-size: 15px; margin: 0 0 8px; }
.pk-footer-ml input[type="email"] {
  width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.25);
  border-radius: 4px; font-size: 14px; min-height: 44px; box-sizing: border-box;
  background: rgba(255,255,255,0.1); color: #fff; margin-bottom: 8px;
}
.pk-footer-ml input[type="email"]::placeholder { color: rgba(255,255,255,0.5); }
.pk-footer-ml button[type="submit"] {
  background: #2075d2; color: #fff; border: none; border-radius: 4px;
  padding: 11px; width: 100%; min-height: 44px;
  font-weight: 700; font-size: 14px; cursor: pointer;
}
.pk-footer-ml button[type="submit"]:hover { background: #1a63b3; }
.pk-footer-bottom {
  max-width: 1140px; margin: 24px auto 0; padding: 20px 20px 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; gap: 16px; flex-wrap: wrap; box-sizing: border-box;
}
.pk-footer-legal { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 0; }
.pk-footer-legal a { color: rgba(255,255,255,0.7); text-decoration: none; }
.pk-footer-legal a:hover { color: #fff; }
.pk-footer-legal .pk-sep { color: rgba(255,255,255,0.3); }
.pk-footer-copyright { margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; white-space: nowrap; }
@media (max-width: 768px) {
  .pk-footer-bottom { flex-direction: column; justify-content: center; text-align: center; gap: 12px; }
  .pk-footer-legal { justify-content: center; }
  .pk-footer-copyright { text-align: center; white-space: normal; }
  .pk-review-hero { width: 100%; max-width: 100%; margin: 16px auto 4px; padding: 28px 16px 4px; }
  .pk-review-hero-inner { max-width: 100%; }
  .pk-review-title { font-size: clamp(26px, 7vw, 36px); }
  .pk-review-dek { font-size: 16px; max-width: 100%; }
  .pk-faq-section, .pk-affiliate-section { padding-left: 16px; padding-right: 16px; }
  .pk-article-cover-wrap { padding-left: 12px; padding-right: 12px; margin: 8px auto 20px; }
  .pk-entry-content-wrap { padding-left: 16px; padding-right: 16px; }
  .entry-content { max-width: 100%; }
  .pk-mw-guide, .pk-block-table { max-width: 100%; }
  .pk-disclosure-footer { padding-left: 16px; padding-right: 16px; }
}
@media (max-width: 991px) and (min-width: 769px) {
  .pk-review-hero { max-width: 920px; padding-left: 24px; padding-right: 24px; }
  .pk-entry-content-wrap, .pk-article-cover-wrap { padding-left: 24px; padding-right: 24px; }
}

${PK_MW_GUIDE_CSS}
</style>
</head>

<body class="${bodyClass}">
${previewBanner}<a class="skip-link screen-reader-text" id="wp-skip-link" href="#wp--skip-link--target">Skip to content</a>
<div class="wp-site-blocks">

<!-- ═══ Header / Nav (same WP block nav structure as live article pages) ═══ -->
<header class="site-header wp-block-template-part">
  <div class="wp-block-group hostinger-ai-menu has-color-1-background-color has-background has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
    <div class="wp-block-group alignwide hostinger-ai-menu-wrapper is-layout-grid wp-block-group-is-layout-grid" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
      <div class="wp-block-group is-nowrap is-layout-flex wp-block-group-is-layout-flex">
        <p class="has-link-color hostinger-ai-site-title wp-block-site-title has-text-color has-color-3-color has-large-font-size">
          <a href="https://pickora.shop/" target="_self" rel="home">Pickora</a>
        </p>
      </div>
      <div class="wp-block-group hostinger-ai-site-navigation-wrapper is-content-justification-right is-nowrap is-layout-flex wp-block-group-is-layout-flex">
        <nav class="has-text-color has-medium-font-size is-responsive hostinger-ai-site-navigation wp-block-navigation is-horizontal is-layout-flex wp-block-navigation-is-layout-flex"
             aria-label="Primary"
             data-wp-interactive="core/navigation"
             data-wp-context="{&quot;overlayOpenedBy&quot;:{&quot;click&quot;:false,&quot;hover&quot;:false,&quot;focus&quot;:false},&quot;type&quot;:&quot;overlay&quot;,&quot;roleAttribute&quot;:&quot;&quot;,&quot;ariaLabel&quot;:&quot;Menu&quot;}">
          <button aria-haspopup="dialog" aria-label="Open menu"
                  class="wp-block-navigation__responsive-container-open"
                  data-wp-on--click="actions.openMenuOnClick"
                  data-wp-on--keydown="actions.handleMenuKeydown">
            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 7.5h16v1.5H4z"></path><path d="M4 15h16v1.5H4z"></path>
            </svg>
          </button>
          <div class="wp-block-navigation__responsive-container" id="modal-1"
               data-wp-class--has-modal-open="state.isMenuOpen"
               data-wp-class--is-menu-open="state.isMenuOpen"
               data-wp-watch="callbacks.initMenu"
               data-wp-on--keydown="actions.handleMenuKeydown"
               data-wp-on--focusout="actions.handleMenuFocusout"
               tabindex="-1">
            <div class="wp-block-navigation__responsive-close" tabindex="-1">
              <div class="wp-block-navigation__responsive-dialog"
                   data-wp-bind--aria-modal="state.ariaModal"
                   data-wp-bind--aria-label="state.ariaLabel"
                   data-wp-bind--role="state.roleAttribute">
                <button aria-label="Close menu"
                        class="wp-block-navigation__responsive-container-close"
                        data-wp-on--click="actions.closeMenuOnClick">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                    <path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"></path>
                  </svg>
                </button>
                <div class="wp-block-navigation__responsive-container-content"
                     data-wp-watch="callbacks.focusFirstElement"
                     id="modal-1-content">
                  <ul class="wp-block-navigation__container has-text-color has-medium-font-size is-responsive hostinger-ai-site-navigation wp-block-navigation">
                    <li class="has-medium-font-size wp-block-navigation-item wp-block-navigation-link"><a class="wp-block-navigation-item__content" href="https://pickora.shop/"><span class="wp-block-navigation-item__label">Home</span></a></li>
                    <li class="has-medium-font-size wp-block-navigation-item wp-block-navigation-link"><a class="wp-block-navigation-item__content" href="https://pickora.shop/products/"><span class="wp-block-navigation-item__label">Products</span></a></li>
                    <li class="has-medium-font-size wp-block-navigation-item wp-block-navigation-link"><a class="wp-block-navigation-item__content" href="https://pickora.shop/articles/"><span class="wp-block-navigation-item__label">Articles</span></a></li>
                    <li class="has-medium-font-size wp-block-navigation-item wp-block-navigation-link"><a class="wp-block-navigation-item__content" href="https://pickora.shop/categories/"><span class="wp-block-navigation-item__label">Categories</span></a></li>
                    <li class="has-medium-font-size wp-block-navigation-item wp-block-navigation-link"><a class="wp-block-navigation-item__content" href="https://pickora.shop/about/"><span class="wp-block-navigation-item__label">About</span></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
</header>

<!-- ═══ Article hero ═══ -->
<main id="wp--skip-link--target">
  <section class="pk-review-hero" aria-labelledby="pk-review-title">
    <div class="pk-review-hero-inner">
      <nav class="pk-crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="https://pickora.shop/">Home</a></li>
          <li><a href="${escAttr(hubUrl)}">${escHtml(hubCategory)}</a></li>
          <li aria-current="page">${escHtml(title)}</li>
        </ol>
      </nav>
      <p class="pk-review-badge"><span class="pk-dot-blue" aria-hidden="true"></span> ${escHtml(hubCategory)}</p>
      <h1 id="pk-review-title" class="pk-review-title">${h1Html}</h1>
      <p class="pk-review-dek">${escHtml(dek)}</p>
    </div>
  </section>
</main>

<!-- ═══ Cover image ═══ -->
${coverHtml}
<!-- ═══ Article body ═══ -->
<div class="pk-entry-content-wrap">
  <div class="entry-content">
    ${bodyHtml}
  </div>
</div>

<!-- ═══ Affiliate product cards ═══ -->
${affiliateSection}
<!-- ═══ FAQ ═══ -->
${faqSection}
<!-- ═══ Affiliate disclosure ═══ -->
<div class="pk-disclosure-footer">
  <p>Pickora is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you. As an Amazon Associate we earn from qualifying purchases. <a href="https://pickora.shop/affiliate-disclosure/">Learn more</a>.</p>
</div>

<!-- ═══ Footer (same three-column structure as live pages) ═══ -->
<footer class="site-footer wp-block-template-part">
  <div class="pk-footer-inner">
    <div class="pk-footer-col">
      <h3>Menu</h3>
      <a href="https://pickora.shop/">Home</a>
      <a href="https://pickora.shop/products/">Products</a>
      <a href="https://pickora.shop/articles/">Articles</a>
      <a href="https://pickora.shop/categories/">Categories</a>
      <a href="https://pickora.shop/about/">About</a>
    </div>
    <div class="pk-footer-col">
      <h3>Contacts</h3>
      <p>Pickora@proton.me</p>
      <h3 style="margin-top:20px">Socials</h3>
      <a href="https://facebook.com/" target="_blank" rel="noopener">Facebook</a>
      <a href="https://instagram.com/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://twitter.com/" target="_blank" rel="noopener">X / Twitter</a>
    </div>
    <div class="pk-footer-col">
      <h3>Subscribe to our newsletter</h3>
      <div class="pk-footer-ml">
        <form action="https://assets.mailerlite.com/jsonp/2575871/forms/195779655847905146/subscribe"
              method="post" target="_blank">
          <input type="email" name="fields[email]" placeholder="Email"
                 autocomplete="email" aria-label="Email address" required>
          <input type="hidden" name="ml-submit" value="1">
          <input type="hidden" name="anticsrf" value="true">
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  </div>
  <div class="pk-footer-bottom">
    <nav class="pk-footer-legal" aria-label="Legal">
      <a href="https://pickora.shop/privacy-policy/">Privacy Policy</a><span class="pk-sep" aria-hidden="true">•</span>
      <a href="https://pickora.shop/affiliate-disclosure/">Affiliate Disclosure</a><span class="pk-sep" aria-hidden="true">•</span>
      <a href="https://pickora.shop/terms-of-service/">Terms of Service</a><span class="pk-sep" aria-hidden="true">•</span>
      <a href="https://pickora.shop/contact/">Contact</a>
    </nav>
    <p class="pk-footer-copyright">© ${year} Pickora Shop. All rights reserved.</p>
  </div>
</footer>

</div><!-- /.wp-site-blocks -->

${footerAssets}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// publishArticleDraft
// ---------------------------------------------------------------------------

/**
 * Full publish flow for an article draft:
 *   1. Write content/articles/{slug}.json        (draft payload as JSON)
 *   2. Update articles/index.html                (prepend hub card if not already linked)
 *   3. Update sitemap.xml                        (upsert URL entry)
 *   4. Write {slug}/index.html                   (full static article page via buildArticlePage)
 *
 * @param {object} env   - Worker env with GITHUB_TOKEN (and optionally GITHUB_REPO, GITHUB_BRANCH)
 * @param {object} draft - Validated article draft from D1
 * @returns {Promise<{ ok: boolean, urls: string[], commits: string[], note: string }>}
 * @throws Error if GitHub writes fail
 */
export async function publishArticleDraft(env, draft) {
  const slug      = String(draft.slug || "").trim();
  const canonical = draft.canonical || `https://pickora.shop/${slug}/`;
  const today     = todayISO();
  const commits   = [];
  const urls      = [];

  // ── 1. Write content/articles/{slug}.json ──────────────────────────────────
  const jsonPath    = `content/articles/${slug}.json`;
  const jsonContent = JSON.stringify({ ...draft, publishedAt: draft.publishedAt || today }, null, 2);

  // Fetch existing sha if the file already exists (needed for update)
  const existingJson = await getFile(env, jsonPath);
  const jsonSha = existingJson?.sha;

  const jsonResult = await putFile(
    env,
    jsonPath,
    jsonContent,
    `publish(article): ${slug} — content JSON`,
    jsonSha
  );
  commits.push(jsonResult.commit.sha);
  urls.push(jsonPath);

  // ── 2. Update articles/index.html ──────────────────────────────────────────
  const hubPath = "articles/index.html";
  const hubFile = await getFile(env, hubPath);
  if (!hubFile) throw new Error("articles/index.html missing on GitHub");
  const { sha: hubSha, content: hubHtml } = hubFile;

  // Check if slug is already linked on the hub to avoid duplicates
  const alreadyLinked =
    hubHtml.includes(`href="${canonical}"`) ||
    hubHtml.includes(`href="/${slug}/"`) ||
    hubHtml.includes(`href="https://pickora.shop/${slug}/"`);

  if (!alreadyLinked) {
    const cardHtml    = buildArticlesHubCard(draft);
    const updatedHub  = prependHubCard(hubHtml, cardHtml);

    const hubResult = await putFile(
      env,
      hubPath,
      updatedHub,
      `publish(article): ${slug} — add hub card`,
      hubSha
    );
    commits.push(hubResult.commit.sha);
  }
  urls.push(hubPath);

  // ── 3. Update sitemap.xml ──────────────────────────────────────────────────
  const sitemapPath = "sitemap.xml";
  const smFile = await getFile(env, sitemapPath);
  if (smFile) {
    const updatedSitemap = upsertSitemapUrl(smFile.content, `/${slug}/`, today);

    // Only write if content actually changed
    if (updatedSitemap !== smFile.content) {
      const sitemapResult = await putFile(
        env,
        sitemapPath,
        updatedSitemap,
        `publish(article): ${slug} — sitemap`,
        smFile.sha
      );
      commits.push(sitemapResult.commit.sha);
    }
  }
  urls.push(canonical);

  // ── 4. Write {slug}/index.html — full static article page ─────────────────
  const articlePagePath = `${slug}/index.html`;
  const articleHtml     = buildArticlePage(draft);

  // Fetch existing sha if the file already exists (needed for update vs create)
  const existingPage = await getFile(env, articlePagePath);
  const pageSha      = existingPage?.sha;

  const pageResult = await putFile(
    env,
    articlePagePath,
    articleHtml,
    `publish(article): ${slug} — article page`,
    pageSha
  );
  commits.push(pageResult.commit.sha);
  urls.push(articlePagePath);

  return {
    ok:      true,
    urls,
    commits,
    slug,
    canonical,
    note:
      "Hub card + sitemap + content JSON + full article page ({slug}/index.html) published. " +
      "Page includes sticky nav, cover image, body HTML, affiliate cards (if any), FAQ (if any), footer.",
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Return today's date as YYYY-MM-DD (UTC). */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

