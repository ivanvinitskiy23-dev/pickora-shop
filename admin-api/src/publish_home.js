/**
 * Pickora Admin API — Home page publish helper
 *
 * Exports: publishHomeDraft(env, draft) -> Promise<{ ok, urls, commits, note }>
 *
 * Ports render_home.py logic to JS (no Python subprocess).
 *
 * draft shape (from D1 key 'home'):
 *   latestReviews: Array<{ url, image, imageAlt, category, title, excerpt, badge }>  — exactly 4
 *   topPicks: { updated, picks: Array<{ image, imageAlt, category, tagline, title,
 *               blurb, pros, amazonUrl, guideUrl }> }
 *
 * Files written to GitHub:
 *   content/home.json          — raw draft JSON
 *   index.html                 — reviews grid + top-pick shell updated in-place
 *   assets/data/top-picks.json — carousel JSON for the js carousel widget
 */

import { getFile, putFile } from "./github.js";
import { injectStudioPreviewChrome } from "./publish_products.js";

// Marker preserved after the 4 cards (mirrors Python KEEP_COMMENT)
const KEEP_COMMENT =
  "        <!-- Keep exactly 4 cards: newest first. Drop the oldest when publishing a new guide. -->";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WORKER_MEDIA =
  "https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/";

/**
 * Absolute image URL for Home cards.
 * Rewrites broken /api/media (and pickora.shop/api/media) to the Worker host —
 * GitHub Pages has no /api/media route.
 */
