#!/usr/bin/env python3
"""Add lazy/eager loading and explicit width/height to img tags (Task 1.2)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
UPLOADS = ROOT / "wp-content" / "uploads"
REPORT_PATH = ROOT / "tools" / "img-fix-report.json"

IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
SRC_RE = re.compile(r'\bsrc=(["\'])(.*?)\1', re.IGNORECASE)
ATTR_RE = {
    name: re.compile(rf'\b{name}=(["\'])(.*?)\1', re.IGNORECASE)
    for name in ("loading", "decoding", "fetchpriority", "width", "height", "id", "class")
}


def resolve_src_to_path(src: str, html_path: Path) -> Path | None:
    src = src.strip()
    if not src or "${" in src or src.startswith("data:"):
        return None

    if src.startswith("https://pickora.shop/"):
        rel = src.replace("https://pickora.shop/", "").split("?", 1)[0]
        candidate = ROOT / rel.replace("/", "\\")
        if candidate.exists():
            return candidate
        alt = rel.replace("/2026/07/", "/2026/06/")
        candidate = ROOT / alt.replace("/", "\\")
        if candidate.exists():
            return candidate

    if src.startswith("../"):
        candidate = (html_path.parent / src).resolve()
        if candidate.exists():
            return candidate

    if src.startswith("/"):
        candidate = ROOT / src.lstrip("/").replace("/", "\\")
        if candidate.exists():
            return candidate

    return None


def get_dimensions(src: str, html_path: Path) -> tuple[int, int] | None:
    local = resolve_src_to_path(src, html_path)
    if not local:
        return None
    try:
        with Image.open(local) as img:
            return img.width, img.height
    except Exception:  # noqa: BLE001
        return None


def is_valid_hero_candidate(tag: str, src: str | None) -> bool:
    if not src or not src.strip() or "${" in src:
        return False
    if 'id="popup-image"' in tag.lower() or "id='popup-image'" in tag.lower():
        return False
    class_match = ATTR_RE["class"].search(tag)
    if class_match and "emoji" in class_match.group(2).lower():
        return False
    return True


def remove_attr(tag: str, attr: str) -> str:
    return re.sub(rf'\s*{attr}=(["\']).*?\1', "", tag, flags=re.IGNORECASE)


def set_or_replace_attr(tag: str, attr: str, value: str) -> str:
    cleaned = remove_attr(tag, attr)
    insert_at = cleaned.rfind(">")
    return f'{cleaned[:insert_at]} {attr}="{value}"{cleaned[insert_at:]}'


def normalize_img_tag(tag: str, *, hero: bool, src: str | None, html_path: Path) -> str:
    updated = tag

    for attr in ("loading", "decoding", "fetchpriority"):
        updated = remove_attr(updated, attr)

    if hero:
        updated = set_or_replace_attr(updated, "loading", "eager")
        updated = set_or_replace_attr(updated, "fetchpriority", "high")
        updated = set_or_replace_attr(updated, "decoding", "async")
    else:
        updated = set_or_replace_attr(updated, "loading", "lazy")
        updated = set_or_replace_attr(updated, "decoding", "async")

    dims = get_dimensions(src or "", html_path)
    if dims:
        width, height = dims
        updated = remove_attr(updated, "width")
        updated = remove_attr(updated, "height")
        updated = set_or_replace_attr(updated, "width", str(width))
        updated = set_or_replace_attr(updated, "height", str(height))

    return updated


def choose_hero_index(tags: list[str], srcs: list[str | None]) -> int | None:
    for idx, (tag, src) in enumerate(zip(tags, srcs)):
        if not is_valid_hero_candidate(tag, src):
            continue
        if ATTR_RE["fetchpriority"].search(tag):
            return idx

    for idx, (tag, src) in enumerate(zip(tags, srcs)):
        if is_valid_hero_candidate(tag, src):
            return idx

    return None


def process_html(path: Path) -> dict:
    content = path.read_text(encoding="utf-8")
    tags = IMG_TAG_RE.findall(content)
    srcs = [SRC_RE.search(tag).group(2) if SRC_RE.search(tag) else None for tag in tags]
    hero_idx = choose_hero_index(tags, srcs)

    changes = 0

    def replacer(match: re.Match[str]) -> str:
        nonlocal changes
        tag = match.group(0)
        src_match = SRC_RE.search(tag)
        src = src_match.group(2) if src_match else None
        idx = tags.index(tag)
        hero = idx == hero_idx and is_valid_hero_candidate(tag, src)
        if not is_valid_hero_candidate(tag, src) and not (src_match and src):
            return tag
        new_tag = normalize_img_tag(tag, hero=hero, src=src, html_path=path)
        if new_tag != tag:
            changes += 1
        return new_tag

    # Replace sequentially to preserve duplicate-tag handling
    new_content = content
    offset = 0
    report_tags: list[dict] = []
    for idx, tag in enumerate(tags):
        pos = new_content.find(tag, offset)
        if pos == -1:
            continue
        src = srcs[idx]
        hero = idx == hero_idx and is_valid_hero_candidate(tag, src)
        if not is_valid_hero_candidate(tag, src):
            offset = pos + len(tag)
            continue
        new_tag = normalize_img_tag(tag, hero=hero, src=src, html_path=path)
        if new_tag != tag:
            changes += 1
        report_tags.append(
            {
                "index": idx,
                "hero": hero,
                "src": src,
                "before": tag[:180],
                "after": new_tag[:180],
            }
        )
        new_content = new_content[:pos] + new_tag + new_content[pos + len(tag) :]
        offset = pos + len(new_tag)

    if changes:
        path.write_text(new_content, encoding="utf-8")

    return {
        "file": str(path.relative_to(ROOT)),
        "img_count": len(tags),
        "hero_index": hero_idx,
        "changes": changes,
        "tags": report_tags,
    }


def main() -> int:
    html_files = sorted(ROOT.rglob("*.html"))
    html_files = [p for p in html_files if "wp-content" not in p.parts and "tools" not in p.parts]

    reports = [process_html(path) for path in html_files]
    total_changes = sum(item["changes"] for item in reports)

    summary = {
        "html_files": len(reports),
        "total_img_attribute_changes": total_changes,
        "pages": reports,
    }
    REPORT_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    for item in reports:
        if item["changes"]:
            print(f"{item['file']}: {item['changes']} img tag updates (hero #{item['hero_index']})")

    print(f"\nDone. Updated {total_changes} img tags across {len(reports)} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
