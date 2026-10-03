/**
 * Pickora Admin API — Cloudflare Worker
 * Auth + cloud drafts (D1) + media + publish to GitHub Pages.
 */
import {
  publishArticleDraft,
  compileBlocksToHtml,
  buildArticlePage,
  resolveArticlesHubUrl,
} from "./publish_article.js";
import { publishHomeDraft }    from "./publish_home.js";
import { publishPinsDraft }    from "./publish_pins.js";
import {
  publishProductsDraft,
  buildCategoryPreviewHtml,
  loadCategoryTemplateHtml,
} from "./publish_products.js";
import { validateArticleDraft } from "./seo_gate.js";
import { getFileSha, putBinaryFile } from "./github.js";

const SESSION_TTL_SEC = 60 * 60 * 12;
const RAW_CONTENT =
  "https://raw.githubusercontent.com/ivanvinitskiy23-dev/pickora-shop/main/content";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), request);
    }
    // Reject browser mutating calls from unknown Origins before handlers run
    const earlyCors = corsGuard(request);
    if (earlyCors) return earlyCors;

    try {
      if (url.pathname === "/" || url.pathname === "") {
        return cors(
          json({
            ok: true,
            service: "pickora-admin-api",
            mode: "cloudflare",
            studio: "https://pickora.shop/pk-studio/",
            health: "/api/health",
          }),
          request
        );
      }

      if (url.pathname === "/api/health") {
        return cors(
          json({
            ok: true,
            mode: "cloudflare",
            hasDb: !!env.DB,
            hasOwner: !!(env.OWNER_LOGIN && env.OWNER_PASSWORD),
            hasMedia: true,
            hasGithub: !!env.GITHUB_TOKEN,
          }),
          request
        );
      }

      if (url.pathname.startsWith("/api/media/file/")) {
        if (request.method === "DELETE") {
          const fileUser = await userFromToken(request, env);
          if (!fileUser) return cors(json({ error: "unauthorized" }, 401), request);
          return cors(await handleMediaDelete(url.pathname, env, fileUser), request);
        }
        return cors(await handleMediaGet(url.pathname, env), request);
      }

      if (url.pathname === "/api/login" && request.method === "POST") {
        return cors(await handleLogin(request, env), request);
      }
      if (url.pathname === "/api/logout" && request.method === "POST") {
        return cors(await handleLogout(request, env), request);
      }
      if (url.pathname === "/api/me" && request.method === "GET") {
        return cors(await handleMe(request, env), request);
      }

      const user = await userFromToken(request, env);

      if (url.pathname === "/api/articles" && request.method === "GET") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleArticles(), request);
      }

      if (url.pathname === "/api/articles/validate" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(json(validateArticleDraft(await readJson(request))), request);
      }

      if (url.pathname === "/api/publish/article" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handlePublishArticle(env, await readJson(request), user), request);
      }

      if (url.pathname === "/api/preview/article" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handlePreviewArticle(await readJson(request), user), request);
      }

      if (url.pathname === "/api/preview/products" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handlePreviewProducts(env, await readJson(request), user), request);
      }

      if (url.pathname === "/api/publish/home" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handlePublishModule(env, "home", user, publishHomeDraft), request);
      }
      if (url.pathname === "/api/publish/pins" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handlePublishModule(env, "pins", user, publishPinsDraft), request);
      }
      if (url.pathname === "/api/publish/products" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handlePublishModule(env, "products", user, publishProductsDraft), request);
      }

      if (url.pathname === "/api/publish/snapshots" && request.method === "GET") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleSnapshotsList(env), request);
      }

      if (url.pathname === "/api/publish/rollback" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleRollback(env, await readJson(request), user), request);
      }

      if (url.pathname === "/api/status" && request.method === "GET") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleStatus(env), request);
      }

      if (url.pathname === "/api/media/list" && request.method === "GET") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleMediaList(env), request);
      }

      if (url.pathname === "/api/audit" && request.method === "GET") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleAuditList(env), request);
      }

      if (url.pathname === "/api/links/check" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleLinkCheck(await readJson(request)), request);
      }

      if (url.pathname === "/api/team" && request.method === "GET") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleTeamList(env), request);
      }

      if (url.pathname === "/api/team/invite" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        if (!requireOwner(user, env)) return cors(json({ error: "forbidden" }, 403), request);
        return cors(await handleTeamInvite(env, await readJson(request)), request);
      }

      if (url.pathname === "/api/team/remove" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        if (!requireOwner(user, env)) return cors(json({ error: "forbidden" }, 403), request);
        return cors(await handleTeamRemove(env, await readJson(request)), request);
      }

      if (url.pathname === "/api/media/upload" && request.method === "POST") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        return cors(await handleMediaUpload(request, env, user), request);
      }

      if (url.pathname === "/api/content/home") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        if (request.method === "GET") {
          return cors(await getDraft(env, "home", `${RAW_CONTENT}/home.json`), request);
        }
        if (request.method === "POST") {
          return cors(await saveDraft(env, "home", await readJson(request), user), request);
        }
      }

      if (url.pathname === "/api/content/pins") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        if (request.method === "GET") {
          return cors(await getDraft(env, "pins", `${RAW_CONTENT}/pins.json`), request);
        }
        if (request.method === "POST") {
          return cors(await saveDraft(env, "pins", await readJson(request), user), request);
        }
      }

      if (url.pathname === "/api/content/products") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        if (request.method === "GET") {
          return cors(
            await getDraft(env, "products", `${RAW_CONTENT}/products.json`),
            request
          );
        }
        if (request.method === "POST") {
          return cors(
            await saveDraft(env, "products", await readJson(request), user),
            request
          );
        }
      }

      // Article drafts: /api/content/articles and /api/content/articles/:slug
      if (url.pathname === "/api/content/articles") {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        if (request.method === "GET") {
          return cors(await listArticleDrafts(env), request);
        }
        if (request.method === "POST") {
          return cors(await saveArticleDraft(env, await readJson(request), user), request);
        }
      }

      const artMatch = url.pathname.match(/^\/api\/content\/articles\/([^/]+)$/);
      if (artMatch) {
        if (!user) return cors(json({ error: "unauthorized" }, 401), request);
        const slug = decodeURIComponent(artMatch[1]);
        if (request.method === "GET") {
          return cors(await getArticleDraft(env, slug), request);
        }
      }

      return cors(json({ error: "not_found" }, 404), request);
    } catch (err) {
      return cors(
        json({ error: "server_error", detail: String(err?.message || err) }, 500),
        request
      );
    }
  },
};

