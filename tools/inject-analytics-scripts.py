#!/usr/bin/env python3
"""Inject pickora-consent.js and pickora-analytics.js into all site HTML pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SCRIPTS = (
    '<script src="/assets/js/pickora-consent.js" defer></script>\n'
    '<script src="/assets/js/pickora-analytics.js" defer></script>\n'
)

HEAD_MARKER = "<!-- pk-analytics-head -->"
BODY_MARKER = "<!-- pk-analytics-body -->"

HEAD_BLOCK = f"{HEAD_MARKER}\n{SCRIPTS}"
BODY_BLOCK = f"{BODY_MARKER}\n{SCRIPTS}"


def process(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    # Remove prior injections to keep idempotent
    text = re.sub(
        r"\s*<!-- pk-analytics-head -->\s*"
        r'(?:<script src="/assets/js/pickora-(?:consent|analytics)\.js" defer></script>\s*)*',
        "\n",
        text,
    )
    text = re.sub(
        r"\s*<!-- pk-analytics-body -->\s*"
        r'(?:<script src="/assets/js/pickora-(?:consent|analytics)\.js" defer></script>\s*)*',
        "\n",
        text,
    )
    # Also strip bare script tags if present without markers
    text = re.sub(
        r'\s*<script src="/assets/js/pickora-(?:consent|analytics)\.js" defer></script>\s*',
        "\n",
        text,
    )

    if re.search(r"</head>", text, re.I):
        text = re.sub(r"</head>", HEAD_BLOCK + "</head>", text, count=1, flags=re.I)
    if re.search(r"</body>", text, re.I):
        text = re.sub(r"</body>", BODY_BLOCK + "</body>", text, count=1, flags=re.I)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    files = sorted(
        p
        for p in ROOT.rglob("*.html")
        if "wp-content" not in p.parts and "tools" not in p.parts
    )
    changed = 0
    for path in files:
        if process(path):
            changed += 1
            print(f"OK: {path.relative_to(ROOT).as_posix()}")
    print(f"\nUpdated {changed}/{len(files)} HTML files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
