"""Render categoryProducts into admin-lab/site/<category>/index.html."""
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import LAB_SITE, ROOT, abs_url, esc, load_json  # noqa: E402

CARD_START = '<div class="pickora-final-card">'
# After last product cards, Elementor usually continues with another e-con / widget
AFTER_CARDS = re.compile(
    r'(</div>\s*</div>\s*</div>\s*)(<div class="elementor-element[^"]*e-con)',
    re.S,
)


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
    verdict = product.get("verdict") or ""
    # Keep "Pickora's Verdict:" prefix if missing
    if verdict and "verdict" not in verdict.lower()[:40]:
        verdict_html = f"<b>Pickora’s Verdict:</b> {esc(verdict)}"
    else:
        # may already contain label; escape whole but allow simple <b> if present
        verdict_html = esc(re.sub(r"<[^>]+>", "", verdict))
        if verdict_html.lower().startswith("pickora"):
            # re-bold first label
            parts = verdict_html.split(":", 1)
            if len(parts) == 2:
                verdict_html = f"<b>{parts[0]}:</b>{parts[1]}"
        else:
            verdict_html = f"<b>Pickora’s Verdict:</b> {verdict_html}"

    amazon = esc(product.get("amazonUrl") or "#")
    pros = product.get("pros") or []
    cons = product.get("cons") or []
    lines = []
    for p in pros:
        lines.append(
            f'  <div class="pickora-final-list-line">\n'
            f'    <span class="pickora-final-badge-pro">Pros</span>\n'
            f"    <span>{esc(p)}</span>\n"
            f"  </div>"
        )
    for c in cons:
        lines.append(
            f'  <div class="pickora-final-list-line">\n'
            f'    <span class="pickora-final-badge-con">Cons</span>\n'
            f"    <span>{esc(c)}</span>\n"
            f"  </div>"
        )
    lists = "\n\n".join(lines)
    rating = stars(product.get("ratingStars") or 5)

    return f"""<div class="pickora-final-card">
  <div class="pickora-final-img-col">
    <div class="pickora-final-img-wrapper">
      <img src="{img}" alt="{alt}" width="1376" height="768" {loading}>
    </div>
  </div>
  <div class="pickora-final-info-col">
    <h3 class="pickora-final-title">{title}</h3>
    <div class="pickora-final-rating">{rating}</div>
    <p class="pickora-final-text">
     {desc}
    </p>
<div class="pickora-final-lists">
{lists}
</div>
    <div class="pickora-final-verdict">
      {verdict_html}
    </div>
    <a href="{amazon}" class="pickora-final-btn" target="_blank" rel="nofollow sponsored noopener noreferrer">
      Check Price on Amazon →
    </a>
  </div>
</div>"""


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
  .pickora-final-info-col { flex: 1; max-width: 55%; display: flex; flex-direction: column; gap: 12px; }
  .pickora-final-title { margin: 0; font-size: 26px; font-weight: 700; color: #15223B; line-height: 1.25; }
  .pickora-final-rating { color: #f5a623; letter-spacing: 2px; font-size: 18px; }
  .pickora-final-text { margin: 0; font-size: 15.5px; line-height: 1.6; color: #445; }
  .pickora-final-lists { display: flex; flex-direction: column; gap: 8px; }
  .pickora-final-list-line { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #334; }
  .pickora-final-badge-pro, .pickora-final-badge-con {
    flex: 0 0 auto; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; text-transform: uppercase;
  }
  .pickora-final-badge-pro { background: #dcfce7; color: #166534; }
  .pickora-final-badge-con { background: #fee2e2; color: #991b1b; }
  .pickora-final-verdict {
    background: #F5FAFF; border-left: 3px solid #2075d2; padding: 12px 14px; border-radius: 8px;
    font-size: 14.5px; line-height: 1.55; color: #15223B;
  }
  .pickora-final-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: #2075d2; color: #fff !important; text-decoration: none !important;
    font-weight: 700; padding: 12px 18px; border-radius: 999px; width: fit-content;
  }
  .pickora-final-btn:hover { background: #1a63b5; }
  @media (max-width: 768px) {
    .pickora-final-card { flex-direction: column; align-items: stretch; gap: 20px; padding: 20px; }
    .pickora-final-img-col, .pickora-final-info-col { max-width: 100%; }
    .pickora-final-btn { display: block; text-align: center; align-self: stretch; padding: 16px; }
  }
</style>
"""


def replace_product_cards(html: str, products: list[dict]) -> str:
    first = html.find(CARD_START)
    if first < 0:
        raise ValueError("no pickora-final-card found")

    # Walk from first card; find last card end by iterating card starts
    starts = [m.start() for m in re.finditer(re.escape(CARD_START), html)]
    last_start = starts[-1]
    # End of last card: closing </div> of the card (outer)
    # Heuristic: after last btn, two closing divs (info-col + card)
    m_end = re.search(
        r'class="pickora-final-btn"[^>]*>.*?</a>\s*(?:<!--.*?-->\s*)?</div>\s*</div>',
        html[last_start:],
        re.S,
    )
    if not m_end:
        raise ValueError("could not find end of last product card")
    end = last_start + m_end.end()

    # Also strip preceding duplicate <style>…pickora-final… blocks immediately before first card
    # Keep page chrome; inject one style + all cards
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
        # Light retitle for lab stub pages cloned from home-kitchen
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
            html = target.read_text(encoding="utf-8", errors="replace")
            # Re-copy base then patch (ensure_lab already copied)
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
