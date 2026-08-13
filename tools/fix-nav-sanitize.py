#!/usr/bin/env python3
"""Premium sitewide header + mobile nav rewrite for all HTML pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

STYLE_ID = "pk-mobile-menu-footer-fix-inline-css"

STYLE = f"""<style id="{STYLE_ID}">
/* =========================================================
   Pickora — premium header + mobile navigation (sitewide)
   ========================================================= */

/* --- Sticky header bar --- */
header.site-header {{
  position: sticky !important;
  top: 0 !important;
  z-index: 10000 !important;
  background: #ffffff !important;
  width: 100% !important;
  flex: 0 0 auto !important;
  min-height: 72px !important;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06) !important;
}}

header.site-header .hostinger-ai-menu-wrapper {{
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 24px !important;
  grid-template-columns: none !important;
  width: 100% !important;
  max-width: 1140px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}}

header.site-header .hostinger-ai-site-navigation-wrapper {{
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  margin-left: auto !important;
}}

header.site-header .hostinger-ai-site-navigation.wp-block-navigation {{
  display: flex !important;
  align-items: center !important;
}}

/* --- Desktop nav: one clean horizontal row --- */
@media (min-width: 769px) {{
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) {{
    display: block !important;
    position: static !important;
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
    background: transparent !important;
  }}
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) .wp-block-navigation__responsive-close,
  header.site-header .wp-block-navigation__responsive-container:not(.is-menu-open):not(.has-modal-open) .wp-block-navigation__responsive-dialog {{
    display: contents !important;
  }}
  header.site-header .wp-block-navigation__responsive-container-content {{
    display: flex !important;
    visibility: visible !important;
    position: static !important;
    padding: 0 !important;
  }}
  header.site-header .wp-block-navigation__container {{
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 32px !important;
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
  }}
  header.site-header .wp-block-navigation-item {{
    display: inline-flex !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 !important;
  }}
  header.site-header .wp-block-navigation-item__content {{
    display: inline-block !important;
    padding: 4px 0 !important;
    margin: 0 !important;
    white-space: nowrap !important;
    font-size: 15px !important;
    font-weight: 500 !important;
    letter-spacing: -0.01em !important;
    color: #0f172a !important;
    line-height: 1.2 !important;
  }}
  header.site-header .wp-block-navigation-item__content:hover {{
    color: #2075d2 !important;
  }}
  header.site-header .current-menu-item > .wp-block-navigation-item__content,
  header.site-header .wp-block-navigation-item__content[aria-current="page"] {{
    color: #2075d2 !important;
    font-weight: 600 !important;
    background: transparent !important;
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
  }}
  header.site-header .wp-block-navigation,
  header.site-header .wp-block-navigation ul,
  header.site-header .wp-block-navigation li,
  header.site-header .wp-block-navigation a {{
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
  }}
}}

/* --- Kill outlines / underlines / borders on ALL header + overlay nav links --- */
header.site-header .wp-block-navigation a.wp-block-navigation-item__content,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:link,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:visited,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:hover,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:active,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:focus,
header.site-header .wp-block-navigation a.wp-block-navigation-item__content:focus-visible,
header.site-header .wp-block-navigation .current-menu-item > a,
header.site-header .wp-block-navigation a[aria-current="page"],
.wp-block-navigation__responsive-container.is-menu-open a,
.wp-block-navigation__responsive-container.has-modal-open a,
.wp-block-navigation__responsive-container.is-menu-open a:link,
.wp-block-navigation__responsive-container.has-modal-open a:link,
.wp-block-navigation__responsive-container.is-menu-open a:visited,
.wp-block-navigation__responsive-container.has-modal-open a:visited,
.wp-block-navigation__responsive-container.is-menu-open a:hover,
.wp-block-navigation__responsive-container.has-modal-open a:hover,
.wp-block-navigation__responsive-container.is-menu-open a:active,
.wp-block-navigation__responsive-container.has-modal-open a:active,
.wp-block-navigation__responsive-container.is-menu-open a:focus,
.wp-block-navigation__responsive-container.has-modal-open a:focus,
.wp-block-navigation__responsive-container.is-menu-open a:focus-visible,
.wp-block-navigation__responsive-container.has-modal-open a:focus-visible {{
  outline: 0 !important;
  outline-offset: 0 !important;
  border: 0 !important;
  border-bottom: 0 !important;
  border-top: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  box-shadow: none !important;
  text-decoration: none !important;
  text-decoration-line: none !important;
  text-underline-offset: unset !important;
  background: transparent !important;
  -webkit-tap-highlight-color: transparent !important;
}}

