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

  /**
   * Resize + JPEG compress so cloud D1 upload stays under the row-size limit.
   * Returns { blob, dataUrl, filename }.
   */
  async function compressImage(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("not_an_image");
    }
    // Tiny files: still normalize via canvas when possible; skip if already small jpeg/webp/png
    let img;
    try {
      img = await loadImage(file);
    } catch {
      // HEIC / exotic formats
      if (file.size <= MAX_BYTES) {
        const dataUrl = await blobToDataUrl(file);
        return { blob: file, dataUrl, filename: file.name };
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

    let type = "image/jpeg";
    let quality = 0.82;
    let blob = await canvasToBlob(canvas, type, quality);
    if (!blob) {
      type = "image/png";
      blob = await canvasToBlob(canvas, type);
    }
    while (blob && blob.size > MAX_BYTES && quality > 0.45) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      type = "image/jpeg";
    }
    if (!blob || blob.size > MAX_BYTES * 1.15) {
      // last resort: shrink more
      canvas.width = Math.round(w * 0.7);
      canvas.height = Math.round(h * 0.7);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
      type = "image/jpeg";
    }
    if (!blob) throw new Error("compress_failed");
    if (blob.size > 700_000) throw new Error("file_too_large");

    const base = String(file.name || "cover")
      .replace(/\.[^.]+$/, "")
      .slice(0, 48);
    const ext = type === "image/png" ? "png" : "jpg";
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

  return { compressImage, upload, errorMessage };
})();
