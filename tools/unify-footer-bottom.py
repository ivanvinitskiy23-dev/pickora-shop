#!/usr/bin/env python3
"""Unify footer-bottom row (legal links + copyright) and ensure CSS on all pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FOOTER_CSS_BLOCK = """<style id="pk-footer-bottom-inline-css">
.pk-footer-bottom,
.pk-footer-bottom *,
.pk-footer-bottom *::before,
.pk-footer-bottom *::after {
  box-sizing: border-box;
}
.pk-footer-bottom {
  max-width: 1140px !important;
  width: 100% !important;
  margin: 30px auto 0 !important;
  padding-top: 20px !important;
  border-top: 1px solid rgba(255,255,255,0.1) !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-size: 13px !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
  gap: 16px;
  flex-wrap: wrap;
}
.pk-footer-legal {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
}
.pk-footer-legal a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  line-height: 1;
}
.pk-footer-legal a:hover {
  color: #ffffff;
}
.pk-footer-legal .pk-sep {
  color: rgba(255, 255, 255, 0.3);
  line-height: 1;
}
.pk-footer-copyright {
  margin: 0 !important;
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 13px !important;
  line-height: 1 !important;
  text-align: right;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .pk-footer-bottom {
    flex-direction: column !important;
    justify-content: center !important;
    text-align: center !important;
    gap: 12px !important;
  }
  .pk-footer-legal {
    justify-content: center;
  }
  .pk-footer-copyright {
    text-align: center;
    white-space: normal;
  }
}
</style>
"""

FOOTER_HTML = (
    '<div class="pk-footer-bottom">'
    '<nav class="pk-footer-legal" aria-label="Legal">'
    '<a href="/privacy-policy/">Privacy Policy</a>'
    '<span class="pk-sep" aria-hidden="true">•</span>'
    '<a href="/affiliate-disclosure/">Affiliate Disclosure</a>'
    '<span class="pk-sep" aria-hidden="true">•</span>'
    '<a href="/terms-of-service/">Terms of Service</a>'
    '<span class="pk-sep" aria-hidden="true">•</span>'
    '<a href="/contact/">Contact</a>'
    "</nav>"
    '<p class="pk-footer-copyright">© 2026 Pickora Shop. All rights reserved.</p>'
    "</div>\n"
)

# Existing bottom block + following copyright paragraph
OLD_FOOTER_RE = re.compile(
    r'<div class="pk-footer-bottom"[^>]*>[\s\S]*?</div>\s*'
    r'<p class="[^"]*"[^>]*>\s*©\s*2026 Pickora Shop\. All rights reserved\.\s*</p>',
    re.I,
)

# Or just the bottom div without copyright adjacent
OLD_BOTTOM_ONLY_RE = re.compile(
    r'<div class="pk-footer-bottom"[^>]*>[\s\S]*?</div>',
    re.I,
)

COPYRIGHT_LOOSE_RE = re.compile(
    r'<p class="[^"]*"[^>]*>\s*©\s*2026 Pickora Shop\. All rights reserved\.\s*</p>\s*',
    re.I,
)

FOOTER_CSS_RE = re.compile(
    r'<style id="pk-footer-bottom-inline-css">[\s\S]*?</style>',
    re.I,
)


def main() -> int:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(p in path.parts for p in (".git", "wp-content", "tools")):
            continue
        text = path.read_text(encoding="utf-8")
        original = text

        if FOOTER_CSS_RE.search(text):
            text = FOOTER_CSS_RE.sub(FOOTER_CSS_BLOCK, text, count=1)
        else:
            text = re.sub(
                r"</head>",
                FOOTER_CSS_BLOCK + "\n</head>",
                text,
                count=1,
                flags=re.I,
            )

        if OLD_FOOTER_RE.search(text):
            text = OLD_FOOTER_RE.sub(FOOTER_HTML, text, count=1)
        elif OLD_BOTTOM_ONLY_RE.search(text):
            text = OLD_BOTTOM_ONLY_RE.sub(FOOTER_HTML, text, count=1)
            # Remove leftover copyright paragraph if still present nearby
            text = COPYRIGHT_LOOSE_RE.sub("", text, count=1)

        if text != original:
            path.write_text(text, encoding="utf-8")
            n += 1
            print(f"OK: {path.relative_to(ROOT).as_posix()}")
    print(f"Updated {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
