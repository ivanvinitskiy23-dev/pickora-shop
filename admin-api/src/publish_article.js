/**
 * Pickora Admin API — Article publish helpers
 *
 * Exports:
 *   buildArticlesHubCard(draft)        -> HTML string
 *   upsertSitemapUrl(xml, path, date)  -> xml string
 *   prependHubCard(html, cardHtml)     -> html string
 *   publishArticleDraft(env, draft)    -> Promise<{ ok, urls, commits }>
 *
 * Chip labels follow chips.md (1–3 chips, first = primary, rest = soft).
 * No AggregateRating. Hub card links to article page only.
 */

import { getFile, putFile } from "./github.js";

// ---------------------------------------------------------------------------
// Chip slug → display label map (source of truth: chips.md)
// ---------------------------------------------------------------------------
const CHIP_LABELS = {
  audio:        "Audio",
  electronics:  "Electronics",
  mobile:       "Mobile",
  kitchen:      "Kitchen",
  cleaning:     "Cleaning",
  "smart-home": "Smart Home",
  fitness:      "Fitness",
  wearables:    "Wearables",
  pets:         "Pets",
  home:         "Home",
};

// ---------------------------------------------------------------------------
// buildArticlesHubCard
// ---------------------------------------------------------------------------

/**
 * Build the <article class="pk-card"> HTML for the articles hub.
 *
 * Rules (from chips.md):
 *   - data-categories: space-separated chip slugs (1–3)
 *   - First chip tag has class "pk-card-tag" (primary, no modifier)
 *   - Additional chips get class "pk-card-tag pk-card-tag--soft"
 *   - Image src: draft.coverImage (may be absolute workers.dev URL — kept as-is)
 *   - Card link: article canonical URL only (no Amazon links on hub card)
 *   - No AggregateRating
 *
 * @param {object} draft - Article draft object from D1
 * @returns {string} Full <article>…</article> HTML, indented with 8 spaces
 */
export function buildArticlesHubCard(draft) {
  const slug      = String(draft.slug     || "").trim();
  const title     = escHtml(String(draft.title || "").trim());
  const excerpt   = escHtml(String(draft.dek || draft.excerpt || draft.metaDescription || "").trim());
  const cover     = String(draft.coverImage || "").trim();
  const canonical = draft.canonical || `https://pickora.shop/${slug}/`;

  // Chips: max 3, validated against allowed set
  const rawChips = (Array.isArray(draft.chips) ? draft.chips : [])
    .filter((c) => CHIP_LABELS[c])
    .slice(0, 3);

  const dataCategories = rawChips.join(" ");

  // Build tag spans
  const tagSpans = rawChips
    .map((c, i) => {
      const label = CHIP_LABELS[c] || c;
      const cls   = i === 0 ? "pk-card-tag" : "pk-card-tag pk-card-tag--soft";
      return `          <span class="${cls}">${escHtml(label)}</span>`;
    })
    .join("\n");

  // Cover image: alt = lowercase title-ish
  const altText = escHtml(title.toLowerCase());

  // Inline cover only if we have one; otherwise use a data-placeholder
  const imgHtml = cover
    ? `<img src="${escAttr(cover)}" alt="${altText}" width="1200" height="670" loading="lazy" decoding="async">`
    : `<img src="" alt="${altText}" width="1200" height="670" loading="lazy" decoding="async" data-cover-pending="true">`;

  return `        <article class="pk-card" data-categories="${escAttr(dataCategories)}">
            <a href="${escAttr(canonical)}" class="pk-card-inner">
                <div class="pk-card-media">
                    ${imgHtml}
                    <div class="pk-card-tags">
${tagSpans}
                    </div>
                </div>
                <div class="pk-card-content">
                    <h3 class="pk-card-title">${title}</h3>
                    <p class="pk-card-excerpt">${excerpt}</p>
                    <div class="pk-card-footer">
                        <span>Read Full Guide</span>
                        <span class="pk-card-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>`;
}

// ---------------------------------------------------------------------------
// upsertSitemapUrl
// ---------------------------------------------------------------------------

/**
 * Insert or update a <url> entry in sitemap XML.
 *
 * Upsert logic:
 *   - If a <loc> matching the full URL already exists → update its <lastmod> in-place
 *   - Otherwise → prepend a new <url> block before </urlset>
 *
 * @param {string} sitemapXml  - Full sitemap XML text
 * @param {string} path        - Path string, e.g. "/best-headphones-2026/" or "best-headphones-2026"
 * @param {string} [lastmod]   - ISO date string YYYY-MM-DD; defaults to today UTC
 * @returns {string} Updated sitemap XML
 */
