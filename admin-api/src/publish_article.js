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
import {
  LIVE_CHROME_HEAD,
  LIVE_HEADER_HTML,
  buildLiveFooterHtml,
} from "./live_chrome.js";

export { compileBlocksToHtml, ensureBlueH1 };

/** Hub category label → Articles filter URL (never product hubs). */
const HUB_TO_ARTICLES = {
  articles: "https://pickora.shop/articles/",
  "home & kitchen": "https://pickora.shop/articles/?cat=kitchen",
  "consumer electronics": "https://pickora.shop/articles/?cat=electronics",
  "fitness & health": "https://pickora.shop/articles/?cat=fitness",
  "pet supplies": "https://pickora.shop/articles/?cat=pets",
};

const CHIP_TO_ARTICLES = {
  kitchen: "https://pickora.shop/articles/?cat=kitchen",
  electronics: "https://pickora.shop/articles/?cat=electronics",
  fitness: "https://pickora.shop/articles/?cat=fitness",
  pets: "https://pickora.shop/articles/?cat=pets",
  home: "https://pickora.shop/articles/?cat=home",
};

const PRODUCT_HUB_RE =
  /\/(home-kitchen|consumer-electronics|fitness-health|pet-supplies|products)(\/|$|\?)/i;

function normalizeHubCategoryLabel(raw) {
  return String(raw || "")
    .replace(/&amp;/gi, "&")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve breadcrumb / badge URL: always Articles filter, never product hubs.
 * Exported for preview normalize + smoke tests.
 */
export function resolveArticlesHubUrl(draft) {
  const label = normalizeHubCategoryLabel(draft?.hubCategory);
  const key = label.toLowerCase();
  if (HUB_TO_ARTICLES[key]) return HUB_TO_ARTICLES[key];

  const chips = Array.isArray(draft?.chips) ? draft.chips : [];
  for (const c of chips) {
    const slug = String(c || "")
      .toLowerCase()
      .trim();
    if (CHIP_TO_ARTICLES[slug]) return CHIP_TO_ARTICLES[slug];
  }

  let hubUrl = String(draft?.hubUrl || "").trim();
  if (hubUrl && !/^https?:\/\//i.test(hubUrl)) {
    hubUrl = `https://pickora.shop${hubUrl.startsWith("/") ? "" : "/"}${hubUrl}`;
  }
  // Already a good Articles filter link
  if (/\/articles\/?\?cat=[a-z0-9-]+/i.test(hubUrl) && !PRODUCT_HUB_RE.test(hubUrl)) {
    return hubUrl;
  }
  if (/\/articles\/?$/i.test(hubUrl) && !PRODUCT_HUB_RE.test(hubUrl)) {
    return "https://pickora.shop/articles/";
  }
  return "https://pickora.shop/articles/";
}

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
  const hubCategory = normalizeHubCategoryLabel(draft.hubCategory || "Articles");
  // Badge + breadcrumb always open Articles filter — never product hubs
  const hubUrl = resolveArticlesHubUrl({ ...draft, hubCategory });
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
/* In-flow PREVIEW banner — never covers chrome.
   Also demote live's position:fixed menu to relative so it stays inside
   the sticky header instead of painting over the banner at top:0. */
#pk-preview-banner{
  position: relative; z-index: 100001;
  background:#15223B; color:#fff;
  font-family:"Open Sans",Montserrat,sans-serif;
  box-shadow:0 2px 12px rgba(15,23,42,.28);
}
.pk-preview-banner-inner{
  max-width:1140px; margin:0 auto; padding:10px 16px;
  display:flex; flex-wrap:wrap; align-items:center; gap:8px 14px;
  font-size:13px; line-height:1.35; box-sizing:border-box;
}
#pk-preview-banner strong{
  letter-spacing:.12em; font-size:11px; background:#ff9900; color:#111;
  padding:4px 8px; border-radius:6px; flex:0 0 auto;
}
.pk-preview-meta{ margin-left:auto; opacity:.75; font-size:12px; }
body.pk-is-preview header.site-header .hostinger-ai-menu,
body.pk-is-preview .hostinger-ai-menu {
  position: relative !important;
  top: auto !important;
}
body.pk-is-preview header.site-header {
  top: 0 !important;
}
@media (max-width:700px){
  .pk-preview-banner-inner{ padding:8px 12px; font-size:12px; gap:6px 10px; }
  .pk-preview-meta{ margin-left:0; width:100%; }
}
</style>
`
    : "";


  const bodyClass = preview
    ? "wp-singular single-post single-format-standard wp-embed-responsive wp-theme-hostinger-ai-theme pk-is-preview"
    : "wp-singular single-post single-format-standard wp-embed-responsive wp-theme-hostinger-ai-theme";

  const footerAssets = `<!-- site chrome scripts (CSS loaded in LIVE_CHROME_HEAD) -->