async function listArticleDrafts(env) {
  const { results } = await env.DB.prepare(
    `SELECT key, json, updated_at, updated_by FROM content_drafts WHERE key LIKE 'article:%' ORDER BY updated_at DESC`
  ).all();
  const drafts = (results || []).map((row) => {
    let meta = {};
    try {
      meta = JSON.parse(row.json);
    } catch {
      meta = {};
    }
    return {
      slug: meta.slug || String(row.key).replace(/^article:/, ""),
      title: meta.title || "",
      status: meta.status || "draft",
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
      affiliateLinks: Array.isArray(meta.affiliateLinks) ? meta.affiliateLinks : [],
      coverImage: meta.coverImage || "",
    };
  });
  return json({ drafts });
}

async function getArticleDraft(env, slug) {
  const key = `article:${slug}`;
  const row = await env.DB.prepare(`SELECT json FROM content_drafts WHERE key = ?`)
    .bind(key)
    .first();
  if (!row?.json) return json({ error: "not_found" }, 404);
  return json(JSON.parse(row.json));
}

async function saveArticleDraft(env, payload, user) {
  const slug = String(payload?.slug || "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return json({ error: "invalid_slug" }, 400);
  }
  const draft = {
    ...payload,
    slug,
    canonical: `https://pickora.shop/${slug}/`,
    updatedAt: new Date().toISOString(),
    status: payload.status || "draft",
  };
  if (Array.isArray(draft.blocks) && draft.blocks.length) {
    draft.bodyHtml = compileBlocksToHtml(draft.blocks);
    // Collect amzn links from product/cta blocks into affiliateLinks
    const fromBlocks = [];
    draft.blocks.forEach((b) => {
      if (b && (b.type === "product" || b.type === "cta")) {
        (b.links || []).forEach((l) => {
          const u = String(l?.url || "").trim();
          if (u && !fromBlocks.includes(u)) fromBlocks.push(u);
        });
      }
    });
    const existing = Array.isArray(draft.affiliateLinks) ? draft.affiliateLinks : [];
    draft.affiliateLinks = [...new Set([...existing, ...fromBlocks].map((u) => String(u).trim()).filter(Boolean))];
  }
  if (draft.status === "seo_ready") {
    const gate = validateArticleDraft(draft);
    if (!gate.ok) {
      return json({ error: "seo_gate_failed", blockers: gate.blockers, warnings: gate.warnings }, 400);
    }
    draft.seoReadyAt = draft.seoReadyAt || new Date().toISOString();
  }
  await env.DB.prepare(
    `INSERT INTO content_drafts (key, json, updated_at, updated_by)
     VALUES (?, ?, datetime('now'), ?)
     ON CONFLICT(key) DO UPDATE SET
       json = excluded.json,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`
  )
    .bind(`article:${slug}`, JSON.stringify(draft), user.login)
    .run();
  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'save_article', ?)`
  )
    .bind(user.login, slug)
    .run();
  return json({ ok: true, draft, mode: "cloudflare" });
}

async function getDraft(env, key, seedUrl) {
  const row = await env.DB.prepare(`SELECT json FROM content_drafts WHERE key = ?`)
    .bind(key)
    .first();
  if (row?.json) {
    return json(JSON.parse(row.json));
  }
  try {
    const res = await fetch(seedUrl, { cf: { cacheTtl: 60 } });
    if (res.ok) {
      const data = await res.json();
      return json(data);
    }
  } catch {
    /* fall through */
  }
  return json({ error: "seed_unavailable", key }, 503);
}

async function saveDraft(env, key, payload, user) {
  if (!payload || typeof payload !== "object") {
    return json({ error: "invalid_payload" }, 400);
  }
  if (key === "home") {
    const reviews = payload.latestReviews;
    if (!Array.isArray(reviews) || reviews.length !== 4) {
      return json({ error: "latestReviews_must_be_4" }, 400);
    }
  }
  if (key === "pins" && !Array.isArray(payload.pins)) {
    return json({ error: "pins_required" }, 400);
  }
  if (key === "products" && !Array.isArray(payload.hubCategories)) {
    return json({ error: "hubCategories_required" }, 400);
  }

  await env.DB.prepare(
    `INSERT INTO content_drafts (key, json, updated_at, updated_by)
     VALUES (?, ?, datetime('now'), ?)
     ON CONFLICT(key) DO UPDATE SET
       json = excluded.json,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`
  )
    .bind(key, JSON.stringify(payload), user.login)
    .run();

  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, ?, ?)`
  )
    .bind(user.login, "save_draft", key)
    .run();

  return json({
    ok: true,
    rendered: false,
    mode: "cloudflare",
    hint: "Cloud draft saved. Open Publish in Studio to push live HTML to GitHub Pages.",
  });
}

