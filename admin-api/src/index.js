/**
 * Pickora Admin API — Cloudflare Worker
 * Auth + cloud drafts (D1) + media (R2). Site UI: https://pickora.shop/pk-studio/
 */
const SESSION_TTL_SEC = 60 * 60 * 12;
const RAW_CONTENT =
  "https://raw.githubusercontent.com/ivanvinitskiy23-dev/pickora-shop/main/content";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), request);
    }

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
          }),
          request
        );
      }

      if (url.pathname.startsWith("/api/media/file/")) {
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
        return cors(json(validateArticleDraftLite(await readJson(request))), request);
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
  if (draft.status === "seo_ready") {
    // Soft server-side re-check of critical fields
    const chips = Array.isArray(draft.chips) ? draft.chips : [];
    const aff = (draft.affiliateLinks || []).filter((u) =>
      /^https:\/\/amzn\.to\/[A-Za-z0-9]+/.test(String(u || ""))
    );
    if (!draft.coverImage || chips.length < 1 || aff.length < 1) {
      return json({ error: "seo_gate_failed", hint: "Run SEO gate in Studio first" }, 400);
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
    hint: "Saved cloud draft. Live site HTML updates after Publish (next phase).",
  });
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
    let image = img;
    if (image.startsWith("http")) {
      try {
        image = new URL(image).pathname;
      } catch {
        /* keep */
      }
    }
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

  const raw = dataB64.includes(",") ? dataB64.split(",", 1)[1] : dataB64;
  // ~1.4MB decoded limit for D1 row comfort
  if (raw.length > 1_800_000) {
    return json({ error: "file_too_large", hint: "Max ~1.2MB for cloud upload" }, 400);
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
  } else if (bytes[0] === 0x52 && bytes[1] === 0x49) {
    ext = "webp";
    contentType = "image/webp";
  }
  const finalKey = `uploads/${yyyy}/${mm}/${base}.${ext}`;

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

  const abs = `https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/${finalKey}`;
  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'media_upload', ?)`
  )
    .bind(user.login, finalKey)
    .run();

  return json({
    ok: true,
    path: abs,
    key: finalKey,
    bytes: bytes.length,
    note: "Cloud media in D1 (temporary). Enable R2 later for larger files.",
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

async function handleLogin(request, env) {
  if (!env.OWNER_LOGIN || !env.OWNER_PASSWORD) {
    return json({ error: "owner_secrets_missing" }, 503);
  }
  if (!env.DB) return json({ error: "d1_missing" }, 503);

  const body = await readJson(request);
  const login = String(body.login || "").trim();
  const password = String(body.password || "");
  if (!timingSafeEqual(login, env.OWNER_LOGIN) || !timingSafeEqual(password, env.OWNER_PASSWORD)) {
    return json({ error: "invalid_credentials" }, 401);
  }

  const token = cryptoRandomToken();
  const expires = new Date(Date.now() + SESSION_TTL_SEC * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO users (login, password_hash, role, is_owner)
     VALUES (?, ?, 'admin', 1)
     ON CONFLICT(login) DO UPDATE SET is_owner = 1`
  )
    .bind(env.OWNER_LOGIN, "secret-backed")
    .run();

  const userRow = await env.DB.prepare(`SELECT id FROM users WHERE login = ?`)
    .bind(env.OWNER_LOGIN)
    .first();

  await env.DB.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
  )
    .bind(token, userRow.id, expires)
    .run();

  await env.DB.prepare(
    `INSERT INTO audit_log (user_login, action, detail) VALUES (?, 'login', 'cloudflare')`
  )
    .bind(env.OWNER_LOGIN)
    .run();

  return json({
    token,
    user: { login: env.OWNER_LOGIN, role: "admin", owner: true },
  });
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

function validateArticleDraftLite(d) {
  const blockers = [];
  const warnings = [];
  const draft = d || {};
  const slug = String(draft.slug || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    blockers.push({ id: "slug", label: "Slug must be kebab-case" });
  }
  const title = String(draft.title || "").trim();
  if (title.length < 25 || title.length > 70) {
    blockers.push({ id: "title_len", label: "Title 25–70 chars" });
  }
  const meta = String(draft.metaDescription || "").trim();
  if (meta.length < 110 || meta.length > 170) {
    blockers.push({ id: "meta_len", label: "Meta 110–170 chars" });
  }
  const chips = Array.isArray(draft.chips) ? draft.chips : [];
  if (chips.length < 1 || chips.length > 3) {
    blockers.push({ id: "chips_count", label: "1–3 chips required" });
  }
  if (!draft.coverImage) blockers.push({ id: "cover", label: "Cover required" });
  const aff = (draft.affiliateLinks || []).filter((u) =>
    /^https:\/\/amzn\.to\/[A-Za-z0-9]+/.test(String(u || ""))
  );
  if (!aff.length) blockers.push({ id: "affiliate", label: "Need real amzn.to link" });
  const body = String(draft.bodyHtml || "");
  if (/AggregateRating/i.test(body) || /TODO/i.test(body)) {
    blockers.push({ id: "banned", label: "Banned pattern in body" });
  }
  return { ok: blockers.length === 0, blockers, warnings };
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

function cors(res, request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = new Set([
    "https://pickora.shop",
    "https://www.pickora.shop",
    "http://127.0.0.1:8765",
    "http://localhost:8765",
  ]);
  const headers = new Headers(res.headers);
  if (allowed.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Vary", "Origin");
  return new Response(res.body, { status: res.status, headers });
}
