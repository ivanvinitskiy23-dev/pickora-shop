/** Pickora Studio app — Home / Pins / Products editors */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let lang = localStorage.getItem("pk_studio_lang") || "ru";
  let homeData = null;
  let pinsData = null;
  let productsData = null;
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

  function show(id) {
    $$("[data-view]").forEach((el) => {
      el.classList.toggle("pk-hidden", el.getAttribute("data-view") !== id);
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
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return path.startsWith("/") ? path : "/" + path;
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
    const dataUrl = await fileToDataUrl(file);
    const res = await fetch(window.PK_AUTH.API + "/api/media/upload", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({
        filename: file.name,
        data: dataUrl,
        preferredName,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || "upload_failed");
    return data;
  }

  /* —— Home —— */
  function applyArticleToSlot(index, article) {
    if (!homeData?.latestReviews?.[index] || !article) return;
    const prev = homeData.latestReviews[index];
    homeData.latestReviews[index] = {
      ...prev,
      slug: article.slug,
      url: normalizeUrl(article.url),
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      image: article.image,
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
    } catch {
      setStatus(status, t("uploadFail"), "warn");
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
    const res = await fetch(window.PK_AUTH.API + "/api/content/home", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ latestReviews, topPicks: homeData.topPicks }),
    });
    if (!res.ok) {
      setStatus(status, t("homeSaveFail"), "warn");
      return;
    }
    homeData.latestReviews = latestReviews;
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
      const preferred = "pin-" + (pinsData.pins[index]?.id || index + 1);
      const data = await uploadImage(file, preferred);
      pinsData.pins[index].image = data.path;
      if (data.width) pinsData.pins[index].width = data.width;
      if (data.height) pinsData.pins[index].height = data.height;
      renderPinsEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch {
      setStatus(status, t("uploadFail"), "warn");
    }
  }

  function addPin() {
    readPinsForm();
    const nextId = pinsData.pins.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
    const firstCat = (pinsData.filters || []).find((f) => f.id !== "all")?.id || "work";
    pinsData.pins.push({
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

  function renderProductsEditor() {
    const wrap = $("#products-list");
    if (!wrap || !productsData) return;
    ensureCategoryProducts();

    wrap.innerHTML = productsData.hubCategories
      .map((c, i) => {
        const products = productsData.categoryProducts[c.id] || [];
        const open = c._open ? " open" : "";
        const productsHtml = products
          .map((p, pi) => {
            return `<div class="product-item panel" data-product-index="${pi}">
              <div class="review-card-head">
                <h4>${escapeAttr(t("labelProduct"))} #${pi + 1}</h4>
                <button type="button" class="btn btn-ghost btn-sm" data-product-del="${i}:${pi}">${escapeAttr(
                  t("btnDeleteProduct")
                )}</button>
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
                  <p class="path-hint">${escapeAttr(p.image || "—")}</p>
                </div>
                <div class="review-fields">
                  <div class="field"><label>${escapeAttr(t("labelTitle"))}</label>
                    <input data-pk="title" value="${escapeAttr(p.title || "")}"></div>
                  <div class="field"><label>${escapeAttr(t("labelExcerpt"))}</label>
                    <textarea data-pk="description" rows="3">${escapeAttr(p.description || "")}</textarea></div>
                  <div class="field"><label>${escapeAttr(t("labelPros"))}</label>
                    <textarea data-pk="pros" rows="3" placeholder="one per line">${escapeAttr(
                      (p.pros || []).join("\n")
                    )}</textarea></div>
                  <div class="field"><label>${escapeAttr(t("labelCons"))}</label>
                    <textarea data-pk="cons" rows="2" placeholder="one per line">${escapeAttr(
                      (p.cons || []).join("\n")
                    )}</textarea></div>
                  <div class="field"><label>${escapeAttr(t("labelVerdict"))}</label>
                    <textarea data-pk="verdict" rows="2">${escapeAttr(p.verdict || "")}</textarea></div>
                  <div class="field"><label>${escapeAttr(t("labelAmazon"))}</label>
                    <input data-pk="amazonUrl" value="${escapeAttr(p.amazonUrl || "")}"></div>
                  <div class="field"><label>${escapeAttr(t("labelImageAlt"))}</label>
                    <input data-pk="imageAlt" value="${escapeAttr(p.imageAlt || "")}"></div>
                </div>
              </div>
            </div>`;
          })
          .join("");

        return `<div class="review-card panel section-card" data-hub-index="${i}">
          <div class="review-card-head">
            <h3>${escapeAttr(c.title || c.id)} <span class="pill">${products.length} ${escapeAttr(
              t("productsCount")
            )}</span></h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" class="btn btn-ghost btn-sm" data-hub-toggle="${i}">${escapeAttr(
                c._open ? t("btnHideProducts") : t("btnShowProducts")
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
                <input data-k="id" value="${escapeAttr(c.id || "")}"></div>
              <div class="field"><label>${escapeAttr(t("labelImageAlt"))}</label>
                <input data-k="imageAlt" value="${escapeAttr(c.imageAlt || "")}"></div>
            </div>
          </div>
          <div class="section-products${open}" data-hub-products="${i}">
            <div class="section-products-bar">
              <strong>${escapeAttr(t("productsInSection"))}</strong>
              <button type="button" class="btn btn-primary btn-sm" data-product-add="${i}" style="width:auto;padding-inline:16px">${escapeAttr(
                t("btnAddProduct")
              )}</button>
            </div>
            ${productsHtml || `<p class="hint">${escapeAttr(t("noProductsYet"))}</p>`}
          </div>
        </div>`;
      })
      .join("");

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
        renderProductsEditor();
      });
    });

    $$("[data-hub-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-hub-toggle"));
        readProductsForm();
        productsData.hubCategories[idx]._open = !productsData.hubCategories[idx]._open;
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
        list.push({
          id: `${hub.id}-${list.length + 1}`,
          title: "New product",
          image: "",
          imageAlt: "",
          description: "",
          pros: [],
          cons: [],
          verdict: "",
          amazonUrl: "https://amzn.to/",
          ratingStars: 5,
        });
        hub._open = true;
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
        hub._open = true;
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
        _open: !!prev._open,
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
          ratingStars: pPrev.ratingStars || 5,
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
    } catch {
      setStatus(status, t("uploadFail"), "warn");
    }
  }

  async function uploadProductImage(hubIndex, productIndex, file) {
    const status = $("#products-status");
    setStatus(status, t("uploading"));
    try {
      readProductsForm();
      const hub = productsData.hubCategories[hubIndex];
      const preferred = `${hub.id}-product-${productIndex + 1}`;
      const data = await uploadImage(file, preferred);
      productsData.categoryProducts[hub.id][productIndex].image = data.path;
      hub._open = true;
      renderProductsEditor();
      setStatus(status, t("uploadOk"), "ok");
    } catch {
      setStatus(status, t("uploadFail"), "warn");
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
      _open: true,
    });
    productsData.categoryProducts[id] = [];
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
    // open first section with products by default
    if (productsData.hubCategories[0]) productsData.hubCategories[0]._open = true;
    renderProductsEditor();
    applyI18n();
    show("products");
  }

  async function saveProducts() {
    const status = $("#products-status");
    readProductsForm();
    const payload = {
      hubCategories: productsData.hubCategories.map(({ _open, ...rest }) => rest),
      categoryProducts: { ...productsData.categoryProducts },
    };
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
    if (name === "Home") {
      openHome().catch(() => {
        $("#panel-module-name").textContent = name;
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
    $("#who-label").textContent = t("whoPrefix") + " " + me.user.login;
    const modePill = document.querySelector('[data-i18n="statusLocal"]');
    if (modePill && window.PK_AUTH.isCloud?.()) {
      modePill.textContent = t("statusCloud");
      modePill.classList.add("ok");
    }
    // Preview links: lab only on localhost; live site paths online
    const local = location.hostname === "127.0.0.1" || location.hostname === "localhost";
    const map = [
      ["link-preview-home", local ? "/admin-lab/site/" : "/", "btnOpenLab", "btnOpenLiveHome"],
      ["link-preview-pins", local ? "/admin-lab/site/categories/" : "/categories/", "btnOpenLabPins", "btnOpenLivePins"],
      ["link-preview-products", local ? "/admin-lab/site/products/" : "/products/", "btnOpenLabProducts", "btnOpenLiveProducts"],
    ];
    map.forEach(([id, href, localKey, liveKey]) => {
      const a = document.getElementById(id);
      if (!a) return;
      a.href = href;
      a.textContent = t(local ? localKey : liveKey);
    });
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
      const s = window.PK_AUTH.getSession();
      if (s && $("#who-label")) {
        $("#who-label").textContent = t("whoPrefix") + " " + s.login;
      }
      const view = $$("[data-view]").find((el) => !el.classList.contains("pk-hidden"));
      const id = view?.getAttribute("data-view");
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

    $("#btn-back-dash")?.addEventListener("click", () => show("dash"));
    $("#btn-back-from-home")?.addEventListener("click", () => show("dash"));
    $("#btn-back-from-pins")?.addEventListener("click", () => show("dash"));
    $("#btn-back-from-products")?.addEventListener("click", () => show("dash"));
    $("#btn-back-from-articles")?.addEventListener("click", () => show("dash"));
    $("#btn-back-from-media")?.addEventListener("click", () => show("dash"));
    $("#btn-home-save")?.addEventListener("click", () => saveHome());
    $("#btn-pins-save")?.addEventListener("click", () => savePins());
    $("#btn-products-save")?.addEventListener("click", () => saveProducts());
    $("#btn-pin-add")?.addEventListener("click", () => addPin());
    $("#btn-hub-add")?.addEventListener("click", () => addHubSection());

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