<script src="https://pickora.shop/assets/js/pickora-nav.js?v=5" defer></script>
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
${LIVE_CHROME_HEAD}
<!-- structured data -->
${preview ? "<!-- preview: json-ld skipped -->" : jsonLd}
<script id="wp-importmap" type="importmap">{"imports":{"@wordpress/interactivity":"https://pickora.shop/wp-includes/js/dist/script-modules/interactivity/index.min.js?ver=efaa5193bbad9c60ffd1"}}</script>
<style>
/* ===================================================================
   Pickora article page — critical inline CSS
   Cloned + trimmed from live article pages (hostinger-ai-theme).
   External: /assets/css/pickora-nav.css (drawer ≤991) +
             /assets/css/pickora-mobile-fixes.css via LIVE_CHROME_HEAD.
   =================================================================== */
*, *::before, *::after { box-sizing: border-box; }
html, body { max-width: 100%; overflow-x: clip; margin: 0; padding: 0; }
/* Live article fonts: Open Sans body + Montserrat titles (same as pickora.shop) */
body {
  font-family: "Open Sans", sans-serif !important;
  color: #0f172a; background: #fff; line-height: 1.6;
}
h1, h2, h3, h4, h5, h6,
.pk-review-title,
footer.site-footer .wp-block-heading {
  font-family: Montserrat, sans-serif !important;
}
/* Live logo wordmark = Open Sans 700 / 18px (NOT Montserrat — looks like a different brand) */
.hostinger-ai-site-title,
.hostinger-ai-site-title a,
.wp-block-site-title,
.wp-block-site-title a {
  font-family: "Open Sans", sans-serif !important;
  font-weight: 700 !important;
  font-size: 18px !important;
  line-height: 1.5 !important;
  letter-spacing: normal !important;
  color: #2075d2 !important;
  text-decoration: none !important;
}
.pk-review-dek,
.entry-content,
.entry-content p,
.entry-content li,
footer.site-footer,
footer.site-footer a,
footer.site-footer p {
  font-family: "Open Sans", sans-serif !important;
}

