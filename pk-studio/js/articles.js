/** Pickora Studio — Articles wizard with block constructor */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let liveArticles = [];
  let drafts = [];
  let current = null;
  let blocksApi = null;

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

  function escapeAttr(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function emptyDraft() {
    const type = 2;
    return {
      slug: "",
      status: "draft",
      type,
      title: "",
      metaDescription: "",
      h1: "",
      dek: "",
      hubCategory: "Home & Kitchen",
      hubUrl: "/home-kitchen/",
      chips: ["kitchen"],
      coverImage: "",
      coverAlt: "",
      canonical: "",
      affiliateLinks: [],
      internalLinks: ["/articles/", "/home-kitchen/"],
      bodyHtml: "",
      blocks: window.PK_BLOCKS.starterBlocks(type),
      faq: [],
      updatedAt: null,
      seoReadyAt: null,
    };
  }

  function setStatus(msg, kind) {
    const el = $("#articles-status");
    if (el) {
      el.classList.remove("pk-hidden", "ok", "warn");
      el.textContent = msg;
      if (kind) el.classList.add(kind);
      if (!msg) el.classList.add("pk-hidden");
    }
    const bar = $("#art-studio-status");
    if (bar) {
      bar.textContent = msg || "";
      bar.classList.toggle("is-ok", kind === "ok");
      bar.classList.toggle("is-warn", kind === "warn");
      bar.hidden = !msg;
    }
  }

  function renderGate(result) {
    const box = $("#articles-gate");
    if (!box) return;
    if (!result) {
      box.innerHTML = "";
      return;
    }
    const blocks = (result.blockers || [])
      .map((b) => `<li class="gate-block">${escapeAttr(b.label)}</li>`)
      .join("");
    const warns = (result.warnings || [])
      .map((b) => `<li class="gate-warn">${escapeAttr(b.label)}</li>`)
      .join("");
    box.innerHTML = `
      <div class="panel" style="margin-top:12px">
        <h3>${escapeAttr(t("seoGateTitle"))}: ${
          result.ok ? escapeAttr(t("seoGateOk")) : escapeAttr(t("seoGateFail"))
        }</h3>
        ${
          blocks
            ? `<p class="hint">${escapeAttr(t("seoBlockers"))}</p><ul class="list-plain">${blocks}</ul>`
            : ""
        }
        ${
          warns
            ? `<p class="hint">${escapeAttr(t("seoWarnings"))}</p><ul class="list-plain">${warns}</ul>`
            : ""
        }
      </div>`;
  }

  function syncBlocksEditor(blocks) {
    const host = $("#art-blocks");
    if (!host || !window.PK_BLOCKS) return;
    blocksApi = window.PK_BLOCKS.renderEditor(host, blocks || [], (next) => {
      if (!current) current = emptyDraft();
      current.blocks = next;
      current.bodyHtml = window.PK_BLOCKS.compileBlocksToHtml(next);
      current.affiliateLinks = window.PK_BLOCKS.collectAffiliateLinks(next, []);
      if ($("#art-affiliate")) {
        $("#art-affiliate").value = (current.affiliateLinks || []).join("\n");
      }
    });
  }

  function readForm() {
    if (!current) current = emptyDraft();
    const chipsRaw = ($("#art-chips")?.value || "")
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    const intl = ($("#art-internal")?.value || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const slug = ($("#art-slug")?.value || "").trim().toLowerCase();
    const blocks = blocksApi?.getBlocks?.() || current.blocks || [];
    const bodyHtml = window.PK_BLOCKS.compileBlocksToHtml(blocks);
    const affiliateLinks = window.PK_BLOCKS.collectAffiliateLinks(
      blocks,
      ($("#art-affiliate")?.value || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
    );
    current = {
      ...current,
      slug,
      type: Number($("#art-type")?.value || 2),
      title: ($("#art-title")?.value || "").trim(),
      metaDescription: ($("#art-meta")?.value || "").trim(),
      h1: ($("#art-h1")?.value || "").trim(),
      dek: ($("#art-dek")?.value || "").trim(),
      hubCategory: $("#art-hub")?.value || current.hubCategory,
      hubUrl: ($("#art-hub-url")?.value || "").trim(),
      chips: chipsRaw,
      coverImage: ($("#art-cover")?.value || "").trim(),
      coverAlt: ($("#art-cover-alt")?.value || "").trim(),
      canonical: slug ? `https://pickora.shop/${slug}/` : "",
      affiliateLinks,
      internalLinks: intl,
      blocks,
      bodyHtml,
      status: current.status || "draft",
    };
    return current;
  }

  function fillForm(d) {
    current = { ...emptyDraft(), ...d };
    current.blocks = window.PK_BLOCKS.ensureBlocks(current);
    $("#art-slug").value = current.slug || "";
    $("#art-type").value = String(current.type || 2);
    $("#art-title").value = current.title || "";
    $("#art-meta").value = current.metaDescription || "";
    $("#art-h1").value = current.h1 || "";
    $("#art-dek").value = current.dek || "";
    $("#art-hub").value = current.hubCategory || "Home & Kitchen";
    $("#art-hub-url").value = current.hubUrl || "";
    $("#art-chips").value = (current.chips || []).join(" ");
    $("#art-cover").value = current.coverImage || "";
    $("#art-cover-alt").value = current.coverAlt || "";
    $("#art-affiliate").value = (current.affiliateLinks || []).join("\n");
    $("#art-internal").value = (current.internalLinks || []).join("\n");
    $("#art-status-pill").textContent = current.status || "draft";
    renderGate(null);
    const thumb = $("#art-cover-preview");
    if (thumb) {
      if (current.coverImage) {
        thumb.innerHTML = `<img src="${escapeAttr(current.coverImage)}" alt="">`;
      } else {
        thumb.innerHTML = `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`;
      }
    }
    syncBlocksEditor(current.blocks);
  }

  function renderLists() {
    const live = $("#articles-live");
    const draftBox = $("#articles-drafts");
    if (live) {
      live.innerHTML = liveArticles
        .slice(0, 20)
        .map(
          (a) => `<div class="panel" style="padding:14px">
          <strong>${escapeAttr(a.title)}</strong>
          <p class="path-hint" style="margin:6px 0 0">${escapeAttr(a.url)}</p>
        </div>`
        )
        .join("");
    }
    if (draftBox) {
      draftBox.innerHTML = drafts.length
        ? drafts
            .map(
              (d) => `<button type="button" class="panel" data-open-draft="${escapeAttr(
                d.slug
              )}" style="text-align:left;width:100%;cursor:pointer">
              <strong>${escapeAttr(d.title || d.slug)}</strong>
              <span class="pill" style="margin-left:8px">${escapeAttr(d.status || "draft")}</span>
              <p class="path-hint" style="margin:6px 0 0">${escapeAttr(d.slug)}</p>
            </button>`
            )
            .join("")
        : `<p class="hint">${escapeAttr(t("articlesNoDrafts"))}</p>`;
      $$("[data-open-draft]").forEach((btn) => {
        btn.addEventListener("click", () => openDraft(btn.getAttribute("data-open-draft")));
      });
    }
  }

  async function loadLists() {
    const [liveRes, draftRes] = await Promise.all([
      fetch(window.PK_AUTH.API + "/api/articles", {
        headers: authHeaders(),
        credentials: "include",
      }),
      fetch(window.PK_AUTH.API + "/api/content/articles", {
        headers: authHeaders(),
        credentials: "include",
      }),
    ]);
    if (liveRes.ok) {
      liveArticles = (await liveRes.json()).articles || [];
    }
    if (draftRes.ok) {
      drafts = (await draftRes.json()).drafts || [];
    } else {
      drafts = [];
    }
    renderLists();
  }

  async function openDraft(slug) {
    const res = await fetch(
      window.PK_AUTH.API + "/api/content/articles/" + encodeURIComponent(slug),
      { headers: authHeaders(), credentials: "include" }
    );
    if (!res.ok) {
      setStatus(t("articlesLoadFail"), "warn");
      return;
    }
    const data = await res.json();
    fillForm(data);
    showWizard(true);
  }

  function setSettingsOpen(on) {
    const panel = $("#art-settings");
    const bd = $("#art-settings-backdrop");
    const studio = $("#articles-wizard");
    if (!panel) return;
    panel.classList.toggle("is-open", !!on);
    studio?.classList.toggle("settings-open", !!on);
    if (bd) {
      bd.hidden = !on;
      bd.classList.toggle("open", !!on);
    }
  }

  function showWizard(on) {
    $("#articles-home")?.classList.toggle("pk-hidden", on);
    $("#articles-wizard")?.classList.toggle("pk-hidden", !on);
    if (on) {
      const wide = window.matchMedia("(min-width: 1100px)").matches;
      setSettingsOpen(wide);
    } else {
      setSettingsOpen(false);
    }
  }

  async function saveDraft() {
    const d = readForm();
    if (!d.slug) {
      setStatus(t("articlesNeedSlug"), "warn");
      return;
    }
    const res = await fetch(window.PK_AUTH.API + "/api/content/articles", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(d),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data.error || t("articlesSaveFail"), "warn");
      return;
    }
    current = data.draft || d;
    fillForm(current);
    setStatus(t("articlesSaved"), "ok");
    await loadLists();
  }

  function runGate() {
    const d = readForm();
    const result = window.PK_SEO_GATE.validateArticleDraft(d);
    renderGate(result);
    setStatus(
      result.ok ? t("seoGateOk") : t("seoGateFail"),
      result.ok ? "ok" : "warn"
    );
    return result;
  }

  async function markSeoReady() {
    const result = runGate();
    if (!result.ok) return;
    const d = readForm();
    d.status = "seo_ready";
    d.seoReadyAt = new Date().toISOString();
    const res = await fetch(window.PK_AUTH.API + "/api/content/articles", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(d),
    });
    if (!res.ok) {
      setStatus(t("articlesSaveFail"), "warn");
      return;
    }
    current = (await res.json()).draft || d;
    fillForm(current);
    setStatus(t("articlesSeoReady"), "ok");
    await loadLists();
  }

  async function openPreview() {
    const d = readForm();
    if (!d.title && !d.h1 && !(d.blocks || []).length) {
      setStatus(t("previewFail"), "warn");
      return;
    }
    // Open window early (same click gesture) so popup blockers don't kill us
    const win = window.open("", "pk-article-preview");
    if (!win) {
      setStatus(t("previewPopupBlocked"), "warn");
      return;
    }
    try {
      win.document.write(
        `<!doctype html><title>${escapeAttr(t("previewOpening"))}</title>
         <body style="font:15px/1.5 system-ui;padding:40px;color:#15223B">
         ${escapeAttr(t("previewOpening"))}</body>`
      );
      win.document.close();
    } catch {
      /* cross-origin replace later via location */
    }
    setStatus(t("previewOpening"));
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/preview/article", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(d),
      });
      const html = await res.text();
      if (!res.ok) {
        let msg = t("previewFail");
        try {
          const err = JSON.parse(html);
          if (err.error) msg += ": " + err.error;
        } catch {
          /* not json */
        }
        try {
          win.document.write(
            `<!doctype html><body style="font:15px/1.5 system-ui;padding:40px;color:#b91c1c">${escapeAttr(
              msg
            )}</body>`
          );
          win.document.close();
        } catch {
          win.close();
        }
        setStatus(msg, "warn");
        return;
      }
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      win.location = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStatus(t("previewOk"), "ok");
    } catch (err) {
      try {
        win.close();
      } catch {
        /* ignore */
      }
      setStatus(t("previewFail") + (err?.message ? ": " + err.message : ""), "warn");
    }
  }

  async function uploadCover(file) {
    setStatus(t("uploading"));
    try {
      const preferred = (readForm().slug || "article") + "-cover";
      const data = await window.PK_MEDIA.upload(file, preferred);
      current = { ...current, ...readForm(), coverImage: data.path };
      if (!current.coverAlt) current.coverAlt = current.title || file.name;
      fillForm(current);
      setStatus(t("uploadOk"), "ok");
    } catch (err) {
      setStatus(window.PK_MEDIA.errorMessage(err, t), "warn");
    }
  }

  async function open() {
    await loadLists();
    showWizard(false);
    fillForm(emptyDraft());
    setStatus("", null);
    $("#articles-status")?.classList.add("pk-hidden");
  }

  function bind() {
    $("#btn-article-new")?.addEventListener("click", () => {
      fillForm(emptyDraft());
      showWizard(true);
    });
    $("#btn-article-cancel")?.addEventListener("click", () => showWizard(false));
    $("#btn-article-save")?.addEventListener("click", () => saveDraft());
    $("#btn-article-gate")?.addEventListener("click", () => runGate());
    $("#btn-article-preview")?.addEventListener("click", () => openPreview());
    $("#btn-article-seo-ready")?.addEventListener("click", () => markSeoReady());
    $("#btn-art-settings")?.addEventListener("click", () => {
      setSettingsOpen(!$("#art-settings")?.classList.contains("is-open"));
    });
    $("#btn-art-settings-close")?.addEventListener("click", () => setSettingsOpen(false));
    $("#art-settings-backdrop")?.addEventListener("click", () => setSettingsOpen(false));
    $("#art-cover-file")?.addEventListener("change", () => {
      const f = $("#art-cover-file").files?.[0];
      if (f) uploadCover(f);
      $("#art-cover-file").value = "";
    });
    $("#art-type")?.addEventListener("change", () => {
      if (!current) return;
      const nextType = Number($("#art-type").value || 2);
      const hasContent = (current.blocks || []).some((b) => {
        if (b.type === "product") return !!(b.title || b.image || b.description);
        if (b.type === "html") return !!(b.html || "").trim();
        if (b.type === "table") return (b.rows || []).some((r) => (r || []).some(Boolean));
        return !!(b.text || "").trim();
      });
      if (!hasContent || confirm(t("blockResetStarter"))) {
        current.type = nextType;
        current.blocks = window.PK_BLOCKS.starterBlocks(nextType);
        syncBlocksEditor(current.blocks);
      }
    });
  }

  window.PK_ARTICLES = { open, bind, t };
})();
