/**
 * Pickora Admin API — Products hub + category pages publish helper
 *
 * Exports: publishProductsDraft(env, draft) -> Promise<{ ok, urls, commits, skipped, note }>
 *
 * Ports render_products.py + render_category_products.py logic to JS (no Python subprocess).
 *
 * draft shape (from D1 key 'products'):
 *   hubCategories:    Array<{ id, url, title, badge, description, image, imageAlt, width, height }>
 *   categoryProducts: { [catId]: Array<{ image, imageAlt, title, description, verdict,
 *                                        amazonUrl, links: [{label,url,style}], pros, cons, ratingStars }> }
 *
 * Files written to GitHub:
 *   content/products.json    — raw draft JSON
 *   products/index.html      — category grid cards replaced in-place
 *   {catId}/index.html       — product cards replaced in-place for each category with data
 */

import { getFile, putFile } from "./github.js";

// ---------------------------------------------------------------------------
// One-shot style block injected before the product cards.
// Replaces the per-card Elementor <style> blocks; mirrors render_category_products.py STYLE_ONCE.
// ---------------------------------------------------------------------------
/* Matches live category pages (Elementor card chrome on pickora.shop). */
const STYLE_ONCE = `
<style>
  .pickora-final-card {
    display: flex; flex-direction: row; align-items: center; gap: 40px;
    background: #ffffff; padding: 32px; margin-bottom: 40px; border-radius: 16px;
    border: 1px solid #eef2f6; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .pickora-final-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
    border-color: #cbd5e1;
  }
  .pickora-final-img-col { flex: 1; max-width: 45%; }
  .pickora-final-img-wrapper {
    width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 12px; background: #f8fafc;
  }
  .pickora-final-img-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pickora-final-info-col {
    flex: 1; max-width: 55%; display: flex; flex-direction: column; justify-content: center;
  }
  .pickora-final-title {
    font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;
  }
  .pickora-final-rating { color: #ff9900; font-size: 15px; margin-bottom: 16px; }
  .pickora-final-text { font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0; }
  .pickora-final-lists { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
  .pickora-final-list-line {
    font-size: 14.5px; line-height: 1.5; color: #334155;
    display: flex; align-items: center; gap: 10px;
  }
  .pickora-final-badge-pro, .pickora-final-badge-con {
    font-size: 11px; text-transform: uppercase; font-weight: 700;
    padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; flex: 0 0 auto;
  }
  .pickora-final-badge-pro { background: #dcfce7; color: #166534; }
  .pickora-final-badge-con { background: #fee2e2; color: #991b1b; }
  .pickora-final-verdict {
    background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px;
    border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.5; color: #475569; margin-bottom: 24px;
  }
  .pickora-final-btns {
    display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 4px;
  }
  .pickora-final-btn {
    display: inline-block; align-self: flex-start; min-height: 44px; box-sizing: border-box;
    background-color: #ff9900; color: #ffffff !important; text-decoration: none !important;
    font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15); transition: all 0.2s ease-in-out;
  }
  .pickora-final-btn:hover {
    background-color: #e68a00; box-shadow: 0 6px 16px rgba(255, 153, 0, 0.3);
  }
  .pickora-final-btn--walmart { background-color: #0071dc; box-shadow: 0 4px 12px rgba(0,113,220,0.18); }
  .pickora-final-btn--walmart:hover { background-color: #0658b0; }
  .pickora-final-btn--blue { background-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.18); }
  .pickora-final-btn--blue:hover { background-color: #1d4ed8; }
  .pickora-final-btn--dark { background-color: #0f172a; box-shadow: 0 4px 12px rgba(15,23,42,0.2); }
  .pickora-final-btn--dark:hover { background-color: #020617; }
  .pickora-final-btn--outline {
    background-color: transparent; color: #0f172a !important; border: 2px solid #cbd5e1;
    box-shadow: none;
  }
  .pickora-final-btn--outline:hover { background-color: #f1f5f9; border-color: #94a3b8; }
  @media (max-width: 768px) {
    .pickora-final-card { flex-direction: column; align-items: stretch; gap: 20px; padding: 20px; }
    .pickora-final-img-col, .pickora-final-info-col { max-width: 100%; }
    .pickora-final-btns { flex-direction: column; align-items: stretch; }
    .pickora-final-btn { display: block; text-align: center; align-self: stretch; }
  }
</style>
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function absUrl(path) {
  if (!path) return "";
  const p = String(path).trim();
  const WORKER_MEDIA =
    "https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/";
  if (/\/api\/media\/file\//i.test(p)) {
    try {
      if (/^https?:\/\//i.test(p)) {
        const u = new URL(p);
        return WORKER_MEDIA + u.pathname.replace(/^\/api\/media\/file\//i, "");
      }
    } catch {
      /* fall through */
    }
    return WORKER_MEDIA + p.replace(/^\/?api\/media\/file\//i, "");
  }
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return "https://pickora.shop" + p;
  return p;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isAmazonUrl(url) {
  return /^https?:\/\/(amzn\.to\/|www\.amazon\.|amazon\.|link\.amazon\/)/i.test(
    String(url || "").trim()
  );
}

function isWalmartUrl(url) {
  return /walmart\.com/i.test(String(url || ""));
}

/** Normalize product.links[] or legacy amazonUrl → buy buttons. */
export function normalizeProductLinks(product) {
  const raw = Array.isArray(product?.links) ? product.links : [];
  const fromLinks = raw
    .map((l) => ({
      label: String(l?.label || "").trim(),
      url: String(l?.url || "").trim(),
      style: String(l?.style || "").trim(),
    }))
    .filter((l) => /^https?:\/\//i.test(l.url));
  if (fromLinks.length) {
    return fromLinks.map((l) => {
      let style = l.style;
      if (!style || !["amazon", "walmart", "blue", "outline", "dark"].includes(style)) {
        style = isAmazonUrl(l.url) ? "amazon" : isWalmartUrl(l.url) ? "walmart" : "blue";
      }
      const label =
        l.label ||
        (style === "amazon"
          ? "Check Price on Amazon"
          : style === "walmart"
            ? "Check on Walmart"
            : "Check Price");
      return { label, url: l.url, style };
    });
  }
  const legacy = String(product?.amazonUrl || "").trim();
  if (/^https?:\/\//i.test(legacy)) {
    return [{ label: "Check Price on Amazon", url: legacy, style: "amazon" }];
  }
  return [];
}

function stars(n) {
  n = Math.max(1, Math.min(5, Math.floor(Number(n) || 5)));
  return "★".repeat(n) + " ";
}

// ---------------------------------------------------------------------------
// buildCatCard — mirrors render_products.py cat_card()
// ---------------------------------------------------------------------------

export function buildCatCard(cat, eager = false) {
  const loading = eager
    ? 'loading="eager" fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  const href   = escHtml(cat.url || "#");
  const img    = escHtml(absUrl(cat.image || ""));
  const alt    = escHtml(cat.imageAlt || cat.title || "");
  const badge  = escHtml(cat.badge || "");
  const title  = escHtml(cat.title || "");
  const desc   = escHtml(cat.description || "");
  const width  = cat.width  || 1200;
  const height = cat.height || 670;

  return `        <article class="pk-cat-card">
            <a href="${href}" class="pk-cat-link">
                <div class="pk-cat-image">
                    <img src="${img}" alt="${alt}" width="${width}" height="${height}" ${loading}>
                    <div class="pk-cat-badge">${badge}</div>
                </div>
                <div class="pk-cat-body">
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <div class="pk-cat-footer">
                        <span class="pk-cat-more">View Collection</span>
                        <span class="pk-cat-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>`;
}

