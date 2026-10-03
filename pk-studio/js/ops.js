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
      const res = await fetch(window.PK_AUTH.API + "/api/content/articles", {
        headers: authHeaders(),
        credentials: "include",
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
      const res = await fetch(window.PK_AUTH.API + "/api/publish/snapshots", {
        headers: authHeaders(),
        credentials: "include",
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
      const res = await fetch(window.PK_AUTH.API + "/api/publish/rollback", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
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
      const res = await fetch(window.PK_AUTH.API + "/api/status", {
        headers: authHeaders(),
        credentials: "include",
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
  async function loadMedia() {
    setPill("#media-status", t("loading"), null);
    const res = await fetch(window.PK_AUTH.API + "/api/media/list", {
      headers: authHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "media_list_failed");
    const wrap = $("#media-grid");
    if (!wrap) return;
    const files = data.files || [];
    if (!files.length) {
      wrap.innerHTML = `<p class="hint">${escapeHtml(t("mediaEmpty"))}</p>`;
      setPill("#media-status", t("mediaEmpty"), "warn");
      return;
    }
    const api = window.PK_AUTH.API;
    wrap.innerHTML = files
      .map((f) => {
        const key = escapeHtml(f.key);
        const src = api + "/api/media/file/" + encodeURIComponent(f.key);
        const kb = Math.round((f.bytes || 0) / 1024);
        return `<div class="media-card panel">
          <div class="media-thumb"><img src="${src}" alt="${key}" loading="lazy"></div>
          <p class="path-hint">${key} \u00b7 ${kb} KB</p>
          <button type="button" class="btn btn-ghost btn-sm" data-media-del="${key}" style="width:auto">${escapeHtml(
          t("btnDeleteMedia")
        )}</button>
        </div>`;
      })
      .join("");
    wrap.querySelectorAll("[data-media-del]").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteMedia(btn.getAttribute("data-media-del"), btn)
      );
    });
    setPill("#media-status", t("mediaFilesCount") + ": " + files.length, "ok");
  }

  async function deleteMedia(key, btn) {
    if (!key || !confirm(t("confirmDeleteMedia"))) return;
    if (btn) btn.disabled = true;
    const res = await fetch(
      window.PK_AUTH.API + "/api/media/file/" + encodeURIComponent(key),
      { method: "DELETE", headers: authHeaders(), credentials: "include" }
    );
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
      const pr = await fetch(window.PK_AUTH.API + "/api/content/products", {
        headers: authHeaders(),
        credentials: "include",
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
      const pinRes = await fetch(window.PK_AUTH.API + "/api/content/pins", {
        headers: authHeaders(),
        credentials: "include",
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
      const hr = await fetch(window.PK_AUTH.API + "/api/content/home", {
        headers: authHeaders(),
        credentials: "include",
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
          `<li class="${r.ok ? "gate-ok" : "gate-block"}">${escapeHtml(r.url)} \u2192 ${
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

  // Determine if current session user is owner (for showing invite panel + remove buttons)
  function sessionIsOwner() {
    const s = window.PK_AUTH.getSession();
    return !!(s?.user?.owner);
  }

  async function loadTeam() {
    setPill("#team-status", t("loading"), null);
    try {
      const res = await fetch(window.PK_AUTH.API + "/api/team", {
        headers: authHeaders(),
        credentials: "include",
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
      const res = await fetch(window.PK_AUTH.API + "/api/team/invite", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
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
      const res = await fetch(window.PK_AUTH.API + "/api/team/remove", {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
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
      $("#team-invite-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        inviteAdmin(e.target).catch((err) =>
          setPill("#team-invite-status", err.message, "warn")
        );
      });
      ["publish", "seo", "team", "status", "media"].forEach((view) => {
        $(`#btn-back-from-${view}`)?.addEventListener("click", () => {
          document.querySelectorAll("[data-view]").forEach((el) => {
            el.classList.toggle("pk-hidden", el.getAttribute("data-view") !== "dash");
          });
        });
      });
    },
  };
})();
