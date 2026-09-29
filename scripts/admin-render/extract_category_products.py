"""Extract pickora-final-card blocks from a category hub HTML into JSON list."""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path


def extract_cards(html_text: str, category_id: str) -> list[dict]:
    parts = re.split(r'<div class="pickora-final-card">', html_text)[1:]
    cards: list[dict] = []
    for i, part in enumerate(parts, 1):
        def grab(pat: str, default: str = "") -> str:
            r = re.search(pat, part, re.S | re.I)
            if not r:
                return default
            return re.sub(r"\s+", " ", r.group(1)).strip()

        title = grab(r'pickora-final-title">(.*?)</h3>')
        img = grab(r'<img[^>]+src="([^"]+)"')
        alt = grab(r'<img[^>]+alt="([^"]*)"')
        desc = grab(r'pickora-final-text">(.*?)</p>')
        verdict_raw = grab(r'pickora-final-verdict">(.*?)</div>')
        amazon = grab(r'class="pickora-final-btn"[^>]*href="([^"]+)"')
        if not amazon:
            amazon = grab(r'href="(https://amzn\.to/[^"]+)"')
        pros = [
            re.sub(r"\s+", " ", html.unescape(p)).strip()
            for p in re.findall(
                r'badge-pro">Pros</span>\s*<span>(.*?)</span>', part, re.S
            )
        ]
        cons = [
            re.sub(r"\s+", " ", html.unescape(c)).strip()
            for c in re.findall(
                r'badge-con">Cons</span>\s*<span>(.*?)</span>', part, re.S
            )
        ]
        cards.append(
            {
                "id": f"{category_id}-{i}",
                "title": html.unescape(title),
                "image": img,
                "imageAlt": html.unescape(alt),
                "description": html.unescape(desc),
                "pros": pros,
                "cons": cons,
                "verdict": re.sub(r"<[^>]+>", "", html.unescape(verdict_raw)).strip(),
                "amazonUrl": amazon,
                "ratingStars": 5,
            }
        )
    return cards


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    cat = sys.argv[1] if len(sys.argv) > 1 else "home-kitchen"
    src = root / cat / "index.html"
    cards = extract_cards(src.read_text(encoding="utf-8", errors="replace"), cat)
    products_path = root / "content" / "products.json"
    data = json.loads(products_path.read_text(encoding="utf-8"))
    data.setdefault("categoryProducts", {})[cat] = cards
    products_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {len(cards)} cards into content/products.json[{cat}]")


if __name__ == "__main__":
    main()
