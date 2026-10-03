"""Render categoryProducts into admin-lab/site/<category>/index.html.

Card markup + CSS must stay aligned with admin-api/src/publish_products.js
(live Elementor chrome on pickora.shop).
"""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import LAB_SITE, ROOT, abs_url, esc, load_json  # noqa: E402

CARD_START = '<div class="pickora-final-card">'


def stars(n: int) -> str:
    n = max(1, min(5, int(n or 5)))
    return "★" * n + " "


def render_card(product: dict, eager: bool = False) -> str:
    loading = (
        'loading="eager" fetchpriority="high" decoding="async"'
        if eager
        else 'loading="lazy" decoding="async"'
    )
    img = abs_url(product.get("image") or "")
    alt = esc(product.get("imageAlt") or product.get("title") or "")
    title = esc(product.get("title") or "")
    desc = esc(product.get("description") or "")
    amazon = esc(product.get("amazonUrl") or "#")

    star_n = product.get("ratingStars")
    try:
        star_n = int(star_n) if star_n is not None and star_n != "" else 0
    except (TypeError, ValueError):
        star_n = 0
    rating_html = (
        f'<div class="pickora-final-rating">{stars(star_n)}</div>'
        if 1 <= star_n <= 5
        else ""
    )

    raw_verdict = str(product.get("verdict") or "").strip()
    verdict_block = ""
    if raw_verdict:
        plain = re.sub(r"<[^>]+>", "", raw_verdict)
        escaped = esc(plain)
        if escaped.lower().startswith("pickora"):
            parts = escaped.split(":", 1)
            body = f"<b>{parts[0]}:</b>{parts[1]}" if len(parts) == 2 else escaped
        else:
            body = f"<b>Pickora’s Verdict:</b> {escaped}"
        verdict_block = f'<div class="pickora-final-verdict">\n      {body}\n    </div>'

    lines = []
    for p in product.get("pros") or []:
        p = str(p or "").strip()
        if not p:
            continue
        lines.append(
            f'  <div class="pickora-final-list-line">\n'
            f'    <span class="pickora-final-badge-pro">Pros</span>\n'
            f"    <span>{esc(p)}</span>\n"
            f"  </div>"
        )
    for c in product.get("cons") or []:
        c = str(c or "").strip()
        if not c:
            continue
        lines.append(
            f'  <div class="pickora-final-list-line">\n'
            f'    <span class="pickora-final-badge-con">Cons</span>\n'
            f"    <span>{esc(c)}</span>\n"
            f"  </div>"
        )
    lists = (
        f'<div class="pickora-final-lists">\n' + "\n\n".join(lines) + "\n</div>"
        if lines
        else ""
    )
    desc_html = (
        f'<p class="pickora-final-text">\n     {desc}\n    </p>' if desc else ""
    )

    return f"""<div class="pickora-final-card">
  <div class="pickora-final-img-col">
    <div class="pickora-final-img-wrapper">
      <img src="{img}" alt="{alt}" width="1376" height="768" {loading}>
    </div>
  </div>
  <div class="pickora-final-info-col">
    <h3 class="pickora-final-title">{title}</h3>
    {rating_html}
    {desc_html}
{lists}
    {verdict_block}
    <a href="{amazon}" class="pickora-final-btn" target="_blank" rel="nofollow sponsored noopener noreferrer">
      Check Price on Amazon →
    </a>
  </div>
</div>"""


# Keep in sync with admin-api/src/publish_products.js STYLE_ONCE
STYLE_ONCE = """
<style>
  .pickora-final-card {
    display: flex; flex-direction: row; align-items: center; gap: 40px;
    background: #ffffff; padding: 32px; margin-bottom: 40px; border-radius: 16px;
    border: 1px solid #eef2f6; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .pickora-final-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
    border-color: #cbd5e1;
  }
  .pickora-final-img-col { flex: 1; max-width: 45%; }
  .pickora-final-img-wrapper {
    width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 12px; background: #f8fafc;
  }
  .pickora-final-img-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pickora-final-info-col {
    flex: 1; max-width: 55%; display: flex; flex-direction: column; justify-content: center;
  }
  .pickora-final-title {
    font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;
  }
  .pickora-final-rating { color: #ff9900; font-size: 15px; margin-bottom: 16px; }
  .pickora-final-text { font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0; }
  .pickora-final-lists { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
  .pickora-final-list-line {
    font-size: 14.5px; line-height: 1.5; color: #334155;
    display: flex; align-items: center; gap: 10px;
  }
  .pickora-final-badge-pro, .pickora-final-badge-con {
    font-size: 11px; text-transform: uppercase; font-weight: 700;
    padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; flex: 0 0 auto;
  }
  .pickora-final-badge-pro { background: #dcfce7; color: #166534; }
  .pickora-final-badge-con { background: #fee2e2; color: #991b1b; }
  .pickora-final-verdict {
    background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px;
    border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.5; color: #475569; margin-bottom: 24px;
  }
  .pickora-final-btn {
    display: inline-block; align-self: flex-start; min-height: 44px; box-sizing: border-box;
    background-color: #ff9900; color: #ffffff !important; text-decoration: none !important;
    font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15); transition: all 0.2s ease-in-out;
  }
  .pickora-final-btn:hover {
    background-color: #e68a00; box-shadow: 0 6px 16px rgba(255, 153, 0, 0.3);
  }
  @media (max-width: 768px) {
    .pickora-final-card { flex-direction: column; align-items: stretch; gap: 20px; padding: 20px; }
    .pickora-final-img-col, .pickora-final-info-col { max-width: 100%; }
    .pickora-final-btn { display: block; text-align: center; align-self: stretch; }
  }
</style>
"""


