/**
 * Self-check offline preview markup for all hubs (no browser).
 */
import { readFileSync } from "fs";
import { buildCategoryPreviewHtml } from "../src/publish_products.js";

const hubs = [
  "consumer-electronics",
  "home-kitchen",
  "fitness-health",
  "pet-supplies",
];

const productsJson = JSON.parse(
  readFileSync(new URL("../../content/products.json", import.meta.url), "utf8")
);

let failed = 0;
for (const hub of hubs) {
  const tpl = await (await fetch(`https://pickora.shop/${hub}/`)).text();
  const products = productsJson.categoryProducts[hub] || [];
  if (!products.length) {
    console.log(hub, "SKIP no products");
    continue;
  }
  const html = buildCategoryPreviewHtml(tpl, products, {
    hubId: hub,
    title: hub,
    previewBy: "verify",
  });
  const body = html.match(/<body[^>]*>/i)?.[0] || "";
  const bannerIdx = html.indexOf('id="pk-preview-banner"');
  const skipIdx = html.indexOf('class="skip-link');
  const headerIdx = html.indexOf("<header");
  const ok = {
    bodyGt: body.endsWith(">"),
    previewClass: body.includes("pk-is-preview"),
    banner: bannerIdx > 0,
    skipIntact: html.includes('Skip to content</a><div class="wp-site-blocks">') ||
      /Skip to content<\/a>\s*<div class="wp-site-blocks">/.test(html),
    order: bannerIdx > 0 && skipIdx > bannerIdx && headerIdx > skipIdx,
    noBannerInsideSkip: !html
      .slice(Math.max(0, skipIdx), skipIdx + 200)
      .includes("#pk-preview-banner"),
  };
  const all = Object.values(ok).every(Boolean);
  if (!all) failed++;
  console.log(all ? "OK" : "FAIL", hub, ok);
}

if (failed) {
  console.error("FAILED hubs:", failed);
  process.exit(1);
}
console.log("All hubs OK");