/**
 * Normalize article-card image URLs for Studio Home picker.
 * Never strip workers.dev /api/media hosts — that produced
 * pickora.shop/api/media/... which GitHub Pages cannot serve.
 */
function publicCatalogImage(img) {
  if (!img) return "";
  const raw = String(img).trim();
  const workerMedia =
    "https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/";

  if (/\/api\/media\/file\//i.test(raw)) {
    try {
      if (/^https?:\/\//i.test(raw)) {
        const u = new URL(raw);
        return workerMedia + u.pathname.replace(/^\/api\/media\/file\//i, "");
      }
    } catch {
      /* fall through */
    }
    const key = raw.replace(/^\/?api\/media\/file\//i, "");
    return workerMedia + key;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).pathname;
    } catch {
      return raw;
    }
  }
  return raw.startsWith("/") ? raw : "/" + raw;
}

async function handleArticles() {
  const res = await fetch("https://pickora.shop/articles/", {
    cf: { cacheTtl: 120 },
  });
  if (!res.ok) return json({ articles: [], error: "catalog_fetch_failed" }, 502);
  const text = await res.text();
  const blocks = [...text.matchAll(/<article class="pk-card"[^>]*>([\s\S]*?)<\/article>/gi)];
  const CATEGORY_MAP = {
    audio: "Consumer Electronics",
    electronics: "Consumer Electronics",
    mobile: "Consumer Electronics",
    kitchen: "Home & Kitchen",
    cleaning: "Home & Kitchen",
    "smart-home": "Home & Kitchen",
    home: "Home & Kitchen",
    fitness: "Fitness & Health",
    wearables: "Fitness & Health",
    pets: "Pet Supplies",
  };
  const articles = blocks.map((m) => {
    const block = m[1];
    const href = (block.match(/href="([^"]+)"/) || [])[1] || "";
    const img = (block.match(/<img[^>]+src="([^"]+)"/) || [])[1] || "";
    const alt = (block.match(/<img[^>]+alt="([^"]*)"/) || [])[1] || "";
    const title = stripTags((block.match(/class="pk-card-title">([\s\S]*?)<\/h3>/) || [])[1] || "");
    const excerpt = stripTags((block.match(/class="pk-card-excerpt">([\s\S]*?)<\/p>/) || [])[1] || "");
    const cats = ((block.match(/data-categories="([^"]*)"/) || [])[1] || "").split(/\s+/).filter(Boolean);
    let url = href.startsWith("http") ? new URL(href).pathname : href;
    if (url && !url.endsWith("/")) url += "/";
    const slug = url.replace(/^\/|\/$/g, "").split("/").pop() || "";
    let category = "Home & Kitchen";
    for (const cid of cats) {
      if (CATEGORY_MAP[cid]) {
        category = CATEGORY_MAP[cid];
        break;
      }
    }
    // Keep workers.dev /api/media absolute URLs — stripping the host turns them into
    // /api/media/... which GitHub Pages cannot serve (broken Latest Reviews on Home).
    // Prefer permanent /wp-content/uploads when the catalog already uses that path.
    let image = publicCatalogImage(img);
    return {
      slug,
      url,
      title,
      excerpt,
      category,
      image,
      imageAlt: alt || title,
    };
  });
  return json({ articles });
}

async function handleMediaUpload(request, env, user) {
  const body = await readJson(request);
  const filename = String(body.filename || "upload.jpg");
  const dataB64 = String(body.data || "");
  const preferred = String(body.preferredName || "").trim();
  if (!dataB64) return json({ error: "missing_data" }, 400);

  // JS String.split(sep, limit) does NOT mean "maxsplit" like Python —
  // split(",", 1) returns only the first segment, so [1] is undefined.
  const comma = dataB64.indexOf(",");
  const raw = comma >= 0 ? dataB64.slice(comma + 1) : dataB64;
  if (!raw) return json({ error: "missing_data" }, 400);
  // D1 max row ~1MB; base64 expands ~4/3 → keep under ~700k chars
  if (raw.length > 900_000) {
    return json(
      {
        error: "file_too_large",
        hint: "Max ~650KB after compress. Studio auto-compresses — try a smaller photo.",
      },
      400
    );
  }
  let bytes;
  try {
    bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  } catch {
    return json({ error: "bad_base64" }, 400);
  }

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const base = slugify(preferred || filename) || "upload";
  let ext = "jpg";
  let contentType = "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    ext = "png";
    contentType = "image/png";
  } else if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    ext = "jpg";
    contentType = "image/jpeg";
  } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) {
    ext = "webp";
    contentType = "image/webp";
  }
  const finalKey = `uploads/${yyyy}/${mm}/${base}.${ext}`;

  try {
    await env.DB.prepare(
      `INSERT INTO media_files (key, content_type, data_b64, bytes, uploaded_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         content_type = excluded.content_type,
         data_b64 = excluded.data_b64,
         bytes = excluded.bytes,
         uploaded_by = excluded.uploaded_by`
    )
      .bind(finalKey, contentType, raw, bytes.length, user.login)
      .run();
  } catch (err) {
    const msg = String(err?.message || err);
    if (/too large|max.*size|SQLITE_TOOBIG|string or blob too big/i.test(msg)) {
      return json(
        { error: "file_too_large", detail: msg, hint: "D1 row limit — compress more" },
        400
      );
    }
    if (/no such table: media_files/i.test(msg)) {
      return json(
        { error: "media_table_missing", detail: "Run schema.sql on D1", hint: msg },
        500
      );
    }
    return json({ error: "media_write_failed", detail: msg }, 500);
  }

  // Prefer permanent site path under wp-content/uploads (GitHub Pages)
  const siteRel = `/wp-content/uploads/${yyyy}/${mm}/${base}.${ext}`;
  const ghPath = `wp-content/uploads/${yyyy}/${mm}/${base}.${ext}`;
  let pathOut = `https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/${finalKey}`;
  let note = "Stored in D1; live path pending GitHub sync.";

  if (env.GITHUB_TOKEN) {
    try {
      const sha = await getFileSha(env, ghPath);
      await putBinaryFile(env, ghPath, raw, `media: upload ${ghPath}`, sha || undefined);
      pathOut = siteRel;
      note = "Uploaded to GitHub Pages path (wp-content/uploads).";
    } catch (err) {
      note = "D1 ok; GitHub sync failed: " + String(err?.message || err).slice(0, 120);
    }
  }

  try {
    await env.DB.prepare(
      `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'media_upload', ?)`
    )
      .bind(user.login, `${finalKey} → ${pathOut}`)
      .run();
  } catch {
    /* non-fatal */
  }

  return json({
    ok: true,
    path: pathOut,
    key: finalKey,
    bytes: bytes.length,
    note,
  });
}