header.site-header .wp-block-navigation .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation-item__label {{
  text-decoration: none !important;
  border: 0 !important;
  box-shadow: none !important;
}}

header.site-header .wp-block-navigation .current-menu-item > a::after,
header.site-header .wp-block-navigation .current-menu-item > a::before,
header.site-header .wp-block-navigation a[aria-current="page"]::after,
header.site-header .wp-block-navigation a[aria-current="page"]::before,
.wp-block-navigation__responsive-container.is-menu-open .current-menu-item > a::after,
.wp-block-navigation__responsive-container.has-modal-open .current-menu-item > a::after,
.wp-block-navigation__responsive-container.is-menu-open .current-menu-item > a::before,
.wp-block-navigation__responsive-container.has-modal-open .current-menu-item > a::before,
.wp-block-navigation__responsive-container.is-menu-open a[aria-current="page"]::after,
.wp-block-navigation__responsive-container.has-modal-open a[aria-current="page"]::after,
.wp-block-navigation__responsive-container.is-menu-open a[aria-current="page"]::before,
.wp-block-navigation__responsive-container.has-modal-open a[aria-current="page"]::before {{
  content: none !important;
  display: none !important;
  border: 0 !important;
  width: 0 !important;
  height: 0 !important;
}}

/* =========================================================
   MOBILE OVERLAY — full viewport premium panel
   Root cause of "drawer + staircase": WP constrains
   .responsive-close to --wide-size and inherits
   justify-right into overlay content.
   ========================================================= */
.wp-block-navigation__responsive-container.is-menu-open,
.wp-block-navigation__responsive-container.has-modal-open {{
  position: fixed !important;
  inset: 0 !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #ffffff !important;
  z-index: 999999 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
  --navigation-layout-justification-setting: flex-start !important;
}}

.wp-block-navigation__responsive-container.is-menu-open:focus,
.wp-block-navigation__responsive-container.has-modal-open:focus,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-dialog:focus,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-dialog:focus,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-close:focus,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-close:focus,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content:focus,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-content:focus {{
  outline: 0 !important;
  box-shadow: none !important;
}}

/* Kill WP wide-size constraint that made a side drawer */
html.has-modal-open .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-close,
html.has-modal-open .wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-close,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-close,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-close {{
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  box-sizing: border-box !important;
}}

.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-dialog,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-dialog {{
  position: relative !important;
  width: 100% !important;
  max-width: none !important;
  min-height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}}

/* Close button — top right */
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-close {{
  position: absolute !important;
  top: 18px !important;
  right: 18px !important;
  left: auto !important;
  z-index: 1000001 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  min-height: 44px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  outline: 0 !important;
  border-radius: 12px !important;
  background: #f1f5f9 !important;
  box-shadow: none !important;
  cursor: pointer !important;
  color: #0f172a !important;
}}

.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close:hover,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-close:hover {{
  background: #e2e8f0 !important;
}}

.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close svg,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-close svg {{
  width: 22px !important;
  height: 22px !important;
  display: block !important;
}}

/* Search under overlay */
#pk-search-system,
.pk-search-container,
.pk-search-box,
.pk-search-outer-container,
input[type="search"],
input#pk-realtime-search {{
  position: relative !important;
  z-index: 1 !important;
}}

/* Content area — single left column, no inherited justify-right */
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__responsive-container-content {{
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 96px 28px 48px !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  --navigation-layout-justification-setting: flex-start !important;
}}

.wp-block-navigation__responsive-container.is-menu-open ul.wp-block-navigation__container,
.wp-block-navigation__responsive-container.has-modal-open ul.wp-block-navigation__container,
.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__container,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation__container {{
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  gap: 4px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  padding-inline-start: 0 !important;
  list-style: none !important;
  box-sizing: border-box !important;
}}

.wp-block-navigation__responsive-container.is-menu-open li.wp-block-navigation-item,
.wp-block-navigation__responsive-container.has-modal-open li.wp-block-navigation-item,
.wp-block-navigation__responsive-container.is-menu-open li.current-menu-item,
.wp-block-navigation__responsive-container.has-modal-open li.current-menu-item {{
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  margin-inline: 0 !important;
  padding: 0 !important;
  padding-inline: 0 !important;
  text-align: left !important;
  list-style: none !important;
  float: none !important;
  position: static !important;
  transform: none !important;
  align-items: stretch !important;
  background: transparent !important;
  border: 0 !important;
  border-bottom: 0 !important;
  border-top: 0 !important;
  box-shadow: none !important;
  outline: 0 !important;
  box-sizing: border-box !important;
}}