// ---------------------------------------------------------------------------
// buildProductCard — mirrors render_category_products.py render_card()
// ---------------------------------------------------------------------------

export function buildProductCard(product, eager = false) {
  const loading = eager
    ? 'loading="eager" fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  const img    = escHtml(absUrl(product.image || ""));
  const alt    = escHtml(product.imageAlt || product.title || "");
  const title  = escHtml(product.title || "");
  const desc   = escHtml(product.description || "");
  const buyLinks = normalizeProductLinks(product);
  const starN  = Number(product.ratingStars);
  // 0 / empty = hide stars (Studio option); 1–5 = show like live
  const ratingHtml =
    starN >= 1 && starN <= 5
      ? `<div class="pickora-final-rating">${stars(starN)}</div>`
      : "";

  const rawVerdict = String(product.verdict || "").trim();
  let verdictBlock = "";
  if (rawVerdict) {
    const plain   = rawVerdict.replace(/<[^>]+>/g, "");
    const escaped = escHtml(plain);
    const body = escaped.toLowerCase().startsWith("pickora")
      ? (() => {
          const parts = escaped.split(":", 2);
          return parts.length === 2
            ? `<b>${parts[0]}:</b>${parts[1]}`
            : escaped;
        })()
      : `<b>Pickora’s Verdict:</b> ${escaped}`;
    verdictBlock = `<div class="pickora-final-verdict">\n      ${body}\n    </div>`;
  }

  const pros = (product.pros || []).map((x) => String(x || "").trim()).filter(Boolean);
  const cons = (product.cons || []).map((x) => String(x || "").trim()).filter(Boolean);
  const lines = [];
  for (const p of pros) {
    lines.push(
      `  <div class="pickora-final-list-line">\n` +
        `    <span class="pickora-final-badge-pro">Pros</span>\n` +
        `    <span>${escHtml(p)}</span>\n` +
        `  </div>`
    );
  }
  for (const c of cons) {
    lines.push(
      `  <div class="pickora-final-list-line">\n` +
        `    <span class="pickora-final-badge-con">Cons</span>\n` +
        `    <span>${escHtml(c)}</span>\n` +
        `  </div>`
    );
  }
  const lists = lines.length
    ? `<div class="pickora-final-lists">\n${lines.join("\n\n")}\n</div>`
    : "";
  const descHtml = desc
    ? `<p class="pickora-final-text">\n     ${desc}\n    </p>`
    : "";

  const btnsHtml = buyLinks.length
    ? `<div class="pickora-final-btns">\n${buyLinks
        .map((l) => {
          const mod =
            l.style === "amazon"
              ? ""
              : ` pickora-final-btn--${escHtml(l.style)}`;
          return `    <a href="${escHtml(l.url)}" class="pickora-final-btn${mod}" target="_blank" rel="nofollow sponsored noopener noreferrer">${escHtml(l.label)} →</a>`;
        })
        .join("\n")}\n    </div>`
    : "";

  return `<div class="pickora-final-card">
  <div class="pickora-final-img-col">
    <div class="pickora-final-img-wrapper">
      <img src="${img}" alt="${alt}" width="1376" height="768" ${loading}>
    </div>
  </div>
  <div class="pickora-final-info-col">
    <h3 class="pickora-final-title">${title}</h3>
    ${ratingHtml}
    ${descHtml}
${lists}
    ${verdictBlock}
    ${btnsHtml}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// replaceProductCards — ports render_category_products.py replace_product_cards()
//
// Strategy:
//   1. Find the first <div class="pickora-final-card">
//   2. Walk back to any preceding <style> that also has pickora-final-card CSS → use as inject start
//   3. Find the last card's end via regex (btn closing </a> + two closing </div>s)
//   4. Splice in STYLE_ONCE + all new cards
// ---------------------------------------------------------------------------

export function replaceProductCards(html, products) {
  const CARD_START = '<div class="pickora-final-card">';
  const firstIdx   = html.indexOf(CARD_START);
  if (firstIdx < 0) throw new Error("no pickora-final-card found");

  // Collect all card start positions
  const starts = [];
  let from = 0;
  while (true) {
    const idx = html.indexOf(CARD_START, from);
    if (idx < 0) break;
    starts.push(idx);
    from = idx + CARD_START.length;
  }

  const lastStart = starts[starts.length - 1];

  // End of last card: prefer buy-button close; else depth-walk the card (no CTAs)
  const afterLast = html.slice(lastStart);
  const endRe =
    /(?:class="pickora-final-btns"[\s\S]*?<\/div>|(?:class="pickora-final-btn"[^>]*>[\s\S]*?<\/a>\s*)+)\s*(?:<!--[\s\S]*?-->\s*)?<\/div>\s*<\/div>/;
  let endIdx = -1;
  const endMatch = afterLast.match(endRe);
  if (endMatch) {
    endIdx = lastStart + endMatch.index + endMatch[0].length;
  } else {
    // Card with no buy buttons: walk nested <div> depth from CARD_START
    const openTag = "<div";
    const closeTag = "</div>";
    let i = CARD_START.length;
    let depth = 1;
    while (i < afterLast.length && depth > 0) {
      const nextOpen = afterLast.indexOf(openTag, i);
      const nextClose = afterLast.indexOf(closeTag, i);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        // Only count real element opens, not attributes containing "<div"
        const ch = afterLast[nextOpen + 4];
        if (ch === " " || ch === ">" || ch === "\n" || ch === "\r" || ch === "\t") {
          depth++;
        }
        i = nextOpen + 4;
      } else {
        depth--;
        i = nextClose + closeTag.length;
      }
    }
    if (depth !== 0) throw new Error("could not find end of last product card");
    endIdx = lastStart + i;
  }

  // Walk back from firstIdx to find a preceding <style> with pickora-final-card CSS
  const styleBefore = html.lastIndexOf("<style>", firstIdx);
  let injectAt = firstIdx;
  if (styleBefore >= 0 && html.slice(styleBefore, firstIdx).includes("pickora-final-card")) {
    injectAt = styleBefore;
  }

  const cards = products.map((p, i) => buildProductCard(p, i === 0)).join("\n\n");
  const block  = STYLE_ONCE + "\n" + cards + "\n";

  return html.slice(0, injectAt) + block + html.slice(endIdx);
}

// ---------------------------------------------------------------------------
// Offline preview (same card renderer as publish; real page chrome + <base>)
// ---------------------------------------------------------------------------

const PREVIEW_BANNER_CSS = `
<style id="pk-products-preview-banner-css">
/* Notice strip UNDER the live nav — never covers Pickora header */
#pk-preview-banner{
  position:relative; z-index:1; background:#15223B; color:#fff;
  font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  flex:0 0 auto; width:100%; box-sizing:border-box; margin:0;
}
.pk-preview-banner-inner{
  display:flex; flex-wrap:wrap; align-items:center; gap:8px 14px;
  padding:8px 16px; max-width:1200px; margin:0 auto;
}
#pk-preview-banner strong{ font-weight:700; }
.pk-preview-meta{ margin-left:auto; opacity:.75; font-size:12px; }
body.pk-is-preview{ margin:0 !important; padding:0 !important; }
/* Keep site header exactly like live (top of page, not under a floating bar) */
body.pk-is-preview header.site-header{
  position: relative !important;
  top: auto !important;
  flex: 0 0 auto !important;
}
/* Empty WP title wrapper leaves a hairline / spacer — hide it in preview */
body.pk-is-preview .hostinger-ai-page-title{ display:none !important; }
body.pk-is-preview main > .wp-block-group:has(> .hostinger-ai-page-title){
  display:none !important;
  margin:0 !important; padding:0 !important; border:0 !important;
  min-height:0 !important; height:0 !important; overflow:hidden !important;
}
/* Match live Elementor pull-up so the hat sits tight under the nav */
body.pk-is-preview .entry-content > .elementor > .e-con:first-child{
  margin-block-start:-10px !important;
  margin-top:-10px !important;
}
body.pk-is-preview .pk-page-hat{
  margin-top:12px !important;
  padding-top:20px !important;
}
@media (max-width:768px){
  .pk-preview-banner-inner{ padding:8px 12px; font-size:12px; }
  .pk-preview-meta{ margin-left:0; width:100%; }
}
</style>
`;

/**
 * Shared offline preview chrome: <base>, robots, banner under site header.
 * @param {string} html — patched page body
 * @param {{ title?: string, label?: string, previewBy?: string, bannerNote?: string }} meta
 */
export function injectStudioPreviewChrome(html, meta = {}) {
  const title = String(meta.title || meta.label || "Preview");
  const label = String(meta.label || meta.title || "preview");
  const by = escHtml(meta.previewBy || "studio");
  const note =
    meta.bannerNote || "Same content as Publish · not saved to GitHub";

  if (!/<base\s/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n<base href="https://pickora.shop/">\n`);
  }
  if (/<meta\s+name=["']robots["']/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']robots["'][^>]*>/i,
      `<meta name="robots" content="noindex,nofollow">`
    );
  } else {
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1>\n<meta name="robots" content="noindex,nofollow">\n`
    );
  }
  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>[Preview] ${escHtml(title)} – Pickora</title>`
  );

  if (!html.includes("pk-products-preview-banner-css")) {
    html = html.replace(/<\/head>/i, `${PREVIEW_BANNER_CSS}\n</head>`);
  }

  html = html.replace(/<body([^>]*)>/i, (_, attrs) => {
    let next = attrs || "";
    if (/\bclass\s*=\s*"/i.test(next)) {
      next = next.replace(/\bclass\s*=\s*"/i, 'class="pk-is-preview ');
    } else if (/\bclass\s*=\s*'/i.test(next)) {
      next = next.replace(/\bclass\s*=\s*'/i, "class='pk-is-preview ");
    } else {
      next = ` class="pk-is-preview"${next}`;
    }
    return `<body${next}>`;
  });

  const banner = `<div id="pk-preview-banner" role="status">
  <div class="pk-preview-banner-inner">
    <strong>Offline preview</strong>
    <span>${escHtml(note)}</span>
    <span class="pk-preview-meta">${escHtml(label)} · ${by}</span>
  </div>
</div>`;

  if (/<header\b[^>]*site-header[\s\S]*?<\/header>/i.test(html)) {
    html = html.replace(
      /(<header\b[^>]*site-header[\s\S]*?<\/header>)/i,
      `$1\n${banner}\n`
    );
  } else {
    html = html.replace(/<\/header>/i, `</header>\n${banner}\n`);
  }
  return html;
}

/**
 * Patch a live/GitHub category page with draft products for offline Studio check.
 * Uses replaceProductCards (identical to publish). Adds <base> so blob/preview
 * loads CSS/images from pickora.shop — does NOT rebuild header/footer chrome.
 */
export function buildCategoryPreviewHtml(templateHtml, products, meta = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("no_products");
  }
  let html = replaceProductCards(templateHtml, products);
  const hubId = String(meta.hubId || "hub");
  return injectStudioPreviewChrome(html, {
    title: meta.title || hubId,
    label: hubId,
    previewBy: meta.previewBy,
  });
}