async function handleMediaGet(pathname, env) {
  const key = decodeURIComponent(pathname.replace(/^\/api\/media\/file\//, ""));
  if (!key || key.includes("..")) return json({ error: "bad_key" }, 400);
  const row = await env.DB.prepare(
    `SELECT content_type, data_b64 FROM media_files WHERE key = ?`
  )
    .bind(key)
    .first();
  if (!row?.data_b64) return json({ error: "not_found" }, 404);
  const bytes = Uint8Array.from(atob(row.data_b64), (c) => c.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "Content-Type": row.content_type || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

async function recordSnapshot(env, module, detail, commits, user, payloadDraft) {
  const shas = Array.isArray(commits) ? commits.filter(Boolean) : [];
  if (!shas.length) return;
  const payloadJson = payloadDraft != null ? JSON.stringify(payloadDraft) : null;
  try {
    await env.DB.prepare(
      `INSERT INTO publish_snapshots (module, detail, commit_shas, created_by, payload_json)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(module, detail || "", JSON.stringify(shas), user.login, payloadJson)
      .run();
    // Keep global last 20 rows (UI shows 5)
    await env.DB.prepare(
      `DELETE FROM publish_snapshots WHERE id NOT IN (
         SELECT id FROM publish_snapshots ORDER BY id DESC LIMIT 20
       )`
    ).run();
  } catch {
    /* table may not exist yet until schema migrate */
  }
}

async function handlePublishModule(env, key, user, publisher) {
  if (!env.GITHUB_TOKEN) {
    return json(
      {
        error: "github_token_missing",
        hint: "Run: npx.cmd wrangler secret put GITHUB_TOKEN",
      },
      503
    );
  }
  const row = await env.DB.prepare(`SELECT json FROM content_drafts WHERE key = ?`)
    .bind(key)
    .first();
  if (!row?.json) return json({ error: "draft_not_found", key }, 404);
  const draft = JSON.parse(row.json);
  try {
    const result = await publisher(env, draft);
    await env.DB.prepare(
      `INSERT INTO audit_log (user_login, action, detail) VALUES (?, ?, ?)`
    )
      .bind(user.login, `publish_${key}`, key)
      .run();
    await recordSnapshot(env, key, key, result.commits, user, draft);
    return json(result);
  } catch (err) {
    return json({ error: "publish_failed", detail: String(err?.message || err) }, 500);
  }
}

async function handleSnapshotsList(env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, module, detail, commit_shas, created_at, created_by
       FROM publish_snapshots ORDER BY id DESC LIMIT 5`
    ).all();
    const snapshots = (results || []).map((r) => ({
      ...r,
      commit_shas: (() => {
        try {
          return JSON.parse(r.commit_shas);
        } catch {
          return [];
        }
      })(),
    }));
    return json({ snapshots });
  } catch {
    return json({
      snapshots: [],
      hint: "Run: npx.cmd wrangler d1 execute pickora-admin --remote --file=schema.sql",
    });
  }
}

async function handleRollback(env, body, user) {
  const id = Number(body.id || 0);
  if (!id) return json({ error: "id_required" }, 400);

  // Fetch snapshot; handle DBs that haven't run the payload_json migration yet
  let row;
  try {
    row = await env.DB.prepare(
      `SELECT id, module, detail, commit_shas, payload_json, created_at FROM publish_snapshots WHERE id = ?`
    )
      .bind(id)
      .first();
  } catch {
    // payload_json column missing — fall back to column-safe query
    row = await env.DB.prepare(
      `SELECT id, module, detail, commit_shas, created_at FROM publish_snapshots WHERE id = ?`
    )
      .bind(id)
      .first();
  }
  if (!row) return json({ error: "not_found" }, 404);

  const repo = env.GITHUB_REPO || "ivanvinitskiy23-dev/pickora-shop";
  let shas = [];
  try { shas = JSON.parse(row.commit_shas); } catch {}

  // Old snapshots without payload — return manual guidance
  if (!row.payload_json) {
    return json({
      ok: false,
      error: "no_payload",
      hint: "This snapshot predates auto-rollback. Use GitHub revert.",
      commits: shas.map((sha) => `https://github.com/${repo}/commit/${sha}`),
    });
  }

  let draft;
  try { draft = JSON.parse(row.payload_json); } catch {
    return json({ error: "bad_payload" }, 500);
  }

  const module = row.module; // 'home' | 'pins' | 'products' | 'article'
  const draftKey = module === "article" ? `article:${row.detail || ""}` : module;

  // 1. Restore draft to content_drafts
  await env.DB.prepare(
    `INSERT INTO content_drafts (key, json, updated_at, updated_by)
     VALUES (?, ?, datetime('now'), ?)
     ON CONFLICT(key) DO UPDATE SET
       json = excluded.json,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`
  )
    .bind(draftKey, JSON.stringify(draft), user.login)
    .run();

  // 2. Re-run matching publisher so live site reverts via new GitHub commits
  const publisherMap = {
    home: publishHomeDraft,
    pins: publishPinsDraft,
    products: publishProductsDraft,
    article: publishArticleDraft,
  };
  const publisher = publisherMap[module];
  if (!publisher) return json({ error: "unknown_module", module }, 400);

  if (!env.GITHUB_TOKEN) {
    return json({
      error: "github_token_missing",
      hint: "Draft restored to D1 but cannot re-publish without GITHUB_TOKEN",
    }, 503);
  }

  let result;
  try {
    result = await publisher(env, draft);
  } catch (err) {
    return json({ error: "republish_failed", detail: String(err?.message || err) }, 500);
  }

  // 3. Audit log rollback
  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'rollback', ?)`
  )
    .bind(user.login, `${module}:${row.detail || ""}:snapshot_${id}`)
    .run();

  // 4. Save new snapshot for the rollback publish
  await recordSnapshot(env, module, row.detail, result.commits || [], user, draft);

  // 5. Return ok + new commits
  return json({
    ok: true,
    module,
    detail: row.detail,
    commits: result.commits || [],
  });
}

async function handleStatus(env) {
  // Article drafts by status
  let artResults = [];
  try {
    const r = await env.DB.prepare(
      `SELECT json FROM content_drafts WHERE key LIKE 'article:%'`
    ).all();
    artResults = r.results || [];
  } catch {}

  const statusCounts = { draft: 0, seo_ready: 0, published: 0, other: 0 };
  for (const r of artResults) {
    try {
      const d = JSON.parse(r.json);
      const s = d.status || "draft";
      if (s in statusCounts) statusCounts[s]++;
      else statusCounts.other++;
    } catch {}
  }

  // Module drafts existence
  const moduleDrafts = {};
  for (const k of ["home", "pins", "products"]) {
    try {
      const row = await env.DB.prepare(
        `SELECT key FROM content_drafts WHERE key = ?`
      ).bind(k).first();
      moduleDrafts[k] = !!row;
    } catch { moduleDrafts[k] = false; }
  }

  // Last 5 audit actions
  let recentAudit = [];
  try {
    const r = await env.DB.prepare(
      `SELECT id, user_login, action, detail, created_at FROM audit_log ORDER BY id DESC LIMIT 5`
    ).all();
    recentAudit = r.results || [];
  } catch {}

  // Last 5 snapshots
  let recentSnapshots = [];
  try {
    const r = await env.DB.prepare(
      `SELECT id, module, detail, commit_shas, created_at, created_by FROM publish_snapshots ORDER BY id DESC LIMIT 5`
    ).all();
    recentSnapshots = (r.results || []).map((s) => ({
      ...s,
      commit_shas: (() => { try { return JSON.parse(s.commit_shas); } catch { return []; } })(),
    }));
  } catch {}

  return json({
    articleCounts: statusCounts,
    totalArticles: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    moduleDrafts,
    recentAudit,
    recentSnapshots,
  });
}

async function handleMediaList(env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT key, content_type, bytes, uploaded_by, created_at
       FROM media_files ORDER BY created_at DESC LIMIT 200`
    ).all();
    return json({ files: results || [] });
  } catch (err) {
    return json({ files: [], error: String(err?.message || err) });
  }
}

async function handleMediaDelete(pathname, env, user) {
  const key = decodeURIComponent(pathname.replace(/^\/api\/media\/file\//, ""));
  if (!key || key.includes("..")) return json({ error: "bad_key" }, 400);
  await env.DB.prepare(`DELETE FROM media_files WHERE key = ?`).bind(key).run();
  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'media_delete', ?)`
  )
    .bind(user.login, key)
    .run();
  return json({ ok: true, key });
}

async function normalizePreviewDraft(payload) {
  const slug = String(payload?.slug || "")
    .trim()
    .toLowerCase() || "preview-draft";
  const draft = {
    ...payload,
    slug,
    canonical: `https://pickora.shop/${slug}/`,
    status: payload?.status || "draft",
  };
  if (Array.isArray(draft.blocks) && draft.blocks.length) {
    draft.bodyHtml = compileBlocksToHtml(draft.blocks);
    const fromBlocks = [];
    draft.blocks.forEach((b) => {
      if (b && (b.type === "product" || b.type === "cta")) {
        (b.links || []).forEach((l) => {
          const u = String(l?.url || "").trim();
          if (u && !fromBlocks.includes(u)) fromBlocks.push(u);
        });
      }
    });
    const existing = Array.isArray(draft.affiliateLinks) ? draft.affiliateLinks : [];
    draft.affiliateLinks = [
      ...new Set([...existing, ...fromBlocks].map((u) => String(u).trim()).filter(Boolean)),
    ];
  }
  // Force Articles filter URL (never product hubs) before HTML build
  draft.hubUrl = resolveArticlesHubUrl(draft);
  return draft;
}

/**
 * Offline category preview — real live/GitHub page chrome + same product cards as Publish.
 * Body: { hubId, draft?: { hubCategories, categoryProducts } }
 * If draft omitted, uses D1 content_drafts key "products".
 */
async function handlePreviewProducts(env, body, user) {
  if (!body || typeof body !== "object") {
    return json({ error: "invalid_payload" }, 400);
  }
  const hubId = String(body.hubId || "").trim().replace(/^\/+|\/+$/g, "");
  if (!hubId) return json({ error: "hub_id_required" }, 400);

  let draft = body.draft;
  if (!draft || typeof draft !== "object") {
    const row = await env.DB.prepare(`SELECT json FROM content_drafts WHERE key = ?`)
      .bind("products")
      .first();
    if (!row?.json) return json({ error: "draft_not_found" }, 404);
    try {
      draft = JSON.parse(row.json);
    } catch {
      return json({ error: "draft_corrupt" }, 500);
    }
  }

  const hubs = Array.isArray(draft.hubCategories) ? draft.hubCategories : [];
  const hub = hubs.find((h) => h && h.id === hubId) || { id: hubId, title: hubId };
  const products = (draft.categoryProducts && draft.categoryProducts[hubId]) || [];
  if (!Array.isArray(products) || products.length === 0) {
    return json(
      {
        error: "no_products",
        hint: "Add at least one product in this hub before offline preview",
      },
      400
    );
  }

  try {
    const tpl = await loadCategoryTemplateHtml(env, hubId);
    let templateHtml = tpl.html;
    if (tpl.stub && hub.title) {
      const safeTitle = String(hub.title).replace(/</g, "");
      templateHtml = templateHtml.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${safeTitle} – Pickora</title>`
      );
    }
    const html = buildCategoryPreviewHtml(templateHtml, products, {
      hubId,
      title: hub.title || hubId,
      previewBy: user?.login || "studio",
    });
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Pickora-Preview-Source": tpl.source + (tpl.stub ? "+stub" : ""),
      },
    });
  } catch (err) {
    return json(
      {
        error: "preview_failed",
        detail: String(err?.message || err),
      },
      500
    );
  }
}

/**
 * Live-identical article HTML preview — same renderer as Publish, no GitHub write.
 */
async function handlePreviewArticle(body, user) {
  if (!body || typeof body !== "object") {
    return json({ error: "invalid_payload" }, 400);
  }
  const draft = await normalizePreviewDraft(body);
  if (!draft.title && !draft.h1 && !(draft.blocks || []).length && !draft.bodyHtml) {
    return json({ error: "empty_draft", hint: "Add a title or blocks first" }, 400);
  }
  const html = buildArticlePage(draft, {
    preview: true,
    previewBy: user?.login || "studio",
  });
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

async function handlePublishArticle(env, body, user) {
  if (!env.GITHUB_TOKEN) {
    return json(
      {
        error: "github_token_missing",
        hint: "Run: npx.cmd wrangler secret put GITHUB_TOKEN (repo scope for pickora-shop)",
      },
      503
    );
  }
  const slug = String(body.slug || "").trim();
  if (!slug) return json({ error: "slug_required" }, 400);
  const row = await env.DB.prepare(`SELECT json FROM content_drafts WHERE key = ?`)
    .bind(`article:${slug}`)
    .first();
  if (!row?.json) return json({ error: "draft_not_found" }, 404);
  const draft = JSON.parse(row.json);
  if (draft.status !== "seo_ready" && draft.status !== "published") {
    return json(
      { error: "not_seo_ready", hint: "Mark SEO ready in Articles wizard first" },
      400
    );
  }
  const gate = validateArticleDraft(draft);
  if (!gate.ok) {
    return json(
      { error: "seo_gate_failed", blockers: gate.blockers, warnings: gate.warnings },
      400
    );
  }
  try {
    const result = await publishArticleDraft(env, draft);
    draft.status = "published";
    draft.publishedAt = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO content_drafts (key, json, updated_at, updated_by)
       VALUES (?, ?, datetime('now'), ?)
       ON CONFLICT(key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
    )
      .bind(`article:${slug}`, JSON.stringify(draft), user.login)
      .run();
    await env.DB.prepare(
      `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'publish_article', ?)`
    )
      .bind(user.login, slug)
      .run();
    await recordSnapshot(env, "article", slug, result.commits, user, draft);
    return json(result);
  } catch (err) {
    return json({ error: "publish_failed", detail: String(err?.message || err) }, 500);
  }
}

async function handleAuditList(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, user_login, action, detail, created_at FROM audit_log ORDER BY id DESC LIMIT 50`
  ).all();
  return json({ entries: results || [] });
}

async function handleLinkCheck(body) {
  const links = Array.isArray(body.links) ? body.links : [];
  const out = [];
  for (const raw of links.slice(0, 20)) {
    const url = String(raw || "").trim();
    if (!url) continue;
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        cf: { cacheTtl: 0 },
      });
      out.push({ url, ok: res.ok, status: res.status });
    } catch (err) {
      out.push({ url, ok: false, status: 0, error: String(err?.message || err) });
    }
  }
  return json({ results: out });
}

