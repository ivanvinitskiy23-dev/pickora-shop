"""Render content/pins.json into admin-lab/site/categories/index.html."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import LAB_SITE, abs_url, esc, load_json  # noqa: E402


def pin_slug(pin: dict) -> str:
    raw = str(pin.get("slug") or "").strip().lower()
    if re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", raw):
        return raw
    from_title = re.sub(r"[^a-z0-9]+", "-", str(pin.get("title") or "").lower()).strip("-")[:64]
    if re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", from_title):
        return from_title
    return f"pin-{pin.get('id', 'x')}"


def board_pin(pin: dict, eager: bool = False) -> str:
    loading = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    slug = pin_slug(pin)
    return f"""    <div class="pickora-board-pin" data-category="{esc(pin['category'])}" data-pin-slug="{esc(slug)}" onclick="openPin('{esc(slug)}')">
      <img src="{abs_url(pin['image'])}" alt="{esc(pin.get('imageAlt') or pin['title'])}" width="{pin.get('width', 896)}" height="{pin.get('height', 1200)}" {loading} decoding="async">
      <div class="pickora-board-info">
        <h4 class="pickora-board-title">{esc(pin['title'])}</h4>
        <p class="pickora-board-desc">{esc(pin.get('boardDesc') or pin.get('popupDesc') or '')}</p>
      </div>
    </div>"""


def filters_html(filters: list[dict]) -> str:
    lines = []
    for i, f in enumerate(filters):
        active = " active" if i == 0 or f["id"] == "all" else ""
        # only first all gets active by default
        if f["id"] != "all":
            active = ""
        elif i == 0:
            active = " active"
        lines.append(
            f'    <button class="pickora-filter-btn{active}" onclick="filterPins(\'{f["id"]}\')">{esc(f["label"])}</button>'
        )
    # fix: ensure only all is active
    out = []
    for f in filters:
        cls = "pickora-filter-btn active" if f["id"] == "all" else "pickora-filter-btn"
        out.append(
            f'    <button class="{cls}" onclick="filterPins(\'{f["id"]}\')">{esc(f["label"])}</button>'
        )
    return "\n".join(out)


def pin_data_js(pins: list[dict]) -> str:
    obj = {}
    for p in pins:
        obj[pin_slug(p)] = {
            "title": p["title"],
            "desc": p.get("popupDesc") or p.get("boardDesc") or "",
            "image": abs_url(p["image"]),
            "products": p.get("products") or [],
        }
    return json.dumps(obj, ensure_ascii=False, indent=2)


def main() -> None:
    data = load_json("pins.json")
    target = LAB_SITE / "categories" / "index.html"
    html = target.read_text(encoding="utf-8", errors="replace")

    filt = filters_html(data["filters"])
    html, n1 = re.subn(
        r'(<div class="pickora-filters">\s*).*?(</div>\s*\n\s*<div class="pickora-board-grid")',
        rf"\1\n{filt}\n  \2",
        html,
        count=1,
        flags=re.S,
    )
    if n1 != 1:
        raise SystemExit("filters block not found")

    pins = data["pins"]
    board = "\n\n".join(board_pin(p, eager=(i == 0)) for i, p in enumerate(pins))
    html, n2 = re.subn(
        r'(<div class="pickora-board-grid" id="pins-grid">\s*).*?(</div>\s*</div>\s*\n\s*<div class="pickora-popup-overlay")',
        rf"\1\n{board}\n\n  \2",
        html,
        count=1,
        flags=re.S,
    )
    if n2 != 1:
        raise SystemExit("pins grid not found")

    js = pin_data_js(pins)
    html, n3 = re.subn(
        r"(const pinData = \{).*?(\n  \};)",
        rf"\1\n{js[1:-1]}\n  \2",
        html,
        count=1,
        flags=re.S,
    )
    # Fallback: replace whole const pinData = {...};
    if n3 != 1:
        html, n3 = re.subn(
            r"const pinData = \{.*?\n  \};",
            f"const pinData = {js};",
            html,
            count=1,
            flags=re.S,
        )
    if n3 != 1:
        raise SystemExit("pinData JS object not found")

    target.write_text(html, encoding="utf-8")
    print(f"Rendered {len(pins)} pins -> {target}")


if __name__ == "__main__":
    main()
