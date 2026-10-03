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
 *                                        amazonUrl, pros, cons, ratingStars }> }
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
  .pickora-final-info-col { flex: 1; max-width: 55%; display: flex; flex-direction: column; gap: 12px; }
  .pickora-final-title { margin: 0; font-size: 26px; font-weight: 700; color: #15223B; line-height: 1.25; }
  .pickora-final-rating { color: #f5a623; letter-spacing: 2px; font-size: 18px; }
  .pickora-final-text { margin: 0; font-size: 15.5px; line-height: 1.6; color: #445; }
  .pickora-final-lists { display: flex; flex-direction: column; gap: 14px; }
  .pickora-final-list-block h4 {
    margin: 0 0 6px; font-size: 13px; font-weight: 800; letter-spacing: 0.04em;
    text-transform: uppercase; color: #15223B;
  }
  .pickora-final-list-block ul { margin: 0; padding-left: 18px; }
  .pickora-final-list-block li { margin: 0 0 6px; font-size: 14px; color: #334; line-height: 1.45; }
  .pickora-final-list-block--pro h4 { color: #166534; }
  .pickora-final-list-block--con h4 { color: #991b1b; }
  .pickora-final-verdict {
    background: #F5FAFF; border-left: 3px solid #2075d2; padding: 12px 14px; border-radius: 8px;
    font-size: 14.5px; line-height: 1.55; color: #15223B;
  }
  .pickora-final-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 44px; box-sizing: border-box;
    background: #ff9900; color: #111 !important; text-decoration: none !important;
    font-weight: 700; padding: 12px 18px; border-radius: 999px; width: fit-content;
  }
  .pickora-final-btn:hover { background: #e88b00; }
  @media (max-width: 768px) {
    .pickora-final-card { flex-direction: column; align-items: stretch; gap: 20px; padding: 20px; }
    .pickora-final-img-col, .pickora-final-info-col { max-width: 100%; }
    .pickora-final-btn { display: block; text-align: center; align-self: stretch; padding: 16px; }
  }
</style>
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function absUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return "https://pickora.shop" + path;
  return path;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const amazon = escHtml(product.amazonUrl || "#");
  const starN  = Number(product.ratingStars);
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
      : `<b>Pickora's Verdict:</b> ${escaped}`;
    verdictBlock = `<div class="pickora-final-verdict">${body}</div>`;
  }

  const pros = (product.pros || []).map((x) => String(x || "").trim()).filter(Boolean);
  const cons = (product.cons || []).map((x) => String(x || "").trim()).filter(Boolean);
  const listsParts = [];
  if (pros.length) {
    listsParts.push(
      `<div class="pickora-final-list-block pickora-final-list-block--pro"><h4>Pros</h4><ul>${pros
        .map((p) => `<li>${escHtml(p)}</li>`)
        .join("")}</ul></div>`
    );
  }
  if (cons.length) {
    listsParts.push(
      `<div class="pickora-final-list-block pickora-final-list-block--con"><h4>Cons</h4><ul>${cons
        .map((c) => `<li>${escHtml(c)}</li>`)
        .join("")}</ul></div>`
    );
  }
  const lists = listsParts.length
    ? `<div class="pickora-final-lists">${listsParts.join("\n")}</div>`
    : "";
  const descHtml = desc ? `<p class="pickora-final-text">${desc}</p>` : "";

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
    <a href="${amazon}" class="pickora-final-btn" target="_blank" rel="nofollow sponsored noopener noreferrer">
      Check Price on Amazon →
    </a>
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

  // End of last card: closing </a> of the buy button + info-col </div> + card </div>
  const afterLast = html.slice(lastStart);
  const endRe     = /class="pickora-final-btn"[^>]*>[\s\S]*?<\/a>\s*(?:<!--[\s\S]*?-->\s*)?<\/div>\s*<\/div>/;
  const endMatch  = afterLast.match(endRe);
  if (!endMatch) throw new Error("could not find end of last product card");
  const endIdx = lastStart + endMatch.index + endMatch[0].length;

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
export async function publishProductsDraft(env, draft) {
  const cats = draft.hubCategories;
  if (!Array.isArray(cats)) throw new Error("hubCategories must be an array");

  const commits = [];
  const urls    = [];
  const skipped = [];

  // ── 1. content/products.json ───────────────────────────────────────────
  const jsonPath     = "content/products.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult   = await putFile(
    env, jsonPath,
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

  const inner  = cats.map((c, i) => buildCatCard(c, i === 0)).join("\n\n");
  const gridRe = /(<div class="pk-category-grid" id="pk-category-grid">\s*)[\s\S]*?(<\/div>\s*\n\s*<!-- Review guides rail)/;
  if (!gridRe.test(hubFile.content)) {
    throw new Error("pk-category-grid not found in products/index.html");
  }
  const updatedHub = hubFile.content.replace(
    gridRe, (_, g1, g2) => g1 + "\n" + inner + "\n\n    " + g2
  );
  const hubResult = await putFile(
    env, hubPath, updatedHub,
    `publish(products): update ${cats.length} category cards`,
    hubFile.sha
  );
  commits.push(hubResult.commit.sha);
  urls.push(hubPath);

  // ── 3. Category pages — product cards ─────────────────────────────────
  const catProducts = draft.categoryProducts || {};

  for (const hub of cats) {
    const catId    = hub.id;
    if (!catId) continue;

    const products = catProducts[catId];
    if (!Array.isArray(products) || products.length === 0) {
      skipped.push(`${catId}: no products in categoryProducts`);
      continue;
    }

    const catPagePath = `${catId}/index.html`;
    const catPage     = await getFile(env, catPagePath);
    if (!catPage) {
      skipped.push(`${catId}: page not found on GitHub`);
      continue;
    }

    try {
      const updatedCat = replaceProductCards(catPage.content, products);
      const catResult  = await putFile(
        env, catPagePath, updatedCat,
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
      (skipped.length > 0 ? `Skipped: ${skipped.join("; ")}` : "No skips."),
  };
}
