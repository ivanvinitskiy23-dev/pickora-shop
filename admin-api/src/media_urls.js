/**
 * Public site media URLs vs Studio Worker preview URLs.
 *
 * Studio may store Worker paths for instant preview. Published HTML/JSON on
 * pickora.shop must use permanent GitHub Pages paths under /wp-content/uploads/.
 */

export const WORKER_MEDIA_HOST =
  "https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/";

export const SITE_ORIGIN = "https://pickora.shop";

/**
 * Map Worker / relative media keys to https://pickora.shop/wp-content/uploads/...
 * Leaves non-media URLs unchanged.
 *
 * @param {string} url
 * @returns {string}
 */
export function toSiteMediaUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";

  // Already a site uploads URL (absolute or root-relative)
  if (/^https?:\/\/pickora\.shop\/wp-content\/uploads\//i.test(raw)) return raw;
  if (raw.startsWith("/wp-content/uploads/")) return SITE_ORIGIN + raw;

  // Worker absolute: .../api/media/file/uploads/2026/10/x.webp
  // Relative: /api/media/file/uploads/... or uploads/...
  let key = "";
  const absWorker = raw.match(
    /^https?:\/\/pickora-admin-api\.pickara-admin\.workers\.dev\/api\/media\/file\/(.+)$/i
  );
  if (absWorker) key = absWorker[1];
  else {
    const apiRel = raw.match(/^\/?api\/media\/file\/(.+)$/i);
    if (apiRel) key = apiRel[1];
    else if (/^uploads\//i.test(raw)) key = raw;
  }

  if (!key) {
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return SITE_ORIGIN + raw;
    return raw;
  }

  // uploads/YYYY/MM/file → wp-content/uploads/YYYY/MM/file
  const path = key.replace(/^uploads\//i, "wp-content/uploads/");
  if (!path.startsWith("wp-content/uploads/")) {
    return SITE_ORIGIN + "/wp-content/uploads/" + path.replace(/^\/+/, "");
  }
  return SITE_ORIGIN + "/" + path.replace(/^\/+/, "");
}

/**
 * Rewrite every Worker media URL inside HTML/JSON/text to pickora.shop paths.
 * @param {string} text
 * @returns {string}
 */
export function rewriteMediaUrlsInText(text) {
  const s = String(text || "");
  if (!s) return s;
  return s
    .replace(
      /https:\/\/pickora-admin-api\.pickara-admin\.workers\.dev\/api\/media\/file\/uploads\//gi,
      `${SITE_ORIGIN}/wp-content/uploads/`
    )
    .replace(
      /(["'(=\s])\/api\/media\/file\/uploads\//gi,
      `$1${SITE_ORIGIN}/wp-content/uploads/`
    );
}

/**
 * Deep-clone JSON-like value rewriting string media URLs.
 * @param {unknown} value
 * @returns {unknown}
 */
export function rewriteMediaUrlsInData(value) {
  if (typeof value === "string") return toSiteMediaUrl(value);
  if (Array.isArray(value)) return value.map(rewriteMediaUrlsInData);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string" && /image|cover|src|url|thumb|media/i.test(k)) {
        out[k] = /html/i.test(k) ? rewriteMediaUrlsInText(v) : toSiteMediaUrl(v);
      } else if (typeof v === "string" && /workers\.dev\/api\/media|\/api\/media\/file\//i.test(v)) {
        out[k] = /</.test(v) ? rewriteMediaUrlsInText(v) : toSiteMediaUrl(v);
      } else {
        out[k] = rewriteMediaUrlsInData(v);
      }
    }
    return out;
  }
  return value;
}