.wp-block-navigation__responsive-container.is-menu-open li.wp-block-navigation-item::before,
.wp-block-navigation__responsive-container.has-modal-open li.wp-block-navigation-item::before,
.wp-block-navigation__responsive-container.is-menu-open li.wp-block-navigation-item::after,
.wp-block-navigation__responsive-container.has-modal-open li.wp-block-navigation-item::after {{
  content: none !important;
  display: none !important;
}}

.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content {{
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 14px 16px !important;
  border-radius: 12px !important;
  font-size: 22px !important;
  font-weight: 600 !important;
  letter-spacing: -0.02em !important;
  line-height: 1.25 !important;
  color: #0f172a !important;
  text-align: left !important;
  text-decoration: none !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  transition: background-color 0.18s ease, color 0.18s ease;
}}

.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:hover,
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content:hover {{
  color: #2075d2 !important;
  background: #f1f5f9 !important;
}}

.wp-block-navigation__responsive-container.is-menu-open li.current-menu-item > a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.has-modal-open li.current-menu-item > a.wp-block-navigation-item__content,
.wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content[aria-current="page"],
.wp-block-navigation__responsive-container.has-modal-open a.wp-block-navigation-item__content[aria-current="page"] {{
  color: #2075d2 !important;
  background-color: rgba(32, 117, 210, 0.1) !important;
  font-weight: 700 !important;
  border: 0 !important;
  border-bottom: 0 !important;
  text-decoration: none !important;
}}

/* While menu open: no navy html peek behind overlay */
html.has-modal-open {{
  background-color: #ffffff !important;
  overflow: hidden !important;
}}

.wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-item__label,
.wp-block-navigation__responsive-container.has-modal-open .wp-block-navigation-item__label {{
  display: inline !important;
  width: auto !important;
  margin: 0 !important;
  padding: 0 !important;
}}

/* Hub titles: keep space under sticky header (do not collapse) */
.pk-hub-header-section {{
  margin-top: 56px !important;
  padding-top: 12px !important;
}}
.pk-catalog-header {{
  padding-top: 48px !important;
}}
@media (max-width: 768px) {{
  .pk-hub-header-section {{
    margin-top: 36px !important;
    padding-top: 12px !important;
  }}
  .pk-catalog-header {{
    padding-top: 36px !important;
  }}
  .pk-main-title {{
    line-height: 1.15 !important;
  }}
}}

/* Categories board must stay visible; no flex-grown empty gap */
.pickora-pins-container {{
  display: block !important;
  min-height: 0 !important;
}}
.pickora-board-grid {{
  display: grid !important;
}}
.wp-site-blocks > .elementor-widget-container,
.wp-site-blocks > .elementor-element,
.e-con.e-flexbox-base,
.elementor-widget-container {{
  flex-grow: 0 !important;
  flex-shrink: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 0 !important;
}}

/* =========================================================
   Sticky footer WITHOUT painting legal content navy
   ========================================================= */
html {{
  background-color: #ffffff !important;
  height: 100% !important;
}}

body {{
  min-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
}}

body > .wp-site-blocks {{
  display: flex !important;
  flex-direction: column !important;
  flex: 1 0 auto !important;
  min-height: 100vh !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background-color: #ffffff !important;
}}

main {{
  flex: 1 0 auto !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
}}

.entry-content,
.pk-legal-container,
.pk-legal-content,
.pk-legal-hero {{
  background-color: #ffffff !important;
  color: #0f172a !important;
}}

.pk-legal-content p,
.pk-legal-content li,
.pk-legal-content h2,
.pk-legal-content h3 {{
  color: #0f172a !important;
}}

footer,
footer.site-footer {{
  flex-shrink: 0 !important;
  width: 100% !important;
  margin-top: auto !important;
  margin-bottom: 0 !important;
  padding-bottom: 30px !important;
  background-color: #15223B !important;
  box-shadow: 0 50vh 0 0 #15223B;
}}

footer.site-footer > .wp-block-group.has-color-2-background-color {{
  background-color: #15223B !important;
}}
</style>
"""

BLOCK_RE = re.compile(
    rf'\s*<style id="{STYLE_ID}">[\s\S]*?</style>\s*',
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
