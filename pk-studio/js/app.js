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

  function t(key) {
    const pack = window.PK_I18N[lang] || window.PK_I18N.ru;
    return pack[key] || window.PK_I18N.en[key] || key;
  }

  function applyI18n() {
    $$("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
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
    // Broken relative media paths from catalog strip — point at Worker
    if (/^\/?api\/media\/file\//i.test(p) || /^https?:\/\/pickora\.shop\/api\/media\/file\//i.test(p)) {
      const key = p.replace(/^https?:\/\/pickora\.shop/i, "").replace(/^\/?api\/media\/file\//i, "");
      return "https://pickora-admin-api.pickara-admin.workers.dev/api/media/file/" + key;
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

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file, preferredName) {
    return window.PK_MEDIA.upload(file, preferredName);
  }

  /* —— Home —— */
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

  function renderHomeEditor() {
    const wrap = $("#home-reviews");
    if (!wrap || !homeData) return;
    const badges = ["none", "new", "hot", "updated", "must-read", "editors-pick"];

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
            <span class="pill">${escapeAttr(r.category || "")}</span>
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
          return `<div class="review-card panel top-pick-card" data-top-pick="${i}">
          <div class="review-card-head">
            <h3>#${i + 1} ${escapeAttr(p.title || "Top pick")}</h3>
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
              <label class="btn btn-ghost btn-sm upload-btn">${escapeAttr(t("btnUploadImage"))}
                <input type="file" accept="image/*" data-tp-upload="${i}" hidden>
              </label>
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
              <div class="field"><label>Amazon</label><input data-tp="amazonUrl" value="${escapeAttr(
                p.amazonUrl || ""
              )}" placeholder="https://link.amazon/…"></div>
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
        const status = $("#home-status");
        setStatus(status, t("uploading"));
        try {
          readTopPicksForm();
          const id = homeData.topPicks.picks[i]?.id || "top-pick";
          const data = await uploadImage(file, "top-pick-" + id);
          homeData.topPicks.picks[i].image = data.path;
          renderTopPicksEditor();
          setStatus(status, t("uploadOk"), "ok");
        } catch (err) {
          setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
        }
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
      picks.push({
        ...prev,
        id: prev.id || slugify(title) || "pick-" + (i + 1),
        title,
        badge: g("badge").trim(),
        tagline: g("tagline").trim(),
        category: g("category").trim(),
        blurb: g("blurb").trim(),
        pros: linesToList(g("pros")),
        amazonUrl: g("amazonUrl").trim(),
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
    renderHomeEditor();
    applyI18n();
    show("home");
  }

  async function saveHome() {
    const status = $("#home-status");
    const latestReviews = readHomeForm();
    const topPicks = readTopPicksForm();
    const res = await fetch(window.PK_AUTH.API + "/api/content/home", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ latestReviews, topPicks }),
    });
    if (!res.ok) {
      setStatus(status, t("homeSaveFail"), "warn");
      return;
    }
    homeData.latestReviews = latestReviews;
    homeData.topPicks = topPicks;
    setStatus(
      status,
      window.PK_AUTH.isCloud?.() ? t("homeSavedCloud") : t("homeSaved"),
      "ok"
    );
  }

  /* —— Pins —— */
  function productsToText(products) {
    return (products || [])
      .map((p) => `${p.name || ""} | ${p.url || ""}`)
      .join("\n");
  }

  function textToProducts(text) {
    return String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((x) => x.trim());
        return { name: parts[0] || "", url: parts[1] || "" };
      })
      .filter((p) => p.name);
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

  function renderPinsEditor() {
    const wrap = $("#pins-list");
    if (!wrap || !pinsData) return;

    wrap.innerHTML = pinsData.pins
      .map((p, i) => {
        return `<div class="review-card panel" data-pin-index="${i}">
          <div class="review-card-head">
            <h3>#${p.id} · ${escapeAttr(p.title || "")}</h3>
            <button type="button" class="btn btn-ghost btn-sm" data-pin-del="${i}">${escapeAttr(
              t("btnDeletePin")
            )}</button>
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
              <label class="btn btn-ghost btn-sm upload-btn">
                ${escapeAttr(t("btnUploadImage"))}
                <input type="file" accept="image/*" data-pin-upload="${i}" hidden>
              </label>
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
              <div class="field"><label>${escapeAttr(t("labelPinProducts"))}</label>
                <textarea data-k="productsText" rows="4" placeholder="Name | https://amzn.to/...">${escapeAttr(
                  productsToText(p.products)
                )}</textarea></div>
            </div>
          </div>
        </div>`;
      })
      .join("");

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
        if (file) uploadPinImage(idx, file);
        input.value = "";
      });
    });
  }

  function readPinsForm() {
    if (!pinsData) return;
    $$("#pins-list [data-pin-index]").forEach((card) => {
      const i = Number(card.getAttribute("data-pin-index"));
      const prev = pinsData.pins[i];
      if (!prev) return;
      const get = (k) => {
        const el = card.querySelector(`[data-k="${k}"]`);
        return el ? el.value : "";
      };
      pinsData.pins[i] = {
        ...prev,
        title: get("title").trim() || prev.title,
        category: get("category").trim() || prev.category,
        boardDesc: get("boardDesc").trim(),
        popupDesc: get("popupDesc").trim(),
        imageAlt: get("imageAlt").trim() || prev.imageAlt,
        products: textToProducts(get("productsText")),
        image: prev.image,
        id: prev.id,
        width: prev.width,
        height: prev.height,
      };
    });
  }

  async function uploadPinImage(index, file) {
    const status = $("#pins-status");
    setStatus(status, t("uploading"));
    try {
      readPinsForm();
      // SEO filename from owner's file; API adds suffix only on name conflict.
      const preferred = String(file?.name || "pin")
        .replace(/\.[^.]+$/, "")
        .trim();
      const data = await uploadImage(file, preferred || "pin");
      pinsData.pins[index].image = data.path;
      if (data.width) pinsData.pins[index].width = data.width;
      if (data.height) pinsData.pins[index].height = data.height;
      renderPinsEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch (err) {
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
    applyI18n();
    show("pins");
  }

  async function savePins() {
    const status = $("#pins-status");
    readPinsForm();
    const res = await fetch(window.PK_AUTH.API + "/api/content/pins", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({
        filters: pinsData.filters,
        pins: pinsData.pins,
      }),
    });
    if (!res.ok) {
      setStatus(status, t("pinsSaveFail"), "warn");
      return;
    }
    setStatus(
      status,
      window.PK_AUTH.isCloud?.() ? t("pinsSavedCloud") : t("pinsSaved"),
      "ok"
    );
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
        return `<div class="product-item panel product-item--compact" data-product-index="${pi}">
              <div class="review-card-head">
                <h4>${escapeAttr(t("labelProduct"))} #${pi + 1}</h4>
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
                  <label class="btn btn-ghost btn-sm upload-btn">
                    ${escapeAttr(t("btnUploadImage"))}
                    <input type="file" accept="image/*" data-product-upload="${i}:${pi}" hidden>
                  </label>
                </div>
                <div class="review-fields">
                  <div class="field"><label>${escapeAttr(t("labelTitle"))}</label>
                    <input data-pk="title" value="${escapeAttr(p.title || "")}"></div>
                  <div class="field"><label>${escapeAttr(t("labelAmazon"))}</label>
                    <input data-pk="amazonUrl" value="${escapeAttr(
                      p.amazonUrl || ""
                    )}" placeholder="https://link.amazon/xxxxx"></div>
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
              <button type="button" class="btn btn-ghost btn-sm" data-hub-offline="${i}">${escapeAttr(
                t("btnOfflineHub")
              )}</button>
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
              <label class="btn btn-ghost btn-sm upload-btn">
                ${escapeAttr(t("btnUploadImage"))}
                <input type="file" accept="image/*" data-hub-upload="${i}" hidden>
              </label>
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
        if (file) uploadHubImage(idx, file);
        input.value = "";
      });
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

    $$("[data-hub-offline]").forEach((btn) => {
      btn.addEventListener("click", () => {
        productsActiveHub = Number(btn.getAttribute("data-hub-offline"));
        openProductsOfflinePreview();
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
          amazonUrl: "https://link.amazon/",
          ratingStars: 0,
        });
        productsActiveHub = idx;
        renderProductsEditor();
      });
    });

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
        if (file) uploadProductImage(hi, pi, file);
        input.value = "";
      });
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

    const win = window.open("", "pk-products-preview");
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
    const draft = productsDraftPayload();
    delete draft.categoryProducts._note;
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/preview/products", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ hubId: hub.id, draft }),
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
        list[pi] = {
          ...pPrev,
          title: gp("title").trim() || pPrev.title,
          description: gp("description").trim(),
          pros: linesToList(gp("pros")),
          cons: linesToList(gp("cons")),
          verdict: gp("verdict").trim(),
          amazonUrl: gp("amazonUrl").trim(),
          imageAlt: gp("imageAlt").trim() || pPrev.imageAlt,
          image: pPrev.image,
          id: pPrev.id || `${newId}-${pi + 1}`,
          ratingStars,
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

  async function uploadHubImage(index, file) {
    const status = $("#products-status");
    setStatus(status, t("uploading"));
    try {
      readProductsForm();
      const preferred = (productsData.hubCategories[index]?.id || "hub") + "-cover";
      const data = await uploadImage(file, preferred);
      productsData.hubCategories[index].image = data.path;
      if (data.width) productsData.hubCategories[index].width = data.width;
      if (data.height) productsData.hubCategories[index].height = data.height;
      renderProductsEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch (err) {
      setStatus(status, window.PK_MEDIA.errorMessage(err, t), "warn");
    }
  }

  async function uploadProductImage(hubIndex, productIndex, file) {
    const status = $("#products-status");
    setStatus(status, t("uploading"));
    try {
      readProductsForm();
      const hub = productsData.hubCategories[hubIndex];
      // SEO filename from owner's file (e.g. airpods-pro-3); API adds suffix only on conflict.
      const preferred = String(file?.name || "product")
        .replace(/\.[^.]+$/, "")
        .trim();
      const data = await uploadImage(file, preferred || "product");
      productsData.categoryProducts[hub.id][productIndex].image = data.path;
      productsActiveHub = hubIndex;
      renderProductsEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch (err) {
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
    applyI18n();
    show("products");
  }

  function isGoodAmazonUrl(u) {
    const s = String(u || "").trim();
    if (!s || /TODO/i.test(s)) return false;
    return (
      /^https:\/\/amzn\.to\/[A-Za-z0-9]+/i.test(s) ||
      /^https:\/\/link\.amazon\/[A-Za-z0-9_-]+/i.test(s)
    );
  }

  async function saveProducts() {
    const status = $("#products-status");
    readProductsForm();
    const bad = [];
    Object.values(productsData.categoryProducts || {}).forEach((list) => {
      (list || []).forEach((p) => {
        if (p && p.title && p.amazonUrl && !isGoodAmazonUrl(p.amazonUrl)) {
          bad.push(p.title || p.amazonUrl);
        }
      });
    });
    if (bad.length) {
      setStatus(
        status,
        t("productsBadAmazon").replace("{n}", String(bad.length)) + ": " + bad.slice(0, 3).join(", "),
        "warn"
      );
      return;
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
      return;
    }
    setStatus(
      status,
      window.PK_AUTH.isCloud?.() ? t("productsSavedCloud") : t("productsSaved"),
      "ok"
    );
  }

  function openModule(name) {
    if (name === "Dash") {
      show("dash");
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
    const modePill = document.querySelector('[data-i18n="statusLocal"]');
    if (modePill && window.PK_AUTH.isCloud?.()) {
      modePill.textContent = t("statusCloud");
      modePill.classList.add("ok");
    }
    updatePreviewLinks();
    show("dash");
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
      const view = $$(".studio-panel[data-view]").find(
        (el) => !el.classList.contains("pk-hidden")
      );
      const id = view?.getAttribute("data-view");
      if (id) setActiveNav(id);
      if (id === "home" && homeData) {
        homeData.latestReviews = readHomeForm();
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
        amazonUrl: "https://link.amazon/",
        guideUrl: "/articles/",
      });
      renderTopPicksEditor();
    });
    $("#btn-pins-save")?.addEventListener("click", () => savePins());
    $("#btn-products-save")?.addEventListener("click", () => saveProducts());
    $("#btn-products-offline")?.addEventListener("click", () => openProductsOfflinePreview());
    $("#btn-pin-add")?.addEventListener("click", () => addPin());
    $("#btn-hub-add")?.addEventListener("click", () => addHubSection());

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
        openModule(btn.getAttribute("data-module"));
      });
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