async function handleLogin(request, env) {
  // MIGRATION NOTE: invited admins store passwords as PBKDF2 hashes (format
  //   "pbkdf2:sha256:<iters>:<salt_hex>:<derived_hex>").
  // The owner account continues to use OWNER_LOGIN + OWNER_PASSWORD env secrets;
  // its password_hash row is the sentinel "secret-backed" (never used for crypto).
  // To add a new invited admin: POST /api/team/invite (owner-only).
  if (!env.OWNER_LOGIN || !env.OWNER_PASSWORD) {
    return json({ error: "owner_secrets_missing" }, 503);
  }
  if (!env.DB) return json({ error: "d1_missing" }, 503);

  const body = await readJson(request);
  const login = String(body.login || "").trim();
  const password = String(body.password || "");
  // Secrets sometimes get a trailing newline from `wrangler secret put` paste
  const ownerLogin = String(env.OWNER_LOGIN || "").trim();
  const ownerPassword = String(env.OWNER_PASSWORD || "").trim();

  // ── Path 1: Owner via environment secrets ────────────────────────────────
  if (timingSafeEqual(login, ownerLogin) && timingSafeEqual(password, ownerPassword)) {
    const token = cryptoRandomToken();
    const expires = new Date(Date.now() + SESSION_TTL_SEC * 1000).toISOString();

    await env.DB.prepare(
      `INSERT INTO users (login, password_hash, role, is_owner)
       VALUES (?, 'secret-backed', 'admin', 1)
       ON CONFLICT(login) DO UPDATE SET is_owner = 1`
    )
      .bind(ownerLogin)
      .run();

    const userRow = await env.DB.prepare(`SELECT id FROM users WHERE login = ?`)
      .bind(ownerLogin)
      .first();

    if (!userRow?.id) {
      return json({ error: "owner_user_missing" }, 500);
    }

    await env.DB.prepare(
      `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
    )
      .bind(token, userRow.id, expires)
      .run();

    await env.DB.prepare(
      `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'login', 'cloudflare')`
    )
      .bind(ownerLogin)
      .run();

    return json({ token, user: { login: ownerLogin, role: "admin", owner: true } });
  }

  // ── Path 2: Invited admin via D1 users table (PBKDF2 password) ──────────
  const dbUser = await env.DB.prepare(
    `SELECT id, login, password_hash, role, is_owner FROM users WHERE login = ?`
  )
    .bind(login)
    .first();

  // Reject sentinel accounts (owner row) from this path
  if (
    !dbUser ||
    dbUser.password_hash === "secret-backed" ||
    !(await verifyPassword(password, dbUser.password_hash))
  ) {
    return json({ error: "invalid_credentials" }, 401);
  }

  const token = cryptoRandomToken();
  const expires = new Date(Date.now() + SESSION_TTL_SEC * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
  )
    .bind(token, dbUser.id, expires)
    .run();

  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'login', 'cloudflare')`
  )
    .bind(login)
    .run();

  return json({
    token,
    user: { login: dbUser.login, role: dbUser.role || "admin", owner: !!dbUser.is_owner },
  });
}

