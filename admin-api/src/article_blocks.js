/**
 * Block → HTML compiler matching live Pickora guide markup (pk-mw-*).
 * Used by publish + preview. Keep in sync with pk-studio/js/blocks.js.
 */

export function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escAttr(s) {
  return escHtml(s).replace(/'/g, "&#39;");
}

/** Brand-blue accent like live articles (middle keywords, never a lone blue last line). */
export function ensureBlueH1(h1Html, titleFallback) {
  const raw = String(h1Html || "").trim();
  if (raw && /pk-blue-text/i.test(raw)) return raw;
  // Author pasted HTML without blue — keep as-is
  if (raw && /<[a-z][\s\S]*>/i.test(raw)) return raw;

  const plain = String(
    (raw ? raw.replace(/<[^>]+>/g, "") : "") || titleFallback || "Article"
  )
    .replace(/\s+/g, " ")
    .trim();

  // "Stainless vs Gooseneck Electric Kettle" → Stainless vs <blue>Gooseneck</blue> Electric Kettle
  const vs = plain.match(/^(.*?)\s+vs\.?\s+(\S+)(.*)$/i);
  if (vs) {
    return `${escHtml(vs[1])} vs <span class="pk-blue-text">${escHtml(vs[2])}</span>${escHtml(vs[3])}`;
  }

  const parts = plain.split(" ").filter(Boolean);
  if (parts.length < 3) return escHtml(plain);

  // Live pattern: "Best <blue>noise cancelling</blue> headphones 2026"
  const blueCount = parts.length >= 5 ? 2 : 1;
  const start = 1;
  const end = Math.min(parts.length - 1, start + blueCount);
  const before = parts.slice(0, start).join(" ");
  const mid = parts.slice(start, end).join(" ");
  const after = parts.slice(end).join(" ");
  return `${escHtml(before)} <span class="pk-blue-text">${escHtml(mid)}</span>${
    after ? " " + escHtml(after) : ""
  }`;
}

function paragraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function sanitizeRichHtml(html) {
  let s = String(html || "");
  if (!s.trim()) return "";
  s = s
    .replace(/<\/?(div|span)([^>]*)>/gi, "")
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/&nbsp;/gi, " ");
  s = s.replace(/<\/?(?!\/?(?:p|br|strong|b|em|i|a)\b)[a-z][^>]*>/gi, "");
  s = s.replace(/<a\b[^>]*>/gi, (tag) => {
    const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    const href = m ? m[1].trim() : "";
    if (!/^https?:\/\//i.test(href)) return "<a>";
    return `<a href="${escAttr(href)}" target="_blank" rel="noopener noreferrer">`;
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
    if (/<p[\s>]/i.test(clean)) return clean;
    return clean
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }
  return paragraphs(raw);
}

function listHtml(items) {
  const lis = (items || [])
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .map((x) => `<li>${escHtml(x)}</li>`)
    .join("");
  return lis ? `<ul>${lis}</ul>` : "";
}

function amazonBtn(url, label) {
  return buyBtn(url, label || "Check on Amazon →", "amazon");
}

function isAmazonUrl(url) {
  return /^https?:\/\/(amzn\.to\/|www\.amazon\.|amazon\.|link\.amazon\/)/i.test(
    String(url || "").trim()
  );
}

const LINK_STYLES = ["amazon", "blue", "outline", "walmart", "dark"];

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
  return `<a class="${cls}" href="${escAttr(href)}" target="_blank" rel="sponsored nofollow noopener noreferrer">${escHtml(text)}</a>`;
}

/**
 * Cell content:
 * - plain text
 * - URL alone → Amazon button
 * - "Label|https://…" → Amazon button with label
 */
export function renderTableCell(raw) {
  const cell = String(raw ?? "").trim();
  if (!cell) return "";
  const parts = cell.split("|");
  if (parts.length >= 2 && /^https?:\/\//i.test(parts[1].trim())) {
    return buyBtn(
      parts[1].trim(),
      parts[0].trim() || "Amazon →",
      parts[2]?.trim() || "amazon"
    );
  }
  if (isAmazonUrl(cell)) return buyBtn(cell, "Amazon →", "amazon");
  return escHtml(cell);
}

const VARIANTS = {
  table: ["compare", "simple", "striped"],
  product: ["card", "compact"],
  cta: ["primary", "outline", "amazon", "walmart", "dark"],
  verdict: ["blue", "advice"],
};

function variantOf(block) {
  const allowed = VARIANTS[block && block.type];
  if (!allowed) return "";
  return allowed.includes(block.variant) ? block.variant : allowed[0];
}

export function compileBlocksToHtml(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return "";

  const html = blocks
    .map((b) => {
      if (!b || !b.type) return "";
      switch (b.type) {
        case "intro":
          return `<div class="pk-block pk-block-intro">${richToHtml(b.text)}</div>`;
        case "heading": {
          const lv = b.level === 3 ? 3 : 2;
          return `<h${lv}>${escHtml(b.text)}</h${lv}>`;
        }
        case "richtext":
          return `<div class="pk-block pk-block-text">${richToHtml(b.text)}</div>`;
        case "image":
          if (!b.src) return "";
          return `<figure class="pk-block pk-block-image">
  <img src="${escAttr(b.src)}" alt="${escAttr(b.alt || "")}" loading="lazy" decoding="async">
  ${b.caption ? `<figcaption>${escHtml(b.caption)}</figcaption>` : ""}
</figure>`;
        case "table": {
          const headers = Array.isArray(b.headers) ? b.headers : [];
          const rows = Array.isArray(b.rows) ? b.rows : [];
          if (!headers.length) return "";
          const thead = `<tr>${headers.map((h) => `<th>${escHtml(h)}</th>`).join("")}</tr>`;
          const tbody = rows
            .map(
              (row) =>
                `<tr>${headers
                  .map((_, i) => `<td>${renderTableCell((row && row[i]) || "")}</td>`)
                  .join("")}</tr>`
            )
            .join("\n");
          const v = variantOf(b);
          return `<p class="pk-swipe-hint">Swipe the table sideways on a phone to compare models.</p>
<div class="pk-mw-table-wrap pk-table--${v}">
<table class="pk-mw-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>
</div>`;
        }
        case "product": {
          const links = (b.links || [])
            .filter((l) => l && String(l.url || "").trim())
            .map((l) => buyBtn(l.url, l.label || "Buy", l.style || detectLinkStyle(l.url)))
            .join("\n");
          const pros = listHtml(b.pros);
          const cons = listHtml(b.cons);
          const cols =
            pros || cons
              ? `<div class="pk-mw-cols">
  <div class="pk-mw-box"><h4>Pros</h4>${pros || "<ul><li>—</li></ul>"}</div>
  <div class="pk-mw-box"><h4>Cons</h4>${cons || "<ul><li>—</li></ul>"}</div>
</div>`
              : "";
          const verdict = b.verdict
            ? `<div class="pk-mw-verdict">${richToHtml(b.verdict)}</div>`
            : "";
          return `<article class="pk-mw-pick">
  ${
    b.image
      ? `<img src="${escAttr(b.image)}" alt="${escAttr(
          b.imageAlt || b.title || ""
        )}" width="1200" height="900" loading="lazy" decoding="async">`
      : ""
  }
  ${b.role ? `<span class="pk-mw-badge">${escHtml(b.role)}</span>` : ""}
  <h3 class="pk-mw-pick-title">${escHtml(b.title || "Product")}</h3>
  ${richToHtml(b.description)}
  ${cols}
  ${verdict}
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
  ${b.title ? `<p class="pk-cta-title">${escHtml(b.title)}</p>` : ""}
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
  <summary class="pk-faq-q">${escHtml(it.q || "Question")}</summary>
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
    })
    .filter(Boolean)
    .join("\n\n");

  return `<div class="pk-mw-guide">\n${html}\n</div>`;
}

