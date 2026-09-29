/**
 * Publish Pins draft to GitHub (content/pins.json + categories/index.html).
 * Ports scripts/admin-render/render_pins.py for live site paths.
 */
import { getFile, putFile } from "./github.js";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sitePath(path) {
  if (!path) return "";
  if (/^https?:\/\/pickora\.shop/i.test(path)) {
    try {
      return new URL(path).pathname;
    } catch {
      /* */
    }
  }
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

function boardPin(pin, eager) {
  const loading = eager
    ? 'loading="eager" fetchpriority="high"'
    : 'loading="lazy"';
  return `    <div class="pickora-board-pin" data-category="${esc(
    pin.category
  )}" onclick="openPin(${Number(pin.id)})">
      <img src="${esc(sitePath(pin.image))}" alt="${esc(
    pin.imageAlt || pin.title
  )}" width="${pin.width || 896}" height="${pin.height || 1200}" ${loading} decoding="async">
      <div class="pickora-board-info">
        <h4 class="pickora-board-title">${esc(pin.title)}</h4>
        <p class="pickora-board-desc">${esc(pin.boardDesc || pin.popupDesc || "")}</p>
      </div>
    </div>`;
}

function filtersHtml(filters) {
  return (filters || [])
    .map((f) => {
      const cls =
        f.id === "all" ? "pickora-filter-btn active" : "pickora-filter-btn";
      return `    <button class="${cls}" onclick="filterPins('${esc(
        f.id
      )}')">${esc(f.label)}</button>`;
    })
    .join("\n");
}

function pinDataJs(pins) {
  const obj = {};
  for (const p of pins || []) {
    obj[String(p.id)] = {
      title: p.title,
      desc: p.popupDesc || p.boardDesc || "",
      image: sitePath(p.image).startsWith("http")
        ? sitePath(p.image)
        : `https://pickora.shop${sitePath(p.image)}`,
      products: p.products || [],
    };
  }
  return JSON.stringify(obj, null, 2);
}

export async function publishPinsDraft(env, draft) {
  if (!Array.isArray(draft?.pins)) throw new Error("pins_required");
  const commits = [];
  const urls = [];

  const jsonPath = "content/pins.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult = await putFile(
    env,
    jsonPath,
    JSON.stringify(draft, null, 2) + "\n",
    "publish(pins): content/pins.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit?.sha);
  urls.push(jsonPath);

  const pagePath = "categories/index.html";
  const page = await getFile(env, pagePath);
  if (!page) throw new Error("categories/index.html missing on GitHub");

  let html = page.content;
  const filt = filtersHtml(draft.filters || []);
  const filtRe =
    /(<div class="pickora-filters">\s*)[\s\S]*?(<\/div>\s*\n\s*<div class="pickora-board-grid")/;
  if (!filtRe.test(html)) throw new Error("filters block not found");
  html = html.replace(filtRe, `$1\n${filt}\n  $2`);

  const board = (draft.pins || [])
    .map((p, i) => boardPin(p, i === 0))
    .join("\n\n");
  const boardRe =
    /(<div class="pickora-board-grid" id="pins-grid">\s*)[\s\S]*?(<\/div>\s*<\/div>\s*\n\s*<div class="pickora-popup-overlay")/;
  if (!boardRe.test(html)) throw new Error("pins grid not found");
  html = html.replace(boardRe, `$1\n${board}\n\n  $2`);

  const js = pinDataJs(draft.pins);
  const pinDataRe = /const pinData = \{[\s\S]*?\n  \};/;
  if (!pinDataRe.test(html)) throw new Error("pinData JS object not found");
  html = html.replace(pinDataRe, `const pinData = ${js};`);

  if (html !== page.content) {
    const r = await putFile(
      env,
      pagePath,
      html,
      "publish(pins): update Categories board",
      page.sha
    );
    commits.push(r.commit?.sha);
  }
  urls.push("https://pickora.shop/categories/");

  return {
    ok: true,
    module: "pins",
    commits: commits.filter(Boolean),
    urls,
    note: "Pins JSON + categories board published.",
  };
}
