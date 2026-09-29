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

// Marker preserved after the 4 cards (mirrors Python KEEP_COMMENT)
const KEEP_COMMENT =
  "        <!-- Keep exactly 4 cards: newest first. Drop the oldest when publishing a new guide. -->";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function absUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return "https://pickora.shop" + path;
  return path;
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
    /(<img class="pk-top-pick-img" src=")[^"]+(")/, `$1${img}$2`
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
export async function publishHomeDraft(env, draft) {
  const reviews = draft.latestReviews;
  if (!Array.isArray(reviews) || reviews.length !== 4) {
    throw new Error(
      `latestReviews must be exactly 4 items, got ${
        Array.isArray(reviews) ? reviews.length : "non-array"
      }`
    );
  }

  const today   = todayISO();
  const commits = [];
  const urls    = [];

  // ── 1. content/home.json ────────────────────────────────────────────────
  const jsonPath    = "content/home.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult   = await putFile(
    env, jsonPath,
    JSON.stringify(draft, null, 2),
    "publish(home): update content/home.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit.sha);
  urls.push(jsonPath);

  // ── 2. index.html ─────────────────────────────────────────────────────
  const homePage = await getFile(env, "index.html");
  if (!homePage) throw new Error("index.html missing on GitHub");

  const cards      = reviews.map((r) => buildRevCard(r)).join("\n\n");
  let updatedHome  = replaceReviewsGrid(homePage.content, cards);

  if (draft.topPicks?.picks?.length > 0) {
    updatedHome = patchTopPickShell(updatedHome, draft.topPicks.picks[0]);
  }

  const homeResult = await putFile(
    env, "index.html",
    updatedHome,
    "publish(home): update reviews grid + top-pick shell",
    homePage.sha
  );
  commits.push(homeResult.commit.sha);
  urls.push("index.html");

  // ── 3. assets/data/top-picks.json ─────────────────────────────────────
  if (draft.topPicks) {
    const tpPath    = "assets/data/top-picks.json";
    const tpExisting = await getFile(env, tpPath);
    const tpPayload  = {
      updated: draft.topPicks.updated || today,
      picks:   draft.topPicks.picks,
    };
    const tpResult = await putFile(
      env, tpPath,
      JSON.stringify(tpPayload, null, 2) + "\n",
      "publish(home): update top-picks.json",
      tpExisting?.sha
    );
    commits.push(tpResult.commit.sha);
    urls.push(tpPath);
  }

  return {
    ok:   true,
    urls,
    commits,
    note: "Reviews grid + top-pick shell patched in index.html; " +
          "content/home.json and assets/data/top-picks.json updated.",
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
