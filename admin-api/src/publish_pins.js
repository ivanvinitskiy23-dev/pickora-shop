/**
 * Pickora Admin API — Pins (categories board) page publish helper
 *
 * Exports: publishPinsDraft(env, draft) -> Promise<{ ok, urls, commits, note }>
 *
 * Ports render_pins.py logic to JS (no Python subprocess).
 *
 * draft shape (from D1 key 'pins'):
 *   filters: Array<{ id, label }>
 *   pins:    Array<{ id, category, image, imageAlt, title, boardDesc, popupDesc,
 *                    products, width, height }>
 *
 * Files written to GitHub:
 *   content/pins.json          — raw draft JSON
 *   categories/index.html      — filters + board grid + pinData JS replaced in-place
 */

import { getFile, putFile } from "./github.js";
import { injectStudioPreviewChrome } from "./publish_products.js";

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

function detectStyle(url, explicit) {
  const st = String(explicit || "").trim();
  if (["amazon", "walmart", "blue", "outline", "dark"].includes(st)) return st;
  if (isAmazonUrl(url)) return "amazon";
  if (/walmart\.com/i.test(url)) return "walmart";
  return "blue";
}

/** Pin product: { name, url?, links?: [{label,url,style}] } */
function normalizePinProduct(prod) {
  const name = String(prod?.name || "").trim();
  const rawLinks = Array.isArray(prod?.links) ? prod.links : [];
  let links = rawLinks
    .map((l) => ({
      label: String(l?.label || "").trim(),
      url: String(l?.url || "").trim(),
      style: detectStyle(l?.url, l?.style),
    }))
    .filter((l) => /^https?:\/\//i.test(l.url))
    .map((l) => ({
      ...l,
      label:
        l.label ||
        (l.style === "amazon" ? "Amazon" : l.style === "walmart" ? "Walmart" : "Buy"),
    }));
  const legacy = String(prod?.url || "").trim();
  if (!links.length && /^https?:\/\//i.test(legacy)) {
    links = [
      {
        label: isAmazonUrl(legacy) ? "Amazon" : "Buy",
        url: legacy,
        style: detectStyle(legacy),
      },
    ];
  }
  return {
    name,
    url: links[0]?.url || legacy || "",
    links,
  };
}

// ---------------------------------------------------------------------------
// buildBoardPin — mirrors render_pins.py board_pin()
// ---------------------------------------------------------------------------

export function buildBoardPin(pin, eager = false) {
  const loading = eager
    ? 'loading="eager" fetchpriority="high"'
    : 'loading="lazy"';
  const img    = escHtml(absUrl(pin.image || ""));
  const alt    = escHtml(pin.imageAlt || pin.title || "");
  const title  = escHtml(pin.title || "");
  const desc   = escHtml(pin.boardDesc || pin.popupDesc || "");
  const cat    = escHtml(pin.category || "");
  const id     = Number(pin.id);
  const width  = pin.width  || 896;
  const height = pin.height || 1200;

  return `    <div class="pickora-board-pin" data-category="${cat}" onclick="openPin(${id})">
      <img src="${img}" alt="${alt}" width="${width}" height="${height}" ${loading} decoding="async">
      <div class="pickora-board-info">
        <h4 class="pickora-board-title">${title}</h4>
        <p class="pickora-board-desc">${desc}</p>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// buildFiltersHtml — mirrors render_pins.py filters_html()
// ---------------------------------------------------------------------------

export function buildFiltersHtml(filters) {
  return (filters || [])
    .map((f) => {
      const cls = f.id === "all" ? "pickora-filter-btn active" : "pickora-filter-btn";
      return `    <button class="${cls}" onclick="filterPins('${escHtml(f.id)}')">${escHtml(f.label)}</button>`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// buildPinDataJs — mirrors render_pins.py pin_data_js()
//
// Returns a JS object literal string  { 1: {...}, 2: {...} }
// (numeric keys are unquoted, string values use JSON quoting — valid JS)
// ---------------------------------------------------------------------------

export function buildPinDataJs(pins) {
  const obj = {};
  for (const p of pins) {
    obj[String(p.id)] = {
      title:    p.title || "",
      desc:     p.popupDesc || p.boardDesc || "",
      image:    absUrl(p.image || ""),
      products: (p.products || []).map(normalizePinProduct),
    };
  }
  // 2-space JSON, then strip quotes around pure-numeric keys
  let raw = JSON.stringify(obj, null, 2);
  raw = raw.replace(/"(\d+)":/g, "$1:");
  return raw;
}

// ---------------------------------------------------------------------------
// Offline preview (same patchers as publish; no GitHub write)
// ---------------------------------------------------------------------------

export function applyPinsDraftToHtml(html, draft) {
  const pins = draft.pins;
  if (!Array.isArray(pins)) {
    throw new Error("draft.pins must be an array");
  }

  const filtersHtml = buildFiltersHtml(draft.filters || []);
  const filtersRe =
    /(<div class="pickora-filters">\s*)[\s\S]*?(<\/div>\s*\n\s*<div class="pickora-board-grid")/;
  if (!filtersRe.test(html)) {
    throw new Error("pickora-filters block not found in categories/index.html");
  }
  html = html.replace(filtersRe, (_, g1, g2) => g1 + "\n" + filtersHtml + "\n  " + g2);

  const board = pins.map((p, i) => buildBoardPin(p, i === 0)).join("\n\n");
  const gridRe =
    /(<div class="pickora-board-grid" id="pins-grid">\s*)[\s\S]*?(<\/div>\s*<\/div>\s*\n\s*<div class="pickora-popup-overlay")/;
  if (!gridRe.test(html)) {
    throw new Error("pickora-board-grid#pins-grid not found in categories/index.html");
  }
  html = html.replace(gridRe, (_, g1, g2) => g1 + "\n" + board + "\n\n  " + g2);

  const shuffleOnLoad = draft.shuffleOnLoad !== false;
  if (/const PICKORA_SHUFFLE_PINS = (true|false);/.test(html)) {
    html = html.replace(
      /const PICKORA_SHUFFLE_PINS = (true|false);/,
      `const PICKORA_SHUFFLE_PINS = ${shuffleOnLoad};`
    );
  }

  const pinDataJs = buildPinDataJs(pins);
  const innerRe = /(const pinData = \{)[\s\S]*?(\n  \};)/;
  if (innerRe.test(html)) {
    const inner = pinDataJs.slice(1, -1);
    html = html.replace(innerRe, (_, g1, g2) => g1 + "\n" + inner + "\n  " + g2);
  } else {
    html = html.replace(
      /const pinData = \{[\s\S]*?\n  \};/,
      `const pinData = ${pinDataJs};`
    );
  }
  return html;
}

export async function loadPinsTemplateHtml(env) {
  if (env?.GITHUB_TOKEN) {
    try {
      const file = await getFile(env, "categories/index.html");
      if (file?.content) return { html: file.content, source: "github" };
    } catch {
      /* fall through */
    }
  }
  const res = await fetch("https://pickora.shop/categories/", {
    headers: { "User-Agent": "pickora-admin-api/preview" },
  });
  if (!res.ok) throw new Error("template_unavailable");
  return { html: await res.text(), source: "live" };
}

export function buildPinsPreviewHtml(templateHtml, draft, meta = {}) {
  const html = applyPinsDraftToHtml(templateHtml, draft);
  return injectStudioPreviewChrome(html, {
    title: "Categories / Pins",
    label: "pins",
    previewBy: meta.previewBy,
  });
}

// ---------------------------------------------------------------------------
// publishPinsDraft
// ---------------------------------------------------------------------------

/**
 * Full publish flow for the pins draft:
 *   1. Write content/pins.json
 *   2. Patch categories/index.html  (filters + board grid + pinData JS)
 *
 * @param {object} env   - Worker env (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH)
 * @param {object} draft - Pins draft from D1 (key 'pins')
 * @returns {Promise<{ ok, urls, commits, note }>}
 */
export async function publishPinsDraft(env, draft) {
  const pins = draft.pins;
  if (!Array.isArray(pins)) {
    throw new Error("draft.pins must be an array");
  }

  const commits = [];
  const urls    = [];

  // ── 1. content/pins.json ──────────────────────────────────────────────
  const jsonPath    = "content/pins.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult   = await putFile(
    env, jsonPath,
    JSON.stringify(draft, null, 2),
    "publish(pins): update content/pins.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit.sha);
  urls.push(jsonPath);

  // ── 2. categories/index.html ──────────────────────────────────────────
  const catPath = "categories/index.html";
  const catFile = await getFile(env, catPath);
  if (!catFile) throw new Error("categories/index.html missing on GitHub");

  const html = applyPinsDraftToHtml(catFile.content, draft);

  const catResult = await putFile(
    env, catPath, html,
    `publish(pins): update ${pins.length} pins + filters`,
    catFile.sha
  );
  commits.push(catResult.commit.sha);
  urls.push(catPath);

  return {
    ok:   true,
    urls,
    commits,
    note: `${pins.length} pins + ${(draft.filters || []).length} filters published to categories/index.html.`,
  };
}
