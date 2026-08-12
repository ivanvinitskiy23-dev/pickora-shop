#!/usr/bin/env python3
"""Add sticky footer CSS to the 4 legal pages."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

STICKY = """
/* Sticky footer — pin footer to bottom of viewport on legal pages */
html, body {
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background-color: #ffffff;
}

body {
  display: flex !important;
  flex-direction: column !important;
  min-height: 100vh !important;
}

/* WP wrapper must be a flex column so footer margin-top:auto works */
.wp-site-blocks {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 0 auto !important;
  min-height: 100vh !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Main content takes remaining free space */
main, .pk-legal-container, .pk-legal-content, .entry-content {
  flex: 1 0 auto !important;
}

.pk-disclosure-footer {
  flex-shrink: 0 !important;
}

/* Footer always sticks to the bottom */
footer,
footer.site-footer {
  flex-shrink: 0 !important;
  width: 100% !important;
  margin-top: auto !important;
  margin-bottom: 0 !important;
  height: auto !important;
  max-height: none !important;
  position: static !important;
  bottom: auto !important;
  background-color: #15223B !important;
}

footer.site-footer > .wp-block-group.has-color-2-background-color {
  background-color: #15223B !important;
}
"""

PAGES = [
    "privacy-policy",
    "affiliate-disclosure",
    "terms-of-service",
    "contact",
]


def main() -> int:
    for name in PAGES:
        path = ROOT / name / "index.html"
        text = path.read_text(encoding="utf-8")
        if "Sticky footer — pin footer" in text:
            print(f"skip (already patched): {name}")
            continue

        marker = 'id="pk-legal-page-inline-css"'
        if marker not in text:
            raise SystemExit(f"missing legal css block: {name}")

        start = text.index(marker)
        end = text.index("</style>", start)
        text = text[:end] + STICKY + text[end:]

        # Clean risky footer inline styles if present
        import re

        def clean_footer(m: re.Match[str]) -> str:
            tag = m.group(0)
            style_m = re.search(r'style="([^"]*)"', tag, re.I)
            if not style_m:
                return tag
            styles = [s.strip() for s in style_m.group(1).split(";") if s.strip()]
            keep = []
            for s in styles:
                key = s.split(":", 1)[0].strip().lower()
                if key in {"position", "margin-bottom", "height", "max-height", "bottom"}:
                    continue
                keep.append(s)
            if not keep:
                return re.sub(r'\s+style="[^"]*"', "", tag, count=1)
            return re.sub(r'style="[^"]*"', f'style="{"; ".join(keep)}"', tag, count=1)

        text = re.sub(r"<footer\b[^>]*>", clean_footer, text, count=1, flags=re.I)
        path.write_text(text, encoding="utf-8")
        print(f"patched: {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
