"""Render content/products.json hub cards into admin-lab/site/products/index.html."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import LAB_SITE, abs_url, esc, load_json  # noqa: E402


def lab_page_url(path: str) -> str:
    """Preview links inside admin-lab (repo-root server on :8765)."""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    p = path if path.startswith("/") else "/" + path
    p = "/" + p.strip("/")
    return f"/admin-lab/site{p}/"


def cat_card(cat: dict, eager: bool = False) -> str:
    loading = (
        'loading="eager" fetchpriority="high" decoding="async"'
        if eager
        else 'loading="lazy" decoding="async"'
    )
    href = lab_page_url(cat["url"])
    return f"""        <article class="pk-cat-card">
            <a href="{esc(href)}" class="pk-cat-link">
                <div class="pk-cat-image">
                    <img src="{abs_url(cat['image'])}" alt="{esc(cat.get('imageAlt') or cat['title'])}" width="{cat.get('width', 1200)}" height="{cat.get('height', 670)}" {loading}>
                    <div class="pk-cat-badge">{esc(cat['badge'])}</div>
                </div>
                <div class="pk-cat-body">
                    <h3>{esc(cat['title'])}</h3>
                    <p>{esc(cat['description'])}</p>
                    <div class="pk-cat-footer">
                        <span class="pk-cat-more">View Collection</span>
                        <span class="pk-cat-arrow">→</span>
                    </div>
                </div>
            </a>
        </article>"""


def main() -> None:
    data = load_json("products.json")
    cats = data["hubCategories"]
    target = LAB_SITE / "products" / "index.html"
    html = target.read_text(encoding="utf-8", errors="replace")
    inner = "\n\n".join(cat_card(c, eager=(i == 0)) for i, c in enumerate(cats))
    html, n = re.subn(
        r'(<div class="pk-category-grid" id="pk-category-grid">\s*).*?(</div>\s*\n\s*<!-- Review guides rail)',
        rf"\1\n{inner}\n\n    \2",
        html,
        count=1,
        flags=re.S,
    )
    if n != 1:
        raise SystemExit("pk-category-grid not found")
    target.write_text(html, encoding="utf-8")
    print(f"Rendered {len(cats)} hub categories -> {target}")

    # Also push product cards into each category page in lab
    subprocess.check_call(
        [sys.executable, str(Path(__file__).parent / "render_category_products.py")]
    )


if __name__ == "__main__":
    main()
