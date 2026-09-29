/**
 * Publish Products draft to GitHub (content/products.json + products hub).
 * Ports scripts/admin-render/render_products.py with live site URLs.
 */
import { getFile, putFile } from "./github.js";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteHref(path) {
  if (!path) return "/";
  if (/^https?:\/\/pickora\.shop/i.test(path)) {
    try {
      let p = new URL(path).pathname;
      if (!p.endsWith("/")) p += "/";
      return p;
    } catch {
      /* */
    }
  }
  if (/^https?:\/\//i.test(path)) return path;
  let p = path.startsWith("/") ? path : `/${path}`;
  if (!p.endsWith("/")) p += "/";
  return p;
}

function imgSrc(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

function catCard(cat, eager) {
  const loading = eager
    ? 'loading="eager" fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  return `        <article class="pk-cat-card">
            <a href="${esc(siteHref(cat.url))}" class="pk-cat-link">
                <div class="pk-cat-image">
                    <img src="${esc(imgSrc(cat.image))}" alt="${esc(
    cat.imageAlt || cat.title
  )}" width="${cat.width || 1200}" height="${cat.height || 670}" ${loading}>
                    <div class="pk-cat-badge">${esc(cat.badge || "")}</div>
                </div>
                <div class="pk-cat-body">
                    <h3>${esc(cat.title)}</h3>
                    <p>${esc(cat.description || "")}</p>
                    <div class="pk-cat-footer">
                        <span class="pk-cat-more">View Collection</span>
                        <span class="pk-cat-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>`;
}

export async function publishProductsDraft(env, draft) {
  const cats = draft?.hubCategories;
  if (!Array.isArray(cats)) throw new Error("hubCategories_required");
  const commits = [];
  const urls = [];

  const jsonPath = "content/products.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult = await putFile(
    env,
    jsonPath,
    JSON.stringify(draft, null, 2) + "\n",
    "publish(products): content/products.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit?.sha);
  urls.push(jsonPath);

  const hubPath = "products/index.html";
  const hub = await getFile(env, hubPath);
  if (!hub) throw new Error("products/index.html missing on GitHub");

  const inner = cats.map((c, i) => catCard(c, i === 0)).join("\n\n");
  const gridRe =
    /(<div class="pk-category-grid" id="pk-category-grid">\s*)[\s\S]*?(<\/div>\s*\n\s*<!-- Review guides rail)/;
  if (!gridRe.test(hub.content)) throw new Error("pk-category-grid not found");
  const hubHtml = hub.content.replace(gridRe, `$1\n${inner}\n\n    $2`);

  if (hubHtml !== hub.content) {
    const r = await putFile(
      env,
      hubPath,
      hubHtml,
      "publish(products): update products hub",
      hub.sha
    );
    commits.push(r.commit?.sha);
  }
  urls.push("https://pickora.shop/products/");

  return {
    ok: true,
    module: "products",
    commits: commits.filter(Boolean),
    urls,
    note: "Products JSON + /products/ hub published. Category product HTML pages: next pass.",
  };
}
