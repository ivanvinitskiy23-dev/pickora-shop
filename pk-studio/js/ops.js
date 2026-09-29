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

    const modulesHtml = ["home", "pins", "products"]
      .map(
        (mod) => `<div class="review-card panel">
          <div class="review-card-head">
            <h3>${escapeHtml(t("pubMod_" + mod))}</h3>
            <span class="pill">draft→live</span>
          </div>
          <p class="hint">${escapeHtml(t("pubModHint_" + mod))}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
            <button type="button" class="btn btn-primary btn-sm" data-publish-mod="${mod}" style="width:auto;padding-inline:18px">${escapeHtml(
          t("btnPublishNow")
        )}</button>
          </div>
        </div>`
      )
      .join("");

    let articlesHtml = "";
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/content/articles", {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      const ready = (data.drafts || []).filter(
        (d) => d.status === "seo_ready" || d.status === "published"
      );
      if (ready.length) {
        articlesHtml =
          `<h3 style="margin:18px 0 10px">${escapeHtml(t("publishArticlesTitle"))}</h3>` +
          ready
            .map((d) => {
              const slug = escapeHtml(d.slug);
              const title = escapeHtml(d.title || d.slug);
              const st = escapeHtml(d.status || "");
              return `<div class="review-card panel" data-pub-slug="${slug}">
          <div class="review-card-head">
            <h3>${title}</h3>
            <span class="pill">${st}</span>
          </div>
          <p class="hint">/${slug}/ · ${escapeHtml(d.updatedAt || "")}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
            <button type="button" class="btn btn-primary btn-sm" data-publish-slug="${slug}" style="width:auto;padding-inline:18px">${escapeHtml(
                t("btnPublishNow")
              )}</button>
          </div>
        </div>`;
            })
            .join("");
      } else {
        articlesHtml = `<p class="hint" style="margin-top:14px">${escapeHtml(
          t("publishEmpty")
        )}</p>`;
      }
      setPill(
        "#publish-status",
        t("publishReadyCount").replace("{n}", String(ready.length)),
        "ok"
      );
    } catch (err) {
      articlesHtml = `<p class="hint">${escapeHtml(err.message)}</p>`;
      setPill("#publish-status", err.message, "warn");
    }

    wrap.innerHTML =
      `<h3>${escapeHtml(t("publishModulesTitle"))}</h3>` +
      modulesHtml +
      articlesHtml;

    wrap.querySelectorAll("[data-publish-mod]").forEach((btn) => {
      btn.addEventListener("click", () =>
        publishModule(btn.getAttribute("data-publish-mod"), btn)
      );
    });
    wrap.querySelectorAll("[data-publish-slug]").forEach((btn) => {
      btn.addEventListener("click", () =>
        publishSlug(btn.getAttribute("data-publish-slug"), btn)
      );
    });

    await loadSnapshots();
  }

  async function publishModule(mod, btn) {
    if (!mod) return;
    if (btn) btn.disabled = true;
    setPill("#publish-status", t("publishing"), null);
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/publish/" + mod, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: "{}",
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
        t("publishModOk").replace("{mod}", mod) + (data.note ? " — " + data.note : ""),
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
      const res = await fetch(window.PK_AUTH.API + "/api/publish/article", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
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
          (data.note ? " — " + data.note : ""),
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
      const res = await fetch(window.PK_AUTH.API + "/api/publish/snapshots", {
        headers: authHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      const rows = data.snapshots || [];
      if (!rows.length) {
        box.innerHTML = `<p class="hint">${escapeHtml(t("snapshotsEmpty"))}</p>`;
        return;
      }
      box.innerHTML = rows
        .map((s) => {
          const shas = (s.commit_shas || []).slice(0, 3).join(", ");
          return `<div class="review-card panel" style="margin-bottom:8px">
            <div class="review-card-head">
              <h3>#${s.id} · ${escapeHtml(s.module)}</h3>
              <span class="pill">${escapeHtml(s.created_at || "")}</span>
            </div>
            <p class="hint">${escapeHtml(shas || "—")}</p>
            <button type="button" class="btn btn-ghost btn-sm" data-rollback-id="${
              s.id
            }" style="width:auto;margin-top:8px">${escapeHtml(
            t("btnRollbackInfo")
          )}</button>
          </div>`;
        })
        .join("");
      box.querySelectorAll("[data-rollback-id]").forEach((btn) => {
        btn.addEventListener("click", () =>
          rollbackInfo(Number(btn.getAttribute("data-rollback-id")))
        );
      });
    } catch (err) {
      box.innerHTML = `<p class="hint">${escapeHtml(err.message)}</p>`;
    }
  }

  async function rollbackInfo(id) {
    setPill("#publish-status", t("loading"), null);
    const res = await fetch(window.PK_AUTH.API + "/api/publish/rollback", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    const links = (data.commits || []).join(" · ");
    setPill(
      "#publish-status",
      (data.hint || t("rollbackManual")) + (links ? " " + links : ""),
      "warn"
    );
  }

  /* —— Audit —— */
  async function loadAuditInto(sel) {
    const box = $(sel);
    if (!box) return;
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/audit", {
        headers: authHeaders(),
        credentials: "include",
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
      box.innerHTML = `<ul class="list-plain">${rows
        .map(
          (e) =>
            `<li><strong>${escapeHtml(e.action)}</strong> · ${escapeHtml(
              e.detail || ""
            )} · ${escapeHtml(e.user_login)} · <span class="hint">${escapeHtml(
              e.created_at
            )}</span></li>`
        )
        .join("")}</ul>`;
    } catch (err) {
      box.innerHTML = `<p class="hint">${escapeHtml(err.message)}</p>`;
    }
  }

  /* —— SEO / links —— */
  async function loadSeo() {
    setPill("#seo-status", t("loading"), null);
    const res = await fetch(window.PK_AUTH.API + "/api/content/articles", {
      headers: authHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    const drafts = data.drafts || [];
    const links = [];
    drafts.forEach((d) => {
      (d.affiliateLinks || []).forEach((u) => {
        if (u) links.push(u);
      });
    });
    // Also scan products draft if available
    try {
      const pr = await fetch(window.PK_AUTH.API + "/api/content/products", {
        headers: authHeaders(),
        credentials: "include",
      });
      const pd = await pr.json();
      (pd.hubCategories || []).forEach((h) => {
        (h.products || []).forEach((p) => {
          if (p.amazonUrl) links.push(p.amazonUrl);
        });
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
    setPill("#seo-status", t("seoChecking"), null);
    const res = await fetch(window.PK_AUTH.API + "/api/links/check", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify({ links: links.slice(0, 20) }),
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
          `<li class="${r.ok ? "gate-ok" : "gate-block"}">${escapeHtml(r.url)} → ${
            r.ok ? "OK" : "FAIL"
          } (${r.status})${r.error ? " " + escapeHtml(r.error) : ""}</li>`
      )
      .join("");
    setPill(
      "#seo-status",
      bad.length
        ? t("seoBrokenCount").replace("{n}", String(bad.length))
        : t("seoAllOk"),
      bad.length ? "warn" : "ok"
    );
  }

  /* —— Team —— */
  async function loadTeam() {
    setPill("#team-status", t("loading"), null);
    const res = await fetch(window.PK_AUTH.API + "/api/team", {
      headers: authHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      setPill("#team-status", data.error || "team_failed", "warn");
      return;
    }
    const list = $("#team-list");
    if (list) {
      list.innerHTML = (data.admins || [])
        .map(
          (a) =>
            `<li><strong>${escapeHtml(a.login)}</strong> · ${escapeHtml(a.role)}</li>`
        )
        .join("");
    }
    setPill("#team-status", data.note || t("teamOwnerOnly"), "ok");
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
      $("#btn-back-from-publish")?.addEventListener("click", () => {
        document.querySelectorAll("[data-view]").forEach((el) => {
          el.classList.toggle("pk-hidden", el.getAttribute("data-view") !== "dash");
        });
      });
      $("#btn-back-from-seo")?.addEventListener("click", () => {
        document.querySelectorAll("[data-view]").forEach((el) => {
          el.classList.toggle("pk-hidden", el.getAttribute("data-view") !== "dash");
        });
      });
      $("#btn-back-from-team")?.addEventListener("click", () => {
        document.querySelectorAll("[data-view]").forEach((el) => {
          el.classList.toggle("pk-hidden", el.getAttribute("data-view") !== "dash");
        });
      });
    },
  };
})();
