import { buildArticlePage } from "../src/publish_article.js";

const html = buildArticlePage(
  {
    slug: "test-chrome",
    title: "Stainless vs Gooseneck Electric Kettle",
    h1: "Stainless vs Gooseneck Electric Kettle",
    dek: "Test dek",
    hubCategory: "Home & Kitchen",
    hubUrl: "https://pickora.shop/home-kitchen/",
    chips: ["kitchen"],
    coverImage: "https://pickora.shop/x.webp",
    blocks: [{ type: "intro", text: "Hello" }],
  },
  { preview: true, previewBy: "test@x.com" }
);

const checks = {
  theme: html.includes("hostinger-ai-theme/assets/css/style.min.css"),
  sticky: html.includes("pk-mobile-menu-footer-fix-inline-css"),
  global: html.includes("global-styles-inline-css"),
  fonts: html.includes("fonts.googleapis.com"),
  headerExact: html.includes("wp-elements-51a1c652b428c38aaa01fc4cea114070"),
  socialTiktok: html.includes("wp-social-link-tiktok"),
  mlForm: html.includes("mlb2-44833402"),
  noCustomFooterInner: !html.includes('class="pk-footer-inner"'),
  liveHeaderComment: html.includes("exact live chrome"),
};
console.log(checks);
if (!Object.values(checks).every(Boolean)) process.exit(1);
console.log("PASS", html.length);
