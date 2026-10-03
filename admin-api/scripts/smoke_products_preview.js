/**
 * Local smoke: buildCategoryPreviewHtml against live home-kitchen chrome.
 * Run: node admin-api/scripts/smoke_products_preview.js
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildCategoryPreviewHtml,
  buildProductCard,
} from "../src/publish_products.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const html = readFileSync(join(root, "home-kitchen/index.html"), "utf8");

const products = [
  {
    title: "Smoke Test Product",
    image: "/wp-content/uploads/2026/06/Espresso_machine_and_latte_mug_202606281727.webp",
    imageAlt: "test",
    description: "Desc",
    pros: ["Fast heat"],
    cons: ["Plastic bits"],
    verdict: "Great for small kitchens.",
    amazonUrl: "https://amzn.to/440gWNu",
    ratingStars: 5,
  },
  {
    title: "No stars product",
    image: "/wp-content/uploads/2026/06/Espresso_machine_and_latte_mug_202606281727.webp",
    description: "Hidden stars",
    pros: [],
    cons: [],
    verdict: "",
    amazonUrl: "https://link.amazon/test",
    ratingStars: 0,
  },
];

const card = buildProductCard(products[0], true);
if (!card.includes("pickora-final-badge-pro")) throw new Error("pros badge missing");
if (!card.includes("pickora-final-btn")) throw new Error("btn missing");

const noStars = buildProductCard(products[1]);
if (noStars.includes("pickora-final-rating")) throw new Error("stars should hide at 0");

const preview = buildCategoryPreviewHtml(html, products, {
  hubId: "home-kitchen",
  title: "Home & Kitchen",
  previewBy: "smoke",
});

const bodyOpen = preview.match(/<body[^>]*>/i)?.[0] || "";
const bannerIdx = preview.indexOf('id="pk-preview-banner"');
const skipIdx = preview.indexOf('class="skip-link');
const headerIdx = preview.indexOf("<header");
const checks = {
  base: preview.includes('<base href="https://pickora.shop/">'),
  banner: preview.includes("Offline preview"),
  orangeBtn: preview.includes("background-color: #ff9900"),
  product1: preview.includes("Smoke Test Product"),
  product2: preview.includes("No stars product"),
  skipLink: skipIdx > 0 && preview.includes("Skip to content</a>"),
  bodyClosed: />$/.test(bodyOpen) && bodyOpen.includes("pk-is-preview"),
  orderOk:
    bannerIdx > 0 &&
    skipIdx > bannerIdx &&
    headerIdx > skipIdx &&
    !preview.slice(skipIdx, skipIdx + 80).includes("#pk-preview-banner"),
  noindex: /noindex/i.test(preview),
};

for (const [k, ok] of Object.entries(checks)) {
  if (!ok) throw new Error("check failed: " + k);
}

console.log("OK products preview smoke", { bytes: preview.length, ...checks });
