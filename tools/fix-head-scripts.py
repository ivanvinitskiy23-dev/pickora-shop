#!/usr/bin/env python3
"""Task 1.3: remove 404 Elementor CSS, drop jquery-migrate, defer head scripts."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BROKEN_CSS = (
    "local-95-frontend-desktop.css",
    "local-95-frontend-mobile.css",
    "local-132-frontend-desktop.css",
    "local-132-frontend-tablet.css",
    "local-160-frontend-desktop.css",
    "local-193-frontend-desktop.css",
)

LINK_RE = re.compile(
    r'<link\b[^>]*rel=["\']stylesheet["\'][^>]*>',
    re.IGNORECASE,
)
HEAD_RE = re.compile(r"(?is)(<head\b[^>]*>)(.*?)(</head>)")


def is_broken_css_link(tag: str) -> bool:
    return any(name in tag for name in BROKEN_CSS)


def process_head(head_inner: str) -> tuple[str, dict]:
    stats = {
        "css_removed": 0,
        "migrate_removed": 0,
        "deferred": 0,
    }

    def drop_link(match: re.Match[str]) -> str:
        tag = match.group(0)
        if is_broken_css_link(tag):
            stats["css_removed"] += 1
            return ""
        return tag

    content = LINK_RE.sub(drop_link, head_inner)

    migrate_re = re.compile(
        r"[ \t]*<script\b[^>]*jquery-migrate[^>]*>\s*</script>\s*\n?",
        re.IGNORECASE,
    )
    content, n = migrate_re.subn("", content)
    stats["migrate_removed"] += n

    def defer_open(match: re.Match[str]) -> str:
        attrs = match.group(1)
        if not re.search(r"\bsrc=", attrs, re.IGNORECASE):
            return match.group(0)
        if re.search(r"\b(async|defer)\b", attrs, re.IGNORECASE):
            return match.group(0)
        stats["deferred"] += 1
        return f"<script{attrs} defer>"

    content = re.sub(
        r"<script(\b[^>]*\bsrc\s*=\s*[\"'][^\"']+[\"'][^>]*)>",
        defer_open,
        content,
        flags=re.IGNORECASE,
    )

    content = re.sub(r"\n{3,}", "\n\n", content)
    return content, stats


def process_file(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    match = HEAD_RE.search(text)
    if not match:
        return None

    new_inner, stats = process_head(match.group(2))
    if stats["css_removed"] == 0 and stats["migrate_removed"] == 0 and stats["deferred"] == 0:
        return None

    new_text = text[: match.start(2)] + new_inner + text[match.end(2) :]
    path.write_text(new_text, encoding="utf-8")
    return {"file": path.relative_to(ROOT).as_posix(), **stats}


def main() -> int:
    html_files = sorted(
        p
        for p in ROOT.rglob("*.html")
        if "wp-content" not in p.parts and "tools" not in p.parts
    )

    totals = {"css_removed": 0, "migrate_removed": 0, "deferred": 0, "files": 0}
    for path in html_files:
        result = process_file(path)
        if not result:
            continue
        totals["files"] += 1
        totals["css_removed"] += result["css_removed"]
        totals["migrate_removed"] += result["migrate_removed"]
        totals["deferred"] += result["deferred"]
        print(
            f"{result['file']}: "
            f"css=-{result['css_removed']}, "
            f"migrate=-{result['migrate_removed']}, "
            f"defer=+{result['deferred']}"
        )

    print(
        f"\nDone. {totals['files']} files | "
        f"CSS links removed: {totals['css_removed']} | "
        f"jquery-migrate removed: {totals['migrate_removed']} | "
        f"scripts deferred: {totals['deferred']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
