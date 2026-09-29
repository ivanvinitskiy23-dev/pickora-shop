"""Parse published article cards from articles/index.html."""
from __future__ import annotations

import html
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
ARTICLES_HTML = ROOT / "articles" / "index.html"

CATEGORY_MAP = {
    "audio": "Consumer Electronics",
    "electronics": "Consumer Electronics",
    "mobile": "Consumer Electronics",
    "kitchen": "Home & Kitchen",
    "cleaning": "Home & Kitchen",
    "smart-home": "Home & Kitchen",
    "home": "Home & Kitchen",
    "fitness": "Fitness & Health",
    "wearables": "Fitness & Health",
    "pets": "Pet Supplies",
}


def _to_path(url: str) -> str:
    if not url:
        return ""
    if url.startswith("/"):
        return url
    parsed = urlparse(url)
    return parsed.path or url


def list_articles() -> list[dict]:
    text = ARTICLES_HTML.read_text(encoding="utf-8", errors="replace")
    blocks = re.findall(
        r'<article class="pk-card"[^>]*>(.*?)</article>',
        text,
        flags=re.S | re.I,
    )
    out: list[dict] = []
    for block in blocks:
        href = re.search(r'href="([^"]+)"', block)
        img = re.search(r'<img[^>]+src="([^"]+)"', block)
        alt = re.search(r'<img[^>]+alt="([^"]*)"', block)
        title = re.search(r'class="pk-card-title">(.*?)</h3>', block, re.S)
        excerpt = re.search(r'class="pk-card-excerpt">(.*?)</p>', block, re.S)
        cats = re.search(r'data-categories="([^"]*)"', block)
        tags = re.findall(r'class="pk-card-tag[^"]*">(.*?)</span>', block, re.S)

        url = _to_path(href.group(1) if href else "")
        slug = url.strip("/").split("/")[-1] if url else ""
        image = _to_path(img.group(1) if img else "")
        cat_ids = (cats.group(1) if cats else "").split()
        display_cat = "Home & Kitchen"
        for cid in cat_ids:
            if cid in CATEGORY_MAP:
                display_cat = CATEGORY_MAP[cid]
                break
        if tags:
            # Prefer human tag label for softer category when mapped is generic
            tag0 = html.unescape(re.sub(r"\s+", " ", tags[0])).strip()
            if tag0 in ("Kitchen", "Home"):
                display_cat = "Home & Kitchen"
            elif tag0 in ("Audio", "Electronics", "Mobile"):
                display_cat = "Consumer Electronics"
            elif tag0 in ("Pets",):
                display_cat = "Pet Supplies"
            elif tag0 in ("Fitness", "Wearables"):
                display_cat = "Fitness & Health"

        out.append(
            {
                "slug": slug,
                "url": url if url.endswith("/") else (url + "/" if url else ""),
                "title": html.unescape(re.sub(r"\s+", " ", title.group(1))).strip()
                if title
                else slug,
                "excerpt": html.unescape(re.sub(r"\s+", " ", excerpt.group(1))).strip()
                if excerpt
                else "",
                "category": display_cat,
                "image": image,
                "imageAlt": html.unescape(alt.group(1)).strip()
                if alt
                else (title.group(1).strip() if title else ""),
                "tags": [html.unescape(re.sub(r"\s+", " ", t)).strip() for t in tags],
            }
        )
    return out


if __name__ == "__main__":
    arts = list_articles()
    print(len(arts))
    for a in arts[:3]:
        print(a["title"], a["url"], a["image"][:40])
