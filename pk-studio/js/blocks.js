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

  /** Optional style variants. First entry is the default. */
  const VARIANTS = {
    table: ["compare", "simple", "striped"],
    product: ["card", "compact"],
    cta: ["primary", "outline", "amazon", "walmart", "dark"],
    verdict: ["blue", "advice"],
  };

  const LINK_STYLES = ["amazon", "blue", "outline", "walmart", "dark"];

  function variantOf(block) {
    const allowed = VARIANTS[block && block.type];
    if (!allowed) return "";
    return allowed.includes(block.variant) ? block.variant : allowed[0];
  }

  function isAmazonUrl(url) {
    return /^https?:\/\/(amzn\.to\/|www\.amazon\.|amazon\.|link\.amazon\/)/i.test(
      String(url || "").trim()
    );
  }

  function detectLinkStyle(url, explicit) {
    if (explicit && LINK_STYLES.includes(explicit)) return explicit;
    if (isAmazonUrl(url)) return "amazon";
    return "blue";
  }

  function buyBtn(url, label, style) {
    const href = String(url || "").trim();
    if (!href) return "";
    const text = String(label || "Buy").trim() || "Buy";
    const st = detectLinkStyle(href, style);
    const cls =
      st === "amazon"
        ? "pk-aff-btn pk-aff-btn--amazon"
        : st === "outline"
          ? "pk-aff-btn pk-aff-btn--outline"
          : st === "walmart"
            ? "pk-aff-btn pk-aff-btn--walmart"
            : st === "dark"
              ? "pk-aff-btn pk-aff-btn--dark"
              : "pk-aff-btn pk-aff-btn--primary";
    return `<a class="${cls}" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${esc(text)}</a>`;
  }

  /** Allow only safe inline tags from the Studio RTE. */
  function sanitizeRichHtml(html) {
    let s = String(html || "");
    if (!s.trim()) return "";
    // Normalize common editor output
    s = s
      .replace(/<\/?(div|span)([^>]*)>/gi, "")
      .replace(/<br\s*\/?>/gi, "<br>")
      .replace(/&nbsp;/gi, " ");
    // Drop everything except p/br/strong/b/em/i/a
    s = s.replace(/<\/?(?!\/?(?:p|br|strong|b|em|i|a)\b)[a-z][^>]*>/gi, "");
    // Clean <a> to href only (http/https)
    s = s.replace(/<a\b[^>]*>/gi, (tag) => {
      const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
      const href = m ? m[1].trim() : "";
      if (!/^https?:\/\//i.test(href)) return "<a>";
      return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">`;
    });
    s = s.replace(/<(strong|b|em|i|p)\b[^>]*>/gi, "<$1>");
    return s.trim();
  }

  function richToHtml(text) {
    const raw = String(text || "").trim();
    if (!raw) return "";
    if (/<\/?[a-z]/i.test(raw)) {
      const clean = sanitizeRichHtml(raw);
      if (!clean) return "";
      // If already has block tags, use as-is; else wrap paragraphs
      if (/<p[\s>]/i.test(clean)) return clean;
      return clean
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("\n");
    }
    return paragraphsToHtml(raw);
  }

  function paragraphsToHtml(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }

  const CATALOG = [
    { type: "intro", labelKey: "blockIntro", icon: "¶" },
    { type: "heading", labelKey: "blockHeading", icon: "H" },
    { type: "richtext", labelKey: "blockRichtext", icon: "≡" },
    { type: "image", labelKey: "blockImage", icon: "▢" },
    { type: "table", labelKey: "blockTable", icon: "▤" },
    { type: "product", labelKey: "blockProduct", icon: "◧" },
    { type: "cta", labelKey: "blockCta", icon: "→" },
    { type: "faq", labelKey: "blockFaq", icon: "?" },
    { type: "verdict", labelKey: "blockVerdict", icon: "◆" },
    { type: "html", labelKey: "blockHtml", icon: "</>" },
  ];

  function ensureTableActionCol(b) {
    if (!b || b.type !== "table") return;
    b.headers = Array.isArray(b.headers) ? b.headers : ["Model", "Best for", "Price"];
    b.rows = Array.isArray(b.rows) ? b.rows : [];
    const hasAction = b.headers.some((h) =>
      /^(action|amazon|buy|cta)$/i.test(String(h || "").trim())
    );
    if (!hasAction) {
      b.headers.push("Action");
      b.rows = b.rows.map((r) => {
        const row = Array.isArray(r) ? [...r] : [];
        while (row.length < b.headers.length - 1) row.push("");
        row.push("Amazon →|https://amzn.to/");
        return row;
      });
    }
  }

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
          variant: "compare",
          headers: ["Model", "Best for", "Skip if", "Price", "Action"],
          rows: [
            ["", "", "", "", "Amazon →|https://amzn.to/"],
            ["", "", "", "", "Amazon →|https://amzn.to/"],
          ],
        };
      case "product":
        return {
          id,
          type,
          variant: "card",
          title: "",
          role: "",
          image: "",
          imageAlt: "",
          description: "",
          pros: [],
          cons: [],
          verdict: "",
          links: [{ label: "Amazon", url: "https://amzn.to/", style: "amazon" }],
        };
      case "cta":
        return {
          id,
          type,
          variant: "amazon",
          title: "",
          links: [
            { label: "Amazon", url: "https://amzn.to/", style: "amazon" },
            { label: "Walmart", url: "", style: "walmart" },
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
        return { id, type, variant: "blue", text: "" };
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

  function listToHtml(items, tag) {
    const lis = (items || [])
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .map((x) => `<li>${esc(x)}</li>`)
      .join("");
    return lis ? `<${tag}>${lis}</${tag}>` : "";
  }

  function renderTableCell(raw) {
    const cell = String(raw ?? "").trim();
    if (!cell) return "";
    const parts = cell.split("|");
    if (parts.length >= 2 && /^https?:\/\//i.test(parts[1].trim())) {
      const label = parts[0].trim();
      const url = parts[1].trim();
      const style = parts[2] ? parts[2].trim() : "";
      return buyBtn(url, label || "Amazon →", style || "amazon");
    }
    if (isAmazonUrl(cell)) return buyBtn(cell, "Amazon →", "amazon");
    return esc(cell);
  }

  function compileBlock(b) {
    if (!b || !b.type) return "";
    switch (b.type) {
      case "intro":
        return `<div class="pk-block pk-block-intro">${richToHtml(b.text)}</div>`;
      case "heading": {
        const lv = b.level === 3 ? 3 : 2;
        return `<h${lv}>${esc(b.text)}</h${lv}>`;
      }
      case "richtext":
        return `<div class="pk-block pk-block-text">${richToHtml(b.text)}</div>`;
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
                .map((_, i) => `<td>${renderTableCell((row && row[i]) || "")}</td>`)
                .join("")}</tr>`
          )
          .join("\n");
        return `<p class="pk-swipe-hint">Swipe the table sideways on a phone to compare models.</p>
<div class="pk-mw-table-wrap pk-table--${variantOf(b)}">
<table class="pk-mw-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>
</div>`;
      }
      case "product": {
        const links = (b.links || [])
          .filter((l) => l && String(l.url || "").trim())
          .map((l) => buyBtn(l.url, l.label || "Buy", l.style || detectLinkStyle(l.url)))
          .join("\n");
        const pros = listToHtml(b.pros, "ul");
        const cons = listToHtml(b.cons, "ul");
        const cols =
          pros || cons
            ? `<div class="pk-mw-cols">
  <div class="pk-mw-box"><h4>Pros</h4>${pros || "<ul><li>—</li></ul>"}</div>
  <div class="pk-mw-box"><h4>Cons</h4>${cons || "<ul><li>—</li></ul>"}</div>
</div>`
            : "";
        return `<article class="pk-mw-pick">
  ${
    b.image
      ? `<img src="${esc(b.image)}" alt="${esc(b.imageAlt || b.title || "")}" loading="lazy" decoding="async">`
      : ""
  }
  ${b.role ? `<span class="pk-mw-badge">${esc(b.role)}</span>` : ""}
  <h3 class="pk-mw-pick-title">${esc(b.title || "Product")}</h3>
  ${richToHtml(b.description)}
  ${cols}
  ${b.verdict ? `<div class="pk-mw-verdict">${richToHtml(b.verdict)}</div>` : ""}
  ${links ? `<p class="pk-product-ctas">${links}</p>` : ""}
</article>`;
      }
      case "cta": {
        const fallbackStyle =
          variantOf(b) === "primary"
            ? "blue"
            : variantOf(b) === "amazon"
              ? "amazon"
              : variantOf(b);
        const links = (b.links || [])
          .filter((l) => l && String(l.url || "").trim())
          .map((l) =>
            buyBtn(
              l.url,
              l.label || "Buy",
              l.style || detectLinkStyle(l.url, fallbackStyle)
            )
          )
          .join("\n");
        if (!links) return "";
        return `<div class="pk-block pk-block-cta pk-block-cta--${variantOf(b)}">
  ${b.title ? `<p class="pk-cta-title">${esc(b.title)}</p>` : ""}
  <div class="pk-product-ctas">${links}</div>
</div>`;
      }
      case "faq": {
        const items = (b.items || []).filter((it) => it && (it.q || it.a));
        if (!items.length) return "";
        return `<div class="pk-faq-section">
  <h2>Frequently Asked Questions</h2>
  ${items
    .map(
      (it) => `<details class="pk-faq-acc">
  <summary class="pk-faq-q">${esc(it.q || "Question")}</summary>
  <div class="pk-faq-a">${richToHtml(it.a)}</div>
</details>`
    )
    .join("\n")}
</div>`;
      }
      case "verdict": {
        const v = variantOf(b) || "blue";
        return `<div class="pk-mw-verdict pk-block-verdict pk-mw-verdict--${v}">${richToHtml(b.text)}</div>`;
      }
      case "html":
        return String(b.html || "");
      default:
        return "";
    }
  }

  function compileBlocksToHtml(blocks) {
    const inner = (blocks || []).map(compileBlock).filter(Boolean).join("\n\n");
    return inner ? `<div class="pk-mw-guide">\n${inner}\n</div>` : "";
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
      paint({ skipDomRead: true });
      emit();
    }

    function removeAt(i) {
      if (!confirm(t("blockConfirmDelete"))) return;
      list.splice(i, 1);
      paint({ skipDomRead: true });
      emit();
    }

    function add(type, afterIndex) {
      const b = createBlock(type);
      if (afterIndex == null || afterIndex < 0) list.push(b);
      else list.splice(afterIndex + 1, 0, b);
      paint({ skipDomRead: true });
      emit();
    }

    function duplicateAt(i) {
      const src = list[i];
      if (!src) return;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = uid();
      list.splice(i + 1, 0, copy);
      paint({ skipDomRead: true });
      emit();
    }

    function readDomIntoList() {
      container.querySelectorAll("[data-block-id]").forEach((card) => {
        const id = card.getAttribute("data-block-id");
        const b = list.find((x) => x.id === id);
        if (!b) return;
        const type = b.type;
        if (VARIANTS[type]) {
          const v = card.querySelector("[data-f=variant]")?.value;
          if (v && VARIANTS[type].includes(v)) b.variant = v;
        }
        if (type === "intro" || type === "richtext" || type === "verdict") {
          const rte = card.querySelector("[data-f=text][contenteditable]");
          if (rte) b.text = sanitizeRichHtml(rte.innerHTML);
          else b.text = card.querySelector("[data-f=text]")?.value || "";
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
          b.rows = rowEls.map((row) => {
            const cells = [];
            const kids = [...row.children].filter((el) => el.matches("[data-td], [data-td-link]"));
            kids.forEach((el) => {
              if (el.matches("[data-td-link]")) {
                const label = el.querySelector("[data-td-label]")?.value || "";
                const url = el.querySelector("[data-td-url]")?.value || "";
                const combined = url ? `${label || "Amazon →"}|${url}` : label;
                const hidden = el.querySelector("[data-td]");
                if (hidden) hidden.value = combined;
                cells.push(combined);
              } else {
                cells.push(el.value || "");
              }
            });
            return cells;
          });
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
            style: detectLinkStyle(
              row.querySelector("[data-f=lurl]")?.value || "",
              row.querySelector("[data-f=lstyle]")?.value || ""
            ),
          }));
        } else if (type === "cta") {
          b.title = card.querySelector("[data-f=title]")?.value || "";
          b.links = [...card.querySelectorAll("[data-link-row]")].map((row) => ({
            label: row.querySelector("[data-f=llabel]")?.value || "",
            url: row.querySelector("[data-f=lurl]")?.value || "",
            style: detectLinkStyle(
              row.querySelector("[data-f=lurl]")?.value || "",
              row.querySelector("[data-f=lstyle]")?.value || ""
            ),
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
      const del = esc(t("btnDeletePin"));
      const styleOpts = (cur) =>
        LINK_STYLES.map(
          (s) =>
            `<option value="${s}"${s === cur ? " selected" : ""}>${esc(t("linkStyle_" + s))}</option>`
        ).join("");
      const rows = (links && links.length ? links : [{ label: "Amazon", url: "", style: "amazon" }])
        .map((l, i) => {
          const st = detectLinkStyle(l.url, l.style);
          return `<div class="buy-row" data-link-row>
          <input class="buy-store" data-f="llabel" placeholder="Amazon" value="${esc(l.label || "")}">
          <input class="buy-url" data-f="lurl" placeholder="https://amzn.to/xxxxx" value="${esc(l.url || "")}" inputmode="url" spellcheck="false">
          <select class="buy-style" data-f="lstyle" title="${esc(t("linkStyle"))}" aria-label="${esc(t("linkStyle"))}">${styleOpts(st)}</select>
          <button type="button" class="block-tool block-tool-del" data-link-del="${i}" title="${del}" aria-label="${del}">×</button>
        </div>`;
        })
        .join("");
      return `<div class="buy-links">
        <span class="block-legend">${esc(t("blockBuyLinks"))}</span>
        <p class="block-hint">${esc(t("hintBuyLink"))}</p>
        <div class="buy-rows">${rows}</div>
        <button type="button" class="btn btn-ghost btn-sm" data-link-add>+ ${esc(t("blockAddLink"))}</button>
      </div>`;
    }

    function rteEditor(text, verdictVariant) {
      const html = String(text || "").trim()
        ? /<\/?[a-z]/i.test(text)
          ? sanitizeRichHtml(text)
          : esc(text).replace(/\n/g, "<br>")
        : "";
      const vClass = verdictVariant ? ` rte-verdict--${verdictVariant}` : "";
      return `<div class="block-prose block-rte${vClass}">
        <div class="rte-toolbar" role="toolbar" aria-label="Format">
          <button type="button" class="rte-btn" data-rte="bold" title="${esc(t("rteBold"))}"><b>B</b></button>
          <button type="button" class="rte-btn" data-rte="italic" title="${esc(t("rteItalic"))}"><i>I</i></button>
          <button type="button" class="rte-btn" data-rte="createLink" title="${esc(t("rteLink"))}">🔗</button>
        </div>
        <div class="prose-input rte-input" data-f="text" contenteditable="true" role="textbox" aria-multiline="true">${html}</div>
        <p class="block-hint rte-hint">${esc(t("rteHint"))}</p>
      </div>`;
    }

    function dropzone(src, big) {
      return `<label class="pk-drop${big ? " pk-drop-lg" : ""}${src ? " has-img" : ""}">
        <input type="file" accept="image/*" data-upload hidden>
        ${src ? `<img src="${esc(src)}" alt="">` : ""}
        <span class="pk-drop-face">
          <span class="pk-drop-mark" aria-hidden="true">+</span>
          <span class="pk-drop-title">${esc(t("btnUploadImage"))}</span>
          <span class="pk-drop-hint">${esc(t("blockDropHint"))}</span>
        </span>
      </label>`;
    }

    function bodyFor(b) {
      switch (b.type) {
        case "intro":
        case "richtext":
          return rteEditor(b.text);
        case "verdict":
          return rteEditor(b.text, variantOf(b) || "blue");
        case "heading":
          return `<div class="block-head-edit">
            <select class="level-pick" data-f="level" aria-label="H">
              <option value="2" ${b.level !== 3 ? "selected" : ""}>H2</option>
              <option value="3" ${b.level === 3 ? "selected" : ""}>H3</option>
            </select>
            <input class="heading-input" data-f="text" value="${esc(b.text || "")}" placeholder="${esc(t("blockText"))}…">
          </div>`;
        case "image":
          return `<div class="media-edit">
            ${dropzone(b.src)}
            <div class="media-fields">
              <div class="field"><label>URL</label><input data-f="src" value="${esc(b.src || "")}"></div>
              <div class="field"><label>Alt</label><input data-f="alt" value="${esc(b.alt || "")}"></div>
              <div class="field"><label>${esc(t("blockCaption"))}</label><input data-f="caption" value="${esc(b.caption || "")}"></div>
            </div>
          </div>`;
        case "table": {
          ensureTableActionCol(b);
          const headers = b.headers || [];
          const rows = b.rows || [];
          const del = esc(t("btnDeletePin"));
          const v = variantOf(b);
          const isActionCol = (h) => /^(action|amazon|buy|cta)$/i.test(String(h || "").trim());
          const splitLink = (raw) => {
            const cell = String(raw || "");
            const pipe = cell.indexOf("|");
            if (pipe > 0 && /^https?:\/\//i.test(cell.slice(pipe + 1).trim())) {
              return { label: cell.slice(0, pipe).trim(), url: cell.slice(pipe + 1).trim() };
            }
            if (/^https?:\/\//i.test(cell.trim())) return { label: "Amazon →", url: cell.trim() };
            return { label: cell, url: "" };
          };
          return `<div class="tbl-edit tbl-edit--${v}" data-table-variant="${v}" style="--cols:${Math.max(headers.length, 1)}">
            <p class="block-hint block-hint--amazon">${esc(t("hintTableAmazon"))}</p>
            <p class="block-hint">${esc(t("hintTableVariant_" + v))}</p>
            <div class="tbl-grid">
              <div class="tbl-head">${headers
                .map((h, i) => `<input data-th value="${esc(h)}" placeholder="Col ${i + 1}"${isActionCol(h) ? ' class="tbl-th-action"' : ""}>`)
                .join("")}<span class="tbl-sp"></span></div>
              ${rows
                .map(
                  (row, ri) =>
                    `<div class="tbl-row" data-row>${headers
                      .map((_, ci) => {
                        const h = headers[ci];
                        const val = (row && row[ci]) || "";
                        if (isActionCol(h) || String(val).includes("|") || /^https?:\/\/amzn\.to\//i.test(val)) {
                          const parts = splitLink(val);
                          return `<div class="tbl-link-cell" data-td-link>
                            <input data-td-label placeholder="Amazon →" value="${esc(parts.label)}">
                            <input data-td-url placeholder="https://amzn.to/xxxxx" value="${esc(parts.url)}">
                            <input type="hidden" data-td value="${esc(val)}">
                          </div>`;
                        }
                        return `<input data-td value="${esc(val)}">`;
                      })
                      .join("")}
                      <button type="button" class="block-tool block-tool-del" data-row-del="${ri}" title="${del}" aria-label="${del}">×</button>
                    </div>`
                )
                .join("")}
            </div>
            <div class="tbl-tools">
              <button type="button" class="btn btn-ghost btn-sm" data-row-add>+ ${esc(t("blockAddRow"))}</button>
              <button type="button" class="btn btn-ghost btn-sm" data-col-add>+ Col</button>
              <button type="button" class="btn btn-primary btn-xs" data-action-col>+ ${esc(t("blockAddActionCol"))}</button>
            </div>
          </div>`;
        }
        case "product":
          return `<div class="prod-edit prod-edit--${variantOf(b)}">
            <div class="prod-media">
              ${dropzone(b.image, true)}
              <div class="field"><label>URL</label><input data-f="image" value="${esc(b.image || "")}" placeholder="/api/media/file/…"><p class="field-hint">${esc(t("hintBlockImage"))}</p></div>
              <div class="field"><label>Alt</label><input data-f="imageAlt" value="${esc(b.imageAlt || "")}" placeholder="Product on a kitchen counter"><p class="field-hint">${esc(t("hintImageAlt"))}</p></div>
            </div>
            <div class="prod-fields">
              <div class="field-row">
                <div class="field grow"><label>${esc(t("labelTitle"))}</label><input data-f="title" value="${esc(b.title || "")}" placeholder="Toshiba OptiChef…"></div>
                <div class="field"><label>${esc(t("blockRole"))}</label><input data-f="role" placeholder="Best overall · $$" value="${esc(b.role || "")}"><p class="field-hint">${esc(t("hintBlockRole"))}</p></div>
              </div>
              <div class="field"><label>${esc(t("labelExcerpt"))}</label><textarea data-f="description" rows="3" placeholder="${esc(t("hintProductDesc"))}">${esc(b.description || "")}</textarea></div>
              <div class="pc-grid">
                <div class="pc-col pc-pro">
                  <span class="block-legend"><span class="pc-mark" aria-hidden="true">+</span>${esc(t("labelPros"))}</span>
                  <textarea data-f="pros" rows="4" placeholder="${esc(t("hintPros"))}">${esc((b.pros || []).join("\n"))}</textarea>
                </div>
                <div class="pc-col pc-con">
                  <span class="block-legend"><span class="pc-mark" aria-hidden="true">−</span>${esc(t("labelCons"))}</span>
                  <textarea data-f="cons" rows="4" placeholder="${esc(t("hintCons"))}">${esc((b.cons || []).join("\n"))}</textarea>
                </div>
              </div>
              <div class="field"><label>${esc(t("labelVerdict"))}</label><textarea data-f="verdict" rows="2" placeholder="${esc(t("hintVerdict"))}">${esc(b.verdict || "")}</textarea></div>
              ${linksEditor(b.links)}
            </div>
          </div>`;
        case "cta":
          return `<div class="cta-edit cta-edit--${variantOf(b)}">
            <div class="field"><label>${esc(t("blockCtaTitle"))}</label><input data-f="title" value="${esc(b.title || "")}" placeholder="Ready to buy?"></div>
            <div class="cta-style-preview" aria-hidden="true"><span class="pk-aff-btn pk-aff-btn--${variantOf(b)}">${esc(t("blockCtaPreview"))}</span></div>
            ${linksEditor(b.links)}
          </div>`;
        case "faq": {
          const del = esc(t("btnDeletePin"));
          return `<div class="faq-edit">
            ${(b.items || [])
              .map(
                (it, i) => `<div class="faq-row" data-faq-row>
              <span class="faq-num" aria-hidden="true">${i + 1}</span>
              <div class="faq-fields">
                <input class="faq-q" data-f="q" value="${esc(it.q || "")}" placeholder="Q${i + 1}">
                <textarea class="faq-a" data-f="a" rows="2" placeholder="A">${esc(it.a || "")}</textarea>
              </div>
              <button type="button" class="block-tool block-tool-del" data-faq-del="${i}" title="${del}" aria-label="${del}">×</button>
            </div>`
              )
              .join("")}
            <button type="button" class="btn btn-ghost btn-sm" data-faq-add>+ FAQ</button>
          </div>`;
        }
        case "html":
          return `<div class="html-edit">
            <span class="block-legend">HTML</span>
            <textarea data-f="html" rows="8" class="mono">${esc(b.html || "")}</textarea>
          </div>`;
        default:
          return "";
      }
    }

    /** Small style switch in the block header — only for table / product / cta. */
    function variantPicker(b) {
      const allowed = VARIANTS[b.type];
      if (!allowed) return "";
      const cur = variantOf(b);
      const opts = allowed
        .map(
          (v) =>
            `<option value="${v}"${v === cur ? " selected" : ""}>${esc(
              t("blockVariant_" + b.type + "_" + v)
            )}</option>`
        )
        .join("");
      return `<label class="block-variant">
        <span class="pk-sr">${esc(t("blockVariant"))}</span>
        <select class="variant-pick" data-f="variant" title="${esc(t("blockVariant"))}">${opts}</select>
      </label>`;
    }

    /** Type picker: a compact popover sheet, opened from one "+" affordance. */
    function catalogBar(afterIndex, placement) {
      const main = placement === "main";
      const addLabel = esc(t("blockAdd"));
      const items = CATALOG.map(
        (c) => `<button type="button" class="pick-item" data-add-type="${c.type}" data-after="${afterIndex}">
            <span class="pick-mark" aria-hidden="true">${esc(c.icon)}</span>
            <span class="pick-name">${esc(t(c.labelKey))}</span>
          </button>`
      ).join("");
      return `<div class="block-seam${main ? " block-seam-main" : ""}" data-after="${afterIndex}">
        <details class="block-insert">
          <summary class="${main ? "block-insert-cta" : "block-seam-btn"}" title="${addLabel}" aria-label="${addLabel}">${
            main ? "+ " + addLabel : "+"
          }</summary>
          <div class="block-picker">
            <span class="block-picker-title">${esc(t("blockPickType"))}</span>
            <div class="block-picker-grid">${items}</div>
          </div>
        </details>
      </div>`;
    }

    function paint(opts) {
      // skipDomRead: after in-memory mutations (add link/row/faq) — do NOT
      // re-read the stale DOM or the change is wiped before re-render.
      if (!opts || !opts.skipDomRead) readDomIntoList();
      const typeLabel = (type) => {
        const c = CATALOG.find((x) => x.type === type);
        return c ? t(c.labelKey) : type;
      };
      const typeMark = (type) => {
        const c = CATALOG.find((x) => x.type === type);
        return c ? c.icon : "•";
      };
      const up = esc(t("blockMoveUp"));
      const down = esc(t("blockMoveDown"));
      const del = esc(t("btnDeletePin"));
      container.innerHTML =
        `<div class="blocks-canvas"><div class="blocks-doc">` +
        (list.length
          ? list
              .map(
                (b, i) => `<article class="block-row" data-block-id="${esc(b.id)}" data-block-type="${esc(b.type)}">
            <header class="block-bar">
              <span class="block-seq">${String(i + 1).padStart(2, "0")}</span>
              <span class="block-mark" aria-hidden="true">${esc(typeMark(b.type))}</span>
              <span class="block-kind">${esc(typeLabel(b.type))}</span>
              ${variantPicker(b)}
              <div class="block-tools">
                <button type="button" class="block-tool" data-up="${i}" title="${up}" aria-label="${up}" ${i === 0 ? "disabled" : ""}>↑</button>
                <button type="button" class="block-tool" data-down="${i}" title="${down}" aria-label="${down}" ${i === list.length - 1 ? "disabled" : ""}>↓</button>
                <button type="button" class="block-tool block-tool-del" data-del="${i}" title="${del}" aria-label="${del}">×</button>
              </div>
            </header>
            <div class="block-body">${bodyFor(b)}</div>
          </article>
          ${catalogBar(i)}`
              )
              .join("")
          : `<div class="blocks-empty">
              <span class="blocks-empty-mark" aria-hidden="true">+</span>
              <p>${esc(t("blockPickType"))}</p>
            </div>`) +
        `</div>` +
        catalogBar(list.length ? list.length - 1 : -1, "main") +
        `</div>`;

      /* only one picker open at a time */
      container.querySelectorAll("details.block-insert").forEach((d) => {
        d.addEventListener("toggle", () => {
          if (!d.open) return;
          container.querySelectorAll("details.block-insert[open]").forEach((other) => {
            if (other !== d) other.open = false;
          });
        });
      });

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
            if (el.matches("[data-f=variant]")) {
              paint({ skipDomRead: true });
            }
            // Auto-pick Amazon color when URL is an Amazon link
            if (el.matches("[data-f=lurl]")) {
              const row = el.closest("[data-link-row]");
              const styleSel = row?.querySelector("[data-f=lstyle]");
              if (styleSel && isAmazonUrl(el.value) && styleSel.value !== "amazon") {
                styleSel.value = "amazon";
              }
            }
            emit();
          });
          el.addEventListener("input", () => {
            /* live soft sync without full repaint */
          });
        });

        /* Rich-text toolbar (bold / italic / link) */
        card.querySelectorAll("[data-rte]").forEach((btn) => {
          btn.addEventListener("mousedown", (e) => e.preventDefault());
          btn.addEventListener("click", () => {
            const cmd = btn.getAttribute("data-rte");
            const editor = card.querySelector(".rte-input");
            if (!editor) return;
            editor.focus();
            if (cmd === "createLink") {
              const url = window.prompt("URL", "https://");
              if (url) document.execCommand("createLink", false, url);
            } else {
              document.execCommand(cmd, false, null);
            }
            readDomIntoList();
            emit();
          });
        });
        card.querySelectorAll(".rte-input").forEach((ed) => {
          ed.addEventListener("input", () => {
            readDomIntoList();
            emit();
          });
          ed.addEventListener("blur", () => {
            readDomIntoList();
            emit();
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
            paint({ skipDomRead: true });
            emit();
          });
        }

        card.querySelector("[data-link-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.links = Array.isArray(b.links) ? b.links : [];
          b.links.push({ label: "Amazon", url: "https://amzn.to/", style: "amazon" });
          paint({ skipDomRead: true });
          emit();
        });
        card.querySelectorAll("[data-link-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            readDomIntoList();
            b.links = Array.isArray(b.links) ? b.links : [];
            b.links.splice(Number(btn.getAttribute("data-link-del")), 1);
            if (!b.links.length) b.links.push({ label: "Amazon", url: "", style: "amazon" });
            paint({ skipDomRead: true });
            emit();
          });
        });

        card.querySelector("[data-faq-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.items = Array.isArray(b.items) ? b.items : [];
          b.items.push({ q: "", a: "" });
          paint({ skipDomRead: true });
          emit();
        });
        card.querySelectorAll("[data-faq-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            readDomIntoList();
            b.items = Array.isArray(b.items) ? b.items : [];
            b.items.splice(Number(btn.getAttribute("data-faq-del")), 1);
            paint({ skipDomRead: true });
            emit();
          });
        });

        card.querySelector("[data-row-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.rows = Array.isArray(b.rows) ? b.rows : [];
          b.rows.push((b.headers || []).map(() => ""));
          paint({ skipDomRead: true });
          emit();
        });
        card.querySelectorAll("[data-row-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            readDomIntoList();
            b.rows = Array.isArray(b.rows) ? b.rows : [];
            b.rows.splice(Number(btn.getAttribute("data-row-del")), 1);
            paint({ skipDomRead: true });
            emit();
          });
        });
        card.querySelector("[data-col-add]")?.addEventListener("click", () => {
          readDomIntoList();
          b.headers = Array.isArray(b.headers) ? b.headers : [];
          b.headers.push("Col");
          b.rows = (b.rows || []).map((r) => [...(r || []), ""]);
          paint({ skipDomRead: true });
          emit();
        });
        card.querySelector("[data-action-col]")?.addEventListener("click", () => {
          readDomIntoList();
          b.headers = Array.isArray(b.headers) ? b.headers : [];
          if (!b.headers.some((h) => /^(action|amazon|buy|cta)$/i.test(String(h || "").trim()))) {
            b.headers.push("Action");
            b.rows = (b.rows || []).map((r) => [...(r || []), "Amazon →|https://amzn.to/"]);
          }
          paint({ skipDomRead: true });
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
        list.forEach(ensureTableActionCol);
        paint({ skipDomRead: true });
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
