import { buildArticlePage, resolveArticlesHubUrl } from "../src/publish_article.js";

const cases = [
  { hubCategory: "Home & Kitchen", hubUrl: "https://pickora.shop/home-kitchen/" },
  { hubCategory: "Home & Kitchen", hubUrl: "/articles/?cat=kitchen" },
  { hubCategory: "Home &amp; Kitchen", hubUrl: "https://pickora.shop/home-kitchen/" },
  { hubCategory: "Home & Kitchen", hubUrl: "https://pickora.shop/products/" },
  { hubCategory: "Weird", hubUrl: "https://pickora.shop/home-kitchen/", chips: ["kitchen"] },
];

for (const c of cases) {
  const resolved = resolveArticlesHubUrl(c);
  const html = buildArticlePage(
    { title: "Test", h1: "Test", dek: "d", slug: "test", blocks: [], ...c },
    { preview: true }
  );
  const crumb = html.match(/<nav class="pk-crumbs"[\s\S]*?<\/nav>/);
  const badge = html.match(/<a class="pk-review-badge"[^>]*>/);
  console.log("---", JSON.stringify(c));
  console.log("resolve:", resolved);
  console.log("crumb:", crumb ? crumb[0].replace(/\s+/g, " ") : "NO");
  console.log("badge:", badge ? badge[0] : "NO");
}