/* ── Fonts — Google Fonts via LIVE_CHROME_HEAD + theme files as fallback ── */
@font-face { font-family: Montserrat; font-style: normal; font-weight: 400; font-display: swap;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/Montserrat-Regular.ttf') format('truetype'); }
@font-face { font-family: "Open Sans"; font-style: normal; font-weight: 300 800; font-display: swap;
  src: url('https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/fonts/OpenSans-Variable.ttf') format('truetype'); }

/* Accessibility: hide SR-only labels (without this, footer social icons show “Facebook” text and wrap) */
.screen-reader-text,
.wp-block-social-link-label.screen-reader-text {
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  width: 1px !important;
  word-wrap: normal !important;
}

/* Footer socials: one clean icon row; keep 44px tap targets on the <a> */
footer.site-footer .wp-block-social-links,
footer.site-footer .wp-container-core-social-links-is-layout-87452e7f {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  gap: 10px !important;
  margin: 4px 0 0 !important;
  padding: 0 !important;
  list-style: none !important;
}
footer.site-footer .wp-block-social-links .wp-social-link {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  list-style: none !important;
}
footer.site-footer .wp-block-social-links .wp-social-link a {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #fff !important;
  min-width: 44px !important;
  min-height: 44px !important;
  padding: 10px !important;
  box-sizing: border-box !important;
}
footer.site-footer .wp-block-social-links .wp-social-link svg {
  width: 22px !important;
  height: 22px !important;
  fill: currentColor !important;
}
/* Tighten footer flow spacing (WP global 40px gap looks sparse in preview) */
footer.site-footer .wp-block-column.is-layout-flow > * {
  margin-block-start: 0.75rem !important;
}
footer.site-footer .wp-block-column.is-layout-flow > :first-child {
  margin-block-start: 0 !important;
}
footer.site-footer .wp-block-heading {
  margin: 0 0 10px !important;
}
footer.site-footer .is-vertical .wp-block-navigation__container {
  gap: 8px !important;
}

/* Article-only styles below; header/footer chrome = LIVE_CHROME_* */

/* skip link */
.skip-link { position: absolute; left: -9999px; z-index: 99999;
  padding: 8px 16px; background: #2075d2; color: #fff; text-decoration: none; }
.skip-link:focus { left: 8px; top: 8px; }

/* ── Layout wrapper ── */
.wp-site-blocks { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Article hero (matches .pk-review-hero on live article pages) ── */
main#wp--skip-link--target { padding-top: 0; padding-bottom: 0; }
.pk-review-hero {
  box-sizing: border-box; width: 100%; max-width: 760px;
  margin: 24px auto 8px; padding: 32px 24px 4px;
  background: transparent; text-align: left;
}
.pk-review-hero-inner { max-width: 720px; margin: 0; }
.pk-crumbs { margin: 0 0 18px; padding: 0; font-size: 13px; line-height: 1.4; color: #94a3b8;
  font-family: "Open Sans", sans-serif; }
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
  font-family: Montserrat, sans-serif;
  text-decoration: none;
}
a.pk-review-badge:hover { color: #15223B; }
.pk-dot-blue { width: 8px; height: 8px; border-radius: 50%; background: #2075d2; display: inline-block; }
.pk-review-title {
  font-family: Montserrat, sans-serif !important;
  font-size: clamp(32px, 4.6vw, 52px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.12;
  color: #15223B !important; margin: 0 0 16px !important;
}
.pk-blue-text { color: #2075d2; }
.pk-review-dek {
  margin: 0 0 8px; max-width: 640px; font-size: 17px; line-height: 1.65; color: #475569;
  font-family: "Open Sans", sans-serif !important;
}

/* ── Cover image (live alignwide cover ≈ 1140) ── */
.pk-article-cover-wrap {
  width: 100%;
  max-width: 1140px !important;
  margin: 12px auto 28px;
  border-radius: 16px; overflow: hidden; padding: 0 20px; box-sizing: border-box;
}
.pk-article-cover { width: 100%; height: auto; display: block; border-radius: 16px; }

/* ── Article body: wide like live entry-content.alignwide (tables + product photos) ── */
.pk-entry-content-wrap {
  width: 100%;
  max-width: 1140px !important;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}
.entry-content {
  max-width: 1140px !important;
  margin: 0 auto;
  width: 100%;
}
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
.pk-verdict,
.pk-mw-verdict {
  background: #f0f7ff; border-left: 4px solid #2075d2;
  padding: 14px 16px; margin: 12px 0 20px;
  border-radius: 0 10px 10px 0; color: #15223B; font-size: 15px; line-height: 1.55;
}
.pk-mw-verdict--advice,
.pk-block-verdict.pk-mw-verdict--advice {
  background: #fff7ed;
  border-left-color: #ff9900;
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
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; box-sizing: border-box;
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
.pk-aff-btn--walmart {
  background: #0071dc !important;
  color: #fff !important;
}
.pk-aff-btn--walmart:hover { background: #0658b0 !important; }
.pk-aff-btn--dark {
  background: #15223B !important;
  color: #fff !important;
}
.pk-aff-btn--dark:hover { background: #0d1524 !important; }
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

/* ── Block constructor product cards ── */
.pk-product-card {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 22px;
  max-width: 1140px !important;
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

/* ===================================================================
   Responsive helpers (do NOT put max-width:100% on content wrappers
   outside phone/tablet media queries — that blows desktop to full bleed)
   =================================================================== */

/* Safe for all widths: allow tables/cards to shrink inside 1140 rail */
.pk-entry-content-wrap,
.entry-content {
  min-width: 0;
  overflow-x: clip;
}
.pk-block-table,
.pk-block-table.pk-table--compare,
.pk-block-table.pk-table--striped,
.pk-mw-table-wrap,
.pk-table--compare,
.pk-table--striped {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  box-sizing: border-box;
}
.entry-content table {
  max-width: 100%;
}
.entry-content > table,
.entry-content table.pk-table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.pk-product-card {
  min-width: 0;
  box-sizing: border-box;
}
.pk-product-media,
.pk-product-media img,
.pk-product-body {
  min-width: 0;
  max-width: 100%;
}

/* Desktop footer rail (WP columns/global styles can fail to constrain in blob preview) */
footer.site-footer {
  background-color: #15223B !important;
}
footer.site-footer > .wp-block-group.has-color-2-background-color,
footer.site-footer .has-color-2-background-color {
  background-color: #15223B !important;
}
footer.site-footer .wp-block-columns.alignwide,
footer.site-footer .wp-block-columns {
  display: flex !important;
  flex-wrap: nowrap !important;
  align-items: flex-start !important;
  width: 100% !important;
  max-width: 1140px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
  gap: 24px !important;
}
footer.site-footer .wp-block-columns > .wp-block-column {
  flex: 1 1 0 !important;
  min-width: 0 !important;
}
@media (max-width: 781px) {
  footer.site-footer .wp-block-columns.alignwide,
  footer.site-footer .wp-block-columns {
    flex-wrap: wrap !important;
  }
  footer.site-footer .wp-block-columns > .wp-block-column {
    flex-basis: 100% !important;
    width: 100% !important;
  }
}

/* Tablet (hamburger still on ≤991; keep live hero width ~760) */
@media (max-width: 991px) {
  .pk-review-hero {
    max-width: 760px;
    padding-left: 24px;
    padding-right: 24px;
  }
  .pk-entry-content-wrap,
  .pk-article-cover-wrap,
  .pk-affiliate-section,
  .pk-block-table,
  .pk-block-image,
  .pk-faq-section,
  .pk-disclosure-footer {
    padding-left: 24px;
    padding-right: 24px;
    box-sizing: border-box;
  }
  .pk-product-card {
    grid-template-columns: 160px 1fr;
    gap: 16px;
    padding: 16px;
    width: 100%;
    max-width: 100%;
  }
  .pk-product-ctas a,
  .pk-aff-btn,
  .entry-content a.pk-aff-btn {
    min-height: 44px;
  }
  .pk-faq-q {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}

/* Phone */
@media (max-width: 768px) {
  .pk-review-hero {
    width: 100%;
    max-width: 100%;
    margin: 16px auto 4px;
    padding: 24px 16px 4px;
  }
  .pk-review-hero-inner { max-width: 100%; }
  .pk-review-title { font-size: clamp(28px, 7vw, 40px); }
  .pk-review-dek { font-size: 16px; max-width: 100%; }
  .pk-crumbs { font-size: 12px; margin-bottom: 14px; }
  .pk-entry-content-wrap,
  .entry-content,
  .pk-affiliate-section,
  .pk-block-table,
  .pk-block-image,
  .pk-faq-section,
  .pk-disclosure-footer {
    max-width: 100%;
    padding-left: 16px;
    padding-right: 16px;
  }
  .pk-article-cover-wrap {
    max-width: 100%;
    padding-left: 12px;
    padding-right: 12px;
    margin: 8px auto 20px;
  }
  .entry-content p { font-size: 16px; }
  .entry-content h2 { font-size: clamp(19px, 5.5vw, 24px); }
  .entry-content h3 { font-size: clamp(16px, 4.5vw, 20px); }
  .pk-mw-guide, .pk-block-table { max-width: 100%; }
  .pk-product-card {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
  }
  .pk-product-ctas {
    flex-direction: column;
    align-items: stretch;
  }
  .pk-product-ctas a,
  .pk-aff-btn {
    width: 100%;
    justify-content: center;
  }
  .pk-aff-card {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  .pk-table,
  .pk-mw-table {
    min-width: 560px;
    font-size: 14px;
  }
  .pk-table th, .pk-table td,
  .pk-mw-table th, .pk-mw-table td {
    padding: 10px 10px;
  }
}

@media (max-width: 600px) {
  .pk-aff-card { flex-direction: column; align-items: stretch; }
  .pk-table,
  .pk-mw-table { min-width: 480px; }
}

@media (max-width: 700px) {
  .pk-product-card { grid-template-columns: 1fr; }
}

${PK_MW_GUIDE_CSS}

/* After guide CSS: keep FAQ/CTA centered on desktop (guide uses margin: 0) */
.pk-faq-section,
.pk-block-cta {
  width: 100% !important;
  max-width: 900px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
.pk-affiliate-section,
.pk-block-table,
.pk-block-image,
.pk-disclosure-footer {
  width: 100%;
  max-width: 1140px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}
.wp-site-blocks {
  align-items: stretch;
}
.wp-site-blocks > main,
.wp-site-blocks > footer.site-footer,
.wp-site-blocks > header.site-header {
  width: 100%;
  max-width: none;
}
</style>
</head>

<body class="${bodyClass}">
${previewBanner}<a class="skip-link screen-reader-text" id="wp-skip-link" href="#wp--skip-link--target">Skip to content</a>
<div class="wp-site-blocks">

<!-- ═══ Header (exact live chrome) ═══ -->
${LIVE_HEADER_HTML}

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
      <a class="pk-review-badge" href="${escAttr(hubUrl)}"><span class="pk-dot-blue" aria-hidden="true"></span> ${escHtml(hubCategory)}</a>
      <h1 id="pk-review-title" class="pk-review-title">${h1Html}</h1>
      <p class="pk-review-dek">${escHtml(dek)}</p>
    </div>
  </section>

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
</main>

<!-- ═══ Footer (exact live chrome) ═══ -->
${buildLiveFooterHtml(year)}

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