/**
 * Load category page HTML for preview: GitHub first, then live pickora.shop.
 * New hubs without a page fall back to home-kitchen chrome.
 */
export async function loadCategoryTemplateHtml(env, catId) {
  const id = String(catId || "").replace(/^\/+|\/+$/g, "");
  if (!id) throw new Error("hub_id_required");

  if (env?.GITHUB_TOKEN) {
    try {
      const file = await getFile(env, `${id}/index.html`);
      if (file?.content) return { html: file.content, source: "github", stub: false };
      const fallback = await getFile(env, "home-kitchen/index.html");
      if (fallback?.content) return { html: fallback.content, source: "github", stub: true };
    } catch {
      /* fall through to live fetch */
    }
  }

  let res = await fetch(`https://pickora.shop/${id}/`, {
    headers: { "User-Agent": "pickora-admin-api/preview" },
  });
  let stub = false;
  if (!res.ok) {
    res = await fetch("https://pickora.shop/home-kitchen/", {
      headers: { "User-Agent": "pickora-admin-api/preview" },
    });
    stub = true;
  }
  if (!res.ok) throw new Error("template_unavailable");
  return { html: await res.text(), source: "live", stub };
}

// ---------------------------------------------------------------------------
// planProductsPublish (dry-run — no GitHub writes)
// ---------------------------------------------------------------------------