export function upsertSitemapUrl(sitemapXml, path, lastmod) {
  const date = lastmod || todayISO();
  // Normalise path to full URL
  const normPath = "/" + path.replace(/^\/|\/$/g, "") + "/";
  const fullUrl  = `https://pickora.shop${normPath}`;

  // Escape for regex usage
  const escapedUrl = fullUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const existingRe = new RegExp(
    `(<url>[\\s\\S]*?<loc>${escapedUrl}<\\/loc>[\\s\\S]*?)<lastmod>[^<]*<\\/lastmod>`,
    "i"
  );

  if (existingRe.test(sitemapXml)) {
    // Update existing lastmod
    return sitemapXml.replace(existingRe, `$1<lastmod>${date}</lastmod>`);
  }

  // Check if the loc exists at all (without lastmod)
  const locRe = new RegExp(`<loc>${escapedUrl}<\\/loc>`, "i");
  if (locRe.test(sitemapXml)) {
    // Already present but has no lastmod — skip to avoid duplicates
    return sitemapXml;
  }

  // New entry — prepend before </urlset>
  const newEntry = `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

  return sitemapXml.replace("</urlset>", newEntry + "</urlset>");
}

// ---------------------------------------------------------------------------
// prependHubCard
// ---------------------------------------------------------------------------

/**
 * Insert a new pk-card HTML block as the FIRST card in the articles hub grid.
 *
 * Insertion order of preference (most→least specific):
 *   1. After the [ИНСТРУКЦИЯ] instruction comment (canonical site marker)
 *   2. Before the first existing <article class="pk-card"
 *   3. Before </div> of the pk-articles-grid / pk-grid-feed div (fallback)
 *
 * @param {string} articlesIndexHtml  - Full articles/index.html text
 * @param {string} cardHtml           - The <article>…</article> block to insert
 * @returns {string} Updated HTML
 */
export function prependHubCard(articlesIndexHtml, cardHtml) {
  const NEWLINE_CARD = "\n\n" + cardHtml + "\n";

  // 1. Preferred: insert after the canonical instruction comment
  const instrRe = /(<!--\s*\[ИНСТРУКЦИЯ\][^\n]*\n)/;
  if (instrRe.test(articlesIndexHtml)) {
    return articlesIndexHtml.replace(instrRe, "$1" + NEWLINE_CARD);
  }

  // 2. Before the first <article class="pk-card"
  const cardRe = /(<article\s+class="pk-card")/;
  if (cardRe.test(articlesIndexHtml)) {
    return articlesIndexHtml.replace(cardRe, cardHtml + "\n\n        $1");
  }

  // 3. Fallback: before the closing tag of pk-grid-feed / pk-articles-grid
  const gridEndRe = /(<\/div>\s*\n\s*<\/div>\s*\n\s*<!-- \/pk-grid| pk-grid-feed|pk-articles-grid)/;
  if (gridEndRe.test(articlesIndexHtml)) {
    return articlesIndexHtml.replace(gridEndRe, NEWLINE_CARD + "\n$1");
  }

  // Last resort: append before last </main> or </body>
  const bodyRe = /(<\/main>|<\/body>)/i;
  return articlesIndexHtml.replace(bodyRe, NEWLINE_CARD + "\n$1");
}

// ---------------------------------------------------------------------------
// publishArticleDraft
// ---------------------------------------------------------------------------

/**
 * Full publish flow for an article draft:
 *   1. Write content/articles/{slug}.json   (draft payload as JSON)
 *   2. Update articles/index.html           (prepend hub card if not already linked)
 *   3. Update sitemap.xml                   (upsert URL entry)
 *
 * @param {object} env   - Worker env with GITHUB_TOKEN (and optionally GITHUB_REPO, GITHUB_BRANCH)
 * @param {object} draft - Validated article draft from D1
 * @returns {Promise<{ ok: boolean, urls: string[], commits: string[] }>}
 * @throws Error if GitHub writes fail
 */
export async function publishArticleDraft(env, draft) {
  const slug      = String(draft.slug || "").trim();
  const canonical = draft.canonical || `https://pickora.shop/${slug}/`;
  const today     = todayISO();
  const commits   = [];
  const urls      = [];

  // ── 1. Write content/articles/{slug}.json ──────────────────────────────────
  const jsonPath    = `content/articles/${slug}.json`;
  const jsonContent = JSON.stringify({ ...draft, publishedAt: draft.publishedAt || today }, null, 2);

  // Fetch existing sha if the file already exists (needed for update)
  const existingJson = await getFile(env, jsonPath);
  const jsonSha = existingJson?.sha;

  const jsonResult = await putFile(
    env,
    jsonPath,
    jsonContent,
    `publish(article): ${slug} — content JSON`,
    jsonSha
  );
  commits.push(jsonResult.commit.sha);
  urls.push(jsonPath);

  // ── 2. Update articles/index.html ──────────────────────────────────────────
  const hubPath = "articles/index.html";
  const hubFile = await getFile(env, hubPath);
  if (!hubFile) throw new Error("articles/index.html missing on GitHub");
  const { sha: hubSha, content: hubHtml } = hubFile;

  // Check if slug is already linked on the hub to avoid duplicates
  const alreadyLinked =
    hubHtml.includes(`href="${canonical}"`) ||
    hubHtml.includes(`href="/${slug}/"`) ||
    hubHtml.includes(`href="https://pickora.shop/${slug}/"`);

  if (!alreadyLinked) {
    const cardHtml    = buildArticlesHubCard(draft);
    const updatedHub  = prependHubCard(hubHtml, cardHtml);

    const hubResult = await putFile(
      env,
      hubPath,
      updatedHub,
      `publish(article): ${slug} — add hub card`,
      hubSha
    );
    commits.push(hubResult.commit.sha);
  }
  urls.push(hubPath);

  // ── 3. Update sitemap.xml ──────────────────────────────────────────────────
  const sitemapPath = "sitemap.xml";
  const smFile = await getFile(env, sitemapPath);
  if (smFile) {
    const updatedSitemap = upsertSitemapUrl(smFile.content, `/${slug}/`, today);

    // Only write if content actually changed
    if (updatedSitemap !== smFile.content) {
      const sitemapResult = await putFile(
        env,
        sitemapPath,
        updatedSitemap,
        `publish(article): ${slug} — sitemap`,
        smFile.sha
      );
      commits.push(sitemapResult.commit.sha);
    }
  }
  urls.push(canonical);

  return {
    ok:      true,
    urls,
    commits,
    slug,
    canonical,
    note:
      "Hub + sitemap + JSON published. Full slug/index.html page is next (Cursor publish skill or template).",
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Return today's date as YYYY-MM-DD (UTC). */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Escape a string for safe use as HTML text content. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape a string for safe use inside an HTML attribute value (double-quoted). */
function escAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}