/** Live guide CSS (from how-to-choose-an-espresso-machine). */
export const PK_MW_GUIDE_CSS = `
.pk-mw-guide h2 { margin-top: 2.2rem; color: #15223B; font-family: Montserrat, sans-serif; }
.pk-mw-guide h3 { color: #15223B; }
.pk-mw-pick {
  margin: 40px 0;
  padding: 0 0 32px;
  border-bottom: 1px solid #e5e7eb;
  max-width: none;
  width: 100%;
}
.pk-mw-pick:last-of-type { border-bottom: 0; }
.pk-mw-pick img {
  width: 100%;
  height: auto;
  border-radius: 14px;
  margin: 0 0 18px;
  display: block;
  box-shadow: 0 8px 24px rgba(15,23,42,0.08);
}
.pk-mw-pick-title {
  font-family: Montserrat, sans-serif;
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  font-weight: 700;
  color: #15223B;
  margin: 0 0 10px;
  line-height: 1.3;
}
.pk-mw-badge {
  display: inline-block;
  background: #eef5fc;
  color: #2075d2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 999px;
  margin: 0 0 12px;
}
.pk-mw-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 16px 0 18px;
}
@media (max-width: 700px) {
  .pk-mw-cols { grid-template-columns: 1fr; }
}
.pk-mw-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
}
.pk-mw-box h4 { margin: 0 0 10px; font-size: 15px; color: #15223B; }
.pk-mw-box ul { margin: 0; padding-left: 18px; }
.pk-mw-box li { margin: 0 0 8px; color: #334155; line-height: 1.45; }
.pk-mw-verdict {
  background: #f0f7ff;
  border-left: 4px solid #2075d2;
  padding: 14px 16px;
  margin: 12px 0 8px;
  border-radius: 0 10px 10px 0;
  color: #15223B;
  line-height: 1.5;
}
.pk-mw-verdict--advice {
  background: #fff7ed;
  border-left-color: #ff9900;
}
.pk-mw-verdict p { margin: 0 0 8px; }
.pk-mw-verdict p:last-child { margin: 0; }
.pk-swipe-hint { color: #64748b; font-size: 14px; margin: 0 0 8px; max-width: none; }
.pk-mw-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 20px 0 28px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  max-width: 100%;
}
.pk-mw-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff;
}
.pk-mw-table th {
  padding: 14px 12px;
  text-align: left;
  background: #f8fafc;
  border-bottom: 3px solid #e2e8f0;
  color: #15223B;
  font-weight: 700;
}
.pk-mw-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
  color: #334155;
}
.pk-mw-table tr:nth-child(even) td { background: #fafafa; }
.pk-table--striped .pk-mw-table th { background: #15223B; color: #fff; border-bottom-color: #15223B; }
.pk-table--simple { box-shadow: none; border-radius: 0; }
.pk-table--simple .pk-mw-table { min-width: 0; }
.pk-table--simple .pk-mw-table th { background: transparent; border-bottom: 2px solid #cbd5e1; }
.pk-faq-section { max-width: 900px; margin: 40px 0 8px; }
.pk-faq-section > h2 {
  font-family: Montserrat, sans-serif; font-size: 24px; font-weight: 800;
  color: #15223B; margin: 0 0 16px; letter-spacing: -0.02em;
}
.pk-faq-acc {
  border-top: 1px solid #e2e8f0;
  padding: 0;
}
.pk-faq-acc:last-child { border-bottom: 1px solid #e2e8f0; }
.pk-faq-acc > summary {
  list-style: none;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  font-size: 1.02rem;
  color: #15223B;
  padding: 16px 28px 16px 0;
  position: relative;
  line-height: 1.35;
}
.pk-faq-acc > summary::-webkit-details-marker { display: none; }
.pk-faq-acc > summary::after {
  content: "+";
  position: absolute;
  right: 0; top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: #2075d2;
  font-weight: 700;
}
.pk-faq-acc[open] > summary::after { content: "−"; }
.pk-faq-acc .pk-faq-a { padding: 0 0 18px; color: #334155; }
.pk-faq-acc .pk-faq-a p { margin: 0 0 10px; line-height: 1.65; }
.pk-block-intro, .pk-block-text { max-width: 900px; }
.pk-block-cta { max-width: 900px; margin: 24px 0; text-align: center; }
@media (max-width: 900px) {
  .pk-mw-pick img { border-radius: 12px; }
  .pk-mw-table { min-width: 560px; }
}
@media (max-width: 600px) {
  .pk-mw-pick { margin: 28px 0; padding-bottom: 24px; }
  .pk-mw-pick img { border-radius: 10px; margin-bottom: 14px; }
  .pk-mw-table { min-width: 480px; font-size: 14px; }
  .pk-mw-table th, .pk-mw-table td { padding: 10px 8px; }
  .pk-faq-section { max-width: 100%; }
  .pk-block-intro, .pk-block-text, .pk-block-cta { max-width: 100%; }
}
.pk-cta-title { font-weight: 700; margin: 0 0 12px; }
.pk-product-ctas { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.pk-aff-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; box-sizing: border-box;
  background: #2075d2; color: #fff !important; text-decoration: none !important;
  font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 999px;
}
.pk-aff-btn--outline { background: #fff; color: #2075D2 !important; border: 1.5px solid #2075D2; }
.pk-aff-btn--primary { background: #2075D2; }
.pk-aff-btn--amazon { background: #ff9900 !important; color: #111 !important; }
.pk-aff-btn--walmart { background: #0071dc !important; color: #fff !important; }
.pk-aff-btn--dark { background: #15223B !important; color: #fff !important; }
.pk-review-title .pk-blue-text, .pk-blue-text { color: #2075d2; }
`;
