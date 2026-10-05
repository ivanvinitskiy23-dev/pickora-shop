/** Pickora Studio — Articles wizard with block constructor */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let liveArticles = [];
  let drafts = [];
  let current = null;
  let blocksApi = null;
  let lastSyncedFingerprint = "";
  let autosaveTimer = null;
  const AUTOSAVE_MS = 30_000;

  function draftFingerprint(d) {
    const x = d || {};
    return JSON.stringify({
      slug: x.slug || "",
      type: x.type || 2,
      title: x.title || "",
      metaDescription: x.metaDescription || "",
      h1: x.h1 || "",
      dek: x.dek || "",
      hubCategory: x.hubCategory || "",
      chips: x.chips || [],
      coverImage: x.coverImage || "",
      coverAlt: x.coverAlt || "",
      affiliateLinks: x.affiliateLinks || [],
      internalLinks: x.internalLinks || [],
      blocks: x.blocks || [],
      includeInSitemap: x.includeInSitemap !== false,
      status: x.status || "draft",
    });
  }

  function autosaveStorageKey(slug) {
    const s = String(slug || "").trim().toLowerCase();
    return s ? `pk_art_autosave_${s}` : "";
  }

  function updateCharMeters() {
    const gate = window.PK_SEO_GATE;
    if (!gate?.charMeterState) return;
    const fields = [
      { id: "art-title", meter: "art-title-meter", field: "title" },
      { id: "art-meta", meter: "art-meta-meter", field: "metaDescription" },
      { id: "art-h1", meter: "art-h1-meter", field: "h1" },
      { id: "art-dek", meter: "art-dek-meter", field: "dek" },
    ];
    fields.forEach(({ id, meter, field }) => {
      const el = $(`#${id}`);
      const m = $(`#${meter}`);
      if (!el || !m) return;
      const len = String(el.value || "").length;
      const state = gate.charMeterState(field, len);
      m.textContent = gate.formatCharMeter(field, len);
      m.classList.remove("is-ok", "is-warn", "is-bad");
      if (state !== "neutral") m.classList.add("is-" + state);
    });
  }

  function readChipsFromUi() {
    const picked = $$("#art-chips-checkboxes input[type=checkbox]:checked").map((cb) =>
      String(cb.value || "").trim()
    );
    const hidden = $("#art-chips");
    if (hidden) hidden.value = picked.join(" ");
    return picked.filter(Boolean);
  }

  function renderChipsCheckboxes(selected) {
    const host = $("#art-chips-checkboxes");
    if (!host || !window.PK_SEO_GATE) return;
    const sel = new Set((selected || []).map((c) => String(c).trim()).filter(Boolean));
    const allowed = window.PK_SEO_GATE.ALLOWED_CHIPS || [];
    host.innerHTML = allowed
      .map((slug) => {
        const on = sel.has(slug);
        const label = t("chip_" + slug) || slug;
        return `<label><input type="checkbox" value="${escapeAttr(slug)}"${
          on ? " checked" : ""
        }><span>${escapeAttr(label)}</span></label>`;
      })
      .join("");
    const syncDisabled = () => {
      const checked = $$("#art-chips-checkboxes input:checked");
      $$("#art-chips-checkboxes input:not(:checked)").forEach((cb) => {
        cb.disabled = checked.length >= 3;
      });
    };
    syncDisabled();
    $$("#art-chips-checkboxes input").forEach((cb) => {
      cb.addEventListener("change", () => {
        const checked = $$("#art-chips-checkboxes input:checked");
        if (checked.length > 3) {
          cb.checked = false;
          setStatus(t("chipsMaxThree"), "warn");
        }
        syncDisabled();
        readChipsFromUi();
        updateCharMeters();
      });
    });
    readChipsFromUi();
  }

  function renderInternalSuggester() {
    const host = $("#art-internal-suggest");
    if (!host) return;
    const current = new Set(
      scrubInternalLinks(($("#art-internal")?.value || "").split("\n")).map((u) => u.replace(/\/+$/, "") + "/")
    );
    const slugs = liveArticles
      .map((a) => String(a.slug || "").trim())
      .filter((s) => s && s !== ($("#art-slug")?.value || "").trim());
    const uniq = [...new Set(slugs)].slice(0, 24);
    if (!uniq.length) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML =
      `<span class="hint">${escapeAttr(t("internalSuggestLabel"))}</span>` +
      uniq
        .map((slug) => {
          const path = `/${slug}/`;
          const norm = path.replace(/\/+$/, "") + "/";
          if (current.has(norm)) return "";
          return `<button type="button" class="btn btn-ghost btn-xs" data-add-internal="${escapeAttr(
            path
          )}">+ ${escapeAttr(slug)}</button>`;
        })
        .join("");
    $$("[data-add-internal]", host).forEach((btn) => {
      btn.addEventListener("click", () => {
        const path = btn.getAttribute("data-add-internal");
        const ta = $("#art-internal");
        if (!ta || !path) return;
        const lines = scrubInternalLinks(ta.value.split("\n"));
        const norm = path.replace(/\/+$/, "") + "/";
        if (!lines.some((u) => (u.replace(/\/+$/, "") + "/") === norm)) {
          lines.push(path);
          ta.value = lines.join("\n");
        }
        renderInternalSuggester();
      });
    });
  }

  function persistAutosave() {
    if (!isDraftDirty()) return;
    const d = readForm();
    if (!d.slug) return;
    const key = autosaveStorageKey(d.slug);
    if (!key) return;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ savedAt: new Date().toISOString(), draft: d })
      );
    } catch {
      /* quota */
    }
  }

  function clearAutosaveForSlug(slug) {
    const key = autosaveStorageKey(slug);
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }

  function peekAutosave(slug) {
    const key = autosaveStorageKey(slug);
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function updateAutosaveBanner() {
    const banner = $("#art-autosave-banner");
    if (!banner) return;
    const slug = ($("#art-slug")?.value || current?.slug || "").trim().toLowerCase();
    const snap = slug ? peekAutosave(slug) : null;
    const show =
      snap?.draft && slug && draftFingerprint(snap.draft) !== lastSyncedFingerprint;
    banner.classList.toggle("pk-hidden", !show);
  }

  function startAutosaveLoop() {
    if (autosaveTimer) clearInterval(autosaveTimer);
    autosaveTimer = setInterval(() => persistAutosave(), AUTOSAVE_MS);
  }

  function isDraftDirty() {
    if (!current) return false;
    try {
      return draftFingerprint(readForm()) !== lastSyncedFingerprint;
    } catch {
      return true;
    }
  }

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

  function mediaSrc(path) {
    if (!path) return "";
    const p = String(path).trim();
    const mediaBase =
      (window.PK_AUTH?.API || "https://pickora-admin-api.pickara-admin.workers.dev").replace(
        /\/$/,
        ""
      ) + "/api/media/file/";
    if (/^\/?api\/media\/file\//i.test(p) || /^https?:\/\/pickora\.shop\/api\/media\/file\//i.test(p)) {
      const key = p.replace(/^https?:\/\/pickora\.shop/i, "").replace(/^\/?api\/media\/file\//i, "");
      return mediaBase + key;
    }
    return p;
  }

  /** Hub category → Articles filter tab (never product hubs). */
  const HUB_ARTICLES = {
    Articles: "/articles/",
    "Home & Kitchen": "/articles/?cat=kitchen",
    "Consumer Electronics": "/articles/?cat=electronics",
    "Fitness & Health": "/articles/?cat=fitness",
    "Pet Supplies": "/articles/?cat=pets",
  };

  function articlesHubUrl(hubCategory) {
    const key = String(hubCategory || "")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
    return HUB_ARTICLES[key] || "/articles/";
  }

  /** Always map hub → Articles filter; ignore stale product-hub URLs. */
  function normalizeHubUrl(hubCategory) {
    return articlesHubUrl(hubCategory);
  }

  function scrubInternalLinks(lines) {
    return (lines || [])
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .map((u) => {
        if (/\/(home-kitchen|consumer-electronics|fitness-health|pet-supplies)\/?/i.test(u)) {
          return articlesHubUrl($("#art-hub")?.value || "Home & Kitchen");
        }
        return u;
      });
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
      hubUrl: articlesHubUrl("Home & Kitchen"),
      chips: ["kitchen"],
      coverImage: "",
      coverAlt: "",
      canonical: "",
      affiliateLinks: [],
      internalLinks: ["/articles/", "/articles/?cat=kitchen"],
      bodyHtml: "",
      blocks: window.PK_BLOCKS.starterBlocks(type),
      faq: [],
      updatedAt: null,
      seoReadyAt: null,
      includeInSitemap: true,
    };
  }

  function applyBlockTemplate(templateId) {
    if (!window.PK_BLOCKS?.templateBlocks) return;
    const next = window.PK_BLOCKS.templateBlocks(templateId);
    if (blocksApi?.setBlocks) blocksApi.setBlocks(next);
    else syncBlocksEditor(next);
    if (current) {
      current.blocks = next;
      current.bodyHtml = window.PK_BLOCKS.compileBlocksToHtml(next);
    }
    const tpl = $("#art-block-template");
    if (tpl) tpl.value = "blank";
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
    const chipsRaw = readChipsFromUi();
    const hubCategory = $("#art-hub")?.value || current.hubCategory;
    const hubUrl = normalizeHubUrl(hubCategory);
    const intl = scrubInternalLinks(($("#art-internal")?.value || "").split("\n"));
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
    // Keep Hub URL field in sync (read-only mapping)
    if ($("#art-hub-url") && $("#art-hub-url").value !== hubUrl) {
      $("#art-hub-url").value = hubUrl;
    }
    if ($("#art-internal")) {
      $("#art-internal").value = intl.join("\n");
    }
    current = {
      ...current,
      slug,
      type: Number($("#art-type")?.value || 2),
      title: ($("#art-title")?.value || "").trim(),
      metaDescription: ($("#art-meta")?.value || "").trim(),
      h1: ($("#art-h1")?.value || "").trim(),
      dek: ($("#art-dek")?.value || "").trim(),
      hubCategory,
      hubUrl,
      chips: chipsRaw,
      coverImage: ($("#art-cover")?.value || "").trim(),
      coverAlt: ($("#art-cover-alt")?.value || "").trim(),
      canonical: slug ? `https://pickora.shop/${slug}/` : "",
      affiliateLinks,
      internalLinks: intl,
      blocks,
      bodyHtml,
      status: current.status || "draft",
      includeInSitemap: $("#art-include-sitemap")?.checked !== false,
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
    current.hubUrl = normalizeHubUrl(current.hubCategory);
    current.internalLinks = scrubInternalLinks(current.internalLinks);
    $("#art-hub-url").value = current.hubUrl || "";
    renderChipsCheckboxes(current.chips || []);
    $("#art-cover").value = current.coverImage || "";
    $("#art-cover-alt").value = current.coverAlt || "";
    $("#art-affiliate").value = (current.affiliateLinks || []).join("\n");
    $("#art-internal").value = (current.internalLinks || []).join("\n");
    $("#art-status-pill").textContent = current.status || "draft";
    if ($("#art-include-sitemap")) {
      $("#art-include-sitemap").checked = current.includeInSitemap !== false;
    }
    if ($("#art-block-template")) $("#art-block-template").value = "blank";
    renderGate(null);
    updateCharMeters();
    renderInternalSuggester();
    updateAutosaveBanner();
    const thumb = $("#art-cover-preview");
    if (thumb) {
      if (current.coverImage) {
        const src = mediaSrc(current.coverImage);
        thumb.innerHTML = `<img src="${escapeAttr(src)}" alt="">`;
      } else {
        thumb.innerHTML = `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`;
      }
    }
    syncBlocksEditor(current.blocks);
    lastSyncedFingerprint = draftFingerprint(current);
    window.PK_ARTICLES?.updateSaveButton?.();
  }

  function renderLists() {
    const live = $("#articles-live");
    const draftBox = $("#articles-drafts");
    const q = String($("#articles-live-search")?.value || "")
      .trim()
      .toLowerCase();
    const filtered = !q
      ? liveArticles
      : liveArticles.filter(
          (a) =>
            String(a.title || "")
              .toLowerCase()
              .includes(q) ||
            String(a.url || "")
              .toLowerCase()
              .includes(q)
        );
    if (live) {
      live.innerHTML = filtered
        .map(
          (a) => `<div class="panel" style="padding:14px;display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:10px">
          <div>
          <strong>${escapeAttr(a.title)}</strong>
          <p class="path-hint" style="margin:6px 0 0">${escapeAttr(a.url)}</p>
          </div>
          <button type="button" class="btn btn-ghost btn-xs" data-import-live="${escapeAttr(
            a.slug
          )}">${escapeAttr(t("btnImportLiveArticle"))}</button>
        </div>`
        )
        .join("") || `<p class="hint">${escapeAttr(t("articlesLiveEmpty") || "—")}</p>`;
      $$("[data-import-live]", live).forEach((btn) => {
        btn.addEventListener("click", () =>
          importLiveArticle(btn.getAttribute("data-import-live"))
        );
      });
    }
    if (draftBox) {
      const dq = String($("#articles-draft-search")?.value || "")
        .trim()
        .toLowerCase();
      const hideArchived = $("#articles-hide-archived")?.checked !== false;
      let draftList = drafts.slice();
      if (hideArchived) draftList = draftList.filter((d) => d.status !== "archived");
      if (dq) {
        draftList = draftList.filter(
          (d) =>
            String(d.slug || "")
              .toLowerCase()
              .includes(dq) ||
            String(d.title || "")
              .toLowerCase()
              .includes(dq)
        );
      }
      draftBox.innerHTML = draftList.length
        ? draftList
            .map(
              (d) => `<div class="panel draft-card-row" style="padding:14px">
              <button type="button" class="draft-card-open" data-open-draft="${escapeAttr(
                d.slug
              )}" style="text-align:left;flex:1;border:0;background:transparent;padding:0;cursor:pointer">
              <strong>${escapeAttr(d.title || d.slug)}</strong>
              <span class="pill" style="margin-left:8px">${escapeAttr(d.status || "draft")}</span>
              <p class="path-hint" style="margin:6px 0 0">${escapeAttr(d.slug)}</p>
              </button>
              <div class="draft-card-actions">
                <button type="button" class="btn btn-ghost btn-xs" data-dup-draft="${escapeAttr(
                  d.slug
                )}">${escapeAttr(t("btnDuplicateDraft"))}</button>
                ${
                  d.status === "archived"
                    ? `<button type="button" class="btn btn-ghost btn-xs" data-restore-draft="${escapeAttr(
                        d.slug
                      )}">${escapeAttr(t("btnRestoreDraft"))}</button>`
                    : `<button type="button" class="btn btn-ghost btn-xs" data-archive-draft="${escapeAttr(
                        d.slug
                      )}">${escapeAttr(t("btnArchiveDraft"))}</button>`
                }
              </div>
            </div>`
            )
            .join("")
        : `<p class="hint">${escapeAttr(t("articlesNoDrafts"))}</p>`;
      $$("[data-open-draft]").forEach((btn) => {
        btn.addEventListener("click", () => openDraft(btn.getAttribute("data-open-draft")));
      });
      $$("[data-dup-draft]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          duplicateDraft(btn.getAttribute("data-dup-draft"));
        });
      });
      $$("[data-archive-draft]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          setDraftArchived(btn.getAttribute("data-archive-draft"), true);
        });
      });
      $$("[data-restore-draft]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          setDraftArchived(btn.getAttribute("data-restore-draft"), false);
        });
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
    updateAutosaveBanner();
  }

  async function duplicateDraft(sourceSlug) {
    if (!sourceSlug) return;
    if (isDraftDirty() && !confirm(t("articlesDiscardUnsaved"))) return;
    setStatus(t("loading"));
    try {
      const res = await fetch(
        window.PK_AUTH.API + "/api/content/articles/" + encodeURIComponent(sourceSlug),
        { headers: authHeaders(), credentials: "include" }
      );
      if (!res.ok) {
        setStatus(t("articlesLoadFail"), "warn");
        return;
      }
      const src = await res.json();
      let newSlug = String(sourceSlug).trim().toLowerCase() + "-copy";
      const prompted = window.prompt(t("articlesDuplicateSlugPrompt"), newSlug);
      if (prompted == null) {
        setStatus("", null);
        return;
      }
      newSlug = String(prompted || "")
        .trim()
        .toLowerCase();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
        setStatus(t("articlesNeedSlug"), "warn");
        return;
      }
      const clone = {
        ...src,
        slug: newSlug,
        status: "draft",
        seoReadyAt: null,
        publishedAt: null,
        canonical: `https://pickora.shop/${newSlug}/`,
      };
      delete clone.updatedAt;
      const saveRes = await fetch(window.PK_AUTH.API + "/api/content/articles", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(clone),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        setStatus(saveData.error || t("articlesSaveFail"), "warn");
        return;
      }
      await loadLists();
      await openDraft(newSlug);
      setStatus(t("articlesDuplicateOk"), "ok");
    } catch (err) {
      setStatus(t("articlesSaveFail") + (err?.message ? ": " + err.message : ""), "warn");
    }
  }

  async function setDraftArchived(slug, archived) {
    if (!slug) return;
    if (archived && !confirm(t("articlesArchiveConfirm"))) return;
    setStatus(t("loading"));
    try {
      const res = await fetch(
        window.PK_AUTH.API + "/api/content/articles/" + encodeURIComponent(slug),
        { headers: authHeaders(), credentials: "include" }
      );
      if (!res.ok) {
        setStatus(t("articlesLoadFail"), "warn");
        return;
      }
      const draft = await res.json();
      draft.status = archived ? "archived" : "draft";
      if (archived) draft.seoReadyAt = null;
      const saveRes = await fetch(window.PK_AUTH.API + "/api/content/articles", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(draft),
      });
      if (!saveRes.ok) {
        setStatus(t("articlesSaveFail"), "warn");
        return;
      }
      if (current?.slug === slug) {
        current.status = draft.status;
        $("#art-status-pill").textContent = draft.status;
      }
      await loadLists();
      setStatus(archived ? t("articlesArchivedOk") : t("articlesRestoredOk"), "ok");
    } catch (err) {
      setStatus(t("articlesSaveFail") + (err?.message ? ": " + err.message : ""), "warn");
    }
  }

  async function importLiveArticle(slug) {
    if (!slug) return;
    const existing = drafts.find((d) => d.slug === slug);
    if (existing && !confirm(t("articlesImportOverwrite").replace("{slug}", slug))) {
      return;
    }
    if (isDraftDirty() && !confirm(t("articlesImportDiscardDirty"))) {
      return;
    }
    setStatus(t("loading"));
    try {
      const res = await fetch(
        window.PK_AUTH.API + "/api/articles/" + encodeURIComponent(slug) + "/live",
        { headers: authHeaders(), credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || t("articlesImportFail"), "warn");
        return;
      }
      const draft = {
        ...data,
        slug: data.slug || slug,
        status: "draft",
      };
      delete draft.publishedAt;
      delete draft.note;
      current = draft;
      fillForm(draft);
      showWizard(true);
      setStatus(t("articlesImportOk"), "ok");
    } catch (err) {
      setStatus(t("articlesImportFail") + (err?.message ? ": " + err.message : ""), "warn");
    }
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
    clearAutosaveForSlug(current.slug);
    updateAutosaveBanner();
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
    if (readForm().status === "archived") {
      setStatus(t("articlesArchivedNoSeo"), "warn");
      return;
    }
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

  function liveArticleUrl(slug) {
    const s = String(slug || "")
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (!s) return "";
    const path = `/${s}/`;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return `https://pickora.shop${path}`;
    return path;
  }

  function openCompareLive() {
    const slug = readForm().slug?.trim();
    if (!slug) {
      setStatus(t("articleCompareNeedSlug"), "warn");
      return;
    }
    const live = liveArticleUrl(slug);
    if (live) window.open(live, "_blank", "noopener,noreferrer");
    openPreview();
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
    if (isDraftDirty() && !confirm(t("articlesDiscardUnsaved"))) {
      throw new Error("cancelled");
    }
    await loadLists();
    showWizard(false);
    fillForm(emptyDraft());
    setStatus("", null);
    $("#articles-status")?.classList.add("pk-hidden");
    startAutosaveLoop();
  }

  function briefBlockId() {
    return "b-" + Math.random().toString(36).slice(2, 11);
  }

  function importBrief(md) {
    const text = String(md || "").trim();
    if (!text) {
      setStatus(t("importBriefFail"), "warn");
      return null;
    }
    let title = "";
    let h1 = "";
    const parsed = [];
    let para = [];
    const flushPara = () => {
      const chunk = para.join("\n").trim();
      if (chunk) parsed.push({ id: briefBlockId(), type: "richtext", text: chunk });
      para = [];
    };
    for (const line of text.split(/\r?\n/)) {
      const h1m = line.match(/^#\s+(.+)/);
      const h2m = line.match(/^##\s+(.+)/);
      if (h1m && !title) {
        title = h1m[1].trim();
        h1 = title;
        continue;
      }
      if (h2m) {
        flushPara();
        parsed.push({
          id: briefBlockId(),
          type: "heading",
          level: 2,
          text: h2m[1].trim(),
        });
        continue;
      }
      para.push(line);
    }
    flushPara();
    if (!title) {
      const first = text.split(/\r?\n/).find((l) => l.trim());
      title = String(first || "new-article")
        .replace(/^#+\s*/, "")
        .trim();
      h1 = title;
    }
    let blocks = window.PK_BLOCKS?.starterBlocks?.(2) || [];
    if (parsed.length >= 3) {
      blocks = parsed;
    } else if (parsed.length) {
      blocks = [...parsed, ...blocks].slice(0, Math.max(3, parsed.length));
    }
    while (blocks.length < 3) {
      blocks.push({ id: briefBlockId(), type: "richtext", text: "" });
    }
    if (blocks[0]?.type === "intro") blocks[0].text = blocks[0].text || title;
    const slug = String(title || "new-article")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    const draft = {
      ...emptyDraft(),
      slug: slug || "new-article",
      title,
      h1: h1 || title,
      dek: "",
      blocks,
      bodyHtml: window.PK_BLOCKS.compileBlocksToHtml(blocks),
      affiliateLinks: window.PK_BLOCKS.collectAffiliateLinks(blocks, []),
    };
    fillForm(draft);
    showWizard(true);
    setStatus(t("importBriefOk"), "ok");
    return draft;
  }

  function bind() {
    $("#btn-article-new")?.addEventListener("click", () => {
      fillForm(emptyDraft());
      showWizard(true);
    });
    $("#btn-articles-brief-import")?.addEventListener("click", () => {
      if (window.PK_STUDIO?.canWrite?.() === false) {
        setStatus(t("viewerReadOnly"), "warn");
        return;
      }
      const md = $("#articles-brief-text")?.value || "";
      importBrief(md);
    });
    $("#articles-live-search")?.addEventListener("input", () => renderLists());
    $("#articles-draft-search")?.addEventListener("input", () => renderLists());
    $("#articles-hide-archived")?.addEventListener("change", () => renderLists());
    $("#btn-art-restore-autosave")?.addEventListener("click", () => {
      const slug = ($("#art-slug")?.value || "").trim().toLowerCase();
      const snap = peekAutosave(slug);
      if (!snap?.draft) return;
      if (isDraftDirty() && !confirm(t("articlesAutosaveOverwrite"))) return;
      fillForm(snap.draft);
      setStatus(t("articlesAutosaveRestored"), "ok");
      updateAutosaveBanner();
    });
    $("#btn-art-dismiss-autosave")?.addEventListener("click", () => {
      const slug = ($("#art-slug")?.value || "").trim().toLowerCase();
      clearAutosaveForSlug(slug);
      updateAutosaveBanner();
    });
    ["art-title", "art-meta", "art-h1", "art-dek"].forEach((id) => {
      $("#" + id)?.addEventListener("input", () => updateCharMeters());
    });
    $("#art-slug")?.addEventListener("change", () => {
      updateAutosaveBanner();
      renderInternalSuggester();
    });
    $("#art-block-template")?.addEventListener("change", () => {
      const val = $("#art-block-template")?.value || "blank";
      if (val === "blank") return;
      if (isDraftDirty() && !confirm(t("artTemplateConfirmDirty"))) {
        $("#art-block-template").value = "blank";
        return;
      }
      applyBlockTemplate(val);
      setStatus(t("artTemplateApplied"), "ok");
    });
    $("#btn-article-cancel")?.addEventListener("click", () => {
      if (isDraftDirty() && !confirm(t("confirmLeaveDirty"))) return;
      showWizard(false);
    });
    $("#btn-article-save")?.addEventListener("click", () => saveDraft());
    $("#btn-article-gate")?.addEventListener("click", () => runGate());
    $("#btn-article-preview")?.addEventListener("click", () => openPreview());
    $("#btn-article-compare-live")?.addEventListener("click", () => openCompareLive());
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
    $("#art-hub")?.addEventListener("change", () => {
      const hub = $("#art-hub").value;
      const url = articlesHubUrl(hub);
      if ($("#art-hub-url")) $("#art-hub-url").value = url;
      const picked = readChipsFromUi();
      if (!picked.length) {
        const chip = (url.match(/[?&]cat=([^&]+)/) || [])[1];
        if (chip) renderChipsCheckboxes([chip]);
      }
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
    startAutosaveLoop();
  }

  function updateArticleSaveButton() {
    const btn = $("#btn-article-save");
    if (!btn) return;
    const cw = window.PK_STUDIO?.canWrite?.() !== false;
    btn.disabled = !cw || !isDraftDirty();
  }

  window.PK_ARTICLES = {
    open,
    bind,
    t,
    importBrief,
    isDirty: isDraftDirty,
    updateSaveButton: updateArticleSaveButton,
  };
})();
