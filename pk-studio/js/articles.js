/** Pickora Studio — Articles wizard (Phase 3) */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let liveArticles = [];
  let drafts = [];
  let current = null;
  let lang = () => localStorage.getItem("pk_studio_lang") || "ru";

  function t(key) {
    const pack = window.PK_I18N[lang()] || window.PK_I18N.ru;
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
    return {
      slug: "",
      status: "draft",
      type: 2,
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
      affiliateLinks: [""],
      internalLinks: ["/articles/", "/home-kitchen/"],
      bodyHtml: "",
      faq: [],
      updatedAt: null,
      seoReadyAt: null,
    };
  }

  function setStatus(msg, kind) {
    const el = $("#articles-status");
    if (!el) return;
    el.classList.remove("pk-hidden", "ok", "warn");
    el.textContent = msg;
    if (kind) el.classList.add(kind);
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

  function readForm() {
    if (!current) current = emptyDraft();
    const chipsRaw = ($("#art-chips")?.value || "")
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    const aff = ($("#art-affiliate")?.value || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const intl = ($("#art-internal")?.value || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const slug = ($("#art-slug")?.value || "").trim().toLowerCase();
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
      affiliateLinks: aff,
      internalLinks: intl,
      bodyHtml: $("#art-body")?.value || "",
      status: current.status || "draft",
    };
    return current;
  }

  function fillForm(d) {
    current = { ...emptyDraft(), ...d };
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
    $("#art-body").value = current.bodyHtml || "";
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

  function showWizard(on) {
    $("#articles-home")?.classList.toggle("pk-hidden", on);
    $("#articles-wizard")?.classList.toggle("pk-hidden", !on);
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

  async function uploadCover(file) {
    setStatus(t("uploading"));
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const preferred = (readForm().slug || "article") + "-cover";
      const res = await fetch(window.PK_AUTH.API + "/api/media/upload", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          filename: file.name,
          data: dataUrl,
          preferredName: preferred,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload_failed");
      $("#art-cover").value = data.path;
      readForm();
      fillForm(current);
      setStatus(t("uploadOk"), "ok");
    } catch {
      setStatus(t("uploadFail"), "warn");
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
    $("#btn-article-seo-ready")?.addEventListener("click", () => markSeoReady());
    $("#art-cover-file")?.addEventListener("change", () => {
      const f = $("#art-cover-file").files?.[0];
      if (f) uploadCover(f);
      $("#art-cover-file").value = "";
    });
  }

  window.PK_ARTICLES = { open, bind, t };
})();