/* ── Team management ──────────────────────────────────────────────────── */

async function handleTeamList(env) {
  const { results } = await env.DB.prepare(
    `SELECT login, role, is_owner, created_at FROM users ORDER BY is_owner DESC, created_at ASC`
  ).all();
  // Never expose password_hash
  return json({ admins: results || [] });
}

async function handleTeamInvite(env, body) {
  const login = String(body.login || "").trim().toLowerCase();
  const password = String(body.password || "");
  const role = String(body.role || "admin").trim();

  if (!login || !/^[a-z0-9_.-]{2,32}$/.test(login)) {
    return json({ error: "invalid_login", hint: "2–32 chars, lowercase a-z 0-9 _ . -" }, 400);
  }
  if (password.length < 8) {
    return json({ error: "password_too_short", hint: "Min 8 characters" }, 400);
  }
  if (!["admin"].includes(role)) {
    return json({ error: "invalid_role", hint: "Allowed roles: admin" }, 400);
  }

  const existing = await env.DB.prepare(`SELECT login FROM users WHERE login = ?`)
    .bind(login)
    .first();
  if (existing) {
    return json({ error: "login_taken" }, 409);
  }

  const hash = await hashPassword(password);
  await env.DB.prepare(
    `INSERT INTO users (login, password_hash, role, is_owner) VALUES (?, ?, ?, 0)`
  )
    .bind(login, hash, role)
    .run();

  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'team_invite', ?)`
  )
    .bind(login, role)
    .run();

  return json({ ok: true, login, role });
}

async function handleTeamRemove(env, body) {
  const login = String(body.login || "").trim();
  if (!login) return json({ error: "login_required" }, 400);

  // Cannot remove the owner secret account or any is_owner=1 row
  if (login === env.OWNER_LOGIN) {
    return json({ error: "cannot_remove_owner_secret" }, 403);
  }
  const row = await env.DB.prepare(`SELECT is_owner FROM users WHERE login = ?`)
    .bind(login)
    .first();
  if (!row) return json({ error: "not_found" }, 404);
  if (row.is_owner) return json({ error: "cannot_remove_owner" }, 403);

  // CASCADE deletes their sessions too
  await env.DB.prepare(`DELETE FROM users WHERE login = ? AND is_owner = 0`)
    .bind(login)
    .run();

  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'team_remove', ?)`
  )
    .bind(login, login)
    .run();

  return json({ ok: true, removed: login });
}

