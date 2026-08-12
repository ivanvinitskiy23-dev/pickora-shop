#!/usr/bin/env python3
"""Task 1.4: add WCAG 44x44px tap-target CSS to all HTML pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BLOCK = """<style id="pk-tap-targets-inline-css">
.wp-block-navigation__responsive-container-open,
.wp-block-navigation__responsive-container-close {
    min-width: 44px; min-height: 44px; display: inline-flex;
    align-items: center; justify-content: center; padding: 10px; margin: -10px;
}
.wp-block-social-links .wp-social-link {
    min-width: 44px; min-height: 44px; display: inline-flex;
    align-items: center; justify-content: center;
}
.pk-filter-btn, .categories-filter button { min-height: 44px; padding-block: 10px; }
</style>
"""

RESET_RE = re.compile(
    r'(<style id="pk-global-reset-inline-css">.*?</style>\s*)',
    re.DOTALL,
)


def main() -> int:
    updated = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "wp-content" in path.parts or "tools" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT).as_posix()
        if "pk-tap-targets-inline-css" in text:
            print(f"SKIP (already): {rel}")
            continue
        match = RESET_RE.search(text)
        if not match:
            print(f"MISS reset block: {rel}")
            continue
        text = text[: match.end()] + BLOCK + text[match.end() :]
        path.write_text(text, encoding="utf-8")
        updated += 1
        print(f"OK: {rel}")
    print(f"\nUpdated {updated} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