export function planProductsPublish(draft, options = {}) {
  const hubIdFilter = options.hubId ? String(options.hubId).trim() : "";
  const cats = draft.hubCategories;
  if (!Array.isArray(cats)) throw new Error("hubCategories must be an array");

  const files = ["content/products.json", "products/index.html"];
  const catProducts = draft.categoryProducts || {};
  const skipped = [];

  if (hubIdFilter && !cats.some((h) => h.id === hubIdFilter)) {
    skipped.push(`${hubIdFilter}: hub not in draft`);
  }

  for (const hub of cats) {
    if (hubIdFilter && hub.id !== hubIdFilter) continue;
    const catId = hub.id;
    if (!catId) continue;
    const products = catProducts[catId];
    if (!Array.isArray(products) || products.length === 0) {
      skipped.push(`${catId}: no products in categoryProducts`);
      continue;
    }
    files.push(`${catId}/index.html`);
  }

  const note =
    (hubIdFilter
      ? `Hub "${hubIdFilter}": content/products.json, products/index.html, and that category page only. `
      : `${cats.length} hub category cards + each category page with products. `) +
    (skipped.length > 0 ? `Skipped: ${skipped.join("; ")}.` : "No skips.");

  return { ok: true, files, skipped, note };
}

// ---------------------------------------------------------------------------
// publishProductsDraft
// ---------------------------------------------------------------------------

