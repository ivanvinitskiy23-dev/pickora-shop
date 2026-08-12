#!/usr/bin/env python3
"""Fix legal badge clipping, disclosure line, and footer-bottom alignment sitewide."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DISCLOSURE_CSS = """<style id="pk-disclosure-footer-inline-css">
.pk-disclosure-footer {
  max-width: 1140px !important;
  width: 100% !important;
  margin: 50px auto 40px !important;
  padding: 0 20px !important;
  text-align: center !important;
  color: #64748b !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  white-space: nowrap;
  box-sizing: border-box !important;
}
.pk-disclosure-footer,
.pk-disclosure-footer * {
  box-sizing: border-box;
}
.pk-disclosure-footer p {
  margin: 0 !important;
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
}
.pk-disclosure-footer a {
  color: #2075d2 !important;
  text-decoration: underline;
  white-space: nowrap;
}
@media (max-width: 900px) {
  .pk-disclosure-footer,
  .pk-disclosure-footer p {
    white-space: normal;
  }
}
</style>
"""

FOOTER_BOTTOM_RULE = """
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
}
"""

BADGE_FIX = """
/* Fix clipped hero / legal badge text */
.pk-hero-badge,
.pk-page-kicker,
.pk-legal-badge {
  display: inline-flex !important;
  align-items: center !important;
  margin-top: 20px !important;
  padding-top: 10px !important;
  line-height: 1.2 !important;
  overflow: visible !important;
}
.pk-legal-hero {
  overflow: visible !important;
  padding-top: max(64px, 4rem) !important;
}
"""

DISCLOSURE_BLOCK_RE = re.compile(
    r'<style id="pk-disclosure-footer-inline-css">[\s\S]*?</style>',
    re.I,
)

FOOTER_BOTTOM_RULE_RE = re.compile(
    r"\.pk-footer-bottom\s*\{[^{}]*\}",
    re.I,
)

FOOTER_INLINE_RE = re.compile(
    r'(<div class="pk-footer-bottom"[^>]*?)style="[^"]*"',
    re.I,
)

FOOTER_INLINE_STYLE = (
    'style="max-width: 1140px; margin: 30px auto 0; padding-top: 20px; '
    "border-top: 1px solid rgba(255,255,255,0.1); display: flex; "
    "justify-content: space-between; align-items: center; font-size: 13px; "
    'line-height: 1; box-sizing: border-box;"'
)


def patch_badge(text: str) -> str:
    if "pk-legal-badge" not in text and "pk-legal-hero" not in text:
        return text
    if "Fix clipped hero / legal badge text" in text:
        return text
    # Prefer inject into legal page CSS block
    marker = 'id="pk-legal-page-inline-css"'
    if marker in text:
        start = text.index(marker)
        end = text.index("</style>", start)
        return text[:end] + BADGE_FIX + text[end:]
    # Fallback: inject before </head>
    return re.sub(
        r"</head>",
        f'<style id="pk-badge-clip-fix-inline-css">{BADGE_FIX}</style>\n</head>',
        text,
        count=1,
        flags=re.I,
    )


def patch_disclosure(text: str) -> str:
    if DISCLOSURE_BLOCK_RE.search(text):
        return DISCLOSURE_BLOCK_RE.sub(DISCLOSURE_CSS, text, count=1)
    return re.sub(r"</head>", DISCLOSURE_CSS + "\n</head>", text, count=1, flags=re.I)


def patch_footer_bottom(text: str) -> str:
    # Replace CSS rule(s) for .pk-footer-bottom (not the * descendants block)
    def repl_rule(m: re.Match[str]) -> str:
        body = m.group(0)
        # Skip box-sizing only blocks that target descendants via commas already handled
        if "justify-content" in body or "max-width" in body or "border-top" in body:
            return FOOTER_BOTTOM_RULE.strip()
        return body

    # More precise: only the main .pk-footer-bottom { ... } not .pk-footer-bottom *
    text2 = re.sub(
        r"(?<![,\w-])\.pk-footer-bottom\s*\{[^{}]*\}",
        FOOTER_BOTTOM_RULE.strip(),
        text,
        count=1,
    )

    # Sync inline style on the div
    if 'class="pk-footer-bottom"' in text2:
        if FOOTER_INLINE_RE.search(text2):
            text2 = FOOTER_INLINE_RE.sub(
                r"\1" + FOOTER_INLINE_STYLE,
                text2,
                count=1,
            )
        else:
            text2 = re.sub(
                r'(<div class="pk-footer-bottom")(\s*>)',
                r"\1 " + FOOTER_INLINE_STYLE + r"\2",
                text2,
                count=1,
            )
    return text2


def main() -> int:
    n = 0
    for path in sorted(ROOT.rglob("*.html")):
        if any(p in path.parts for p in (".git", "wp-content", "tools")):
            continue
        original = path.read_text(encoding="utf-8")
        text = original
        text = patch_badge(text)
        text = patch_disclosure(text)
        text = patch_footer_bottom(text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            n += 1
            print(f"OK: {path.relative_to(ROOT).as_posix()}")
    print(f"Updated {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
