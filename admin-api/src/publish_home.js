/**
 * Publish Home draft to GitHub Pages (content/home.json + index.html + top-picks.json).
 * Ports scripts/admin-render/render_home.py (live paths, not lab).
 */
import { getFile, putFile } from "./github.js";

const KEEP_COMMENT =
  "        <!-- Keep exactly 4 cards: newest first. Drop the oldest when publishing a new guide. -->";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? `https://pickora.shop${path}` : `https://pickora.shop/${path}`;
}

function sitePath(path) {
  if (!path) return "";
  if (/^https?:\/\/pickora\.shop/i.test(path)) {
    try {
      return new URL(path).pathname;
    } catch {
      /* fall */
    }
  }
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

function renderReviewCard(item) {
  const url = sitePath(item.url);
  const img = sitePath(item.image);
  const cat = esc(item.category);
  const title = esc(item.title);
  const excerpt = esc(item.excerpt);
  const alt = esc(item.imageAlt || item.title);
  const badge = item.badge || "none";
  let badgeHtml = "";
  if (badge && badge !== "none") {
    const label =
      {
        updated: "Updated",
        "must-read": "Must read",
        "editors-pick": "Editor's pick",
        hot: "Hot",
        new: "New",
      }[badge] || badge;
    badgeHtml = `\n                    <span class="pk-rev-badge" data-badge="${esc(
      badge
    )}">${esc(label)}</span>`;
  }
  return `        <article class="pk-rev-card">
            <a href="${esc(url)}" class="pk-rev-link">
                <div class="pk-rev-image">
                    <img src="${esc(img)}" alt="${alt}" width="1200" height="670" loading="lazy" decoding="async">${badgeHtml}
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

function patchTopPickShell(html, pick) {
  let out = html;
  out = out.replace(
    /(<img class="pk-top-pick-img" src=")[^"]+(")/,
    `$1${sitePath(pick.image)}$2`
  );
  out = out.replace(
    /(class="pk-top-pick-img"[^>]*alt=")[^"]*(")/,
    `$1${esc(pick.imageAlt || pick.title)}$2`
  );
  out = out.replace(
    /(class="pk-pick-category">)[^<]*(<\/span>)/,
    `$1${esc(pick.category)}$2`
  );
  out = out.replace(
    /(class="pk-year-tag">)[^<]*(<\/p>)/,
    `$1${esc(pick.tagline)}$2`
  );
  // Title / link / excerpt — best-effort from Python's remaining patches if present
  if (pick.title) {
    out = out.replace(
      /(class="pk-top-pick-title"[^>]*>)[\s\S]*?(<\/h2>)/,
      `$1${esc(pick.title)}$2`
    );
  }
  if (pick.url) {
    out = out.replace(
      /(class="pk-top-pick-cta"[^>]*href=")[^"]+(")/,
      `$1${esc(sitePath(pick.url))}$2`
    );
  }
  return out;
}

function replaceReviewsGrid(html, cards) {
  const pattern = /(<div class="pk-reviews-grid">\s*)[\s\S]*?(<\/div>\s*<\/section>)/;
  const inner = cards + "\n\n" + KEEP_COMMENT + "\n\n    ";
  if (!pattern.test(html)) {
    throw new Error("pk-reviews-grid marker not found in index.html");
  }
  const newHtml = html.replace(pattern, `$1\n${inner}$2`);
  if (!newHtml.includes(".pk-rev-card {") || !newHtml.includes(".pk-reviews-grid {")) {
    throw new Error("Reviews style block missing after home patch — abort");
  }
  return newHtml;
}

export async function publishHomeDraft(env, draft) {
  const reviews = draft?.latestReviews;
  if (!Array.isArray(reviews) || reviews.length !== 4) {
    throw new Error("latestReviews_must_be_4");
  }
  const commits = [];
  const urls = [];

  // 1) content/home.json
  const jsonPath = "content/home.json";
  const existingJson = await getFile(env, jsonPath);
  const jsonResult = await putFile(
    env,
    jsonPath,
    JSON.stringify(draft, null, 2) + "\n",
    "publish(home): content/home.json",
    existingJson?.sha
  );
  commits.push(jsonResult.commit?.sha);
  urls.push(jsonPath);

  // 2) index.html — reviews + first top pick shell
  const homePath = "index.html";
  const homeFile = await getFile(env, homePath);
  if (!homeFile) throw new Error("index.html missing on GitHub");
  const cards = reviews.map(renderReviewCard).join("\n\n");
  let html = replaceReviewsGrid(homeFile.content, cards);
  const first = draft.topPicks?.picks?.[0];
  if (first) html = patchTopPickShell(html, first);
  // Ensure live top-picks src (not lab path)
  html = html.replace(
    /data-pk-top-picks-src="[^"]+"/,
    'data-pk-top-picks-src="/assets/data/top-picks.json"'
  );
  if (html !== homeFile.content) {
    const homeResult = await putFile(
      env,
      homePath,
      html,
      "publish(home): update Latest Reviews",
      homeFile.sha
    );
    commits.push(homeResult.commit?.sha);
  }
  urls.push("https://pickora.shop/");

  // 3) assets/data/top-picks.json
  if (draft.topPicks) {
    const tpPath = "assets/data/top-picks.json";
    const payload = {
      updated: draft.topPicks.updated,
      picks: draft.topPicks.picks,
    };
    const existingTp = await getFile(env, tpPath);
    const tpResult = await putFile(
      env,
      tpPath,
      JSON.stringify(payload, null, 2) + "\n",
      "publish(home): top-picks.json",
      existingTp?.sha
    );
    commits.push(tpResult.commit?.sha);
    urls.push(tpPath);
  }

  return {
    ok: true,
    module: "home",
    commits: commits.filter(Boolean),
    urls,
    note: "Home JSON + index.html reviews + top-picks published.",
  };
}