function absUrl(path) {
  if (!path) return "";
  const p = String(path).trim();
  if (/\/api\/media\/file\//i.test(p)) {
    try {
      if (/^https?:\/\//i.test(p)) {
        const u = new URL(p);
        return WORKER_MEDIA + u.pathname.replace(/^\/api\/media\/file\//i, "");
      }
    } catch {
      /* fall through */
    }
    return WORKER_MEDIA + p.replace(/^\/?api\/media\/file\//i, "");
  }
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return "https://pickora.shop" + p;
  return p;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// buildRevCard — mirrors render_home.py render_review_card()
// ---------------------------------------------------------------------------

export function buildRevCard(item) {
  const url     = escHtml(absUrl(item.url || ""));
  const img     = escHtml(absUrl(item.image || ""));
  const cat     = escHtml(item.category || "");
  const title   = escHtml(item.title || "");
  const excerpt = escHtml(item.excerpt || "");
  const alt     = escHtml(item.imageAlt || item.title || "");
  const badge   = item.badge || "none";

  let badgeHtml = "";
  if (badge && badge !== "none") {
    const label = {
      updated:      "Updated",
      "must-read":  "Must read",
      "editors-pick": "Editor's pick",
      hot:          "Hot",
      new:          "New",
    }[badge] || badge;
    badgeHtml =
      `\n                    <span class="pk-rev-badge" data-badge="${escHtml(badge)}">${escHtml(label)}</span>`;
  }

  return `        <article class="pk-rev-card">
            <a href="${url}" class="pk-rev-link">
                <div class="pk-rev-image">
                    <img src="${img}" alt="${alt}" width="1200" height="670" loading="lazy" decoding="async">${badgeHtml}
                    <span class="pk-rev-category">${cat}</span>
                </div>
                <div class="pk-rev-content">
                    <h3 class="pk-rev-title">${title}</h3>
                    <p class="pk-rev-excerpt">${excerpt}</p>
                    <div class="pk-rev-cta">
                        Read Review <span class="pk-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>`;
}

// ---------------------------------------------------------------------------
// replaceReviewsGrid — mirrors render_home.py replace_reviews_grid()
// ---------------------------------------------------------------------------

export function replaceReviewsGrid(html, cards) {
  const inner = cards + "\n\n" + KEEP_COMMENT + "\n\n    ";
  const re    = /(<div class="pk-reviews-grid">\s*)[\s\S]*?(<\/div>\s*<\/section>)/;
  const result = html.replace(re, (_, g1, g2) => g1 + "\n" + inner + g2);
  if (result === html) {
    throw new Error(
      'Could not find pk-reviews-grid … </div></section> in index.html. ' +
      'Page may be corrupt — re-seed from live index.html.'
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// patchTopPickShell — mirrors render_home.py patch_top_pick_shell()
//
// Only the first pick (index 0) is used to update the static HTML shell.
// All picks are written to assets/data/top-picks.json for the JS carousel.
// ---------------------------------------------------------------------------

export function patchTopPickShell(html, pick) {
  const img      = escHtml(absUrl(pick.image || ""));
  const alt      = escHtml(pick.imageAlt || pick.title || "");
  const cat      = escHtml(pick.category || "");
  const tagline  = escHtml(pick.tagline || "");
  const title    = escHtml(pick.title || "");
  const blurb    = escHtml(pick.blurb || "");
  const amazon   = escHtml(pick.amazonUrl || "#");
  const guide    = escHtml(pick.guideUrl || "#");

  const pros = (pick.pros || [])
    .map((p) => `                    <li><span>✓</span> ${escHtml(p)}</li>`)
    .join("\n");

  html = html.replace(
    /(<img class="pk-top-pick-img" src=")[^"]*(")/, `$1${img}$2`
  );
  html = html.replace(
    /(class="pk-top-pick-img"[^>]*alt=")[^"]*(")/,  `$1${alt}$2`
  );
  html = html.replace(
    /(class="pk-pick-category">)[^<]*(<\/span>)/,   `$1${cat}$2`
  );
  html = html.replace(
    /(class="pk-year-tag">)[^<]*(<\/p>)/,           `$1${tagline}$2`
  );
  html = html.replace(
    /(class="pk-product-title">)[^<]*(<\/h3>)/,     `$1${title}$2`
  );
  html = html.replace(
    /(class="pk-pick-blurb">)[^<]*(<\/p>)/,         `$1${blurb}$2`
  );
  html = html.replace(
    /(<ul class="pk-check-list">)[\s\S]*?(<\/ul>)/,
    `$1\n${pros}\n                $2`
  );
  html = html.replace(
    /(class="pk-btn-blue pk-btn-amazon"[^>]*href=")[^"]+(")/, `$1${amazon}$2`
  );
  html = html.replace(
    /(class="pk-btn-ghost pk-btn-guide"[^>]*href=")[^"]+(")/, `$1${guide}$2`
  );

  return html;
}

// ---------------------------------------------------------------------------
// Offline preview (same patchers as publish; no GitHub write)
// ---------------------------------------------------------------------------

export function applyHomeDraftToHtml(html, draft) {
  const reviews = draft.latestReviews;
  if (!Array.isArray(reviews) || reviews.length !== 4) {
    throw new Error(
      `latestReviews must be exactly 4 items, got ${
        Array.isArray(reviews) ? reviews.length : "non-array"
      }`
    );
  }
  const cards = reviews.map((r) => buildRevCard(r)).join("\n\n");
  let updated = replaceReviewsGrid(html, cards);
  if (draft.topPicks) {
    const first = draft.topPicks.picks?.[0] || {
      title: "",
      image: "",
      imageAlt: "",
      category: "",
      tagline: "",
      blurb: "",
      amazonUrl: "#",
      guideUrl: "#",
      pros: [],
    };
    updated = patchTopPickShell(updated, first);
  }
  return updated;
}

export async function loadHomeTemplateHtml(env) {
  if (env?.GITHUB_TOKEN) {
    try {
      const file = await getFile(env, "index.html");
      if (file?.content) return { html: file.content, source: "github" };
    } catch {
      /* fall through to live */
    }
  }
  const res = await fetch("https://pickora.shop/", {
    headers: { "User-Agent": "pickora-admin-api/preview" },
  });
  if (!res.ok) throw new Error("template_unavailable");
  return { html: await res.text(), source: "live" };
}

export function buildHomePreviewHtml(templateHtml, draft, meta = {}) {
  const html = applyHomeDraftToHtml(templateHtml, draft);
  return injectStudioPreviewChrome(html, {
    title: "Home",
    label: "home",
    previewBy: meta.previewBy,
  });
}

// ---------------------------------------------------------------------------
// planHomePublish (dry-run — no GitHub writes)
// ---------------------------------------------------------------------------

export function planHomePublish(draft) {
  const reviews = draft.latestReviews;
  if (!Array.isArray(reviews) || reviews.length !== 4) {
    throw new Error(
      `latestReviews must be exactly 4 items, got ${
        Array.isArray(reviews) ? reviews.length : "non-array"
      }`
    );
  }
  const files = ["content/home.json", "index.html"];
  if (draft.topPicks) files.push("assets/data/top-picks.json");
  return {
    ok: true,
    files,
    note:
      "Reviews grid + top-pick shell patched in index.html; " +
      "content/home.json and assets/data/top-picks.json updated.",
  };
}

// ---------------------------------------------------------------------------
// publishHomeDraft
// ---------------------------------------------------------------------------

/**
 * Full publish flow for the home draft:
 *   1. Write content/home.json
 *   2. Patch index.html  (reviews grid + top-pick shell)
 *   3. Write assets/data/top-picks.json
 *
 * @param {object} env   - Worker env (GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH)
 * @param {object} draft - Home draft from D1 (key 'home')
 * @returns {Promise<{ ok, urls, commits, note }>}
 */
export async function publishHomeDraft(env, draft, opts = {}) {
  const reviews = draft.latestReviews;
  if (!Array.isArray(reviews) || reviews.length !== 4) {
    throw new Error(
      `latestReviews must be exactly 4 items, got ${
        Array.isArray(reviews) ? reviews.length : "non-array"
      }`
    );
  }

  const dryRun = !!opts.dryRun;
  const today = todayISO();
  const urls = ["content/home.json", "index.html"];
  if (draft.topPicks) urls.push("assets/data/top-picks.json");

  // Validate patch even on dry-run
  const homePage = await getFile(env, "index.html");
  if (!homePage) throw new Error("index.html missing on GitHub");
  applyHomeDraftToHtml(homePage.content, draft);

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      urls,
      commits: [],
      note: "Dry-run: would update " + urls.join(", "),
    };
  }

  const commits = [];
  const written = [];

  const jsonPath = "content/home.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult = await putFile(
    env,
    jsonPath,
    JSON.stringify(draft, null, 2),
    "publish(home): update content/home.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit.sha);
  written.push(jsonPath);

  let updatedHome = applyHomeDraftToHtml(homePage.content, draft);
  const homeResult = await putFile(
    env,
    "index.html",
    updatedHome,
    "publish(home): update reviews grid + top-pick shell",
    homePage.sha
  );
  commits.push(homeResult.commit.sha);
  written.push("index.html");

  if (draft.topPicks) {
    const tpPath = "assets/data/top-picks.json";
    const tpExisting = await getFile(env, tpPath);
    const tpPayload = {
      updated: draft.topPicks.updated || today,
      picks: draft.topPicks.picks,
    };
    const tpResult = await putFile(
      env,
      tpPath,
      JSON.stringify(tpPayload, null, 2) + "\n",
      "publish(home): update top-picks.json",
      tpExisting?.sha
    );
    commits.push(tpResult.commit.sha);
    written.push(tpPath);
  }

  return {
    ok: true,
    urls: written,
    commits,
    note:
      "Reviews grid + top-pick shell patched in index.html; " +
      "content/home.json and assets/data/top-picks.json updated.",
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
