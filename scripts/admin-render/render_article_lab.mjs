/**
 * Build one article HTML into admin-lab/site/{slug}/index.html for local e2e.
 * Prefers content/articles/{slug}.json, else a minimal draft from live title.
 *
 * Usage:
 *   node scripts/admin-render/render_article_lab.mjs --slug how-to-choose-a-microwave-2026
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function arg(name, fallback = "") {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const slug = arg("--slug", "");
if (!slug) {
  console.error("Need --slug");
  process.exit(1);
}

const pubPath = path.join(ROOT, "admin-api", "src", "publish_article.js");
const { buildArticlePage } = await import(pathToFileURL(pubPath).href);

const jsonPath = path.join(ROOT, "content", "articles", `${slug}.json`);
let draft;
if (fs.existsSync(jsonPath)) {
  draft = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} else {
  draft = {
    slug,
    title: slug.replace(/-/g, " "),
    h1: slug.replace(/-/g, " "),
    dek: "Lab preview draft — fill via Studio.",
    hubCategory: "Articles",
    hubUrl: "/articles/",
    chips: ["kitchen"],
    coverImage: "",
    coverAlt: "",
    canonical: `https://pickora.shop/${slug}/`,
    blocks: [{ id: "i1", type: "intro", text: "Lab stub. Open Studio to edit." }],
    affiliateLinks: [],
    internalLinks: ["/articles/"],
  };
}

const html = buildArticlePage(draft, { preview: true, previewBy: "lab" });
const outDir = path.join(ROOT, "admin-lab", "site", slug);
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "index.html");
fs.writeFileSync(outFile, html, "utf8");
console.log("Wrote", outFile);
console.log("Open http://127.0.0.1:8765/" + slug + "/");