/* ── Password hashing (PBKDF2-SHA-256, 100 000 iterations) ─────────────── */
// Format stored in users.password_hash: "pbkdf2:sha256:<iters>:<salt_hex>:<derived_hex>"

async function hashPassword(password) {
  const enc = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = [...saltBytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: 100_000 },
    keyMat,
    256
  );
  const hex = [...new Uint8Array(derived)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:sha256:100000:${salt}:${hex}`;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith("pbkdf2:sha256:")) return false;
  const parts = stored.split(":");
  if (parts.length !== 5) return false;
  const [, , iterStr, saltHex, expectedHex] = parts;
  const iterations = parseInt(iterStr, 10);
  if (!iterations || isNaN(iterations)) return false;
  const saltBytes = new Uint8Array(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)));
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
    keyMat,
    256
  );
  const hex = [...new Uint8Array(derived)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(hex, expectedHex);
}

/* ── Owner check helper ─────────────────────────────────────────────────── */
function requireOwner(user, env) {
  if (!user) return false;
  // owner if they logged in via OWNER_LOGIN secret OR is_owner flag set in DB
  return user.owner || user.login === env.OWNER_LOGIN;
}

async function handleLogout(request, env) {
  const token = bearer(request);
  if (token && env.DB) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
  }
  return json({ ok: true });
}

async function handleMe(request, env) {
  const user = await userFromToken(request, env);
  if (!user) return json({ error: "unauthorized" }, 401);
  return json({ user });
}

async function userFromToken(request, env) {
  const token = bearer(request);
  if (!token || !env.DB) return null;
  const row = await env.DB.prepare(
    `SELECT s.token, s.expires_at, u.login, u.role, u.is_owner
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`
  )
    .bind(token)
    .first();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
    return null;
  }
  return {
    login: row.login,
    role: row.role || "admin",
    owner: !!row.is_owner,
  };
}

function bearer(request) {
  const auth = request.headers.get("Authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function cryptoRandomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const aa = enc.encode(String(a));
  const bb = enc.encode(String(b));
  if (aa.length !== bb.length) {
    let x = 0;
    const n = Math.max(aa.length, bb.length);
    for (let i = 0; i < n; i++) x |= (aa[i] || 0) ^ (bb[i] || 0);
    return false;
  }
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa[i] ^ bb[i];
  return out === 0;
}

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function stripTags(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

const CORS_ALLOWED = new Set([
  "https://pickora.shop",
  "https://www.pickora.shop",
  "http://127.0.0.1:8765",
  "http://localhost:8765",
  "http://127.0.0.1:8799",
  "http://localhost:8799",
]);

function corsGuard(request) {
  const origin = request.headers.get("Origin") || "";
  const method = (request.method || "GET").toUpperCase();
  if (!origin) return null;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return null;
  if (CORS_ALLOWED.has(origin)) return null;
  return new Response(JSON.stringify({ error: "cors_origin_denied" }), {
    status: 403,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      Vary: "Origin",
    },
  });
}

function cors(res, request) {
  const origin = request.headers.get("Origin") || "";
  const headers = new Headers(res.headers);
  if (CORS_ALLOWED.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  headers.set("Vary", "Origin");
  return new Response(res.body, { status: res.status, headers });
}
