#!/usr/bin/env python3
"""Unify header + sanitize mobile/desktop nav styles across all site HTML."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Replaces pk-mobile-menu-footer-fix-inline-css with expanded sanitize rules.
STYLE = """<style id="pk-mobile-menu-footer-fix-inline-css">
/* ===== Desktop header: logo left, links one horizontal row ===== */
header.site-header .hostinger-ai-menu-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 24px !important;
  grid-template-columns: none !important;
  width: 100% !important;
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
@media (min-width: 769px) {
  header.site-header .wp-block-navigation__container {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 28px !important;
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
  }
  header.site-header .wp-block-navigation-item {
    margin: 0 !important;
    padding: 0 !important;
  }
  header.site-header .wp-block-navigation-item__content {
    display: inline-block !important;
    padding: 0 !important;
    margin: 0 !important;
    white-space: nowrap !important;
  }
}

/* ===== Kill black focus rings + long underlines (desktop + mobile) ===== */
header.site-header .wp-block-navigation a.wp-block-navigation-item__content,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:hover,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:focus,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:focus-visible,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:active,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:visited,
header.site-header .wp-block-navigation .current-menu-item > a.wp-block-navigation-item__content,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content[aria-current="page"],
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:hover,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content:hover,
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:focus,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content:focus,
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:focus-visible,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content:focus-visible,
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:active,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content:active,
.wp-block-navigation__responsive-container.is-menu-open .current-menu-item > a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.has-modal-open .current-menu-item > a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content[aria-current="page"],
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content[aria-current="page"] {
  outline: none !important;
  outline-offset: 0 !important;
  border: none !important;
  border-bottom: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  box-shadow: none !important;
  text-decoration: none !important;
  text-decoration-line: none !important;
  background: transparent !important;
  -webkit-tap-highlight-color: transparent !important;
}
header.site-header .wp-block-navigation .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation-item__label {
  text-decoration: none !important;
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}
.wp-block-navigation__responsive-container.is-menu-open,
.wp-block-navigation__responsive-container.has-modal-open,
.wp-block-navigation__responsive-container.is-menu-open:focus,
.wp-block-navigation__responsive-container.has-modal-open:focus,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-dialog,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-dialog,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-close,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-close,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-content {
  outline: none !important;
  box-shadow: none !important;
}

/* ===== Mobile open overlay ===== */
.wp-block-navigation__responsive-container.is-menu-open,
.wp-block-navigation__responsive-container.has-modal-open {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  background-color: #ffffff !important;
  z-index: 999999 !important;
  box-sizing: border-box !important;
  overflow-y: auto !important;
}

.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-close {
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
  left: auto !important;
  z-index: 1000000 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 44px !important;
  min-height: 44px !important;
  margin: 0 !important;
  padding: 10px !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Search stays under the open menu overlay */
#pk-search-system,
.pk-search-container,
.pk-search-box,
.pk-search-outer-container,
input[type="search"],
input#pk-realtime-search {
  position: relative !important;
  z-index: 1 !important;
}

/* Padding once on content; UL is a clean left column */
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-content {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 90px 32px 40px !important;
  box-sizing: border-box !important;
}

.wp-block-navigation__responsive-container.is-menu-open ul.wp-block-navigation__container,
.wp-block-navigation__responsive-container.has-modal-open ul.wp-block-navigation__container {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  gap: 24px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  padding-left: 0 !important;
  padding-inline-start: 0 !important;
  list-style: none !important;
  box-sizing: border-box !important;
}

.wp-block-navigation__responsive-container.is-menu-open li.wp-block-navigation-item,
.wp-block-navigation__responsive-container.has-modal-open li.wp-block-navigation-item {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  margin-left: 0 !important;
  padding: 0 !important;
  padding-left: 0 !important;
  padding-inline-start: 0 !important;
  text-align: left !important;
  list-style: none !important;
  position: static !important;
  float: none !important;
  transform: none !important;
  box-sizing: border-box !important;
}

.wp-block-navigation__responsive-container.is-menu-open li.wp-block-navigation-item::before,
.wp-block-navigation__responsive-container.has-modal-open li.wp-block-navigation-item::before,
.wp-block-navigation__responsive-container.is-menu-open li.wp-block-navigation-item::after,
.wp-block-navigation__responsive-container.has-modal-open li.wp-block-navigation-item::after {
  content: none !important;
  display: none !important;
}

.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content {
  display: inline-block !important;
  width: auto !important;
  max-width: 100% !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  color: #0f172a !important;
  text-decoration: none !important;
  padding: 4px 0 !important;
  margin: 0 !important;
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
  transition: color 0.2s ease;
}

.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:hover,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content:hover {
  color: #2075d2 !important;
}

/* ===== Sticky footer / remove white strip under navy footer ===== */
html {
  background-color: #15223B !important;
  height: 100% !important;
}

body {
  min-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: #ffffff !important;
}

body > .wp-site-blocks {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 0 auto !important;
  min-height: 100vh !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

main,
.entry-content,
.pk-legal-container,
.pk-legal-content {
  flex: 1 0 auto !important;
}

footer,
footer.site-footer {
  flex-shrink: 0 !important;
  width: 100% !important;
  margin-top: auto !important;
  margin-bottom: 0 !important;
  padding-bottom: 30px !important;
  background-color: #15223B !important;
}

footer.site-footer > .wp-block-group.has-color-2-background-color {
  background-color: #15223B !important;
}
</style>
"""

BLOCK_RE = re.compile(
    r'\s*<style id="pk-mobile-menu-footer-fix-inline-css">[\s\S]*?</style>\s*',
    re.I,
)


def main() -> int:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(x in path.parts for x in (".git", "wp-content", "tools")):
            continue
        text = path.read_text(encoding="utf-8")
        text2 = BLOCK_RE.sub("\n", text)
        if "</head>" not in text2.lower():
            print("NO HEAD:", path.relative_to(ROOT).as_posix())
            continue
        text2 = re.sub(
            r"</head>",
            STYLE + "\n</head>",
            text2,
            count=1,
            flags=re.I,
        )
        if text2 != text:
            path.write_text(text2, encoding="utf-8")
            n += 1
            print("OK:", path.relative_to(ROOT).as_posix())
    print(f"updated {n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
