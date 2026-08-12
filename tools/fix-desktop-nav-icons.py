#!/usr/bin/env python3
"""Hide mobile nav icons on desktop; keep 44px targets on mobile only."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NEW = """<style id="pk-tap-targets-inline-css">
/* Touch targets — mobile only; do not force burger/close visible on desktop */
@media (max-width: 768px) {
  .wp-block-navigation__responsive-container-open,
  .wp-block-navigation__responsive-container-close {
    min-width: 44px !important;
    min-height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 10px !important;
    margin: -10px !important;
  }
  .wp-block-navigation__responsive-container-open {
    display: flex !important;
  }
}
.wp-block-social-links .wp-social-link {
  min-width: 44px !important;
  min-height: 44px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.pk-filter-btn, .categories-filter button {
  min-height: 44px !important;
  padding-block: 10px !important;
}

/* Hide mobile nav icons on desktop */
@media (min-width: 769px) {
  .wp-block-navigation__responsive-container-open,
  .wp-block-navigation__responsive-container-close,
  .wp-block-navigation__responsive-container-open:not(.always-show) {
    display: none !important;
  }
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) {
    display: block !important;
    position: static !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
    background: transparent !important;
  }
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) .wp-block-navigation__responsive-close,
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) .wp-block-navigation__responsive-dialog {
    display: contents !important;
  }
  header.site-header .wp-block-navigation__responsive-container-content {
    display: flex !important;
    visibility: visible !important;
    position: static !important;
    padding: 0 !important;
  }
}

/* Header: logo left, menu right, one horizontal line */
header.site-header .hostinger-ai-menu-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 24px !important;
  grid-template-columns: none !important;
}
header.site-header .hostinger-ai-site-navigation-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  margin-left: auto !important;
}
header.site-header .hostinger-ai-site-navigation.wp-block-navigation {
  display: flex !important;
  align-items: center !important;
}
</style>
"""

PAT = re.compile(r'<style id="pk-tap-targets-inline-css">[\s\S]*?</style>', re.I)


def main() -> int:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(x in path.parts for x in (".git", "wp-content", "tools")):
            continue
        text = path.read_text(encoding="utf-8")
        if not PAT.search(text):
            print("NO BLOCK:", path.relative_to(ROOT).as_posix())
            continue
        path.write_text(PAT.sub(NEW.strip(), text, count=1), encoding="utf-8")
        n += 1
        print("OK:", path.relative_to(ROOT).as_posix())
    print(f"updated {n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