def replace_product_cards(html: str, products: list[dict]) -> str:
    first = html.find(CARD_START)
    if first < 0:
        raise ValueError("no pickora-final-card found")

    starts = [m.start() for m in re.finditer(re.escape(CARD_START), html)]
    last_start = starts[-1]
    m_end = re.search(
        r'class="pickora-final-btn"[^>]*>.*?</a>\s*(?:<!--.*?-->\s*)?</div>\s*</div>',
        html[last_start:],
        re.S,
    )
    if not m_end:
        raise ValueError("could not find end of last product card")
    end = last_start + m_end.end()

    style_before = html.rfind("<style>", 0, first)
    inject_at = first
    if style_before >= 0 and "pickora-final-card" in html[style_before:first]:
        inject_at = style_before

    cards = "\n\n".join(
        render_card(p, eager=(i == 0)) for i, p in enumerate(products)
    )
    block = STYLE_ONCE + "\n" + cards + "\n"
    return html[:inject_at] + block + html[end:]


def ensure_lab_category(cat_id: str, hub: dict | None = None) -> Path:
    live = ROOT / cat_id / "index.html"
    template = ROOT / "home-kitchen" / "index.html"
    dest_dir = LAB_SITE / cat_id
    dest = dest_dir / "index.html"
    dest_dir.mkdir(parents=True, exist_ok=True)
    src = live if live.exists() else template
    if not src.exists():
        raise FileNotFoundError(f"No template for category page: {cat_id}")
    shutil.copy2(src, dest)
    html = dest.read_text(encoding="utf-8", errors="replace")
    if hub and not live.exists():
        title = hub.get("title") or cat_id
        html = re.sub(
            r"<title>[^<]*</title>",
            f"<title>{esc(title)} – Pickora</title>",
            html,
            count=1,
        )
        html = re.sub(
            r'(property="og:title" content=")[^"]*(")',
            rf"\1{esc(title)}\2",
            html,
            count=1,
        )
        dest.write_text(html, encoding="utf-8")
    return dest


def main() -> None:
    data = load_json("products.json")
    hubs = data.get("hubCategories") or []
    cat_products = data.get("categoryProducts") or {}
    rendered = 0
    skipped = []

    for hub in hubs:
        cat_id = hub.get("id")
        if not cat_id:
            continue
        products = cat_products.get(cat_id) or []
        if not isinstance(products, list):
            skipped.append(cat_id)
            continue

        try:
            target = ensure_lab_category(cat_id, hub)
            live = ROOT / cat_id / "index.html"
            src = live if live.exists() else ROOT / "home-kitchen" / "index.html"
            shutil.copy2(src, target)
            html = target.read_text(encoding="utf-8", errors="replace")
            if hub and not live.exists():
                title = hub.get("title") or cat_id
                html = re.sub(
                    r"<title>[^<]*</title>",
                    f"<title>{esc(title)} – Pickora</title>",
                    html,
                    count=1,
                )
            if not products:
                skipped.append(f"{cat_id}: no products")
                continue
            new_html = replace_product_cards(html, products)
            target.write_text(new_html, encoding="utf-8")
            print(f"Rendered {len(products)} products -> {target}")
            rendered += 1
        except (ValueError, FileNotFoundError) as ex:
            skipped.append(f"{cat_id}:{ex}")

    if skipped:
        print("Skipped:", ", ".join(skipped))
    print(f"Done. Categories rendered: {rendered}")


if __name__ == "__main__":
    main()
