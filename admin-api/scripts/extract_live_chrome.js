/**
 * One-shot extractor: pulls header/footer/head chrome from a live article HTML
 * and writes admin-api/src/live_chrome.js with inlined string exports (Worker-safe).
 *
 * Usage: node admin-api/scripts/extract_live_chrome.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "best-coffee-makers-2026", "index.html");
const OUT = path.join(ROOT, "admin-api", "src", "live_chrome.js");

const STYLE_IDS = [
  "pk-tap-targets-inline-css",
  "wp-block-site-title-inline-css",
  "wp-block-group-inline-css",
  "wp-block-social-links-inline-css",
  "wp-block-columns-inline-css",
  "global-styles-inline-css",
  "core-block-supports-inline-css",
  "pk-footer-bottom-inline-css",
  "pk-mobile-menu-footer-fix-inline-css",
  "pk-ml-footer-dark",
];

const html = fs.readFileSync(SRC, "utf8");

function extractStyleById(doc, id) {
  const re = new RegExp(
    `<style\\s+id="${id}"[^>]*>[\\s\\S]*?<\\/style>`,
    "i"
  );
  const m = doc.match(re);
  return m ? m[0] : null;
}

function extractBetween(doc, startNeedle, endNeedle) {
  const start = doc.indexOf(startNeedle);
  if (start < 0) throw new Error(`Start not found: ${startNeedle}`);
  const end = doc.indexOf(endNeedle, start);
  if (end < 0) throw new Error(`End not found after start: ${endNeedle}`);
  return doc.slice(start, end + endNeedle.length);
}

const styles = [];
const missing = [];
for (const id of STYLE_IDS) {
  const block = extractStyleById(html, id);
  if (block) styles.push(block);
  else missing.push(id);
}

const stylesheetLinks = [
  `<link rel="stylesheet" id="wp-block-navigation-css" href="https://pickora.shop/wp-includes/blocks/navigation/style.min.css?ver=7.0" media="all">`,
  `<link rel="stylesheet" id="hostinger-ai-style-css" href="https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/css/style.min.css?ver=2.0.22" media="all">`,
  `<link rel="stylesheet" id="elementor-gf-montserrat-css" href="https://fonts.googleapis.com/css?family=Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic&amp;display=swap" media="all">`,
  `<link rel="stylesheet" id="elementor-gf-opensans-css" href="https://fonts.googleapis.com/css?family=Open+Sans:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic&amp;display=swap" media="all">`,
  `<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-nav.css?v=5">`,
  `<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-mobile-fixes.css?v=2">`,
].join("\n");

const LIVE_CHROME_HEAD = [stylesheetLinks, ...styles].join("\n");

const LIVE_HEADER_HTML = extractBetween(
  html,
  '<header class="site-header wp-block-template-part">',
  "</header>"
).trim();

let footerRaw = extractBetween(
  html,
  '<footer class="site-footer wp-block-template-part">',
  "</footer>"
).trim();

// Year placeholder for importer
footerRaw = footerRaw.replace(
  /©\s*20\d{2}\s+Pickora Shop/g,
  "© ${YEAR} Pickora Shop"
);

function asJsStringExport(name, value) {
  return `export const ${name} = ${JSON.stringify(value)};\n`;
}

const banner = `/**
 * Live Pickora.shop article chrome (header / footer / head assets).
 *
 * AUTO-GENERATED from best-coffee-makers-2026/index.html
 * by admin-api/scripts/extract_live_chrome.js — do not hand-edit CSS.
 *
 * Exports for Studio preview/publish (Cloudflare Worker–safe inlined strings):
 *   LIVE_CHROME_HEAD
 *   LIVE_HEADER_HTML
 *   LIVE_FOOTER_HTML           (contains "\${YEAR}" placeholder)
 *   buildLiveFooterHtml(year)  (replaces \${YEAR})
 *
 * Missing optional style ids from source: ${missing.length ? missing.join(", ") : "(none)"}
 */
`;

const footerFn = `
/**
 * @param {number|string} [year=new Date().getFullYear()]
 * @returns {string}
 */
export function buildLiveFooterHtml(year = new Date().getFullYear()) {
  return LIVE_FOOTER_HTML.replace(/\\$\\{YEAR\\}/g, String(year));
}
`;

const out =
  banner +
  "\n" +
  asJsStringExport("LIVE_CHROME_HEAD", LIVE_CHROME_HEAD) +
  "\n" +
  asJsStringExport("LIVE_HEADER_HTML", LIVE_HEADER_HTML) +
  "\n" +
  asJsStringExport("LIVE_FOOTER_HTML", footerRaw) +
  footerFn;

fs.writeFileSync(OUT, out, "utf8");

const bytes = Buffer.byteLength(out, "utf8");
console.log(
  JSON.stringify(
    {
      out: path.relative(ROOT, OUT),
      bytes,
      headChars: LIVE_CHROME_HEAD.length,
      headerChars: LIVE_HEADER_HTML.length,
      footerChars: footerRaw.length,
      stylesIncluded: styles.map((s) => {
        const m = s.match(/id="([^"]+)"/);
        return m ? m[1] : "?";
      }),
      stylesMissing: missing,
    },
    null,
    2
  )
);