/**
 * Full publish flow for the products draft:
 *   1. Write content/products.json
 *   2. Patch products/index.html  (category hub cards)
 *   3. For each hubCategory with products in categoryProducts:
 *      patch {catId}/index.html  (product cards)
 *
 * Categories whose page is missing on GitHub or have no products are collected in `skipped`.
 *
 * @param {object} env   - Worker env (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH)
 * @param {object} draft - Products draft from D1 (key 'products')
 * @returns {Promise<{ ok, urls, commits, skipped, note }>}
 */
export async function publishProductsDraft(env, draft, opts = {}) {
  const cats = draft.hubCategories;
  if (!Array.isArray(cats)) throw new Error("hubCategories must be an array");

  const dryRun = !!opts.dryRun;
  const onlyHub = opts.hubId ? String(opts.hubId).trim() : "";
  const commits = [];
  const urls = [];
  const skipped = [];
  const catProducts = draft.categoryProducts || {};

  const planned = ["content/products.json", "products/index.html"];
  for (const hub of cats) {
    const catId = hub.id;
    if (!catId) continue;
    if (onlyHub && catId !== onlyHub) continue;
    const products = catProducts[catId];
    if (!Array.isArray(products) || products.length === 0) continue;
    planned.push(`${catId}/index.html`);
  }

  if (dryRun) {
    // Validate hub page + optional category pages exist / patchable
    const hubFile = await getFile(env, "products/index.html");
    if (!hubFile) throw new Error("products/index.html missing on GitHub");
    for (const path of planned) {
      if (path === "content/products.json" || path === "products/index.html") continue;
      const catId = path.replace(/\/index\.html$/, "");
      const products = catProducts[catId];
      const page = await getFile(env, path);
      if (!page) {
        skipped.push(`${catId}: page not found on GitHub`);
        continue;
      }
      try {
        replaceProductCards(page.content, products);
      } catch (err) {
        skipped.push(`${catId}: ${err.message}`);
      }
    }
    return {
      ok: true,
      dryRun: true,
      urls: planned,
      commits: [],
      skipped,
      note:
        "Dry-run: would update " +
        planned.join(", ") +
        (onlyHub ? ` (hub-only: ${onlyHub})` : "") +
        (skipped.length ? `; issues: ${skipped.join("; ")}` : ""),
    };
  }

  // ── 1. content/products.json ───────────────────────────────────────────
  const jsonPath = "content/products.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult = await putFile(
    env,
    jsonPath,
    JSON.stringify(draft, null, 2),
    "publish(products): update content/products.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit.sha);
  urls.push(jsonPath);

  // ── 2. products/index.html — category grid ────────────────────────────
  const hubPath = "products/index.html";
  const hubFile = await getFile(env, hubPath);
  if (!hubFile) throw new Error("products/index.html missing on GitHub");

  const inner = cats.map((c, i) => buildCatCard(c, i === 0)).join("\n\n");
  const gridRe =
    /(<div class="pk-category-grid" id="pk-category-grid">\s*)[\s\S]*?(<\/div>\s*\n\s*<!-- Review guides rail)/;
  if (!gridRe.test(hubFile.content)) {
    throw new Error("pk-category-grid not found in products/index.html");
  }
  const updatedHub = hubFile.content.replace(gridRe, (_, g1, g2) => g1 + "\n" + inner + "\n\n    " + g2);
  const hubResult = await putFile(
    env,
    hubPath,
    updatedHub,
    `publish(products): update ${cats.length} category cards`,
    hubFile.sha
  );
  commits.push(hubResult.commit.sha);
  urls.push(hubPath);

  // ── 3. Category pages — product cards ─────────────────────────────────
  for (const hub of cats) {
    const catId = hub.id;
    if (!catId) continue;
    if (onlyHub && catId !== onlyHub) {
      skipped.push(`${catId}: skipped (hub-only ${onlyHub})`);
      continue;
    }

    const products = catProducts[catId];
    if (!Array.isArray(products) || products.length === 0) {
      skipped.push(`${catId}: no products in categoryProducts`);
      continue;
    }

    const catPagePath = `${catId}/index.html`;
    const catPage = await getFile(env, catPagePath);
    if (!catPage) {
      skipped.push(`${catId}: page not found on GitHub`);
      continue;
    }

    try {
      const updatedCat = replaceProductCards(catPage.content, products);
      const catResult = await putFile(
        env,
        catPagePath,
        updatedCat,
        `publish(products): update ${products.length} products in ${catId}`,
        catPage.sha
      );
      commits.push(catResult.commit.sha);
      urls.push(catPagePath);
    } catch (err) {
      skipped.push(`${catId}: ${err.message}`);
    }
  }

  return {
    ok: true,
    urls,
    commits,
    skipped,
    note:
      `${cats.length} hub category cards updated in products/index.html. ` +
      `Category pages updated: ${urls.length - 2}. ` +
      (onlyHub ? `Hub-only: ${onlyHub}. ` : "") +
      (skipped.length > 0 ? `Skipped: ${skipped.join("; ")}` : "No skips."),
  };
}
