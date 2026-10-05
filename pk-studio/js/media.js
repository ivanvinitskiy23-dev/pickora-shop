/** Shared image compress + upload for Pickora Studio */
window.PK_MEDIA = (function () {
  const MAX_EDGE = 1600;
  const MAX_BYTES = 450_000; // keep D1 row (base64) under ~600KB

  function authHeaders() {
    const s = window.PK_AUTH.getSession();
    const h = { "Content-Type": "application/json" };
    if (s?.token) h.Authorization = "Bearer " + s.token;
    return h;
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image_decode_failed"));
      };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), type, quality);
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  function isRealWebp(blob) {
    return !!(blob && blob.size > 0 && blob.type === "image/webp");
  }

  /**
   * Resize + compress. Prefer WebP (SEO / site standard); fall back to JPEG.
   * Returns { blob, dataUrl, filename, bytes }.
   */
  async function compressImage(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("not_an_image");
    }
    let img;
    try {
      img = await loadImage(file);
    } catch {
      // HEIC / exotic formats — pass through only if already small
      if (file.size <= MAX_BYTES) {
        const dataUrl = await blobToDataUrl(file);
        return { blob: file, dataUrl, filename: file.name, bytes: file.size };
      }
      throw new Error("image_decode_failed");
    }

    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error("image_decode_failed");

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    async function encode(type, startQ) {
      let quality = startQ;
      let blob = await canvasToBlob(canvas, type, quality);
      if (type === "image/webp" && !isRealWebp(blob)) return null;
      while (blob && blob.size > MAX_BYTES && quality > 0.45) {
        quality -= 0.08;
        blob = await canvasToBlob(canvas, type, quality);
        if (type === "image/webp" && !isRealWebp(blob)) return null;
      }
      return blob;
    }

    let type = "image/webp";
    let blob = await encode("image/webp", 0.82);
    if (!blob) {
      type = "image/jpeg";
      blob = await encode("image/jpeg", 0.82);
    }
    if (!blob || blob.size > MAX_BYTES * 1.15) {
      canvas.width = Math.round(w * 0.7);
      canvas.height = Math.round(h * 0.7);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, "image/webp", 0.72);
      if (isRealWebp(blob)) {
        type = "image/webp";
      } else {
        blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
        type = "image/jpeg";
      }
    }
    if (!blob) throw new Error("compress_failed");
    if (blob.size > 700_000) throw new Error("file_too_large");

    const base = String(file.name || "cover")
      .replace(/\.[^.]+$/, "")
      .slice(0, 48);
    const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";
    const dataUrl = await blobToDataUrl(blob);
    return {
      blob,
      dataUrl,
      filename: `${base}.${ext}`,
      bytes: blob.size,
    };
  }

  async function upload(file, preferredName) {
    const prepared = await compressImage(file);
    const res = await fetch(window.PK_AUTH.API + "/api/media/upload", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({
        filename: prepared.filename,
        data: prepared.dataUrl,
        preferredName,
      }),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* empty */
    }
    if (!res.ok) {
      const code = data.error || "upload_failed";
      const err = new Error(code);
      err.status = res.status;
      err.detail = data.detail || data.hint || "";
      err.code = code;
      throw err;
    }
    return data;
  }

  function errorMessage(err, t) {
    const code = err?.code || err?.message || "";
    if (code === "file_too_large") return t("uploadTooLarge");
    if (code === "image_decode_failed" || code === "not_an_image") {
      return t("uploadBadFormat");
    }
    if (code === "unauthorized") return t("loginError");
    if (err?.detail) return t("uploadFail") + ": " + err.detail;
    return t("uploadFail");
  }

  function t(key) {
    const lang = localStorage.getItem("pk_studio_lang") || "ru";
    const pack = window.PK_I18N[lang] || window.PK_I18N.ru;
    return pack[key] || window.PK_I18N.en[key] || key;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mediaPickPayload(key) {
    const api = String(window.PK_AUTH?.API || "").replace(/\/$/, "");
    const workerUrl = api + "/api/media/file/" + encodeURIComponent(key);
    return { key, workerUrl, path: workerUrl };
  }

  let pickerKeyHandler = null;

  function closePicker() {
    const el = document.getElementById("pk-media-picker");
    if (el) el.remove();
    if (pickerKeyHandler) {
      document.removeEventListener("keydown", pickerKeyHandler);
      pickerKeyHandler = null;
    }
  }

  /**
   * Modal media picker: grid from /api/media/list, optional upload, Escape/backdrop close.
   * @param {{ onPick: (pick: { path: string, key: string, workerUrl: string }) => void }} opts
   */
  async function openPicker({ onPick }) {
    if (typeof onPick !== "function") return;
    closePicker();

    const backdrop = document.createElement("div");
    backdrop.id = "pk-media-picker";
    backdrop.className = "media-picker-backdrop";
    backdrop.innerHTML = `<div class="media-picker-modal panel" role="dialog" aria-modal="true">
        <div class="media-picker-head">
          <h3>${escapeHtml(t("mediaPickerTitle"))}</h3>
          <button type="button" class="btn btn-ghost btn-sm" data-picker-close aria-label="Close">×</button>
        </div>
        <div class="media-picker-toolbar">
          <input type="search" class="field-input" data-picker-search placeholder="${escapeHtml(
            t("mediaSearchPlaceholder")
          )}">
          <label class="btn btn-ghost btn-sm upload-btn">${escapeHtml(t("btnUploadImage"))}
            <input type="file" accept="image/*" data-picker-upload hidden>
          </label>
        </div>
        <div class="pill pk-hidden" data-picker-status style="margin:0 18px 10px"></div>
        <div class="media-picker-grid media-grid" data-picker-grid></div>
      </div>`;
    document.body.appendChild(backdrop);

    const modal = backdrop.querySelector(".media-picker-modal");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closePicker();
    });
    modal?.addEventListener("click", (e) => e.stopPropagation());
    backdrop.querySelector("[data-picker-close]")?.addEventListener("click", closePicker);
    pickerKeyHandler = (e) => {
      if (e.key === "Escape") closePicker();
    };
    document.addEventListener("keydown", pickerKeyHandler);

    let filesCache = [];

    function setPickerStatus(msg, kind) {
      const el = backdrop.querySelector("[data-picker-status]");
      if (!el) return;
      el.classList.remove("pk-hidden", "ok", "warn");
      el.textContent = msg;
      if (kind) el.classList.add(kind);
    }

    function finishPick(key) {
      if (!key) return;
      onPick(mediaPickPayload(key));
      closePicker();
    }

    function renderPickerGrid(files, query) {
      const grid = backdrop.querySelector("[data-picker-grid]");
      if (!grid) return;
      const q = String(query || "").trim().toLowerCase();
      const filtered = !q
        ? files
        : files.filter((f) => {
            const key = String(f.key || "").toLowerCase();
            return key.includes(q) || ("/api/media/file/" + key).includes(q);
          });
      if (!filtered.length) {
        grid.innerHTML = `<p class="hint">${escapeHtml(t("mediaSearchEmpty"))}</p>`;
        return;
      }
      const api = window.PK_AUTH.API;
      grid.innerHTML = filtered
        .map((f) => {
          const keyEnc = encodeURIComponent(f.key);
          const src = api + "/api/media/file/" + encodeURIComponent(f.key);
          return `<button type="button" class="media-picker-item" data-pick-key="${keyEnc}">
            <div class="media-thumb"><img src="${src}" alt="" loading="lazy"></div>
            <span class="path-hint">${escapeHtml(f.key)}</span>
          </button>`;
        })
        .join("");
      grid.querySelectorAll("[data-pick-key]").forEach((btn) => {
        btn.addEventListener("click", () => {
          finishPick(decodeURIComponent(btn.getAttribute("data-pick-key") || ""));
        });
      });
    }

    async function loadPickerMedia() {
      setPickerStatus(t("loading"), null);
      const res = await fetch(window.PK_AUTH.API + "/api/media/list", {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "media_list_failed");
      filesCache = data.files || [];
      const q = backdrop.querySelector("[data-picker-search]")?.value || "";
      renderPickerGrid(filesCache, q);
      setPickerStatus(t("mediaFilesCount") + ": " + filesCache.length, "ok");
    }

    backdrop.querySelector("[data-picker-search]")?.addEventListener("input", (e) => {
      renderPickerGrid(filesCache, e.target.value);
    });

    backdrop.querySelector("[data-picker-upload]")?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      setPickerStatus(t("uploading"), null);
      try {
        const preferred = String(file.name || "upload")
          .replace(/\.[^.]+$/, "")
          .trim();
        const data = await upload(file, preferred || "upload");
        if (data.key) {
          finishPick(data.key);
          return;
        }
        await loadPickerMedia();
        setPickerStatus(t("uploadOk"), "ok");
      } catch (err) {
        setPickerStatus(errorMessage(err, t), "warn");
      }
    });

    try {
      await loadPickerMedia();
    } catch (err) {
      setPickerStatus(err.message, "warn");
    }
  }

  return { compressImage, upload, errorMessage, openPicker };
})();
