/**
 * Pickora Studio — article block constructor (Path A)
 * Block types: intro, heading, richtext, image, table, product, cta, faq, verdict, html
 */
window.PK_BLOCKS = (function () {
  function uid() {
    return "b" + Math.random().toString(36).slice(2, 10);
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function t(key) {
    const lang = localStorage.getItem("pk_studio_lang") || "ru";
    const pack = (window.PK_I18N && (window.PK_I18N[lang] || window.PK_I18N.ru)) || {};
    return pack[key] || (window.PK_I18N && window.PK_I18N.en[key]) || key;
  }

  const CATALOG = [
    { type: "intro", labelKey: "blockIntro", icon: "¶" },
    { type: "heading", labelKey: "blockHeading", icon: "H" },
    { type: "richtext", labelKey: "blockRichtext", icon: "✎" },
    { type: "image", labelKey: "blockImage", icon: "▣" },
    { type: "table", labelKey: "blockTable", icon: "▦" },
    { type: "product", labelKey: "blockProduct", icon: "★" },
    { type: "cta", labelKey: "blockCta", icon: "↗" },
    { type: "faq", labelKey: "blockFaq", icon: "?" },
    { type: "verdict", labelKey: "blockVerdict", icon: "✓" },
    { type: "html", labelKey: "blockHtml", icon: "</>" },
  ];

  function createBlock(type) {
    const id = uid();
    switch (type) {
      case "intro":
        return { id, type, text: "" };
      case "heading":
        return { id, type, level: 2, text: "" };
      case "richtext":
        return { id, type, text: "" };
      case "image":
        return { id, type, src: "", alt: "", caption: "" };
      case "table":
        return {
          id,
          type,
          headers: ["Model", "Best for", "Skip if"],
          rows: [
            ["", "", ""],
            ["", "", ""],
          ],
        };
      case "product":
        return {
          id,
          type,
          title: "",
          role: "",
          image: "",
          imageAlt: "",
          description: "",
          pros: [],
          cons: [],
          verdict: "",
          links: [{ label: "Amazon", url: "https://amzn.to/" }],
        };
      case "cta":
        return {
          id,
          type,
          title: "",
          links: [
            { label: "Amazon", url: "https://amzn.to/" },
            { label: "Walmart", url: "" },
          ],
        };
      case "faq":
        return {
          id,
          type,
          items: [
            { q: "", a: "" },
            { q: "", a: "" },
          ],
        };
      case "verdict":
        return { id, type, text: "" };
      case "html":
        return { id, type, html: "" };
      default:
        return { id, type: "richtext", text: "" };
    }
  }

  /** Starter stack for article types 1–6 */
  function starterBlocks(articleType) {
    const n = Number(articleType) || 2;
    const stack = [createBlock("intro")];
    if (n === 1 || n === 2) {
      stack.push(createBlock("table"));
      stack.push(createBlock("product"));
      stack.push(createBlock("product"));
      stack.push(createBlock("faq"));
      stack.push(createBlock("verdict"));
    } else if (n === 3) {
      stack.push(createBlock("product"));
      stack.push(createBlock("product"));
      stack.push(createBlock("table"));
      stack.push(createBlock("verdict"));
    } else if (n === 4) {
      stack.push(createBlock("product"));
      stack.push(createBlock("cta"));
      stack.push(createBlock("faq"));
      stack.push(createBlock("verdict"));
    } else {
      stack.push(createBlock("richtext"));
      stack.push(createBlock("product"));
      stack.push(createBlock("faq"));
      stack.push(createBlock("verdict"));
    }
    return stack;
  }

  function migrateFromBodyHtml(bodyHtml) {
    const html = String(bodyHtml || "").trim();
    if (!html) return starterBlocks(2);
    return [{ id: uid(), type: "html", html }];
  }

  function ensureBlocks(draft) {
    if (Array.isArray(draft.blocks) && draft.blocks.length) return draft.blocks;
    if (draft.bodyHtml) return migrateFromBodyHtml(draft.bodyHtml);
    return starterBlocks(draft.type || 2);
  }

  function paragraphsToHtml(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }

  function listToHtml(items, tag) {
    const lis = (items || [])
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .map((x) => `<li>${esc(x)}</li>`)
      .join("");
    return lis ? `<${tag}>${lis}</${tag}>` : "";
  }

  function compileBlock(b) {
    if (!b || !b.type) return "";
    switch (b.type) {
      case "intro":
        return `<div class="pk-block pk-block-intro">${paragraphsToHtml(b.text)}</div>`;
      case "heading": {
        const lv = b.level === 3 ? 3 : 2;
        return `<h${lv} class="pk-block-h">${esc(b.text)}</h${lv}>`;
      }
      case "richtext":
        return `<div class="pk-block pk-block-text">${paragraphsToHtml(b.text)}</div>`;
      case "image":
        if (!b.src) return "";
        return `<figure class="pk-block pk-block-image">
  <img src="${esc(b.src)}" alt="${esc(b.alt || "")}" loading="lazy">
  ${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ""}
</figure>`;
      case "table": {
        const headers = Array.isArray(b.headers) ? b.headers : [];
        const rows = Array.isArray(b.rows) ? b.rows : [];
        if (!headers.length) return "";
        const thead = `<tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>`;
        const tbody = rows
          .map(
            (row) =>
              `<tr>${headers
                .map((_, i) => `<td>${esc((row && row[i]) || "")}</td>`)
                .join("")}</tr>`
          )
          .join("\n");
        return `<div class="pk-block pk-block-table"><table><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
      }
      case "product": {
        const links = (b.links || [])
          .filter((l) => l && String(l.url || "").trim())
          .map(
            (l) =>
              `<a class="pk-aff-btn" href="${esc(l.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${esc(
                l.label || "Buy"
              )}</a>`
          )
          .join("\n");
        return `<article class="pk-block pk-product-card">
  ${
    b.image
      ? `<div class="pk-product-media"><img src="${esc(b.image)}" alt="${esc(
          b.imageAlt || b.title || ""
        )}" loading="lazy"></div>`
      : ""
  }
  <div class="pk-product-body">
    ${b.role ? `<span class="pk-aff-card-role">${esc(b.role)}</span>` : ""}
    <h3>${esc(b.title || "Product")}</h3>
    ${paragraphsToHtml(b.description)}
    ${listToHtml(b.pros, "ul")}
    ${b.cons && b.cons.filter(Boolean).length ? `<p><strong>Skip if:</strong></p>${listToHtml(b.cons, "ul")}` : ""}
    ${b.verdict ? `<div class="pk-verdict">${paragraphsToHtml(b.verdict)}</div>` : ""}
    ${links ? `<div class="pk-product-ctas">${links}</div>` : ""}
  </div>
</article>`;
      }
      case "cta": {
        const links = (b.links || [])
          .filter((l) => l && String(l.url || "").trim())
          .map(
            (l) =>
              `<a class="pk-aff-btn" href="${esc(l.url)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${esc(
                l.label || "Buy"
              )}</a>`
          )
          .join("\n");
        if (!links) return "";
        return `<div class="pk-block pk-block-cta">
  ${b.title ? `<p class="pk-cta-title">${esc(b.title)}</p>` : ""}
  <div class="pk-product-ctas">${links}</div>
</div>`;
      }
      case "faq": {
        const items = (b.items || []).filter((it) => it && (it.q || it.a));
        if (!items.length) return "";
        return `<div class="pk-faq-section pk-block">
  <h2>Frequently Asked Questions</h2>
  ${items
    .map(
      (it) => `<div class="pk-faq-item">
    <p class="pk-faq-q">${esc(it.q || "")}</p>
    <div class="pk-faq-a">${paragraphsToHtml(it.a)}</div>
  </div>`
    )
    .join("\n")}
</div>`;
      }
      case "verdict":
        return `<div class="pk-block pk-verdict pk-block-verdict">${paragraphsToHtml(b.text)}</div>`;
      case "html":
        return String(b.html || "");
      default:
        return "";
    }
  }

  function compileBlocksToHtml(blocks) {
    return (blocks || []).map(compileBlock).filter(Boolean).join("\n\n");
  }

  function plainTextFromBlocks(blocks) {
    return (blocks || [])
      .map((b) => {
        if (!b) return "";
        if (b.type === "html") return String(b.html || "").replace(/<[^>]+>/g, " ");
        if (b.type === "table") {
          return [...(b.headers || []), ...(b.rows || []).flat()].join(" ");
        }
        if (b.type === "product") {
          return [b.title, b.role, b.description, b.verdict, ...(b.pros || []), ...(b.cons || [])].join(" ");
        }
        if (b.type === "faq") {
          return (b.items || []).map((i) => `${i.q || ""} ${i.a || ""}`).join(" ");
        }
        if (b.type === "cta") return b.title || "";
        return b.text || "";
      })
      .join("\n");
  }

  function collectAffiliateLinks(blocks, extra) {
    const out = [];
    const push = (u) => {
      const url = String(u || "").trim();
      if (url && !out.includes(url)) out.push(url);
    };
    (extra || []).forEach(push);
    (blocks || []).forEach((b) => {
      if (b.type === "product" || b.type === "cta") {
        (b.links || []).forEach((l) => push(l && l.url));
      }
    });
    return out;
  }

  function countChars(el) {
    return String(el?.value || "").length;
  }

  function bindImageUpload(input, onPath) {
    input?.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      input.value = "";
      if (!file || !window.PK_MEDIA) return;
      try {
        const preferred = "block-" + Date.now();
        const data = await window.PK_MEDIA.upload(file, preferred);
        onPath(data.path);
      } catch (err) {
        alert(window.PK_MEDIA.errorMessage(err, t));
      }
    });
  }

  function renderEditor(container, blocks, onChange) {
    if (!container) return;
    let list = Array.isArray(blocks) ? blocks.map((b) => ({ ...b })) : [];

    function emit() {
      onChange(list.map((b) => JSON.parse(JSON.stringify(b))));
    }

    function move(i, dir) {
      const j = i + dir;
      if (j < 0 || j >= list.length) return;
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
      paint();
      emit();
    }

    function removeAt(i) {
      if (!confirm(t("blockConfirmDelete"))) return;
      list.splice(i, 1);
      paint();
      emit();
    }

    function add(type, afterIndex) {
      const b = createBlock(type);
      if (afterIndex == null || afterIndex < 0) list.push(b);
      else list.splice(afterIndex + 1, 0, b);
      paint();
      emit();
    }

    function readDomIntoList() {
      container.querySelectorAll("[data-block-id]").forEach((card) => {
        const id = card.getAttribute("data-block-id");
        const b = list.find((x) => x.id === id);
        if (!b) return;
        const type = b.type;
        if (type === "intro" || type === "richtext" || type === "verdict") {
          b.text = card.querySelector("[data-f=text]")?.value || "";
        } else if (type === "heading") {
          b.text = card.querySelector("[data-f=text]")?.value || "";
          b.level = Number(card.querySelector("[data-f=level]")?.value || 2);
        } else if (type === "image") {
          b.src = card.querySelector("[data-f=src]")?.value || "";
          b.alt = card.querySelector("[data-f=alt]")?.value || "";
          b.caption = card.querySelector("[data-f=caption]")?.value || "";
        } else if (type === "html") {
          b.html = card.querySelector("[data-f=html]")?.value || "";
        } else if (type === "table") {
          const headers = [...card.querySelectorAll("[data-th]")].map((el) => el.value);
          b.headers = headers;
          const rowEls = [...card.querySelectorAll("[data-row]")];
          b.rows = rowEls.map((row) =>
            [...row.querySelectorAll("[data-td]")].map((el) => el.value)
          );
        } else if (type === "product") {
          b.title = card.querySelector("[data-f=title]")?.value || "";
          b.role = card.querySelector("[data-f=role]")?.value || "";
          b.image = card.querySelector("[data-f=image]")?.value || "";
          b.imageAlt = card.querySelector("[data-f=imageAlt]")?.value || "";
          b.description = card.querySelector("[data-f=description]")?.value || "";
          b.verdict = card.querySelector("[data-f=verdict]")?.value || "";
          b.pros = (card.querySelector("[data-f=pros]")?.value || "")
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean);
          b.cons = (card.querySelector("[data-f=cons]")?.value || "")
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean);
          b.links = [...card.querySelectorAll("[data-link-row]")].map((row) => ({
            label: row.querySelector("[data-f=llabel]")?.value || "",
            url: row.querySelector("[data-f=lurl]")?.value || "",
          }));
        } else if (type === "cta") {
          b.title = card.querySelector("[data-f=title]")?.value || "";
          b.links = [...card.querySelectorAll("[data-link-row]")].map((row) => ({
            label: row.querySelector("[data-f=llabel]")?.value || "",
            url: row.querySelector("[data-f=lurl]")?.value || "",
          }));
        } else if (type === "faq") {
          b.items = [...card.querySelectorAll("[data-faq-row]")].map((row) => ({
            q: row.querySelector("[data-f=q]")?.value || "",
            a: row.querySelector("[data-f=a]")?.value || "",
          }));
        }
      });
    }

    function linksEditor(links) {
      const rows = (links && links.length ? links : [{ label: "", url: "" }])
        .map(
          (l, i) => `<div class="block-link-row" data-link-row>
          <input data-f="llabel" placeholder="Amazon" value="${esc(l.label || "")}">
          <input data-f="lurl" placeholder="https://amzn.to/…" value="${esc(l.url || "")}">
          <button type="button" class="btn btn-ghost btn-sm" data-link-del="${i}">×</button>
        </div>`
        )
        .join("");
      return `<div class="block-links">${rows}
        <button type="button" class="btn btn-ghost btn-sm" data-link-add>+ ${esc(t("blockAddLink"))}</button>
      </div>`;
    }

    function bodyFor(b) {
      switch (b.type) {
        case "intro":
        case "richtext":
        case "verdict":
          return `<div class="field"><label>${esc(t("blockText"))}</label>
            <textarea data-f="text" rows="4">${esc(b.text || "")}</textarea></div>`;
        case "heading":
          return `<div class="field-row">
            <div class="field"><label>H</label>
              <select data-f="level"><option value="2" ${b.level !== 3 ? "selected" : ""}>H2</option>
              <option value="3" ${b.level === 3 ? "selected" : ""}>H3</option></select></div>
            <div class="field grow"><label>${esc(t("blockText"))}</label>
              <input data-f="text" value="${esc(b.text || "")}"></div>
          </div>`;
        case "image":
          return `<div class="block-image-row">
            <div class="block-thumb">${
              b.src
                ? `<img src="${esc(b.src)}" alt="">`
                : `<div class="review-thumb-empty">${esc(t("noImage"))}</div>`
            }</div>
            <div class="review-fields">
              <label class="btn btn-ghost btn-sm upload-btn">${esc(t("btnUploadImage"))}
                <input type="file" accept="image/*" data-upload hidden></label>
              <div class="field"><label>URL</label><input data-f="src" value="${esc(b.src || "")}"></div>
              <div class="field"><label>Alt</label><input data-f="alt" value="${esc(b.alt || "")}"></div>
              <div class="field"><label>${esc(t("blockCaption"))}</label><input data-f="caption" value="${esc(b.caption || "")}"></div>
            </div>
          </div>`;
        case "table": {
          const headers = b.headers || [];
          const rows = b.rows || [];
          return `<div class="block-table-edit">
            <div class="block-table-head">${headers
              .map((h, i) => `<input data-th value="${esc(h)}" placeholder="Col ${i + 1}">`)
              .join("")}
              <button type="button" class="btn btn-ghost btn-sm" data-col-add>+col</button>
            </div>
            ${rows
              .map(
                (row, ri) =>
                  `<div class="block-table-row" data-row>${headers
                    .map(
                      (_, ci) =>
                        `<input data-td value="${esc((row && row[ci]) || "")}">`
                    )
                    .join("")}
                    <button type="button" class="btn btn-ghost btn-sm" data-row-del="${ri}">×</button>
                  </div>`
              )
              .join("")}
            <button type="button" class="btn btn-ghost btn-sm" data-row-add>+ ${esc(t("blockAddRow"))}</button>
          </div>`;
        }
        case "product":
          return `<div class="block-product">
            <div class="block-image-row">
              <div class="block-thumb">${
                b.image
                  ? `<img src="${esc(b.image)}" alt="">`
                  : `<div class="review-thumb-empty">${esc(t("noImage"))}</div>`
              }</div>
              <div class="review-fields">
                <label class="btn btn-ghost btn-sm upload-btn">${esc(t("btnUploadImage"))}
                  <input type="file" accept="image/*" data-upload hidden></label>
                <div class="field"><label>URL</label><input data-f="image" value="${esc(b.image || "")}"></div>
                <div class="field"><label>Alt</label><input data-f="imageAlt" value="${esc(b.imageAlt || "")}"></div>
              </div>
            </div>
            <div class="field-row">
              <div class="field grow"><label>${esc(t("labelTitle"))}</label><input data-f="title" value="${esc(b.title || "")}"></div>
              <div class="field"><label>${esc(t("blockRole"))}</label><input data-f="role" placeholder="Best overall" value="${esc(b.role || "")}"></div>
            </div>
            <div class="field"><label>${esc(t("labelExcerpt"))}</label><textarea data-f="description" rows="3">${esc(b.description || "")}</textarea></div>
            <div class="field-row">
              <div class="field grow"><label>${esc(t("labelPros"))}</label><textarea data-f="pros" rows="3">${esc((b.pros || []).join("\n"))}</textarea></div>
              <div class="field grow"><label>${esc(t("labelCons"))}</label><textarea data-f="cons" rows="3">${esc((b.cons || []).join("\n"))}</textarea></div>
            </div>
            <div class="field"><label>${esc(t("labelVerdict"))}</label><textarea data-f="verdict" rows="2">${esc(b.verdict || "")}</textarea></div>
            <label class="field-label">${esc(t("blockBuyLinks"))}</label>
            ${linksEditor(b.links)}
          </div>`;
        case "cta":
          return `<div class="field"><label>${esc(t("blockCtaTitle"))}</label><input data-f="title" value="${esc(b.title || "")}"></div>
            <label class="field-label">${esc(t("blockBuyLinks"))}</label>
            ${linksEditor(b.links)}`;
        case "faq":
          return `<div class="block-faq">${(b.items || [])
            .map(
              (it, i) => `<div class="block-faq-row" data-faq-row>
              <div class="field"><label>Q${i + 1}</label><input data-f="q" value="${esc(it.q || "")}"></div>
              <div class="field"><label>A</label><textarea data-f="a" rows="2">${esc(it.a || "")}</textarea></div>
              <button type="button" class="btn btn-ghost btn-sm" data-faq-del="${i}">×</button>
            </div>`
            )
            .join("")}
            <button type="button" class="btn btn-ghost btn-sm" data-faq-add>+ FAQ</button>
          </div>`;
        case "html":
          return `<div class="field"><label>HTML</label><textarea data-f="html" rows="6" class="mono">${esc(b.html || "")}</textarea></div>`;
        default:
          return "";
      }
    }

    function catalogBar(afterIndex) {
      return `<div class="block-add-bar" data-after="${afterIndex}">
        <span class="block-add-label">${esc(t("blockAdd"))}</span>
        ${CATALOG.map(
          (c) =>
            `<button type="button" class="btn btn-ghost btn-sm" data-add-type="${c.type}" data-after="${afterIndex}">${esc(
              c.icon
            )} ${esc(t(c.labelKey))}</button>`
        ).join("")}
      </div>`;
    }

    function paint() {
      readDomIntoList();
      const typeLabel = (type) => {
        const c = CATALOG.find((x) => x.type === type);
        return c ? t(c.labelKey) : type;
      };
      container.innerHTML =
        `<div class="blocks-canvas">` +
        list
          .map(
            (b, i) => `<div class="block-card" data-block-id="${esc(b.id)}" data-block-type="${esc(b.type)}">
            <div class="block-card-head">
              <strong>${esc(typeLabel(b.type))}</strong>
              <div class="block-card-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
                <button type="button" class="btn btn-ghost btn-sm" data-down="${i}" ${i === list.length - 1 ? "disabled" : ""}>↓</button>
                <button type="button" class="btn btn-ghost btn-sm" data-del="${i}">${esc(t("btnDeletePin"))}</button>
              </div>
            </div>
            <div class="block-card-body">${bodyFor(b)}</div>
          </div>
          ${catalogBar(i)}`
          )
          .join("") +
        (list.length ? "" : catalogBar(-1)) +
        `</div>`;

      container.querySelectorAll("[data-up]").forEach((btn) => {
        btn.addEventListener("click", () => {
          readDomIntoList();
          move(Number(btn.getAttribute("data-up")), -1);
        });
      });
      container.querySelectorAll("[data-down]").forEach((btn) => {
        btn.addEventListener("click", () => {
          readDomIntoList();
          move(Number(btn.getAttribute("data-down")), 1);
        });
      });
      container.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          readDomIntoList();
          removeAt(Number(btn.getAttribute("data-del")));
        });
      });
      container.querySelectorAll("[data-add-type]").forEach((btn) => {
        btn.addEventListener("click", () => {
          readDomIntoList();
          add(btn.getAttribute("data-add-type"), Number(btn.getAttribute("data-after")));
        });
      });

      container.querySelectorAll("[data-block-id]").forEach((card) => {
        const id = card.getAttribute("data-block-id");
        const b = list.find((x) => x.id === id);
        if (!b) return;

        card.querySelectorAll("input, textarea, select").forEach((el) => {
          el.addEventListener("change", () => {
            readDomIntoList();
            emit();
          });
          el.addEventListener("input", () => {
            /* live soft sync without full repaint */
          });
        });

        const upload = card.querySelector("[data-upload]");
        if (upload) {
          bindImageUpload(upload, (path) => {
            readDomIntoList();
            if (b.type === "image") {
              b.src = path;
            } else if (b.type === "product") {
              b.image = path;
            }
            paint();
            emit();
          });
        }

        card.querySelector("[data-link-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.links = b.links || [];
          b.links.push({ label: "", url: "" });
          paint();
          emit();
        });
        card.querySelectorAll("[data-link-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            readDomIntoList();
            b.links.splice(Number(btn.getAttribute("data-link-del")), 1);
            paint();
            emit();
          });
        });

        card.querySelector("[data-faq-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.items = b.items || [];
          b.items.push({ q: "", a: "" });
          paint();
          emit();
        });
        card.querySelectorAll("[data-faq-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            readDomIntoList();
            b.items.splice(Number(btn.getAttribute("data-faq-del")), 1);
            paint();
            emit();
          });
        });

        card.querySelector("[data-row-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.rows = b.rows || [];
          b.rows.push((b.headers || []).map(() => ""));
          paint();
          emit();
        });
        card.querySelectorAll("[data-row-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            readDomIntoList();
            b.rows.splice(Number(btn.getAttribute("data-row-del")), 1);
            paint();
            emit();
          });
        });
        card.querySelector("[data-col-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.headers = b.headers || [];
          b.headers.push("Col");
          b.rows = (b.rows || []).map((r) => [...r, ""]);
          paint();
          emit();
        });
      });
    }

    paint();

    return {
      getBlocks() {
        readDomIntoList();
        return list.map((b) => JSON.parse(JSON.stringify(b)));
      },
      setBlocks(next) {
        list = Array.isArray(next) ? next.map((b) => ({ ...b })) : [];
        paint();
      },
      refresh() {
        paint();
      },
    };
  }

  return {
    CATALOG,
    createBlock,
    starterBlocks,
    ensureBlocks,
    migrateFromBodyHtml,
    compileBlocksToHtml,
    plainTextFromBlocks,
    collectAffiliateLinks,
    renderEditor,
  };
})();
