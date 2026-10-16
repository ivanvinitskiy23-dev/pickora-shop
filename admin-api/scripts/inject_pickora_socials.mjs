/**
 * Sitewide: hide dead footer social UL + inject pickora-socials.js before </body>.
 * Skips admin-lab, node_modules, pk-studio, admin-api, .git
 *
 * Usage: node admin-api/scripts/inject_pickora_socials.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "admin-lab",
  "pk-studio",
  "covers-inbox",
  "briefs",
  ".cursor",
  "admin-api",
]);

const EMPTY_UL =
  '<ul class="wp-block-social-links has-icon-color is-style-logos-only is-layout-flex wp-container-core-social-links-is-layout-87452e7f wp-block-social-links-is-layout-flex" data-pk-socials="empty" hidden></ul>';

const SCRIPT_TAG =
  '<script src="/assets/js/pickora-socials.js?v=1" defer></script>';

const UL_RE = /<ul class="wp-block-social-links[\s\S]*?<\/ul>/;
const SOCIALS_H3_RE =
  /(<h3\b[^>]*>)\s*Socials\s*(<\/h3>)/i;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let patchedUl = 0;
let patchedScript = 0;
let patchedHeading = 0;

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("wp-block-social-links") && !html.includes("site-footer")) {
    continue;
  }
  let changed = false;

  if (UL_RE.test(html)) {
    const next = html.replace(UL_RE, EMPTY_UL);
    if (next !== html) {
      html = next;
      patchedUl++;
      changed = true;
    }
  }

  if (html.includes('data-pk-socials="empty"') && SOCIALS_H3_RE.test(html)) {
    const next = html.replace(SOCIALS_H3_RE, (m, open, close) => {
      if (/\bhidden\b/.test(open)) return m;
      return `${open.replace(/>$/, " hidden>")}Socials${close}`;
    });
    if (next !== html) {
      html = next;
      patchedHeading++;
      changed = true;
    }
  }

  if (
    html.includes("</body>") &&
    !html.includes("pickora-socials.js") &&
    (html.includes("data-pk-socials") || html.includes("site-footer"))
  ) {
    if (html.includes("pickora-nav.js")) {
      html = html.replace(
        /(<script[^>]*pickora-nav\.js[^>]*><\/script>)/,
        `$1\n${SCRIPT_TAG}`
      );
    } else {
      html = html.replace(/<\/body>/i, `${SCRIPT_TAG}\n</body>`);
    }
    patchedScript++;
    changed = true;
  }

  if (changed) fs.writeFileSync(file, html, "utf8");
}

console.log(
  JSON.stringify({ files: files.length, patchedUl, patchedScript, patchedHeading }, null, 2)
);
