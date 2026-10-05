/** Pickora Studio — Publish / SEO links / Team (Phase 3–4) */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  function t(key) {
    const lang = localStorage.getItem("pk_studio_lang") || "ru";
    const pack = window.PK_I18N[lang] || window.PK_I18N.ru;
    return pack[key] || window.PK_I18N.en[key] || key;
  }

  function authHeaders() {
    const s = window.PK_AUTH.getSession();
    const h = { "Content-Type": "application/json" };
    if (s?.token) h.Authorization = "Bearer " + s.token;
    return h;
  }

  /** Ops fetch with shared 401 → logout (A-30) */
  function apiFetch(path, opts = {}) {
    const headers = { ...authHeaders(), ...(opts.headers || {}) };
    return window.PK_AUTH.apiFetch(path, { ...opts, headers });
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setPill(id, msg, kind) {
    const el = $(id);
    if (!el) return;
    el.classList.remove("pk-hidden", "ok", "warn");
    el.textContent = msg;
    if (kind) el.classList.add(kind);
  }

  /* —— Publish —— */
  async function loadPublish() {
    setPill("#publish-status", t("loading"), null);
    const wrap = $("#publish-list");
    if (!wrap) return;

    wrap.className = "publish-grid";
    wrap.style.gridTemplateColumns = "1fr";

    /* ── Module cards ────────────────────────────────────────────── */
    const modCardsHtml = ["home", "pins", "products"]
      .map((mod) => {
        const name = escapeHtml(t("pubMod_" + mod));
        const hint = escapeHtml(t("pubModHint_" + mod));
        const cta = escapeHtml(t("btnPublishNow"));
        return (
          '<div class="publish-card publish-card__mod">' +
            '<div class="publish-card__head">' +
              "<h3>" + name + "</h3>" +
              '<span class="pill">draft\u2192live</span>' +
            "</div>" +
            '<p class="publish-card__hint">' + hint + "</p>" +
            '<div class="publish-card__actions">' +
              '<button type="button" class="btn btn-ghost btn-sm"' +
              ' data-dry-run-mod="' + mod + '">' +
              escapeHtml(t("btnDryRun")) +
              "</button>" +
              '<button type="button" class="btn btn-primary btn-sm"' +
              ' data-publish-mod="' + mod + '">' +
              cta + "</button>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    const modulesHtml =
      '<h3 class="ops-section-title">' +
      escapeHtml(t("publishModulesTitle")) +
      "</h3>" +
      '<div class="publish-grid">' +
      modCardsHtml +
      "</div>";

    /* ── Article cards (seo_ready + published) ───────────────────── */
    let articlesHtml = "";
    try {
      const res = await apiFetch("/api/content/articles",{
      });
      const data = await res.json();
      const ready = (data.drafts || []).filter(
        (d) => d.status === "seo_ready" || d.status === "published"
      );

      const artLabel =
        '<h3 class="ops-section-title">' +
        escapeHtml(t("publishArticlesTitle")) +
        "</h3>";

      if (ready.length) {
        const rowsHtml = ready
          .map((d) => {
            const slug = escapeHtml(d.slug);
            const title = escapeHtml(d.title || d.slug);
            const st = escapeHtml(d.status || "");
            const pillCls = d.status === "published" ? "pill ok" : "pill";
            const cta = escapeHtml(t("btnPublishNow"));
            return (
              '<div class="publish-card publish-card__article">' +
                '<div class="publish-card__head">' +
                  "<h3>" + title + "</h3>" +
                  '<span class="' + pillCls + '">' + st + "</span>" +
                "</div>" +
                '<p class="publish-card__hint">/' +
                slug +
                "/ \u00b7 " +
                escapeHtml(d.updatedAt || "") +
                "</p>" +
                '<div class="publish-card__actions">' +
                  '<button type="button" class="btn btn-primary btn-sm"' +
                  ' data-publish-slug="' +
                  slug +
                  '">' +
                  cta +
                  "</button>" +
                "</div>" +
              "</div>"
            );
          })
          .join("");
        articlesHtml =
          artLabel + '<div class="publish-grid">' + rowsHtml + "</div>";
      } else {
        articlesHtml =
          artLabel +
          '<p class="hint">' +
          escapeHtml(t("publishEmpty")) +
          "</p>";
      }

      setPill(
        "#publish-status",
        t("publishReadyCount").replace("{n}", String(ready.length)),
        "ok"
      );
    } catch (err) {
      articlesHtml += '<p class="hint">' + escapeHtml(err.message) + "</p>";
      setPill("#publish-status", err.message, "warn");
    }

    wrap.innerHTML = modulesHtml + articlesHtml;

    wrap.querySelectorAll("[data-dry-run-mod]").forEach((btn) =>
      btn.addEventListener("click", () =>
        dryRunModule(btn.getAttribute("data-dry-run-mod"), btn)
      )
    );
    wrap.querySelectorAll("[data-publish-mod]").forEach((btn) =>
      btn.addEventListener("click", () =>
        publishModule(btn.getAttribute("data-publish-mod"), btn)
      )
    );
    wrap.querySelectorAll("[data-publish-slug]").forEach((btn) =>
      btn.addEventListener("click", () =>
        publishSlug(btn.getAttribute("data-publish-slug"), btn)
      )
    );

    await loadSnapshots();
  }

  async function runPublishDryRun(mod, publishBody) {
    const res = await apiFetch("/api/publish/" + mod + "/dry-run", {
      method: "POST",
      body: JSON.stringify(publishBody || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.error || t("publishFail"));
    }
    return data;
  }

  async function dryRunModule(mod, btn) {
    if (!mod) return;
    if (btn) btn.disabled = true;
    try {
      setPill("#publish-status", t("publishLoadingDraft"), null);
      const publishBody = {};
      if (mod === "products") {
        const hubId = window.prompt(t("publishHubOnlyPrompt"), "");
        if (hubId === null) return;
        if (String(hubId).trim()) publishBody.hubId = String(hubId).trim();
      }
      setPill("#publish-status", t("publishDryRunning"), null);
      const dry = await runPublishDryRun(mod, publishBody);
      const files = dry.files || dry.urls || [];
      setPill(
        "#publish-status",
        (t("publishDryRunOk") || "Dry-run OK ({n} files)").replace("{n}", String(files.length)) +
          (dry.note ? " \u2014 " + dry.note : ""),
        "ok"
      );
      if (files.length) {
        alert((t("publishDryRunFiles") || "Files:") + "\n" + files.join("\n"));
      }
    } catch (err) {
      setPill("#publish-status", t("publishFail") + ": " + err.message, "warn");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function publishModule(mod, btn) {
    if (!mod) return;
    // A-04 + D1: preflight + dry-run file list before publish
    try {
      setPill("#publish-status", t("publishLoadingDraft") || "Loading draft…", null);
      const draftRes = await apiFetch("/api/content/" + mod, {});
      const draft = await draftRes.json().catch(() => ({}));
      if (!draftRes.ok) {
        setPill("#publish-status", draft.error || t("publishFail"), "warn");
        return;
      }
      const checks = [];
      if (mod === "home") {
        const picks = draft.topPicks?.picks || [];
        const reviews = draft.latestReviews || draft.reviews || [];
        checks.push(`Top picks: ${picks.length}`);
        checks.push(`Latest reviews: ${reviews.length}`);
        const badBuy = picks.filter((p) => p.amazonUrl && !/^https?:\/\//i.test(String(p.amazonUrl)));
        if (badBuy.length) checks.push(`⚠ bad amazonUrl: ${badBuy.length}`);
      } else if (mod === "pins") {
        const products = draft.pins || [];
        checks.push(`Pin cards: ${products.length}`);
        const noLink = products.filter((pin) =>
          (pin.products || []).every(
            (p) => !(p.links || []).some((l) => l && l.url) && !p.amazonUrl && !p.url
          )
        );
        if (noLink.length) checks.push(`⚠ pins weak links: ${noLink.length}`);
      } else if (mod === "products") {
        const hubs = draft.hubCategories || [];
        const cp = draft.categoryProducts || {};
        checks.push(`Hubs: ${hubs.length}`);
        const empty = hubs.filter((h) => !(cp[h.id] || []).length);
        if (empty.length) checks.push(`⚠ hubs with 0 products: ${empty.map((h) => h.id).join(", ")}`);
      }

      setPill("#publish-status", t("publishDryRunning") || "Dry-run…", null);
      const publishBody = {};
      if (mod === "products") {
        const hubId = window.prompt(
          t("publishHubOnlyPrompt") ||
            "Hub-only publish? Enter hub id (e.g. home-kitchen) or leave empty for all:",
          ""
        );
        if (hubId === null) return; // cancelled
        if (String(hubId).trim()) publishBody.hubId = String(hubId).trim();
      }

      const dry = await runPublishDryRun(mod, publishBody);
      const fileList = dry.files || dry.urls || [];
      const files = fileList.join("\n");
      const msg =
        (t("publishPreflightConfirm") || "Publish {mod}?\n\n{checks}")
          .replace("{mod}", mod)
          .replace("{checks}", checks.join("\n")) +
        "\n\n" +
        (t("publishDryRunFiles") || "Files:") +
        "\n" +
        files +
        (dry.note ? "\n\n" + dry.note : "");
      if (!confirm(msg)) return;

      if (btn) btn.disabled = true;
      setPill("#publish-status", t("publishing"), null);
      const res = await apiFetch("/api/publish/" + mod, {
        method: "POST",
        body: JSON.stringify(publishBody),
      });
      const data = await res.json();
      if (!res.ok) {
        setPill(
          "#publish-status",
          data.error === "github_token_missing"
            ? t("publishNeedToken")
            : data.detail || data.error || t("publishFail"),
          "warn"
        );
        return;
      }
      setPill(
        "#publish-status",
        t("publishModOk").replace("{mod}", mod) + (data.note ? " \u2014 " + data.note : ""),
        "ok"
      );
      await loadPublish();
      await loadAuditInto("#publish-audit");
    } catch (err) {
      setPill("#publish-status", t("publishFail") + ": " + err.message, "warn");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function publishSlug(slug, btn) {
    if (!slug) return;
    if (btn) btn.disabled = true;
    setPill("#publish-status", t("publishing"), null);
    try {
      const res = await apiFetch("/api/publish/article",{
        method: "POST",
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error === "github_token_missing"
            ? t("publishNeedToken")
            : data.detail || data.error || t("publishFail");
        setPill("#publish-status", msg, "warn");
        return;
      }
      setPill(
        "#publish-status",
        t("publishOk").replace("{slug}", slug) +
          (data.note ? " \u2014 " + data.note : ""),
        "ok"
      );
      await loadPublish();
      await loadAuditInto("#publish-audit");
    } catch (err) {
      setPill("#publish-status", t("publishFail") + ": " + err.message, "warn");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function loadSnapshots() {
    const box = $("#publish-snapshots");
    if (!box) return;
    try {
      const res = await apiFetch("/api/publish/snapshots",{
      });
      const data = await res.json();
      const rows = data.snapshots || [];
      if (!rows.length) {
        box.innerHTML = '<p class="hint">' + escapeHtml(t("snapshotsEmpty")) + "</p>";
        return;
      }
      const cta = escapeHtml(t("btnRollback"));
      box.innerHTML =
        '<div class="snapshot-list">' +
        rows
          .map((s) => {
            const label =
              "#" +
              s.id +
              " \u00b7 " +
              escapeHtml(s.module) +
              (s.detail ? " \u2014 " + escapeHtml(s.detail) : "");
            return (
              '<div class="snapshot-row">' +
                '<div class="snapshot-row__meta">' +
                  '<span class="snapshot-row__label">' +
                  label +
                  "</span>" +
                  '<span class="snapshot-row__ts">' +
                  escapeHtml(s.created_at || "") +
                  "</span>" +
                "</div>" +
                '<div class="snapshot-row__actions">' +
                  '<button type="button" class="btn btn-primary btn-sm"' +
                  ' data-rollback-id="' +
                  s.id +
                  '">' +
                  cta +
                  "</button>" +
                "</div>" +
              "</div>"
            );
          })
          .join("") +
        "</div>";
      box.querySelectorAll("[data-rollback-id]").forEach((btn) => {
        btn.addEventListener("click", () =>
          doRollback(Number(btn.getAttribute("data-rollback-id")), btn)
        );
      });
    } catch (err) {
      box.innerHTML = '<p class="hint">' + escapeHtml(err.message) + "</p>";
    }
  }

  async function doRollback(id, btn) {
    if (!id) return;
    if (!confirm(t("confirmRollback"))) return;
    if (btn) btn.disabled = true;
    setPill("#publish-status", t("rollbackInProgress"), null);
    try {
      const res = await apiFetch("/api/publish/rollback",{
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        const links = (data.commits || []).join(" \u00b7 ");
        setPill(
          "#publish-status",
          (data.hint || data.detail || data.error || t("rollbackFail")) +
            (links ? " " + links : ""),
          "warn"
        );
        return;
      }
      setPill(
        "#publish-status",
        t("rollbackOk").replace("{mod}", data.module || "") +
          (data.note ? " \u2014 " + data.note : ""),
        "ok"
      );
      await loadPublish();
      await loadAuditInto("#publish-audit");
    } catch (err) {
      setPill("#publish-status", t("rollbackFail") + ": " + err.message, "warn");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /* —— Status digest —— */
  async function loadStatus() {
    const box = $("#status-content");
    setPill("#status-status", t("loading"), null);
    try {
      const res = await apiFetch("/api/status",{
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "status_failed");
      if (!box) return;

      const ac = data.articleCounts || {};
      const md = data.moduleDrafts || {};

      const countsHtml = `
        <div class="review-card panel" style="margin-bottom:12px">
          <h3 style="margin-bottom:10px">${escapeHtml(t("statusArticlesTitle"))}</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <span class="pill ok">${escapeHtml(t("statusPublished"))}: ${ac.published || 0}</span>
            <span class="pill">${escapeHtml(t("statusSeoReady"))}: ${ac.seo_ready || 0}</span>
            <span class="pill warn">${escapeHtml(t("statusDraft"))}: ${ac.draft || 0}</span>
          </div>
          <p class="hint" style="margin-top:8px">${escapeHtml(t("articlesTitle"))}: ${data.totalArticles || 0}</p>
        </div>`;

      const modsHtml = `
        <div class="review-card panel" style="margin-bottom:12px">
          <h3 style="margin-bottom:10px">${escapeHtml(t("statusModulesTitle"))}</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            ${["home", "pins", "products"]
              .map(
                (k) =>
                  `<span class="pill ${md[k] ? "ok" : ""}">${k}: ${md[k] ? "\u2713" : "\u2014"}</span>`
              )
              .join("")}
          </div>
        </div>`;

      const auditHtml = `
        <div class="panel" style="margin-bottom:12px">
          <h3>${escapeHtml(t("auditTitle"))}</h3>
          <ul class="list-plain">${
            (data.recentAudit || []).length
              ? data.recentAudit
                  .map(
                    (e) =>
                      `<li><strong>${escapeHtml(e.action)}</strong> \u00b7 ${escapeHtml(
                        e.detail || ""
                      )} \u00b7 ${escapeHtml(e.user_login)} \u00b7 <span class="hint">${escapeHtml(
                        e.created_at
                      )}</span></li>`
                  )
                  .join("")
              : `<li class="hint">${escapeHtml(t("auditEmpty"))}</li>`
          }</ul>
        </div>`;

      const snapHtml = `
        <div class="panel">
          <h3>${escapeHtml(t("rollbackTitle"))}</h3>
          <ul class="list-plain">${
            (data.recentSnapshots || []).length
              ? data.recentSnapshots
                  .map(
                    (s) =>
                      `<li><strong>#${s.id} ${escapeHtml(s.module)}</strong> \u00b7 ${escapeHtml(
                        s.detail || ""
                      )} \u00b7 <span class="hint">${escapeHtml(s.created_at)}</span></li>`
                  )
                  .join("")
              : `<li class="hint">${escapeHtml(t("snapshotsEmpty"))}</li>`
          }</ul>
        </div>`;

      box.innerHTML = countsHtml + modsHtml + auditHtml + snapHtml;
      setPill("#status-status", t("statusOk"), "ok");
    } catch (err) {
      if (box) box.innerHTML = `<p class="hint">${escapeHtml(err.message)}</p>`;
      setPill("#status-status", err.message, "warn");
    }
  }

  /* —— Media gallery —— */
  async function copyText(text) {
    const s = String(text || "");
    if (!s) return false;
    try {
      await navigator.clipboard.writeText(s);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = s;
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  function showMediaUploadPath(path) {
    const box = $("#media-upload-result");
    const code = $("#media-upload-path");
    if (!box || !code || !path) return;
    code.textContent = path;
    box.classList.remove("pk-hidden");
  }

  let mediaFilesCache = [];
  let mediaSearchQuery = "";

  function formatMediaBytes(bytes) {
    const b = Number(bytes) || 0;
    if (b < 1024) return b + " B";
    const kb = b / 1024;
    if (kb < 1024) return Math.round(kb) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  }

  function mediaWorkerPath(key) {
    return "/api/media/file/" + String(key || "").replace(/^\/+/, "");
  }

  function mediaWpContentPath(key) {
    const k = String(key || "").replace(/^\/+/, "");
    if (k.startsWith("uploads/")) return "/wp-content/" + k;
    return "/wp-content/uploads/" + k.replace(/^uploads\//, "");
  }

  function mediaMarkdownForKey(key) {
    return `![](${mediaWpContentPath(key)})`;
  }

  function filterMediaFiles(files, query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => {
      const key = String(f.key || "").toLowerCase();
      const worker = mediaWorkerPath(f.key).toLowerCase();
      const wp = mediaWpContentPath(f.key).toLowerCase();
      return key.includes(q) || worker.includes(q) || wp.includes(q);
    });
  }

  function bindMediaGridActions(wrap) {
    if (!wrap) return;
    wrap.querySelectorAll("[data-media-used]").forEach((btn) => {
      btn.addEventListener("click", () => {
        showMediaUsages(decodeURIComponent(btn.getAttribute("data-media-used") || "")).catch(
          (e) => setPill("#media-status", e.message, "warn")
        );
      });
    });
    wrap.querySelectorAll("[data-media-copy-worker]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = decodeURIComponent(btn.getAttribute("data-media-copy-worker") || "");
        const ok = await copyText(mediaWorkerPath(key));
        setPill("#media-status", ok ? t("mediaCopyOk") : t("mediaCopyFail"), ok ? "ok" : "warn");
      });
    });
    wrap.querySelectorAll("[data-media-copy-wp]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = decodeURIComponent(btn.getAttribute("data-media-copy-wp") || "");
        const ok = await copyText(mediaWpContentPath(key));
        setPill("#media-status", ok ? t("mediaCopyOk") : t("mediaCopyFail"), ok ? "ok" : "warn");
      });
    });
    wrap.querySelectorAll("[data-media-copy-md]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = decodeURIComponent(btn.getAttribute("data-media-copy-md") || "");
        const ok = await copyText(mediaMarkdownForKey(key));
        setPill("#media-status", ok ? t("mediaCopyOk") : t("mediaCopyFail"), ok ? "ok" : "warn");
      });
    });
    wrap.querySelectorAll("[data-media-del]").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteMedia(decodeURIComponent(btn.getAttribute("data-media-del") || ""), btn)
      );
    });
  }

  function renderMediaGrid(files) {
    const wrap = $("#media-grid");
    if (!wrap) return;
    if (!files.length) {
      wrap.innerHTML = `<p class="hint">${escapeHtml(t("mediaSearchEmpty"))}</p>`;
      return;
    }
    const api = window.PK_AUTH.API;
    wrap.innerHTML = files
      .map((f) => {
        const rawKey = f.key || "";
        const keyEnc = encodeURIComponent(rawKey);
        const keyLabel = escapeHtml(rawKey);
        const src = api + "/api/media/file/" + encodeURIComponent(rawKey);
        const bytesLabel = formatMediaBytes(f.bytes);
        return `<div class="media-card panel">
          <div class="media-thumb"><img src="${src}" alt="${keyLabel}" loading="lazy"></div>
          <p class="media-card-key">${keyLabel}</p>
          <p class="media-card-bytes">${escapeHtml(bytesLabel)}</p>
          <div class="media-card-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-media-used="${keyEnc}" style="width:auto">${escapeHtml(
            t("btnMediaUsedIn")
          )}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-media-copy-worker="${keyEnc}" style="width:auto">${escapeHtml(
            t("btnCopyWorkerPath")
          )}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-media-copy-wp="${keyEnc}" style="width:auto">${escapeHtml(
            t("btnCopyWpPath")
          )}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-media-copy-md="${keyEnc}" style="width:auto">${escapeHtml(
            t("btnCopyMarkdown")
          )}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-media-del="${keyEnc}" style="width:auto">${escapeHtml(
            t("btnDeleteMedia")
          )}</button>
          </div>
        </div>`;
      })
      .join("");
    bindMediaGridActions(wrap);
  }

  async function showMediaUsages(key) {
    if (!key) return;
    setPill("#media-status", t("loading"), null);
    const usages = await findMediaDraftUsages(key);
    if (!usages.length) {
      setPill("#media-status", t("mediaUsedNone"), "warn");
      return;
    }
    alert(t("mediaUsedInTitle") + ":\n\n" + usages.map((u) => "• " + u).join("\n"));
    setPill(
      "#media-status",
      t("mediaUsedCount").replace("{n}", String(usages.length)),
      "ok"
    );
  }

  async function uploadMedia(file, opts = {}) {
    if (!file) return null;
    if (!opts.skipStatus) setPill("#media-status", t("uploading"), null);
    try {
      const preferred = String(file.name || "upload")
        .replace(/\.[^.]+$/, "")
        .trim();
      let data;
      if (window.PK_MEDIA?.upload) {
        data = await window.PK_MEDIA.upload(file, preferred || "upload");
      } else {
        throw new Error("media_unavailable");
      }
      const path = data.path || data.url || "";
      if (!opts.silentResult) showMediaUploadPath(path);
      if (!opts.skipStatus) setPill("#media-status", t("uploadOk"), "ok");
      if (!opts.skipReload) await loadMedia();
      return data;
    } catch (err) {
      const msg =
        window.PK_MEDIA?.errorMessage?.(err, t) || err.message || "upload_failed";
      if (!opts.skipStatus) setPill("#media-status", msg, "warn");
      throw err;
    }
  }

  async function uploadMediaBatch(fileList) {
    const list = Array.from(fileList || []).filter((f) => f && f.type.startsWith("image/"));
    if (!list.length) {
      setPill("#media-status", t("uploadBadFormat"), "warn");
      return;
    }
    let okCount = 0;
    for (let i = 0; i < list.length; i++) {
      setPill(
        "#media-status",
        t("mediaUploadProgress")
          .replace("{current}", String(i + 1))
          .replace("{total}", String(list.length)),
        null
      );
      try {
        await uploadMedia(list[i], { skipReload: true, silentResult: true, skipStatus: true });
        okCount++;
      } catch {
        /* continue batch */
      }
    }
    await loadMedia();
    setPill(
      "#media-status",
      t("mediaUploadBatchOk").replace("{n}", String(okCount)).replace("{total}", String(list.length)),
      okCount === list.length ? "ok" : "warn"
    );
  }

  async function loadMedia() {
    setPill("#media-status", t("loading"), null);
    const res = await apiFetch("/api/media/list", {});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "media_list_failed");
    mediaFilesCache = data.files || [];
    const filtered = filterMediaFiles(mediaFilesCache, mediaSearchQuery);
    const wrap = $("#media-grid");
    if (!wrap) return;
    if (!mediaFilesCache.length) {
      wrap.innerHTML = `<p class="hint">${escapeHtml(t("mediaEmpty"))}</p>`;
      setPill("#media-status", t("mediaEmpty"), "warn");
      return;
    }
    renderMediaGrid(filtered);
    const statusMsg =
      filtered.length === mediaFilesCache.length
        ? t("mediaFilesCount") + ": " + mediaFilesCache.length
        : t("mediaSearchShowing")
            .replace("{n}", String(filtered.length))
            .replace("{total}", String(mediaFilesCache.length));
    setPill("#media-status", statusMsg, "ok");
  }

  function draftJsonReferencesMedia(obj, mediaKey) {
    if (!mediaKey) return false;
    const path = "/api/media/file/" + mediaKey;
    const enc = encodeURIComponent(mediaKey);
    const s = JSON.stringify(obj ?? "");
    return s.includes(mediaKey) || s.includes(path) || s.includes(enc);
  }

  async function findMediaDraftUsages(mediaKey) {
    const usages = [];
    try {
      const hr = await apiFetch("/api/content/home");
      if (hr.ok) {
        const hd = await hr.json();
        if (draftJsonReferencesMedia(hd, mediaKey)) usages.push(t("mediaUsedHome"));
      }
    } catch {
      /* ignore */
    }
    try {
      const pr = await apiFetch("/api/content/pins");
      if (pr.ok) {
        const pd = await pr.json();
        if (draftJsonReferencesMedia(pd, mediaKey)) usages.push(t("mediaUsedPins"));
      }
    } catch {
      /* ignore */
    }
    try {
      const prodRes = await apiFetch("/api/content/products");
      if (prodRes.ok) {
        const prod = await prodRes.json();
        if (draftJsonReferencesMedia(prod, mediaKey)) usages.push(t("mediaUsedProducts"));
      }
    } catch {
      /* ignore */
    }
    try {
      const listRes = await apiFetch("/api/content/articles");
      if (listRes.ok) {
        const { drafts } = await listRes.json();
        for (const d of drafts || []) {
          const slug = d.slug;
          if (!slug) continue;
          let payload = d;
          try {
            const fullRes = await apiFetch(
              "/api/content/articles/" + encodeURIComponent(slug)
            );
            if (fullRes.ok) payload = await fullRes.json();
          } catch {
            /* use list row */
          }
          if (draftJsonReferencesMedia(payload, mediaKey)) {
            usages.push(t("mediaUsedArticle").replace("{slug}", slug));
          }
        }
      }
    } catch {
      /* ignore */
    }
    return usages;
  }

  async function deleteMedia(key, btn) {
    if (!key) return;
    const usages = await findMediaDraftUsages(key);
    if (usages.length) {
      const list = usages.map((u) => "• " + u).join("\n");
      const msg = t("confirmDeleteMediaInUse").replace("{list}", list);
      if (!confirm(msg)) return;
    } else if (!confirm(t("confirmDeleteMedia"))) {
      return;
    }
    if (btn) btn.disabled = true;
    const res = await apiFetch("/api/media/file/" + encodeURIComponent(key), {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setPill("#media-status", data.error || t("mediaDeleteFail"), "warn");
      if (btn) btn.disabled = false;
      return;
    }
    setPill("#media-status", t("mediaDeleteOk"), "ok");
    await loadMedia();
  }

  /* —— Audit —— */
  async function loadAuditInto(sel) {
    const box = $(sel);
    if (!box) return;
    try {
      const res = await apiFetch("/api/audit",{
      });
      const data = await res.json();
      if (!res.ok) {
        box.innerHTML = `<p class="hint">${escapeHtml(data.error || "audit_failed")}</p>`;
        return;
      }
      const rows = data.entries || [];
      if (!rows.length) {
        box.innerHTML = `<p class="hint">${escapeHtml(t("auditEmpty"))}</p>`;
        return;
      }
      box.innerHTML =
        '<div class="audit-log">' +
        rows
          .map(
            (e) =>
              '<div class="audit-entry">' +
                '<span class="audit-ts">' +
                escapeHtml(e.created_at) +
                "</span>" +
                '<div class="audit-msg">' +
                escapeHtml(e.detail || "") +
                (e.user_login
                  ? " \u00b7 " + escapeHtml(e.user_login)
                  : "") +
                "</div>" +
                '<span class="audit-tag">' +
                escapeHtml(e.action) +
                "</span>" +
              "</div>"
          )
          .join("") +
        "</div>";
    } catch (err) {
      box.innerHTML = `<p class="hint">${escapeHtml(err.message)}</p>`;
    }
  }

  /* —— SEO / links —— */
  async function loadSeo() {
    setPill("#seo-status", t("loading"), null);
    const res = await apiFetch("/api/content/articles",{
    });
    if (!res.ok) {
      if (res.status === 401) {
        await window.PK_AUTH.logout?.();
        setPill("#seo-status", t("loginError") || "unauthorized", "warn");
        return;
      }
      setPill("#seo-status", "seo_load_failed", "warn");
      return;
    }
    const data = await res.json();
    const drafts = data.drafts || [];
    const links = [];
    drafts.forEach((d) => {
      (d.affiliateLinks || []).forEach((u) => {
        if (u) links.push(u);
      });
      (d.blocks || []).forEach((b) => {
        if (!b) return;
        if (b.type === "product" || b.type === "cta") {
          (b.links || []).forEach((l) => {
            if (l && l.url) links.push(l.url);
          });
        }
        if (b.type === "table" && Array.isArray(b.rows)) {
          b.rows.forEach((row) => {
            (row || []).forEach((cell) => {
              const c = String(cell || "");
              const pipe = c.indexOf("|");
              if (pipe > 0) links.push(c.slice(pipe + 1).trim());
            });
          });
        }
      });
    });
    // Products draft: categoryProducts map (not hub.products)
    try {
      const pr = await apiFetch("/api/content/products",{
      });
      const pd = await pr.json();
      const map = pd.categoryProducts || {};
      Object.keys(map).forEach((catId) => {
        (map[catId] || []).forEach((p) => {
          if (!p) return;
          if (Array.isArray(p.links)) {
            p.links.forEach((l) => {
              if (l && l.url) links.push(l.url);
            });
          }
          if (p.amazonUrl) links.push(p.amazonUrl);
        });
      });
    } catch {
      /* ignore */
    }
    // Pins draft: product store links
    try {
      const pinRes = await apiFetch("/api/content/pins",{
      });
      const pinData = await pinRes.json();
      (pinData.pins || []).forEach((pin) => {
        (pin.products || []).forEach((prod) => {
          if (!prod) return;
          if (Array.isArray(prod.links)) {
            prod.links.forEach((l) => {
              if (l && l.url) links.push(l.url);
            });
          }
          if (prod.url) links.push(prod.url);
        });
      });
    } catch {
      /* ignore */
    }
    // Home top picks
    try {
      const hr = await apiFetch("/api/content/home",{
      });
      const hd = await hr.json();
      ((hd.topPicks && hd.topPicks.picks) || []).forEach((p) => {
        if (p && p.amazonUrl) links.push(p.amazonUrl);
      });
    } catch {
      /* ignore */
    }
    const unique = [...new Set(links.map((u) => String(u).trim()).filter(Boolean))];
    $("#seo-link-count").textContent = String(unique.length);
    window.__pk_seo_links = unique;
    setPill("#seo-status", t("seoLinksLoaded").replace("{n}", String(unique.length)), "ok");
    $("#seo-results").innerHTML = "";
  }

  async function runLinkCheck() {
    const links = window.__pk_seo_links || [];
    if (!links.length) {
      setPill("#seo-status", t("seoNoLinks"), "warn");
      return;
    }
    const total = links.length;
    const batch = links.slice(0, 20);
    setPill(
      "#seo-status",
      t("seoCheckingBatch").replace("{n}", String(batch.length)).replace("{total}", String(total)),
      null
    );
    const res = await apiFetch("/api/links/check",{
      method: "POST",
      body: JSON.stringify({ links: batch }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPill("#seo-status", data.error || t("seoCheckFail"), "warn");
      return;
    }
    const rows = data.results || [];
    const bad = rows.filter((r) => !r.ok);
    $("#seo-results").innerHTML = rows
      .map(
        (r) =>
          `<li class="${r.ok ? "gate-ok" : "gate-block"}">${escapeHtml(r.url)} \u2192 ${
            r.ok ? "OK" : "FAIL"
          } (${r.status})${r.error ? " " + escapeHtml(r.error) : ""}</li>`
      )
      .join("");
    const okMsg =
      bad.length === 0
        ? t("seoAllOkChecked")
            .replace("{n}", String(batch.length))
            .replace("{total}", String(total))
        : t("seoBrokenCount").replace("{n}", String(bad.length));
    setPill("#seo-status", okMsg, bad.length ? "warn" : "ok");
  }

  /* —— Team —— */

  // Determine if current session user is owner (for showing invite panel + remove buttons)
  function sessionIsOwner() {
    const s = window.PK_AUTH.getSession();
    // Session is flat: { token, login, role, owner } — not nested under .user
    return !!(s?.owner || s?.user?.owner || s?.role === "owner");
  }

  async function loadTeam() {
    setPill("#team-status", t("loading"), null);
    try {
      const res = await apiFetch("/api/team",{
      });
      const data = await res.json();
      if (!res.ok) {
        setPill("#team-status", data.error || "team_failed", "warn");
        return;
      }

      const isOwner = sessionIsOwner();
      const list = $("#team-list");
      if (list) {
        const admins = data.admins || [];
        list.innerHTML = admins.length
          ? admins
              .map((a) => {
                const badge = a.is_owner
                  ? `<span class="pill" style="margin-left:6px">${escapeHtml(t("teamOwnerBadge"))}</span>`
                  : `<span class="pill" style="margin-left:6px">${escapeHtml(t("teamAdminBadge"))}</span>`;
                const removeBtn =
                  isOwner && !a.is_owner
                    ? ` <button type="button" class="btn btn-ghost btn-sm" data-team-remove="${escapeHtml(
                        a.login
                      )}" style="width:auto;padding-inline:10px;margin-left:12px">${escapeHtml(
                        t("btnRemove")
                      )}</button>`
                    : "";
                return `<li style="display:flex;align-items:center;gap:4px;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.07)">
                  <strong>${escapeHtml(a.login)}</strong>${badge}
                  <span class="hint" style="margin-left:6px">${escapeHtml(a.created_at || "")}</span>
                  ${removeBtn}
                </li>`;
              })
              .join("")
          : `<li class="hint">${escapeHtml(t("teamOwnerOnly"))}</li>`;

        list.querySelectorAll("[data-team-remove]").forEach((btn) => {
          btn.addEventListener("click", () => removeAdmin(btn.getAttribute("data-team-remove")));
        });
      }

      // Show invite panel only to owner
      const invitePanel = $("#team-invite-panel");
      if (invitePanel) invitePanel.classList.toggle("pk-hidden", !isOwner);

      setPill("#team-status", `${(data.admins || []).length} ${t("teamAdminBadge")}(s)`, "ok");
    } catch (err) {
      setPill("#team-status", err.message, "warn");
    }
  }

  async function inviteAdmin(form) {
    const login = ($("#team-invite-login")?.value || "").trim();
    const password = $("#team-invite-password")?.value || "";
    const role = $("#team-invite-role")?.value || "admin";
    const btn = $("#btn-team-invite");
    if (btn) btn.disabled = true;
    setPill("#team-invite-status", t("teamInviting"), null);
    try {
      const res = await apiFetch("/api/team/invite",{
        method: "POST",
        body: JSON.stringify({ login, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPill(
          "#team-invite-status",
          t("teamInviteFail").replace("{err}", data.hint || data.error || "failed"),
          "warn"
        );
        return;
      }
      setPill(
        "#team-invite-status",
        t("teamInviteOk").replace("{login}", data.login),
        "ok"
      );
      if (form) form.reset();
      await loadTeam();
    } catch (err) {
      setPill("#team-invite-status", t("teamInviteFail").replace("{err}", err.message), "warn");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function removeAdmin(login) {
    if (!login) return;
    if (!confirm(t("teamRemoveConfirm").replace("{login}", login))) return;
    setPill("#team-status", t("loading"), null);
    try {
      const res = await apiFetch("/api/team/remove",{
        method: "POST",
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPill("#team-status", t("teamRemoveFail").replace("{err}", data.error || "failed"), "warn");
        return;
      }
      setPill("#team-status", t("teamRemoveOk").replace("{login}", login), "ok");
      await loadTeam();
    } catch (err) {
      setPill("#team-status", t("teamRemoveFail").replace("{err}", err.message), "warn");
    }
  }

  window.PK_OPS = {
    async openPublish() {
      await loadPublish();
      await loadAuditInto("#publish-audit");
    },
    async openSeo() {
      await loadSeo();
      await loadAuditInto("#seo-audit");
    },
    async openTeam() {
      await loadTeam();
    },
    async openStatus() {
      await loadStatus();
    },
    async openMedia() {
      await loadMedia();
    },
    bind() {
      $("#btn-publish-refresh")?.addEventListener("click", () =>
        loadPublish().catch((e) => setPill("#publish-status", e.message, "warn"))
      );
      $("#btn-seo-refresh")?.addEventListener("click", () =>
        loadSeo().catch((e) => setPill("#seo-status", e.message, "warn"))
      );
      $("#btn-seo-check")?.addEventListener("click", () =>
        runLinkCheck().catch((e) => setPill("#seo-status", e.message, "warn"))
      );
      $("#btn-team-refresh")?.addEventListener("click", () =>
        loadTeam().catch((e) => setPill("#team-status", e.message, "warn"))
      );
      $("#btn-status-refresh")?.addEventListener("click", () =>
        loadStatus().catch((e) => setPill("#status-status", e.message, "warn"))
      );
      $("#btn-media-refresh")?.addEventListener("click", () =>
        loadMedia().catch((e) => setPill("#media-status", e.message, "warn"))
      );
      $("#media-search")?.addEventListener("input", (e) => {
        mediaSearchQuery = e.target.value || "";
        renderMediaGrid(filterMediaFiles(mediaFilesCache, mediaSearchQuery));
        const filtered = filterMediaFiles(mediaFilesCache, mediaSearchQuery);
        if (mediaFilesCache.length) {
          const statusMsg =
            filtered.length === mediaFilesCache.length
              ? t("mediaFilesCount") + ": " + mediaFilesCache.length
              : t("mediaSearchShowing")
                  .replace("{n}", String(filtered.length))
                  .replace("{total}", String(mediaFilesCache.length));
          setPill("#media-status", statusMsg, "ok");
        }
      });
      const dropzone = $("#media-dropzone");
      const onDragOver = (e) => {
        e.preventDefault();
        dropzone?.classList.add("is-dragover");
      };
      const onDragLeave = () => dropzone?.classList.remove("is-dragover");
      const onDrop = (e) => {
        e.preventDefault();
        dropzone?.classList.remove("is-dragover");
        const files = e.dataTransfer?.files;
        if (files?.length) {
          uploadMediaBatch(files).catch((err) =>
            setPill("#media-status", err.message, "warn")
          );
        }
      };
      dropzone?.addEventListener("dragover", onDragOver);
      dropzone?.addEventListener("dragleave", onDragLeave);
      dropzone?.addEventListener("drop", onDrop);
      $("#media-upload-input")?.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files?.length) {
          uploadMediaBatch(files).catch((err) =>
            setPill("#media-status", err.message, "warn")
          );
        }
        e.target.value = "";
      });
      $("#btn-media-copy-path")?.addEventListener("click", async () => {
        const path = $("#media-upload-path")?.textContent?.trim();
        if (!path) return;
        const ok = await copyText(path);
        setPill("#media-status", ok ? t("mediaCopyOk") : t("mediaCopyFail"), ok ? "ok" : "warn");
      });
      $("#team-invite-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        inviteAdmin(e.target).catch((err) =>
          setPill("#team-invite-status", err.message, "warn")
        );
      });
    },
  };
})();
