/** Pickora Studio app — Home / Pins / Products editors */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let lang = localStorage.getItem("pk_studio_lang") || "ru";
  let homeData = null;
  let pinsData = null;
  let productsData = null;
  let productsActiveHub = 0;
  let articles = [];
  let homeSavedFp = "";
  let pinsSavedFp = "";
  let productsSavedFp = "";
  let toastTimer = null;

  function t(key) {
    const pack = window.PK_I18N[lang] || window.PK_I18N.ru;
    return pack[key] || window.PK_I18N.en[key] || key;
  }

  function applyI18n() {
    $$("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", t(key));
    });
    document.title = t("metaTitle");
    const langBtn = $("#btn-lang");
    if (langBtn) langBtn.textContent = t("langSwitch");
  }

  const VIEW_TITLES = {
    dash: "navDash",
    home: "modHome",
    articles: "modArticles",
    products: "modProducts",
    pins: "modPins",
    media: "modMedia",
    publish: "modPublish",
    seo: "modSeo",
    status: "modStatus",
    team: "modTeam",
    panel: "soon",
  };

  function isLocalHost() {
    return location.hostname === "127.0.0.1" || location.hostname === "localhost";
  }

  function closeSidebar() {
    $("#studio-sidebar")?.classList.remove("open");
    const bd = $("#sidebar-backdrop");
    if (bd) {
      bd.classList.remove("open");
      bd.hidden = true;
    }
  }

  function setActiveNav(view) {
    $$(".nav-item[data-nav]").forEach((btn) => {
      const on = btn.getAttribute("data-nav") === view;
      btn.classList.toggle("active", on);
      btn.classList.toggle("is-active", on);
    });
    const title = $("#topbar-title");
    if (title) title.textContent = t(VIEW_TITLES[view] || "metaTitle");
  }

  function show(id) {
    if (id === "login") {
      document.querySelector(".login-screen")?.classList.remove("pk-hidden");
      $("#studio-app")?.classList.add("pk-hidden");
      closeSidebar();
      return;
    }
    document.querySelector(".login-screen")?.classList.add("pk-hidden");
    $("#studio-app")?.classList.remove("pk-hidden");
    $$(".studio-panel[data-view]").forEach((el) => {
      el.classList.toggle("pk-hidden", el.getAttribute("data-view") !== id);
    });
    setActiveNav(id);
    closeSidebar();
  }

  function updatePreviewLinks() {
    const local = isLocalHost();
    const labRoot = $("#link-open-lab");
    if (labRoot) labRoot.classList.toggle("pk-hidden", !local);

    const pairs = [
      ["link-preview-home", "/", "btnOpenLiveHome"],
      ["link-lab-home", "http://127.0.0.1:8765/admin-lab/site/", "btnOpenLab"],
      ["link-preview-pins", "/categories/", "btnOpenLivePins"],
      ["link-lab-pins", "http://127.0.0.1:8765/admin-lab/site/categories/", "btnOpenLabPins"],
      ["link-preview-products", "/products/", "btnOpenLiveProducts"],
      ["link-lab-products", "http://127.0.0.1:8765/admin-lab/site/products/", "btnOpenLabProducts"],
      ["link-lab-articles", "http://127.0.0.1:8765/admin-lab/site/articles/", "btnOpenLabArticles"],
    ];
    pairs.forEach(([id, href, key]) => {
      const a = document.getElementById(id);
      if (!a) return;
      if (id.startsWith("link-lab-")) {
        a.classList.toggle("pk-hidden", !local);
        a.href = href;
      } else {
        a.href = href;
      }
      if (key) a.textContent = t(key);
    });
  }

  function authHeaders(json = true) {
    const s = window.PK_AUTH.getSession();
    const h = {};
    if (json) h["Content-Type"] = "application/json";
    if (s?.token) h.Authorization = "Bearer " + s.token;
    return h;
  }

  function escapeAttr(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function imgSrc(path) {
    if (!path) return "";
    const p = String(path).trim();
    const mediaBase =
      (window.PK_AUTH?.API || "https://pickora-admin-api.pickara-admin.workers.dev").replace(
        /\/$/,
        ""
      ) + "/api/media/file/";
    // Broken relative media paths from catalog strip — point at API Worker
    if (/^\/?api\/media\/file\//i.test(p) || /^https?:\/\/pickora\.shop\/api\/media\/file\//i.test(p)) {
      const key = p.replace(/^https?:\/\/pickora\.shop/i, "").replace(/^\/?api\/media\/file\//i, "");
      return mediaBase + key;
    }
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return p.startsWith("/") ? p : "/" + p;
  }

  function normalizeUrl(url) {
    if (!url) return "";
    let u = url.trim();
    if (u.startsWith("https://pickora.shop")) u = u.replace("https://pickora.shop", "");
    if (!u.startsWith("/")) u = "/" + u;
    if (!u.endsWith("/")) u += "/";
    return u;
  }

  function findArticleByUrl(url) {
    const n = normalizeUrl(url);
    return articles.find((a) => normalizeUrl(a.url) === n) || null;
  }

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.classList.remove("pk-hidden", "ok", "warn");
    el.textContent = msg;
    if (kind) el.classList.add(kind);
  }

  function ensureAltFromTitle(existingAlt, title) {
    const a = String(existingAlt || "").trim();
    if (a) return a;
    return String(title || "").trim();
  }

  function setCardThumbPreview(card, fileOrUrl) {
    if (!card) return null;
    const thumb = card.querySelector(".review-thumb");
    if (!thumb) return null;
    let url =
      typeof fileOrUrl === "string"
        ? fileOrUrl
        : fileOrUrl instanceof File
          ? URL.createObjectURL(fileOrUrl)
          : null;
    if (!url) return null;
    let img = thumb.querySelector("img");
    if (!img) {
      thumb.innerHTML = "";
      img = document.createElement("img");
      thumb.appendChild(img);
    }
    img.src = url;
    img.alt = "";
    return url.startsWith("blob:") ? url : null;
  }

  function thumbImageActionsHtml(replaceDataAttr, pickerDataAttr) {
    return `<div class="thumb-actions" style="display:flex;gap:6px;flex-wrap:wrap">
      <label class="btn btn-ghost btn-sm upload-btn">${escapeAttr(t("btnReplaceImage"))}
        <input type="file" accept="image/*" ${replaceDataAttr} hidden>
      </label>
      <button type="button" class="btn btn-ghost btn-sm" ${pickerDataAttr}>${escapeAttr(
      t("btnFromMedia")
    )}</button>
    </div>`;
  }

  function mediaPickPath(pick) {
    return pick?.path || pick?.workerUrl || "";
  }

  function bindMediaPickerButtons(selector, onPickForButton) {
    $$(selector).forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!window.PK_MEDIA?.openPicker) return;
        window.PK_MEDIA.openPicker({
          onPick: (pick) => onPickForButton(btn, pick),
        });
      });
    });
  }

  async function uploadImage(file, preferredName) {
    return window.PK_MEDIA.upload(file, preferredName);
  }

  /* —— Home —— */
  const HOME_REVIEWS_MIN = 3;
  const HOME_REVIEWS_MAX = 6;

  function isValidLatestReviewsCount(arr) {
    return Array.isArray(arr) && arr.length >= HOME_REVIEWS_MIN && arr.length <= HOME_REVIEWS_MAX;
  }

  function emptyReviewSlot() {
    return {
      url: "",
      title: "",
      excerpt: "",
      category: "",
      image: "",
      imageAlt: "",
      badge: "none",
      slug: "",
    };
  }

  function ensureHomeReviewSlots() {
    if (!homeData) return;
    if (!Array.isArray(homeData.latestReviews)) homeData.latestReviews = [];
    while (homeData.latestReviews.length < HOME_REVIEWS_MIN) {
      homeData.latestReviews.push(emptyReviewSlot());
    }
    if (homeData.latestReviews.length > HOME_REVIEWS_MAX) {
      homeData.latestReviews = homeData.latestReviews.slice(0, HOME_REVIEWS_MAX);
    }
  }

  function applyArticleToSlot(index, article) {
    if (!homeData?.latestReviews?.[index] || !article) return;
    const prev = homeData.latestReviews[index];
    // Persist a URL that works on GitHub Pages (Worker media or /wp-content/…)
    let image = article.image || "";
    if (/\/api\/media\/file\//i.test(image) && !/^https?:\/\/pickora-admin-api\./i.test(image)) {
      image = imgSrc(image);
    }
    homeData.latestReviews[index] = {
      ...prev,
      slug: article.slug,
      url: normalizeUrl(article.url),
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      image,
      imageAlt: article.imageAlt || article.title,
      badge: prev.badge || "none",
    };
    renderHomeEditor();
  }

  function renderHomeReviewsToolbar() {
    if (!homeData) return;
    const n = homeData.latestReviews.length;
    const countEl = $("#home-reviews-count");
    if (countEl) {
      countEl.textContent = t("homeReviewsCountLabel")
        .replace("{n}", String(n))
        .replace("{max}", String(HOME_REVIEWS_MAX));
    }
    const addBtn = $("#btn-review-add");
    if (addBtn) {
      addBtn.disabled = !canWriteSession() || n >= HOME_REVIEWS_MAX;
      if (!addBtn.dataset.bound) {
        addBtn.dataset.bound = "1";
        addBtn.addEventListener("click", () => {
          if (!homeData || !canWriteSession()) return;
          readHomeForm();
          if (homeData.latestReviews.length >= HOME_REVIEWS_MAX) return;
          homeData.latestReviews.unshift(emptyReviewSlot());
          renderHomeEditor();
          updateDirtyUi();
        });
      }
    }
  }

  function renderHomeEditor() {
    const wrap = $("#home-reviews");
    if (!wrap || !homeData) return;
    ensureHomeReviewSlots();
    renderHomeReviewsToolbar();
    const badges = ["none", "new", "hot", "updated", "must-read", "editors-pick"];
    const canRemoveReview = homeData.latestReviews.length > HOME_REVIEWS_MIN;

    wrap.innerHTML = homeData.latestReviews
      .map((r, i) => {
        const selected = normalizeUrl(r.url);
        const options = [
          `<option value="">${escapeAttr(t("pickArticle"))}</option>`,
          ...articles.map((a) => {
            const val = normalizeUrl(a.url);
            const sel = val === selected ? " selected" : "";
            return `<option value="${escapeAttr(val)}"${sel}>${escapeAttr(a.title)}</option>`;
          }),
        ].join("");

        return `<div class="review-card panel" data-review-index="${i}">
          <div class="review-card-head">
            <h3>#${i + 1}</h3>
            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
              <span class="pill">${escapeAttr(r.category || "")}</span>
              ${
                canRemoveReview
                  ? `<button type="button" class="btn btn-ghost btn-sm" data-review-del="${i}">${escapeAttr(
                      t("btnRemoveReview")
                    )}</button>`
                  : ""
              }
            </div>
          </div>
          <div class="review-card-body">
            <div class="review-thumb-col">
              <div class="review-thumb">
                ${
                  r.image
                    ? `<img src="${escapeAttr(imgSrc(r.image))}" alt="${escapeAttr(
                        r.imageAlt || r.title || ""
                      )}">`
                    : `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`
                }
              </div>
              <label class="btn btn-ghost btn-sm upload-btn">
                ${escapeAttr(t("btnUploadImage"))}
                <input type="file" accept="image/*" data-upload-index="${i}" hidden>
              </label>
              <p class="path-hint">${escapeAttr(r.image || "—")}</p>
            </div>
            <div class="review-fields">
              <div class="field">
                <label>${escapeAttr(t("labelPickArticle"))}</label>
                <select data-article-pick="${i}">${options}</select>
              </div>
              <div class="field"><label>${escapeAttr(t("labelTitle"))}</label>
                <input data-k="title" value="${escapeAttr(r.title || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelExcerpt"))}</label>
                <input data-k="excerpt" value="${escapeAttr(r.excerpt || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelCategory"))}</label>
                <input data-k="category" value="${escapeAttr(r.category || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelBadge"))}</label>
                <select data-k="badge">${badges
                  .map(
                    (b) =>
                      `<option value="${b}" ${
                        (r.badge || "none") === b ? "selected" : ""
                      }>${b}</option>`
                  )
                  .join("")}</select></div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    $$("[data-article-pick]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const idx = Number(sel.getAttribute("data-article-pick"));
        const art = findArticleByUrl(sel.value);
        if (art) applyArticleToSlot(idx, art);
      });
    });

    $$("[data-upload-index]").forEach((input) => {
      input.addEventListener("change", () => {
        const idx = Number(input.getAttribute("data-upload-index"));
        const file = input.files && input.files[0];
        if (file) uploadHomeImage(idx, file);
        input.value = "";
      });
    });

    $$("[data-review-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-review-del"));
        readHomeForm();
        if (homeData.latestReviews.length <= HOME_REVIEWS_MIN) return;
        homeData.latestReviews.splice(idx, 1);
        renderHomeEditor();
      });
    });

    renderTopPicksEditor();
  }

  function ensureTopPicks() {
    if (!homeData.topPicks || typeof homeData.topPicks !== "object") {
      homeData.topPicks = { updated: "", picks: [] };
    }
    if (!Array.isArray(homeData.topPicks.picks)) homeData.topPicks.picks = [];
  }

  function renderTopPicksEditor() {
    const wrap = $("#home-top-picks");
    if (!wrap || !homeData) return;
    ensureTopPicks();
    const picks = homeData.topPicks.picks;
    wrap.innerHTML =
      `<div class="field" style="margin-bottom:12px"><label>${escapeAttr(
        t("labelTopPicksUpdated")
      )}</label>
        <input id="top-picks-updated" value="${escapeAttr(
          homeData.topPicks.updated || ""
        )}" placeholder="2026-10-03"></div>` +
      picks
        .map((p, i) => {
          return `<div class="review-card panel top-pick-card" data-top-pick="${i}" draggable="true">
          <div class="review-card-head">
            <h3 class="tp-drag-handle" title="${escapeAttr(t("topPickDragHint"))}">⋮⋮ #${i + 1} ${escapeAttr(
              p.title || "Top pick"
            )}</h3>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button type="button" class="btn btn-ghost btn-sm" data-tp-up="${i}" ${
                i === 0 ? "disabled" : ""
              }>↑</button>
              <button type="button" class="btn btn-ghost btn-sm" data-tp-down="${i}" ${
                i === picks.length - 1 ? "disabled" : ""
              }>↓</button>
              <button type="button" class="btn btn-ghost btn-sm" data-tp-del="${i}">${escapeAttr(
                t("btnDeletePin")
              )}</button>
            </div>
          </div>
          <div class="review-card-body">
            <div class="review-thumb-col">
              <div class="review-thumb">
                ${
                  p.image
                    ? `<img src="${escapeAttr(imgSrc(p.image))}" alt="">`
                    : `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`
                }
              </div>
              ${thumbImageActionsHtml(`data-tp-upload="${i}"`, `data-tp-media="${i}"`)}
            </div>
            <div class="review-fields">
              <div class="field-row" style="display:flex;gap:10px;flex-wrap:wrap">
                <div class="field grow"><label>Title</label><input data-tp="title" value="${escapeAttr(
                  p.title || ""
                )}"></div>
                <div class="field"><label>Badge</label><input data-tp="badge" value="${escapeAttr(
                  p.badge || ""
                )}" placeholder="Top Pick"></div>
              </div>
              <div class="field"><label>Tagline</label><input data-tp="tagline" value="${escapeAttr(
                p.tagline || ""
              )}"></div>
              <div class="field"><label>${escapeAttr(t("labelCategory"))}</label><input data-tp="category" value="${escapeAttr(
                p.category || ""
              )}"></div>
              <div class="field"><label>Blurb</label><textarea data-tp="blurb" rows="2">${escapeAttr(
                p.blurb || ""
              )}</textarea></div>
              <div class="field"><label>Pros (1/line)</label><textarea data-tp="pros" rows="2">${escapeAttr(
                (p.pros || []).join("\n")
              )}</textarea></div>
              ${buyLinksEditorHtml(normalizeBuyLinks({ ...p, url: p.amazonUrl }), `data-tp-links="${i}"`)}
              <div class="field"><label>Guide URL</label><input data-tp="guideUrl" value="${escapeAttr(
                p.guideUrl || ""
              )}" placeholder="/best-…/"></div>
              <div class="field"><label>Alt</label><input data-tp="imageAlt" value="${escapeAttr(
                p.imageAlt || ""
              )}"></div>
            </div>
          </div>
        </div>`;
        })
        .join("");

    $$("[data-tp-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        readTopPicksForm();
        homeData.topPicks.picks.splice(Number(btn.getAttribute("data-tp-del")), 1);
        renderTopPicksEditor();
      });
    });
    $$("[data-tp-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-tp-up"));
        readTopPicksForm();
        const arr = homeData.topPicks.picks;
        if (i < 1) return;
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        renderTopPicksEditor();
      });
    });
    $$("[data-tp-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-tp-down"));
        readTopPicksForm();
        const arr = homeData.topPicks.picks;
        if (i >= arr.length - 1) return;
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        renderTopPicksEditor();
      });
    });
    $$("[data-tp-upload]").forEach((input) => {
      input.addEventListener("change", async () => {
        const i = Number(input.getAttribute("data-tp-upload"));
        const file = input.files && input.files[0];
        input.value = "";
        if (!file) return;
        const card = input.closest("[data-top-pick]");
        const status = $("#home-status");
        const blobUrl = setCardThumbPreview(card, file);
        setStatus(status, t("uploading"));
        try {
          readTopPicksForm();
          const pick = homeData.topPicks.picks[i] || {};
          const id = pick.id || "top-pick";
          const data = await uploadImage(file, "top-pick-" + id);
          homeData.topPicks.picks[i].image = data.path;
          homeData.topPicks.picks[i].imageAlt = ensureAltFromTitle(
            pick.imageAlt,
            pick.title || file.name
          );
          if (blobUrl) URL.revokeObjectURL(blobUrl);
          renderTopPicksEditor();
          setStatus(status, t("uploadOk"), "ok");
        } catch (err) {
          if (blobUrl) URL.revokeObjectURL(blobUrl);
          setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
        }
      });
    });
    bindMediaPickerButtons("[data-tp-media]", (btn, pick) => {
      const i = Number(btn.getAttribute("data-tp-media"));
      readTopPicksForm();
      const p = homeData.topPicks.picks[i];
      if (!p) return;
      p.image = mediaPickPath(pick);
      p.imageAlt = ensureAltFromTitle(p.imageAlt, p.title);
      renderTopPicksEditor();
    });
    bindTopPicksDragDrop(wrap);
    bindBuyLinksEditor(wrap);
  }

  function bindTopPicksDragDrop(wrap) {
    if (!wrap) return;
    let dragFrom = null;
    wrap.querySelectorAll(".top-pick-card[draggable]").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        dragFrom = Number(card.getAttribute("data-top-pick"));
        card.classList.add("is-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(dragFrom));
        }
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("is-dragging");
        wrap.querySelectorAll(".top-pick-card").forEach((c) => c.classList.remove("is-drag-over"));
        dragFrom = null;
      });
      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        card.classList.add("is-drag-over");
      });
      card.addEventListener("dragleave", () => card.classList.remove("is-drag-over"));
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("is-drag-over");
        const from =
          dragFrom != null
            ? dragFrom
            : Number(e.dataTransfer?.getData("text/plain"));
        const to = Number(card.getAttribute("data-top-pick"));
        if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) return;
        readTopPicksForm();
        const arr = homeData.topPicks.picks;
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        renderTopPicksEditor();
      });
    });
  }

  function readTopPicksForm() {
    ensureTopPicks();
    const updated = $("#top-picks-updated")?.value?.trim() || homeData.topPicks.updated || "";
    const picks = [];
    $$("#home-top-picks [data-top-pick]").forEach((card) => {
      const i = Number(card.getAttribute("data-top-pick"));
      const prev = homeData.topPicks.picks[i] || {};
      const g = (k) => card.querySelector(`[data-tp="${k}"]`)?.value || "";
      const title = g("title").trim();
      const links = readBuyLinksFrom(card.querySelector(".buy-links"));
      const amazonUrl =
        links.find((l) => l.style === "amazon")?.url || links[0]?.url || prev.amazonUrl || "";
      picks.push({
        ...prev,
        id: prev.id || slugify(title) || "pick-" + (i + 1),
        title,
        badge: g("badge").trim(),
        tagline: g("tagline").trim(),
        category: g("category").trim(),
        blurb: g("blurb").trim(),
        pros: linesToList(g("pros")),
        links,
        amazonUrl,
        guideUrl: g("guideUrl").trim(),
        imageAlt: g("imageAlt").trim() || title,
        image: prev.image || "",
      });
    });
    homeData.topPicks = { ...homeData.topPicks, updated, picks };
    return homeData.topPicks;
  }

  function readHomeForm() {
    const reviews = [];
    $$("#home-reviews [data-review-index]").forEach((card) => {
      const i = Number(card.getAttribute("data-review-index"));
      const prev = homeData.latestReviews[i] || {};
      const get = (k) => card.querySelector(`[data-k="${k}"]`)?.value?.trim() || "";
      reviews.push({
        ...prev,
        title: get("title") || prev.title,
        excerpt: get("excerpt") || prev.excerpt,
        category: get("category") || prev.category,
        badge: get("badge") || "none",
        imageAlt: prev.imageAlt || get("title") || prev.title,
        url: normalizeUrl(prev.url),
        image: prev.image,
        slug: prev.slug,
      });
    });
    return reviews;
  }

  async function uploadHomeImage(index, file) {
    const status = $("#home-status");
    setStatus(status, t("uploading"));
    try {
      const preferred = (homeData.latestReviews[index]?.slug || "review") + "-cover";
      const data = await uploadImage(file, preferred);
      homeData.latestReviews = readHomeForm().map((r, i) =>
        i === index
          ? { ...r, image: data.path, imageAlt: r.title || file.name }
          : r
      );
      renderHomeEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch (err) {
      setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
    }
  }

  async function openHome() {
    const [homeRes, artRes] = await Promise.all([
      fetch(window.PK_AUTH.API + "/api/content/home", {
        headers: authHeaders(),
        credentials: "include",
      }),
      fetch(window.PK_AUTH.API + "/api/articles", {
        headers: authHeaders(),
        credentials: "include",
      }),
    ]);
    if (!homeRes.ok || !artRes.ok) throw new Error("load_failed");
    homeData = await homeRes.json();
    articles = (await artRes.json()).articles || [];
    ensureHomeReviewSlots();
    renderHomeEditor();
    syncSavedFingerprints();
    applyI18n();
    show("home");
  }

  function isGoodBuyUrl(u) {
    const s = String(u || "").trim();
    if (!s || /TODO/i.test(s)) return false;
    if (!/^https:\/\//i.test(s)) return false;
    // Placeholder stubs from "add product" / new blocks
    if (/^https:\/\/link\.amazon\/?$/i.test(s)) return false;
    if (/^https:\/\/(www\.)?amzn\.to\/?$/i.test(s)) return false;
    return true;
  }

  async function saveHome() {
    if (!canWriteSession()) {
      toast(t("viewerReadOnly"));
      return;
    }
    const status = $("#home-status");
    const latestReviews = readHomeForm();
    const topPicks = readTopPicksForm();
    const bad = [];
    (topPicks.picks || []).forEach((p, i) => {
      const links = normalizeBuyLinks({ ...p, url: p.amazonUrl }).filter((l) => l.url);
      if (!links.length) return;
      links.forEach((l) => {
        if (!isGoodBuyUrl(l.url)) bad.push((p.title || "pick#" + (i + 1)) + ": " + l.url);
      });
    });
    if (bad.length) {
      setStatus(
        status,
        t("productsBadLinks").replace("{n}", String(bad.length)) + ": " + bad.slice(0, 3).join(", "),
        "warn"
      );
      return;
    }
    const urlSlots = new Map();
    (latestReviews || []).forEach((r, i) => {
      const u = normalizeUrl(r.url);
      if (!u) return;
      if (!urlSlots.has(u)) urlSlots.set(u, []);
      urlSlots.get(u).push(i + 1);
    });
    const dupReviews = [...urlSlots.entries()].filter(([, slots]) => slots.length > 1);
    if (dupReviews.length) {
      const detail = dupReviews
        .slice(0, 3)
        .map(([u, slots]) => "#" + slots.join(", #") + ": " + u)
        .join("; ");
      setStatus(
        status,
        t("homeDupReviewUrls").replace("{n}", String(dupReviews.length)) + " — " + detail,
        "warn"
      );
      return;
    }
    if (!isValidLatestReviewsCount(latestReviews)) {
      setStatus(status, t("homeReviewsCountInvalid"), "warn");
      return;
    }
    const res = await fetch(window.PK_AUTH.API + "/api/content/home", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ latestReviews, topPicks }),
    });
    if (!res.ok) {
      setStatus(status, t("homeSaveFail"), "warn");
      toast(t("homeSaveFail"));
      return;
    }
    homeData.latestReviews = latestReviews;
    homeData.topPicks = topPicks;
    const okMsg = window.PK_AUTH.isCloud?.() ? t("homeSavedCloud") : t("homeSaved");
    setStatus(status, okMsg, "ok");
    toast(okMsg);
    syncSavedFingerprints();
    window.PK_OPS?.softReloadSeoLinks?.();
  }

  /* —— Pins —— */
  const BUY_LINK_STYLES = ["amazon", "blue", "outline", "walmart", "dark"];
  const BUY_LINK_PRESETS = [
    { key: "amazon", label: "Amazon", style: "amazon" },
    { key: "walmart", label: "Walmart", style: "walmart" },
    { key: "bestbuy", label: "Best Buy", style: "blue" },
    { key: "other", label: "Other", style: "outline" },
  ];

  function detectBuyStyle(url, explicit) {
    const st = String(explicit || "").trim();
    if (BUY_LINK_STYLES.includes(st)) return st;
    const u = String(url || "");
    if (/amzn\.to|amazon\.|link\.amazon/i.test(u)) return "amazon";
    if (/walmart\.com/i.test(u)) return "walmart";
    return "blue";
  }

  function normalizeBuyLinks(product) {
    const raw = Array.isArray(product?.links) ? product.links : [];
    const fromLinks = raw
      .map((l) => ({
        label: String(l?.label || "").trim(),
        url: String(l?.url || "").trim(),
        style: detectBuyStyle(l?.url, l?.style),
      }))
      .filter((l) => l.url);
    if (fromLinks.length) return fromLinks;
    const legacy = String(product?.amazonUrl || product?.url || "").trim();
    if (legacy) {
      return [
        {
          label: /amzn\.to|amazon\.|link\.amazon/i.test(legacy) ? "Amazon" : "Buy",
          url: legacy,
          style: detectBuyStyle(legacy),
        },
      ];
    }
    return [{ label: "Amazon", url: "", style: "amazon" }];
  }

  function buyLinkRowInnerHtml(l) {
    const st = detectBuyStyle(l.url, l.style);
    const styleOpts = BUY_LINK_STYLES.map(
      (s) =>
        `<option value="${s}"${s === st ? " selected" : ""}>${escapeAttr(t("linkStyle_" + s))}</option>`
    ).join("");
    return `<input class="buy-store" data-f="llabel" placeholder="Amazon" value="${escapeAttr(l.label || "")}">
          <input class="buy-url" data-f="lurl" placeholder="https://amzn.to/… or store URL" value="${escapeAttr(l.url || "")}" inputmode="url" spellcheck="false">
          <select class="buy-style" data-f="lstyle" title="${escapeAttr(t("linkStyle"))}" aria-label="${escapeAttr(t("linkStyle"))}">${styleOpts}</select>
          <button type="button" class="btn btn-ghost btn-xs buy-check-btn" data-link-check title="${escapeAttr(t("btnCheckLink"))}">${escapeAttr(t("btnCheckLink"))}</button>
          <span class="buy-check-status pk-hidden" data-link-check-status aria-live="polite"></span>
          <button type="button" class="block-tool block-tool-del" data-link-del title="${escapeAttr(t("btnDeletePin"))}" aria-label="${escapeAttr(t("btnDeletePin"))}">×</button>`;
  }

  function buyLinksEditorHtml(links, rowAttr) {
    const list = links && links.length ? links : [{ label: "Amazon", url: "", style: "amazon" }];
    const presetBtns = BUY_LINK_PRESETS.map(
      (p) =>
        `<button type="button" class="btn btn-ghost btn-xs buy-preset" data-link-preset="${escapeAttr(p.key)}" data-preset-label="${escapeAttr(p.label)}" data-preset-style="${escapeAttr(p.style)}">${escapeAttr(t("linkPreset_" + p.key))}</button>`
    ).join("");
    const rows = list
      .map((l) => `<div class="buy-row" data-link-row>${buyLinkRowInnerHtml(l)}</div>`)
      .join("");
    return `<div class="buy-links" ${rowAttr || ""}>
        <span class="block-legend">${escapeAttr(t("blockBuyLinks"))}</span>
        <div class="buy-presets">${presetBtns}</div>
        <p class="block-hint">${escapeAttr(t("hintBuyLinkMulti"))}</p>
        <div class="buy-rows">${rows}</div>
        <button type="button" class="btn btn-ghost btn-sm" data-link-add>+ ${escapeAttr(t("blockAddLink"))}</button>
      </div>`;
  }

  function appendBuyLinkRow(rows, preset) {
    const div = document.createElement("div");
    div.className = "buy-row";
    div.setAttribute("data-link-row", "");
    const label = preset?.label || "Walmart";
    const style = preset?.style || "walmart";
    div.innerHTML = buyLinkRowInnerHtml({ label, url: "", style });
    rows.appendChild(div);
    bindBuyLinkRowTools(div);
  }

  function flashBuyLinkCheck(row, ok, detail) {
    const el = row?.querySelector("[data-link-check-status]");
    if (!el) return;
    el.classList.remove("pk-hidden", "ok", "warn");
    el.textContent = ok ? t("linkCheckOk") : t("linkCheckFail") + (detail ? `: ${detail}` : "");
    el.classList.add(ok ? "ok" : "warn");
    clearTimeout(el._pkCheckT);
    el._pkCheckT = setTimeout(() => {
      el.classList.add("pk-hidden");
      el.textContent = "";
    }, 3200);
  }

  async function checkBuyLinkRow(row) {
    const url = row.querySelector("[data-f=lurl]")?.value?.trim() || "";
    if (!url) {
      flashBuyLinkCheck(row, false, t("linkCheckEmpty"));
      return;
    }
    const btn = row.querySelector("[data-link-check]");
    if (btn) btn.disabled = true;
    try {
      const res = await window.PK_AUTH.apiFetch("/api/links/check", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ links: [url] }),
      });
      const data = await res.json().catch(() => ({}));
      const r = (data.results || []).find((x) => x.url === url) || data.results?.[0];
      if (!res.ok) {
        flashBuyLinkCheck(row, false, data.error || "");
        return;
      }
      flashBuyLinkCheck(row, !!r?.ok, r?.error || (r?.status ? String(r.status) : ""));
    } catch (err) {
      flashBuyLinkCheck(row, false, err?.message || "");
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bindBuyLinkRowTools(row) {
    row.querySelector("[data-link-del]")?.addEventListener("click", () => {
      const rows = row.closest(".buy-rows");
      if (!rows) return;
      if (rows.querySelectorAll("[data-link-row]").length > 1) row.remove();
    });
    row.querySelector("[data-link-check]")?.addEventListener("click", () => checkBuyLinkRow(row));
  }

  function readBuyLinksFrom(el) {
    if (!el) return [];
    return [...el.querySelectorAll("[data-link-row]")]
      .map((row) => {
        const url = row.querySelector("[data-f=lurl]")?.value?.trim() || "";
        const label = row.querySelector("[data-f=llabel]")?.value?.trim() || "";
        const style = detectBuyStyle(url, row.querySelector("[data-f=lstyle]")?.value || "");
        return { label: label || (style === "amazon" ? "Amazon" : "Buy"), url, style };
      })
      .filter((l) => l.url);
  }

  function bindBuyLinksEditor(root) {
    if (!root) return;
    root.querySelectorAll("[data-link-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rows = btn.closest(".buy-links")?.querySelector(".buy-rows");
        if (rows) appendBuyLinkRow(rows, { label: "Walmart", style: "walmart" });
      });
    });
    root.querySelectorAll("[data-link-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rows = btn.closest(".buy-links")?.querySelector(".buy-rows");
        if (!rows) return;
        appendBuyLinkRow(rows, {
          label: btn.getAttribute("data-preset-label") || "Buy",
          style: btn.getAttribute("data-preset-style") || "blue",
        });
      });
    });
    root.querySelectorAll("[data-link-row]").forEach((row) => bindBuyLinkRowTools(row));
  }

  function liveSiteUrl(path) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return isLocalHost() ? `https://pickora.shop${p}` : p;
  }

  function compareLiveWithOffline(livePath, offlineFn) {
    window.open(liveSiteUrl(livePath), "_blank", "noopener,noreferrer");
    offlineFn();
  }

  /** Pin textarea: Name | Amazon | url | Walmart | url  OR legacy Name | url */
  function productsToText(products) {
    return (products || [])
      .map((p) => {
        const links = normalizeBuyLinks(p).filter((l) => l.url && l.url !== "https://link.amazon/");
        if (!links.length && p.url) return `${p.name || ""} | ${p.url}`;
        if (links.length === 1 && (!links[0].label || links[0].style === "amazon")) {
          return `${p.name || ""} | ${links[0].url}`;
        }
        const parts = [p.name || ""];
        links.forEach((l) => {
          parts.push(l.label || "Buy", l.url);
        });
        return parts.join(" | ");
      })
      .join("\n");
  }

  function textToProducts(text) {
    return String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((x) => x.trim());
        const name = parts[0] || "";
        if (parts.length === 2 && /^https?:\/\//i.test(parts[1] || "")) {
          return {
            name,
            url: parts[1],
            links: [
              {
                label: /amzn\.to|amazon\.|link\.amazon/i.test(parts[1]) ? "Amazon" : "Buy",
                url: parts[1],
                style: detectBuyStyle(parts[1]),
              },
            ],
          };
        }
        const links = [];
        for (let i = 1; i + 1 < parts.length; i += 2) {
          const label = parts[i] || "Buy";
          const url = parts[i + 1] || "";
          if (/^https?:\/\//i.test(url)) {
            links.push({ label, url, style: detectBuyStyle(url) });
          }
        }
        return { name, url: links[0]?.url || "", links };
      })
      .filter((p) => p.name);
  }

  function normalizeHubProduct(raw, hubId, index) {
    const title = String(raw?.title || raw?.name || "").trim();
    const links = normalizeBuyLinks(raw);
    const amazonUrl =
      links.find((l) => l.style === "amazon")?.url || links[0]?.url || raw?.amazonUrl || "";
    const pros = Array.isArray(raw?.pros) ? raw.pros : linesToList(raw?.pros);
    const cons = Array.isArray(raw?.cons) ? raw.cons : linesToList(raw?.cons);
    const starsRaw = raw?.ratingStars;
    const ratingStars =
      starsRaw === 0 || starsRaw === "0" || starsRaw == null
        ? 0
        : Math.min(5, Math.max(0, Number(starsRaw) || 0));
    return {
      id: String(raw?.id || `${hubId}-${Date.now().toString(36)}-${index}`),
      title,
      image: raw?.image || "",
      imageAlt: raw?.imageAlt || title,
      description: raw?.description || "",
      pros,
      cons,
      verdict: raw?.verdict || "",
      amazonUrl,
      links: links.length
        ? links
        : [{ label: "Amazon", url: amazonUrl || "", style: "amazon" }],
      ratingStars,
      hidden: !!raw?.hidden,
    };
  }

  function parseBulkProductsInput(text, hubId) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      const arr = JSON.parse(trimmed);
      if (!Array.isArray(arr)) throw new Error("expected_array");
      return arr.map((p, i) => normalizeHubProduct(p, hubId, i));
    }
    return textToProducts(trimmed).map((p, i) =>
      normalizeHubProduct({ title: p.name, links: p.links, url: p.url }, hubId, i)
    );
  }

  function applyBulkProductsToHub(hubId, items) {
    if (!productsData || !hubId || !items.length) return 0;
    ensureCategoryProducts();
    const list = productsData.categoryProducts[hubId] || [];
    productsData.categoryProducts[hubId] = [...items, ...list];
    return items.length;
  }

  function renderAgentImportPreview(rows) {
    const box = $("#products-import-preview");
    if (!box) return;
    if (!rows.length) {
      box.innerHTML = `<p class="hint">${escapeAttr(t("productsImportPreviewEmpty"))}</p>`;
      return;
    }
    box.innerHTML =
      `<table class="import-preview-table"><thead><tr><th>#</th><th>${escapeAttr(
        t("labelTitle")
      )}</th><th>${escapeAttr(t("labelProductHidden"))}</th></tr></thead><tbody>` +
      rows
        .slice(0, 30)
        .map(
          (p, i) =>
            `<tr><td>${i + 1}</td><td>${escapeAttr(p.title || "—")}</td><td>${
              p.hidden ? "✓" : ""
            }</td></tr>`
        )
        .join("") +
      (rows.length > 30
        ? `<tr><td colspan="3">… +${rows.length - 30}</td></tr>`
        : "") +
      `</tbody></table>`;
  }

  function filterOptions(selected) {
    const filters = pinsData?.filters || [];
    return filters
      .filter((f) => f.id !== "all")
      .map((f) => {
        const sel = f.id === selected ? " selected" : "";
        return `<option value="${escapeAttr(f.id)}"${sel}>${escapeAttr(f.label)}</option>`;
      })
      .join("");
  }

  function pinProductsEditorHtml(pinIndex, products) {
    const list = products && products.length ? products : [{ name: "", url: "", links: [] }];
    const items = list
      .map((prod, pj) => {
        const links = normalizeBuyLinks(prod);
        return `<div class="product-item panel product-item--compact" data-pin-product="${pinIndex}:${pj}" style="margin-top:10px">
          <div class="review-card-head">
            <h4>${escapeAttr(t("labelProduct"))} #${pj + 1}</h4>
            <button type="button" class="btn btn-ghost btn-sm" data-pin-product-del="${pinIndex}:${pj}">${escapeAttr(
              t("btnDeleteProduct")
            )}</button>
          </div>
          <div class="field" style="margin-bottom:0"><label>${escapeAttr(t("labelTitle"))}</label>
            <input data-pk="name" value="${escapeAttr(prod.name || "")}" placeholder="Product name"></div>
          ${buyLinksEditorHtml(links, `data-pin-product-links="${pinIndex}:${pj}"`)}
        </div>`;
      })
      .join("");
    return `<div class="pin-products">
        <span class="block-legend">${escapeAttr(t("labelPinProducts"))}</span>
        <p class="block-hint">${escapeAttr(t("pinProductsHint"))}</p>
        ${items}
        <button type="button" class="btn btn-ghost btn-sm" data-pin-product-add="${pinIndex}" style="margin-top:10px;width:auto">${escapeAttr(
          t("btnAddProduct")
        )}</button>
      </div>`;
  }

  function renderPinsEditor() {
    const wrap = $("#pins-list");
    if (!wrap || !pinsData) return;

    const shuffleEl = $("#pins-shuffle-load");
    if (shuffleEl) shuffleEl.checked = pinsData.shuffleOnLoad !== false;

    // A-36: editable category filters
    const filtersBox = $("#pins-filters");
    if (filtersBox) {
      if (!Array.isArray(pinsData.filters)) pinsData.filters = [];
      filtersBox.innerHTML =
        `<div class="review-card-head" style="margin-bottom:10px"><h3 style="margin:0">${escapeAttr(
          t("pinsFiltersTitle")
        )}</h3>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-filter-add">+ ${escapeAttr(
          t("btnAddFilter")
        )}</button></div>` +
        pinsData.filters
          .map((f, fi) => {
            const locked = f.id === "all";
            return `<div class="buy-row" data-filter-row="${fi}" style="margin-bottom:8px">
              <input data-f="fid" ${locked ? "readonly" : ""} placeholder="id" value="${escapeAttr(
                f.id || ""
              )}" style="max-width:140px">
              <input data-f="flabel" placeholder="Label" value="${escapeAttr(f.label || "")}">
              <button type="button" class="block-tool block-tool-del" data-filter-del="${fi}" ${
                locked ? "disabled" : ""
              } title="×">×</button>
            </div>`;
          })
          .join("");
      $("#btn-filter-add")?.addEventListener("click", () => {
        readPinsFiltersForm();
        pinsData.filters.push({ id: "cat-" + Date.now().toString(36), label: "New" });
        renderPinsEditor();
      });
      filtersBox.querySelectorAll("[data-filter-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          readPinsFiltersForm();
          const i = Number(btn.getAttribute("data-filter-del"));
          if (pinsData.filters[i]?.id === "all") return;
          pinsData.filters.splice(i, 1);
          renderPinsEditor();
        });
      });
    }

    wrap.innerHTML = pinsData.pins
      .map((p, i) => {
        const pinCount = pinsData.pins.length;
        return `<div class="review-card panel" data-pin-index="${i}">
          <div class="review-card-head">
            <h3>#${p.id} · ${escapeAttr(p.title || "")}${
              p.featured ? ` <span class="pill ok">${escapeAttr(t("pinFeaturedBadge"))}</span>` : ""
            }</h3>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button type="button" class="btn btn-ghost btn-sm" data-pin-up="${i}" ${
                i === 0 ? "disabled" : ""
              }>↑</button>
              <button type="button" class="btn btn-ghost btn-sm" data-pin-down="${i}" ${
                i === pinCount - 1 ? "disabled" : ""
              }>↓</button>
              <button type="button" class="btn btn-ghost btn-sm" data-pin-del="${i}">${escapeAttr(
              t("btnDeletePin")
            )}</button>
            </div>
          </div>
          <div class="review-card-body pin-card-body">
            <div class="review-thumb-col">
              <div class="review-thumb pin-thumb">
                ${
                  p.image
                    ? `<img src="${escapeAttr(imgSrc(p.image))}" alt="${escapeAttr(
                        p.imageAlt || p.title || ""
                      )}">`
                    : `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`
                }
              </div>
              ${thumbImageActionsHtml(`data-pin-upload="${i}"`, `data-pin-media="${i}"`)}
              <p class="path-hint">${escapeAttr(p.image || "—")}</p>
            </div>
            <div class="review-fields">
              <div class="field"><label>${escapeAttr(t("labelTitle"))}</label>
                <input data-k="title" value="${escapeAttr(p.title || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelPinFilter"))}</label>
                <select data-k="category">${filterOptions(p.category)}</select></div>
              <div class="field"><label>${escapeAttr(t("labelBoardDesc"))}</label>
                <textarea data-k="boardDesc" rows="2">${escapeAttr(p.boardDesc || "")}</textarea></div>
              <div class="field"><label>${escapeAttr(t("labelPopupDesc"))}</label>
                <textarea data-k="popupDesc" rows="3">${escapeAttr(p.popupDesc || "")}</textarea></div>
              <div class="field"><label>${escapeAttr(t("labelImageAlt"))}</label>
                <input data-k="imageAlt" value="${escapeAttr(p.imageAlt || "")}"></div>
              <label class="field-hint" style="display:inline-flex;align-items:center;gap:8px;margin:0;cursor:pointer">
                <input type="checkbox" data-k="featured" ${p.featured ? "checked" : ""}>
                <span>${escapeAttr(t("labelPinFeatured"))}</span>
              </label>
              ${pinProductsEditorHtml(i, p.products)}
            </div>
          </div>
        </div>`;
      })
      .join("");

    bindBuyLinksEditor(wrap);

    $$("[data-pin-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-pin-up"));
        readPinsForm();
        if (idx < 1 || !pinsData.pins[idx]) return;
        [pinsData.pins[idx - 1], pinsData.pins[idx]] = [pinsData.pins[idx], pinsData.pins[idx - 1]];
        renderPinsEditor();
      });
    });
    $$("[data-pin-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-pin-down"));
        readPinsForm();
        if (idx >= pinsData.pins.length - 1) return;
        [pinsData.pins[idx], pinsData.pins[idx + 1]] = [pinsData.pins[idx + 1], pinsData.pins[idx]];
        renderPinsEditor();
      });
    });

    $$("[data-pin-product-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-pin-product-add"));
        readPinsForm();
        const pin = pinsData.pins[idx];
        if (!pin) return;
        if (!Array.isArray(pin.products)) pin.products = [];
        pin.products.push({ name: "", url: "", links: [{ label: "Amazon", url: "", style: "amazon" }] });
        renderPinsEditor();
      });
    });

    $$("[data-pin-product-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [pi, pj] = btn.getAttribute("data-pin-product-del").split(":").map(Number);
        if (!confirm(t("confirmDeleteProduct"))) return;
        readPinsForm();
        const pin = pinsData.pins[pi];
        if (!pin?.products) return;
        pin.products.splice(pj, 1);
        renderPinsEditor();
      });
    });

    $$("[data-pin-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-pin-del"));
        readPinsForm();
        pinsData.pins.splice(idx, 1);
        renderPinsEditor();
      });
    });

    $$("[data-pin-upload]").forEach((input) => {
      input.addEventListener("change", () => {
        const idx = Number(input.getAttribute("data-pin-upload"));
        const file = input.files && input.files[0];
        const card = input.closest("[data-pin-index]");
        if (file) uploadPinImage(idx, file, card);
        input.value = "";
      });
    });
    bindMediaPickerButtons("[data-pin-media]", (btn, pick) => {
      const idx = Number(btn.getAttribute("data-pin-media"));
      readPinsForm();
      const pin = pinsData.pins[idx];
      if (!pin) return;
      pin.image = mediaPickPath(pick);
      pin.imageAlt = ensureAltFromTitle(pin.imageAlt, pin.title);
      renderPinsEditor();
    });
  }

  function readPinsFiltersForm() {
    if (!pinsData) return;
    const rows = $$("#pins-filters [data-filter-row]");
    if (!rows.length) return;
    pinsData.filters = rows.map((row) => {
      const id = (row.querySelector("[data-f=fid]")?.value || "").trim().toLowerCase();
      const label = (row.querySelector("[data-f=flabel]")?.value || "").trim();
      return { id: id || "cat", label: label || id || "Category" };
    });
  }

  function readPinsForm() {
    if (!pinsData) return;
    readPinsFiltersForm();
    $$("#pins-list [data-pin-index]").forEach((card) => {
      const i = Number(card.getAttribute("data-pin-index"));
      const prev = pinsData.pins[i];
      if (!prev) return;
      const get = (k) => {
        const el = card.querySelector(`[data-k="${k}"]`);
        return el ? el.value : "";
      };
      const products = [];
      card.querySelectorAll("[data-pin-product]").forEach((pCard) => {
        const name =
          pCard.querySelector('[data-pk="name"]')?.value?.trim() || "";
        const links = readBuyLinksFrom(pCard.querySelector(".buy-links"));
        const url =
          links.find((l) => l.style === "amazon")?.url || links[0]?.url || "";
        if (!name && !links.length) return;
        products.push({ name, url, links });
      });
      const featuredEl = card.querySelector('[data-k="featured"]');
      pinsData.pins[i] = {
        ...prev,
        title: get("title").trim() || prev.title,
        category: get("category").trim() || prev.category,
        boardDesc: get("boardDesc").trim(),
        popupDesc: get("popupDesc").trim(),
        imageAlt: get("imageAlt").trim() || prev.imageAlt,
        featured: featuredEl ? featuredEl.checked : !!prev.featured,
        products,
        image: prev.image,
        id: prev.id,
        width: prev.width,
        height: prev.height,
      };
    });
  }

  async function uploadPinImage(index, file, card) {
    const status = $("#pins-status");
    const blobUrl = setCardThumbPreview(card, file);
    setStatus(status, t("uploading"));
    try {
      readPinsForm();
      const pin = pinsData.pins[index];
      // SEO filename from owner's file; API adds suffix only on name conflict.
      const preferred = String(file?.name || "pin")
        .replace(/\.[^.]+$/, "")
        .trim();
      const data = await uploadImage(file, preferred || "pin");
      pinsData.pins[index].image = data.path;
      pinsData.pins[index].imageAlt = ensureAltFromTitle(pin?.imageAlt, pin?.title || file.name);
      if (data.width) pinsData.pins[index].width = data.width;
      if (data.height) pinsData.pins[index].height = data.height;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      renderPinsEditor();
      const okMsg = data.note ? `${t("uploadOk")} — ${data.note}` : t("uploadOk");
      setStatus(status, okMsg, data.sitePath ? "ok" : "warn");
    } catch (err) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
    }
  }

  function addPin() {
    readPinsForm();
    const nextId = pinsData.pins.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
    const firstCat = (pinsData.filters || []).find((f) => f.id !== "all")?.id || "work";
    pinsData.pins.unshift({
      id: nextId,
      category: firstCat,
      title: "New pin",
      boardDesc: "",
      popupDesc: "",
      image: "",
      imageAlt: "",
      width: 896,
      height: 1200,
      products: [],
    });
    renderPinsEditor();
  }

  async function openPins() {
    const res = await fetch(window.PK_AUTH.API + "/api/content/pins", {
      headers: authHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("load_failed");
    pinsData = await res.json();
    renderPinsEditor();
    syncSavedFingerprints();
    applyI18n();
    show("pins");
  }

  async function savePins() {
    if (!canWriteSession()) {
      toast(t("viewerReadOnly"));
      return;
    }
    const status = $("#pins-status");
    readPinsForm();
    const bad = [];
    (pinsData.pins || []).forEach((pin) => {
      (pin.products || []).forEach((prod) => {
        const links = normalizeBuyLinks(prod).filter((l) => l.url);
        links.forEach((l) => {
          if (!isGoodBuyUrl(l.url)) {
            bad.push(`${pin.title || "pin"} / ${prod.name || "?"}: ${l.url}`);
          }
        });
      });
    });
    if (bad.length) {
      setStatus(
        status,
        t("productsBadLinks").replace("{n}", String(bad.length)) + ": " + bad.slice(0, 3).join(", "),
        "warn"
      );
      return;
    }
    pinsData.shuffleOnLoad = $("#pins-shuffle-load")?.checked !== false;
    const res = await fetch(window.PK_AUTH.API + "/api/content/pins", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({
        filters: pinsData.filters,
        pins: pinsData.pins,
        shuffleOnLoad: pinsData.shuffleOnLoad,
      }),
    });
    if (!res.ok) {
      setStatus(status, t("pinsSaveFail"), "warn");
      toast(t("pinsSaveFail"));
      return;
    }
    const okMsg = window.PK_AUTH.isCloud?.() ? t("pinsSavedCloud") : t("pinsSaved");
    setStatus(status, okMsg, "ok");
    toast(okMsg);
    syncSavedFingerprints();
    window.PK_OPS?.softReloadSeoLinks?.();
  }

  /* —— Products (sections + products) —— */
  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "section";
  }

  function linesToList(text) {
    return String(text || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function ensureCategoryProducts() {
    if (!productsData.categoryProducts || typeof productsData.categoryProducts !== "object") {
      productsData.categoryProducts = {};
    }
    productsData.hubCategories.forEach((c) => {
      if (!Array.isArray(productsData.categoryProducts[c.id])) {
        productsData.categoryProducts[c.id] = [];
      }
    });
  }

  function clampProductsActiveHub() {
    const n = productsData?.hubCategories?.length || 0;
    if (n === 0) {
      productsActiveHub = 0;
      return;
    }
    if (productsActiveHub < 0) productsActiveHub = 0;
    if (productsActiveHub >= n) productsActiveHub = n - 1;
  }

  function productsDraftPayload() {
    return {
      hubCategories: productsData.hubCategories.map(({ _open, ...rest }) => rest),
      categoryProducts: { ...productsData.categoryProducts },
    };
  }

  function renderProductsHubTabs() {
    const tabs = $("#products-hub-tabs");
    if (!tabs || !productsData) return;
    clampProductsActiveHub();
    const hubs = productsData.hubCategories || [];
    tabs.innerHTML = hubs
      .map((c, i) => {
        const count = (productsData.categoryProducts[c.id] || []).length;
        const active = i === productsActiveHub ? " is-active" : "";
        return `<button type="button" class="hub-tab${active}" role="tab" aria-selected="${
          i === productsActiveHub ? "true" : "false"
        }" data-hub-tab="${i}">
          <span>${escapeAttr(c.title || c.id)}</span>
          <span class="hub-tab-count">${count}</span>
        </button>`;
      })
      .join("");
    $$("[data-hub-tab]", tabs).forEach((btn) => {
      btn.addEventListener("click", () => {
        readProductsForm();
        productsActiveHub = Number(btn.getAttribute("data-hub-tab"));
        renderProductsEditor();
      });
    });
  }

  function renderProductsEditor() {
    const wrap = $("#products-list");
    if (!wrap || !productsData) return;
    ensureCategoryProducts();
    clampProductsActiveHub();
    renderProductsHubTabs();

    const hubs = productsData.hubCategories || [];
    if (!hubs.length) {
      wrap.innerHTML = `<p class="hint">${escapeAttr(t("noHubsYet"))}</p>`;
      return;
    }

    const i = productsActiveHub;
    const c = hubs[i];
    const products = productsData.categoryProducts[c.id] || [];
    const productsHtml = products
      .map((p, pi) => {
        const starsVal =
          p.ratingStars === 0 || p.ratingStars === "0" || p.ratingStars == null
            ? "0"
            : String(Math.min(5, Math.max(0, Number(p.ratingStars) || 0)));
        const hiddenCls = p.hidden ? " product-item--hidden" : "";
        return `<div class="product-item panel product-item--compact${hiddenCls}" data-product-index="${pi}">
              <div class="review-card-head">
                <h4>${escapeAttr(t("labelProduct"))} #${pi + 1}${
                  p.hidden ? ` <span class="pill">${escapeAttr(t("productHiddenBadge"))}</span>` : ""
                }</h4>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  <button type="button" class="btn btn-ghost btn-sm" data-product-up="${i}:${pi}" ${
                    pi === 0 ? "disabled" : ""
                  }>↑</button>
                  <button type="button" class="btn btn-ghost btn-sm" data-product-down="${i}:${pi}" ${
                    pi === products.length - 1 ? "disabled" : ""
                  }>↓</button>
                  <button type="button" class="btn btn-ghost btn-sm" data-product-del="${i}:${pi}">${escapeAttr(
                    t("btnDeleteProduct")
                  )}</button>
                </div>
              </div>
              <div class="review-card-body">
                <div class="review-thumb-col">
                  <div class="review-thumb">
                    ${
                      p.image
                        ? `<img src="${escapeAttr(imgSrc(p.image))}" alt="${escapeAttr(
                            p.imageAlt || p.title || ""
                          )}">`
                        : `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`
                    }
                  </div>
                  ${thumbImageActionsHtml(
                    `data-product-upload="${i}:${pi}"`,
                    `data-product-media="${i}:${pi}"`
                  )}
                  <p class="path-hint">${escapeAttr(p.image || "—")}</p>
                </div>
                <div class="review-fields">
                  <label class="field-hint" style="display:inline-flex;align-items:center;gap:8px;margin:0 0 10px;cursor:pointer">
                    <input type="checkbox" data-pk="hidden" ${p.hidden ? "checked" : ""}>
                    <span>${escapeAttr(t("labelProductHidden"))}</span>
                  </label>
                  <div class="field"><label>${escapeAttr(t("labelTitle"))}</label>
                    <input data-pk="title" value="${escapeAttr(p.title || "")}"></div>
                  ${buyLinksEditorHtml(normalizeBuyLinks(p), `data-product-links="${pi}"`)}
                  <div class="field"><label>${escapeAttr(t("labelStars"))}</label>
                    <select data-pk="ratingStars">
                      <option value="0"${starsVal === "0" ? " selected" : ""}>${escapeAttr(
                        t("starsHidden")
                      )}</option>
                      ${[1, 2, 3, 4, 5]
                        .map(
                          (n) =>
                            `<option value="${n}"${starsVal === String(n) ? " selected" : ""}>${n} ★</option>`
                        )
                        .join("")}
                    </select></div>
                  <details class="product-more">
                    <summary>${escapeAttr(t("productMoreFields"))}</summary>
                    <div class="field"><label>${escapeAttr(t("labelExcerpt"))}</label>
                      <textarea data-pk="description" rows="2">${escapeAttr(p.description || "")}</textarea></div>
                    <div class="field"><label>${escapeAttr(t("labelPros"))}</label>
                      <textarea data-pk="pros" rows="2" placeholder="one per line">${escapeAttr(
                        (p.pros || []).join("\n")
                      )}</textarea></div>
                    <div class="field"><label>${escapeAttr(t("labelCons"))}</label>
                      <textarea data-pk="cons" rows="2" placeholder="one per line">${escapeAttr(
                        (p.cons || []).join("\n")
                      )}</textarea></div>
                    <div class="field"><label>${escapeAttr(t("labelVerdict"))}</label>
                      <textarea data-pk="verdict" rows="2">${escapeAttr(p.verdict || "")}</textarea></div>
                    <div class="field"><label>${escapeAttr(t("labelImageAlt"))}</label>
                      <input data-pk="imageAlt" value="${escapeAttr(p.imageAlt || "")}"></div>
                  </details>
                </div>
              </div>
            </div>`;
      })
      .join("");

    wrap.innerHTML = `<div class="review-card panel section-card" data-hub-index="${i}">
          <div class="review-card-head">
            <h3>${escapeAttr(c.title || c.id)} <span class="pill">${products.length} ${escapeAttr(
              t("productsCount")
            )}</span></h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" class="btn btn-ghost btn-sm" data-hub-del="${i}">${escapeAttr(
                t("btnDeleteSection")
              )}</button>
            </div>
          </div>
          <div class="review-card-body">
            <div class="review-thumb-col">
              <div class="review-thumb">
                ${
                  c.image
                    ? `<img src="${escapeAttr(imgSrc(c.image))}" alt="${escapeAttr(
                        c.imageAlt || c.title || ""
                      )}">`
                    : `<div class="review-thumb-empty">${escapeAttr(t("noImage"))}</div>`
                }
              </div>
              ${thumbImageActionsHtml(`data-hub-upload="${i}"`, `data-hub-media="${i}"`)}
              <p class="path-hint">${escapeAttr(c.image || "—")}</p>
            </div>
            <div class="review-fields">
              <div class="field"><label>${escapeAttr(t("labelTitle"))}</label>
                <input data-k="title" value="${escapeAttr(c.title || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelBadge"))}</label>
                <input data-k="badge" value="${escapeAttr(c.badge || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelExcerpt"))}</label>
                <textarea data-k="description" rows="3">${escapeAttr(c.description || "")}</textarea></div>
              <div class="field"><label>${escapeAttr(t("labelUrl"))}</label>
                <input data-k="url" value="${escapeAttr(c.url || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelSectionId"))}</label>
                <input data-k="id" value="${escapeAttr(c.id || "")}" readonly class="mono" title="${escapeAttr(
                  t("hintSectionIdReadonly")
                )}"><p class="field-hint">${escapeAttr(t("hintSectionIdReadonly"))}</p></div>
              <div class="field"><label>${escapeAttr(t("labelImageAlt"))}</label>
                <input data-k="imageAlt" value="${escapeAttr(c.imageAlt || "")}"></div>
            </div>
          </div>
          <div class="section-products" data-hub-products="${i}">
            <div class="section-products-bar">
              <strong>${escapeAttr(t("productsInSection"))}</strong>
              <button type="button" class="btn btn-primary btn-sm" data-product-add="${i}" style="width:auto;padding-inline:16px">${escapeAttr(
                t("btnAddProduct")
              )}</button>
            </div>
            ${productsHtml || `<p class="hint">${escapeAttr(t("noProductsYet"))}</p>`}
          </div>
        </div>`;

    $$("[data-hub-upload]").forEach((input) => {
      input.addEventListener("change", () => {
        const idx = Number(input.getAttribute("data-hub-upload"));
        const file = input.files && input.files[0];
        const card = input.closest("[data-hub-index]");
        if (file) uploadHubImage(idx, file, card);
        input.value = "";
      });
    });
    bindMediaPickerButtons("[data-hub-media]", (btn, pick) => {
      const idx = Number(btn.getAttribute("data-hub-media"));
      readProductsForm();
      const hub = productsData.hubCategories[idx];
      if (!hub) return;
      hub.image = mediaPickPath(pick);
      hub.imageAlt = ensureAltFromTitle(hub.imageAlt, hub.title);
      productsActiveHub = idx;
      renderProductsEditor();
    });
    bindMediaPickerButtons("[data-product-media]", (btn, pick) => {
      const [hi, pi] = btn.getAttribute("data-product-media").split(":").map(Number);
      readProductsForm();
      const hub = productsData.hubCategories[hi];
      if (!hub) return;
      const prod = productsData.categoryProducts[hub.id]?.[pi];
      if (!prod) return;
      prod.image = mediaPickPath(pick);
      prod.imageAlt = ensureAltFromTitle(prod.imageAlt, prod.title);
      productsActiveHub = hi;
      renderProductsEditor();
    });

    $$("[data-hub-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-hub-del"));
        if (!confirm(t("confirmDeleteSection"))) return;
        readProductsForm();
        const id = productsData.hubCategories[idx]?.id;
        productsData.hubCategories.splice(idx, 1);
        if (id && productsData.categoryProducts) delete productsData.categoryProducts[id];
        if (productsActiveHub >= productsData.hubCategories.length) {
          productsActiveHub = Math.max(0, productsData.hubCategories.length - 1);
        }
        renderProductsEditor();
      });
    });

    $$("[data-product-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-product-add"));
        readProductsForm();
        const hub = productsData.hubCategories[idx];
        if (!hub) return;
        ensureCategoryProducts();
        const list = productsData.categoryProducts[hub.id];
        list.unshift({
          id: `${hub.id}-${Date.now().toString(36)}`,
          title: "",
          image: "",
          imageAlt: "",
          description: "",
          pros: [],
          cons: [],
          verdict: "",
          amazonUrl: "",
          links: [{ label: "Amazon", url: "", style: "amazon" }],
          ratingStars: 0,
        });
        productsActiveHub = idx;
        renderProductsEditor();
      });
    });

    bindBuyLinksEditor(wrap);

    $$("[data-product-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [hi, pi] = btn.getAttribute("data-product-up").split(":").map(Number);
        readProductsForm();
        const hub = productsData.hubCategories[hi];
        const list = productsData.categoryProducts[hub.id];
        if (!list || pi < 1) return;
        [list[pi - 1], list[pi]] = [list[pi], list[pi - 1]];
        productsActiveHub = hi;
        renderProductsEditor();
      });
    });
    $$("[data-product-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [hi, pi] = btn.getAttribute("data-product-down").split(":").map(Number);
        readProductsForm();
        const hub = productsData.hubCategories[hi];
        const list = productsData.categoryProducts[hub.id];
        if (!list || pi >= list.length - 1) return;
        [list[pi], list[pi + 1]] = [list[pi + 1], list[pi]];
        productsActiveHub = hi;
        renderProductsEditor();
      });
    });

    $$("[data-product-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [hi, pi] = btn.getAttribute("data-product-del").split(":").map(Number);
        if (!confirm(t("confirmDeleteProduct"))) return;
        readProductsForm();
        const hub = productsData.hubCategories[hi];
        if (!hub) return;
        productsData.categoryProducts[hub.id].splice(pi, 1);
        productsActiveHub = hi;
        renderProductsEditor();
      });
    });

    $$("[data-product-upload]").forEach((input) => {
      input.addEventListener("change", () => {
        const [hi, pi] = input.getAttribute("data-product-upload").split(":").map(Number);
        const file = input.files && input.files[0];
        const card = input.closest("[data-product-index]");
        if (file) uploadProductImage(hi, pi, file, card);
        input.value = "";
      });
    });
  }

  async function openHtmlOfflinePreview({ apiPath, body, statusEl, windowName }) {
    const status = statusEl;
    const win = window.open("", windowName || "pk-offline-preview");
    if (!win) {
      setStatus(status, t("previewPopupBlocked"), "warn");
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
      /* ignore */
    }
    setStatus(status, t("previewOpening"));
    try {
      const res = await fetch(window.PK_AUTH.API + apiPath, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(body),
      });
      const html = await res.text();
      if (!res.ok) {
        let msg = t("previewFail");
        try {
          const err = JSON.parse(html);
          if (err.error) msg += ": " + err.error;
          if (err.hint) msg += " — " + err.hint;
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
        setStatus(status, msg, "warn");
        return;
      }
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      win.location = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStatus(status, t("previewOk"), "ok");
    } catch (err) {
      try {
        win.close();
      } catch {
        /* ignore */
      }
      setStatus(status, t("previewFail") + (err?.message ? ": " + err.message : ""), "warn");
    }
  }

  async function openHomeOfflinePreview() {
    if (!homeData) return;
    const status = $("#home-status");
    const latestReviews = readHomeForm();
    if (!isValidLatestReviewsCount(latestReviews)) {
      setStatus(status, t("homeReviewsCountInvalid"), "warn");
      return;
    }
    const topPicks = readTopPicksForm();
    await openHtmlOfflinePreview({
      apiPath: "/api/preview/home",
      body: { draft: { latestReviews, topPicks } },
      statusEl: status,
      windowName: "pk-home-preview",
    });
  }

  async function openPinsOfflinePreview() {
    if (!pinsData) return;
    const status = $("#pins-status");
    readPinsForm();
    pinsData.shuffleOnLoad = $("#pins-shuffle-load")?.checked !== false;
    await openHtmlOfflinePreview({
      apiPath: "/api/preview/pins",
      body: {
        draft: {
          filters: pinsData.filters,
          pins: pinsData.pins,
          shuffleOnLoad: pinsData.shuffleOnLoad,
        },
      },
      statusEl: status,
      windowName: "pk-pins-preview",
    });
  }

  async function openProductsOfflinePreview() {
    const status = $("#products-status");
    if (!productsData) return;
    readProductsForm();
    clampProductsActiveHub();
    const hub = productsData.hubCategories[productsActiveHub];
    if (!hub?.id) {
      setStatus(status, t("previewFail"), "warn");
      return;
    }
    const list = productsData.categoryProducts[hub.id] || [];
    if (!list.length) {
      setStatus(status, t("productsOfflineNeedProducts"), "warn");
      return;
    }
    const draft = productsDraftPayload();
    delete draft.categoryProducts._note;
    await openHtmlOfflinePreview({
      apiPath: "/api/preview/products",
      body: { hubId: hub.id, draft },
      statusEl: status,
      windowName: "pk-products-preview",
    });
  }

  function readProductsForm() {
    if (!productsData) return;
    ensureCategoryProducts();
    const idChanges = [];

    $$("#products-list [data-hub-index]").forEach((card) => {
      const i = Number(card.getAttribute("data-hub-index"));
      const prev = productsData.hubCategories[i];
      if (!prev) return;
      const get = (k) => {
        const el = card.querySelector(`[data-k="${k}"]`);
        return el ? el.value.trim() : "";
      };
      const oldId = prev.id;
      let newId = get("id") || oldId;
      newId = slugify(newId);
      if (newId !== oldId) idChanges.push({ from: oldId, to: newId, index: i });

      productsData.hubCategories[i] = {
        ...prev,
        id: newId,
        title: get("title") || prev.title,
        badge: get("badge") || prev.badge,
        description: get("description") || prev.description,
        url: get("url") || `/${newId}/`,
        imageAlt: get("imageAlt") || prev.imageAlt,
        image: prev.image,
      };

      const list = productsData.categoryProducts[oldId] || productsData.categoryProducts[newId] || [];
      card.querySelectorAll("[data-product-index]").forEach((pCard) => {
        const pi = Number(pCard.getAttribute("data-product-index"));
        const pPrev = list[pi];
        if (!pPrev) return;
        const gp = (k) => {
          const el = pCard.querySelector(`[data-pk="${k}"]`);
          return el ? el.value : "";
        };
        const starsRaw = gp("ratingStars").trim();
        const ratingStars = starsRaw === "" ? 0 : Math.min(5, Math.max(0, Number(starsRaw) || 0));
        const links = readBuyLinksFrom(pCard.querySelector(".buy-links"));
        const amazonUrl =
          links.find((l) => l.style === "amazon")?.url || links[0]?.url || pPrev.amazonUrl || "";
        const hiddenEl = pCard.querySelector('[data-pk="hidden"]');
        list[pi] = {
          ...pPrev,
          title: gp("title").trim() || pPrev.title,
          description: gp("description").trim(),
          pros: linesToList(gp("pros")),
          cons: linesToList(gp("cons")),
          verdict: gp("verdict").trim(),
          amazonUrl,
          links,
          imageAlt: gp("imageAlt").trim() || pPrev.imageAlt,
          image: pPrev.image,
          id: pPrev.id || `${newId}-${pi + 1}`,
          ratingStars,
          hidden: hiddenEl ? hiddenEl.checked : !!pPrev.hidden,
        };
      });
      productsData.categoryProducts[oldId] = list;
    });

    idChanges.forEach(({ from, to }) => {
      if (from === to) return;
      if (productsData.categoryProducts[from]) {
        productsData.categoryProducts[to] = productsData.categoryProducts[from];
        delete productsData.categoryProducts[from];
      }
    });
  }

  async function uploadHubImage(index, file, card) {
    const status = $("#products-status");
    const blobUrl = setCardThumbPreview(card, file);
    setStatus(status, t("uploading"));
    try {
      readProductsForm();
      const hub = productsData.hubCategories[index];
      const preferred = (hub?.id || "hub") + "-cover";
      const data = await uploadImage(file, preferred);
      productsData.hubCategories[index].image = data.path;
      productsData.hubCategories[index].imageAlt = ensureAltFromTitle(
        hub?.imageAlt,
        hub?.title || file.name
      );
      if (data.width) productsData.hubCategories[index].width = data.width;
      if (data.height) productsData.hubCategories[index].height = data.height;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      renderProductsEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch (err) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
    }
  }

  async function uploadProductImage(hubIndex, productIndex, file, card) {
    const status = $("#products-status");
    const blobUrl = setCardThumbPreview(card, file);
    setStatus(status, t("uploading"));
    try {
      readProductsForm();
      const hub = productsData.hubCategories[hubIndex];
      const prod = productsData.categoryProducts[hub.id][productIndex];
      // SEO filename from owner's file (e.g. airpods-pro-3); API adds suffix only on conflict.
      const preferred = String(file?.name || "product")
        .replace(/\.[^.]+$/, "")
        .trim();
      const data = await uploadImage(file, preferred || "product");
      // Worker URL works immediately; sitePath is SEO path on Pages (may lag).
      productsData.categoryProducts[hub.id][productIndex].image = data.path;
      productsData.categoryProducts[hub.id][productIndex].imageAlt = ensureAltFromTitle(
        prod?.imageAlt,
        prod?.title || file.name
      );
      productsActiveHub = hubIndex;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      renderProductsEditor();
      const okMsg = data.note ? `${t("uploadOk")} — ${data.note}` : t("uploadOk");
      setStatus(status, okMsg, data.sitePath ? "ok" : "warn");
    } catch (err) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
    }
  }

  function addHubSection() {
    readProductsForm();
    ensureCategoryProducts();
    const base = "new-section";
    let id = base;
    let n = 2;
    const used = new Set(productsData.hubCategories.map((c) => c.id));
    while (used.has(id)) {
      id = `${base}-${n++}`;
    }
    productsData.hubCategories.push({
      id,
      url: `/${id}/`,
      title: "New section",
      badge: "New",
      description: "",
      image: "",
      imageAlt: "",
      width: 1200,
      height: 670,
    });
    productsData.categoryProducts[id] = [];
    productsActiveHub = productsData.hubCategories.length - 1;
    renderProductsEditor();
  }

  async function openProducts() {
    const res = await fetch(window.PK_AUTH.API + "/api/content/products", {
      headers: authHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("load_failed");
    productsData = await res.json();
    ensureCategoryProducts();
    productsActiveHub = 0;
    renderProductsEditor();
    syncSavedFingerprints();
    applyI18n();
    show("products");
  }

  async function saveProducts() {
    if (!canWriteSession()) {
      toast(t("viewerReadOnly"));
      return;
    }
    const status = $("#products-status");
    readProductsForm();
    const bad = [];
    Object.values(productsData.categoryProducts || {}).forEach((list) => {
      (list || []).forEach((p) => {
        if (!p || !p.title || p.hidden) return;
        const links = normalizeBuyLinks(p).filter((l) => l.url);
        if (!links.length) {
          bad.push(p.title + " (no store link)");
          return;
        }
        links.forEach((l) => {
          if (!isGoodBuyUrl(l.url)) bad.push(`${p.title}: ${l.url}`);
        });
      });
    });
    if (bad.length) {
      setStatus(
        status,
        t("productsBadLinks").replace("{n}", String(bad.length)) + ": " + bad.slice(0, 3).join(", "),
        "warn"
      );
      return;
    }
    // A-43: warn if hub category page is missing on GitHub
    const hubs = productsData.hubCategories || [];
    const ids = hubs.map((h) => String(h?.id || "").trim()).filter(Boolean);
    if (ids.length) {
      try {
        const probe = await fetch(window.PK_AUTH.API + "/api/probe/hubs", {
          method: "POST",
          headers: authHeaders(),
          credentials: "include",
          body: JSON.stringify({ ids }),
        });
        const pdata = await probe.json().catch(() => ({}));
        if (probe.ok && Array.isArray(pdata.missing) && pdata.missing.length) {
          const msg = t("productsHubPageMissing")
            .replace("{n}", String(pdata.missing.length))
            .replace("{ids}", pdata.missing.slice(0, 6).join(", "));
          if (!confirm(msg + "\n\nSave anyway?")) return;
        }
      } catch {
        /* probe optional — still allow save */
      }
    }
    const payload = productsDraftPayload();
    delete payload.categoryProducts._note;
    const res = await fetch(window.PK_AUTH.API + "/api/content/products", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setStatus(status, t("productsSaveFail"), "warn");
      toast(t("productsSaveFail"));
      return;
    }
    const okMsg = window.PK_AUTH.isCloud?.() ? t("productsSavedCloud") : t("productsSaved");
    setStatus(status, okMsg, "ok");
    toast(okMsg);
    syncSavedFingerprints();
    window.PK_OPS?.softReloadSeoLinks?.();
  }

  function canWriteSession() {
    const s = window.PK_AUTH?.getSession();
    if (!s) return false;
    if (s.owner) return true;
    const role = String(s.role || "admin").toLowerCase();
    return role === "admin" || role === "editor";
  }

  function toast(msg) {
    const el = $("#pk-toast");
    if (!el || !msg) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2000);
  }

  function captureHomeFp() {
    if (!homeData) return "";
    readHomeForm();
    readTopPicksForm();
    return JSON.stringify({ latestReviews: homeData.latestReviews, topPicks: homeData.topPicks });
  }

  function capturePinsFp() {
    if (!pinsData) return "";
    readPinsForm();
    pinsData.shuffleOnLoad = $("#pins-shuffle-load")?.checked !== false;
    return JSON.stringify({
      filters: pinsData.filters,
      pins: pinsData.pins,
      shuffleOnLoad: pinsData.shuffleOnLoad,
    });
  }

  function captureProductsFp() {
    if (!productsData) return "";
    readProductsForm();
    const payload = productsDraftPayload();
    delete payload.categoryProducts?._note;
    return JSON.stringify(payload);
  }

  function isHomeDirty() {
    return !!homeData && captureHomeFp() !== homeSavedFp;
  }

  function isPinsDirty() {
    return !!pinsData && capturePinsFp() !== pinsSavedFp;
  }

  function isProductsDirty() {
    return !!productsData && captureProductsFp() !== productsSavedFp;
  }

  function isAnyDirty() {
    if (isHomeDirty() || isPinsDirty() || isProductsDirty()) return true;
    if (window.PK_ARTICLES?.isDirty?.()) return true;
    return false;
  }

  function syncSavedFingerprints() {
    if (homeData) homeSavedFp = captureHomeFp();
    if (pinsData) pinsSavedFp = capturePinsFp();
    if (productsData) productsSavedFp = captureProductsFp();
    updateDirtyUi();
  }

  function updateDirtyUi() {
    const cw = canWriteSession();
    const homeBtn = $("#btn-home-save");
    if (homeBtn) homeBtn.disabled = !cw || !isHomeDirty();
    const pinsBtn = $("#btn-pins-save");
    if (pinsBtn) pinsBtn.disabled = !cw || !isPinsDirty();
    const prodBtn = $("#btn-products-save");
    if (prodBtn) prodBtn.disabled = !cw || !isProductsDirty();
    window.PK_ARTICLES?.updateSaveButton?.();
  }

  function confirmLeaveIfDirty() {
    if (!isAnyDirty()) return true;
    return confirm(t("confirmLeaveDirty"));
  }

  function currentViewId() {
    const view = $$(".studio-panel[data-view]").find((el) => !el.classList.contains("pk-hidden"));
    return view?.getAttribute("data-view") || "dash";
  }

  async function saveCurrentView() {
    if (!canWriteSession()) return;
    const id = currentViewId();
    if (id === "home") await saveHome();
    else if (id === "pins") await savePins();
    else if (id === "products") await saveProducts();
    else if (id === "articles" && !$("#articles-wizard")?.classList.contains("pk-hidden")) {
      const btn = $("#btn-article-save");
      if (btn && !btn.disabled) btn.click();
    }
  }

  function applyPermissionsUi() {
    const s = window.PK_AUTH?.getSession();
    const cw = canWriteSession();
    const badge = $("#role-badge");
    if (badge && s) {
      let label = s.owner ? t("teamOwnerBadge") : t("teamRole_" + (s.role || "admin")) || s.role;
      badge.textContent = label;
      badge.classList.remove("pk-hidden");
    }
    const skipDirtySave = new Set([
      "btn-home-save",
      "btn-pins-save",
      "btn-products-save",
      "btn-article-save",
    ]);
    $$("[data-requires-write]").forEach((el) => {
      if (skipDirtySave.has(el.id)) return;
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") el.disabled = !cw;
    });
    if (!cw) {
      $("#media-dropzone")?.classList.add("pk-readonly");
      $("#media-upload-input") && ($("#media-upload-input").disabled = true);
    } else {
      $("#media-dropzone")?.classList.remove("pk-readonly");
      const up = $("#media-upload-input");
      if (up) up.disabled = false;
    }
    updateDirtyUi();
  }

  async function loadDashStats() {
    const box = $("#dash-stats");
    if (!box) return;
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/status", {
        headers: authHeaders(false),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return;
      const ac = data.articleCounts || {};
      box.innerHTML = `<span class="pill warn">${escapeHtml(t("statusDraft"))}: ${ac.draft || 0}</span>
        <span class="pill">${escapeHtml(t("dashMediaCount"))}: ${data.mediaCount ?? 0}</span>`;
    } catch {
      /* optional */
    }
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.PK_STUDIO = { toast, canWrite: canWriteSession, isAnyDirty, updateDirtyUi };

  function openModule(name) {
    if (name === "Dash") {
      show("dash");
      loadDashStats();
      return;
    }
    if (name === "Home") {
      openHome().catch(() => {
        const el = $("#panel-module-name");
        if (el) el.textContent = name;
        show("panel");
      });
      return;
    }
    if (name === "Pins") {
      openPins().catch(() => {
        $("#panel-module-name").textContent = name;
        show("panel");
      });
      return;
    }
    if (name === "Products") {
      openProducts().catch(() => {
        $("#panel-module-name").textContent = name;
        show("panel");
      });
      return;
    }
    if (name === "Articles") {
      window.PK_ARTICLES.open()
        .then(() => {
          applyI18n();
          show("articles");
        })
        .catch(() => {
          $("#panel-module-name").textContent = name;
          show("panel");
        });
      return;
    }
    if (name === "Publish") {
      window.PK_OPS.openPublish()
        .then(() => {
          applyI18n();
          show("publish");
        })
        .catch((err) => {
          $("#panel-module-name").textContent = name;
          show("panel");
          console.warn(err);
        });
      return;
    }
    if (name === "SEO") {
      window.PK_OPS.openSeo()
        .then(() => {
          applyI18n();
          show("seo");
        })
        .catch(() => {
          $("#panel-module-name").textContent = name;
          show("panel");
        });
      return;
    }
    if (name === "Team") {
      window.PK_OPS.openTeam()
        .then(() => {
          applyI18n();
          show("team");
        })
        .catch(() => {
          $("#panel-module-name").textContent = name;
          show("panel");
        });
      return;
    }
    if (name === "Media") {
      window.PK_OPS.openMedia()
        .then(() => {
          applyI18n();
          show("media");
        })
        .catch(() => {
          applyI18n();
          show("media");
        });
      return;
    }
    if (name === "Status") {
      window.PK_OPS.openStatus()
        .then(() => {
          applyI18n();
          show("status");
        })
        .catch((err) => {
          $("#panel-module-name").textContent = name;
          show("panel");
          console.warn(err);
        });
      return;
    }
    $("#panel-module-name").textContent = name;
    show("panel");
  }

  async function refreshAuth() {
    const session = window.PK_AUTH.getSession();
    if (!session) {
      show("login");
      return;
    }
    const me = await window.PK_AUTH.me();
    if (!me?.user) {
      show("login");
      return;
    }
    const who = $("#who-label");
    if (who) who.textContent = t("whoPrefix") + " " + me.user.login;
    if (session?.token) {
      window.PK_AUTH.setSession({
        token: session.token,
        login: me.user.login,
        role: me.user.role,
        owner: !!me.user.owner,
      });
    }
    const modePill = document.querySelector('[data-i18n="statusLocal"]');
    if (modePill && window.PK_AUTH.isCloud?.()) {
      modePill.textContent = t("statusCloud");
      modePill.classList.add("ok");
    }
    applyPermissionsUi();
    updatePreviewLinks();
    show("dash");
    loadDashStats();
  }

  function bind() {
    $("#login-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = $("#login-error");
      err.classList.add("pk-hidden");
      err.textContent = "";
      try {
        await window.PK_AUTH.login(
          $("#field-login").value.trim(),
          $("#field-password").value
        );
        $("#field-password").value = "";
        await refreshAuth();
      } catch (ex) {
        err.textContent =
          ex.status === 401 ? t("loginError") : t("loginNetwork");
        err.classList.remove("pk-hidden");
      }
    });

    $("#btn-logout")?.addEventListener("click", async () => {
      await window.PK_AUTH.logout();
      show("login");
    });

    $("#btn-lang")?.addEventListener("click", () => {
      lang = lang === "ru" ? "en" : "ru";
      localStorage.setItem("pk_studio_lang", lang);
      applyI18n();
      updatePreviewLinks();
      const s = window.PK_AUTH.getSession();
      if (s && $("#who-label")) {
        $("#who-label").textContent = t("whoPrefix") + " " + s.login;
      }
      applyPermissionsUi();
      const view = $$(".studio-panel[data-view]").find(
        (el) => !el.classList.contains("pk-hidden")
      );
      const id = view?.getAttribute("data-view");
      if (id) setActiveNav(id);
      if (id === "home" && homeData) {
        homeData.latestReviews = readHomeForm();
        readTopPicksForm();
        renderHomeEditor();
      }
      if (id === "pins" && pinsData) {
        readPinsForm();
        renderPinsEditor();
      }
      if (id === "products" && productsData) {
        readProductsForm();
        renderProductsEditor();
      }
    });

    $("#btn-home-save")?.addEventListener("click", () => saveHome());
    $("#btn-top-pick-add")?.addEventListener("click", () => {
      if (!homeData) return;
      readTopPicksForm();
      ensureTopPicks();
      homeData.topPicks.picks.push({
        id: "pick-" + (homeData.topPicks.picks.length + 1),
        title: "",
        badge: "Top Pick",
        tagline: "",
        category: "Home & Kitchen",
        image: "",
        imageAlt: "",
        blurb: "",
        pros: [],
        amazonUrl: "",
        guideUrl: "/articles/",
      });
      renderTopPicksEditor();
    });
    $("#btn-pins-save")?.addEventListener("click", () => savePins());
    $("#btn-products-save")?.addEventListener("click", () => saveProducts());
    $("#btn-home-offline")?.addEventListener("click", () => openHomeOfflinePreview());
    $("#btn-pins-offline")?.addEventListener("click", () => openPinsOfflinePreview());
    $("#btn-products-offline")?.addEventListener("click", () => openProductsOfflinePreview());
    $("#btn-home-compare-live")?.addEventListener("click", () =>
      compareLiveWithOffline("/", () => openHomeOfflinePreview())
    );
    $("#btn-pins-compare-live")?.addEventListener("click", () =>
      compareLiveWithOffline("/categories/", () => openPinsOfflinePreview())
    );
    $("#btn-products-compare-live")?.addEventListener("click", () =>
      compareLiveWithOffline("/products/", () => openProductsOfflinePreview())
    );
    $("#btn-pin-add")?.addEventListener("click", () => addPin());
    $("#btn-hub-add")?.addEventListener("click", () => addHubSection());

    $("#btn-products-bulk-apply")?.addEventListener("click", () => {
      const status = $("#products-status");
      if (!productsData) return;
      readProductsForm();
      clampProductsActiveHub();
      const hub = productsData.hubCategories[productsActiveHub];
      if (!hub?.id) return;
      const text = $("#products-bulk-text")?.value || "";
      try {
        const items = parseBulkProductsInput(text, hub.id);
        if (!items.length) {
          setStatus(status, t("productsBulkEmpty"), "warn");
          return;
        }
        const n = applyBulkProductsToHub(hub.id, items);
        renderProductsEditor();
        setStatus(status, t("productsBulkApplied").replace("{n}", String(n)), "ok");
      } catch (err) {
        setStatus(status, t("productsBulkParseFail") + (err?.message ? ": " + err.message : ""), "warn");
      }
    });

    $("#btn-products-import-preview")?.addEventListener("click", () => {
      const status = $("#products-status");
      const text = $("#products-import-json")?.value || "";
      try {
        const pack = JSON.parse(text);
        const hubId = String(pack?.hubId || "").trim();
        const products = pack?.products;
        if (!hubId || !Array.isArray(products)) throw new Error("invalid_pack");
        const rows = products.map((p, i) => normalizeHubProduct(p, hubId, i));
        renderAgentImportPreview(rows);
        $("#products-import-pack").dataset.hubId = hubId;
        $("#products-import-pack").dataset.previewCount = String(rows.length);
        setStatus(status, t("productsImportPreviewOk").replace("{n}", String(rows.length)), "ok");
      } catch (err) {
        renderAgentImportPreview([]);
        setStatus(status, t("productsImportParseFail"), "warn");
      }
    });

    $("#btn-products-import-apply")?.addEventListener("click", () => {
      const status = $("#products-status");
      if (!productsData) return;
      readProductsForm();
      const text = $("#products-import-json")?.value || "";
      try {
        const pack = JSON.parse(text);
        const hubId = String(pack?.hubId || "").trim();
        const products = pack?.products;
        if (!hubId || !Array.isArray(products)) throw new Error("invalid_pack");
        const items = products.map((p, i) => normalizeHubProduct(p, hubId, i));
        if (!items.length) {
          setStatus(status, t("productsBulkEmpty"), "warn");
          return;
        }
        const tabIdx = productsData.hubCategories.findIndex((h) => h.id === hubId);
        if (tabIdx >= 0) productsActiveHub = tabIdx;
        const n = applyBulkProductsToHub(hubId, items);
        renderProductsEditor();
        setStatus(status, t("productsImportApplied").replace("{n}", String(n)), "ok");
      } catch {
        setStatus(status, t("productsImportParseFail"), "warn");
      }
    });

    $("#btn-sidebar-toggle")?.addEventListener("click", () => {
      const sb = $("#studio-sidebar");
      const bd = $("#sidebar-backdrop");
      if (!sb) return;
      const open = !sb.classList.contains("open");
      sb.classList.toggle("open", open);
      if (bd) {
        bd.hidden = !open;
        bd.classList.toggle("open", open);
      }
    });
    $("#sidebar-backdrop")?.addEventListener("click", () => closeSidebar());

    $$("[data-module]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        if (!confirmLeaveIfDirty()) return;
        openModule(btn.getAttribute("data-module"));
      });
    });

    $("#studio-content")?.addEventListener("input", () => updateDirtyUi());
    $("#studio-content")?.addEventListener("change", () => updateDirtyUi());

    window.addEventListener("beforeunload", (e) => {
      if (isAnyDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveCurrentView();
      }
      if (e.key === "Escape" && $("#art-settings")?.classList.contains("is-open")) {
        $("#btn-art-settings-close")?.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // Never keep credentials in the URL (broken JS used to submit form as GET)
    if (location.search) {
      history.replaceState(null, "", location.pathname + location.hash);
    }
    applyI18n();
    bind();
    window.PK_ARTICLES?.bind();
    window.PK_OPS?.bind();
    await refreshAuth();
  });
})();
