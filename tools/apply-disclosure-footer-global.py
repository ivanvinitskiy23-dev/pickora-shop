#!/usr/bin/env python3
"""Apply disclosure banner + footer legal links to all site HTML pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DISCLOSURE = (
    '<div class="pk-disclosure-footer" style="max-width: 1140px; margin: 0 auto 40px; '
    'padding: 0 20px; text-align: center; color: #64748b; font-size: 13px; '
    'line-height: 1.6; box-sizing: border-box;">\n'
    "  Pickora is reader-supported. When you buy through links on our site, we may "
    "earn an affiliate commission at no extra cost to you. As an Amazon Associate we "
    'earn from qualifying purchases. <a href="/affiliate-disclosure/" '
    'style="color: #2075d2; text-decoration: underline;">Learn more</a>.\n'
    "</div>\n"
)

LEGAL = (
    '<div class="pk-footer-bottom" style="max-width: 1140px; margin: 30px auto 0; '
    "padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; "
    "justify-content: center; align-items: center; gap: 12px; font-size: 13px; "
    'flex-wrap: wrap; box-sizing: border-box;">\n'
    '  <a href="/privacy-policy/" style="color: rgba(255,255,255,0.7); '
    'text-decoration: none;">Privacy Policy</a>\n'
    '  <span style="color: rgba(255,255,255,0.3);">•</span>\n'
    '  <a href="/affiliate-disclosure/" style="color: rgba(255,255,255,0.7); '
    'text-decoration: none;">Affiliate Disclosure</a>\n'
    '  <span style="color: rgba(255,255,255,0.3);">•</span>\n'
    '  <a href="/terms-of-service/" style="color: rgba(255,255,255,0.7); '
    'text-decoration: none;">Terms of Service</a>\n'
    '  <span style="color: rgba(255,255,255,0.3);">•</span>\n'
    '  <a href="/contact/" style="color: rgba(255,255,255,0.7); '
    'text-decoration: none;">Contact</a>\n'
    "</div>\n"
)


def find_div_block(html: str, start: int) -> int:
    """Return end index (after closing </div>) for the div starting at start."""
    open_match = re.match(r"<div\b[^>]*>", html[start:], flags=re.I)
    if not open_match:
        return -1
    i = start + open_match.end()
    depth = 1
    while i < len(html) and depth:
        next_open = re.search(r"<div\b", html[i:], flags=re.I)
        next_close = re.search(r"</div>", html[i:], flags=re.I)
        if not next_close:
            return -1
        close_at = i + next_close.start()
        open_at = i + next_open.start() if next_open else None
        if open_at is not None and open_at < close_at:
            depth += 1
            i = open_at + 4
        else:
            depth -= 1
            i = close_at + len(next_close.group(0))
    return i


def remove_class_divs(html: str, class_name: str) -> tuple[str, list[str]]:
    """Remove all divs with given class; return cleaned html + extracted copyright snippets."""
    copyrights: list[str] = []
    while True:
        m = re.search(rf'<div\b[^>]*class="[^"]*\b{re.escape(class_name)}\b[^"]*"[^>]*>', html, re.I)
        if not m:
            break
        end = find_div_block(html, m.start())
        if end < 0:
            break
        block = html[m.start() : end]
        if re.search(r"(?:©|&copy;)\s*2026\s*Pickora", block, re.I):
            copyrights.append(
                '<p class="has-text-align-center has-light-color has-text-color '
                'has-small-font-size wp-block-paragraph"> © 2026 Pickora Shop. '
                "All rights reserved.</p>\n"
            )
        html = html[: m.start()] + html[end:]
    return html, copyrights


def process(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    # Remove prior disclosure / footer-legal blocks
    text = re.sub(
        r'\s*<div class="pk-disclosure-footer"[^>]*>.*?</div>\s*',
        "\n",
        text,
        flags=re.I | re.S,
    )
    text = re.sub(
        r'\s*<aside class="pk-disclosure"[^>]*>.*?</aside>\s*(?=<footer\b)',
        "\n",
        text,
        flags=re.I | re.S,
    )
    text = re.sub(
        r'\s*<p[^>]*class="[^"]*pk-legal-footer[^"]*"[^>]*>.*?</p>\s*',
        "\n",
        text,
        flags=re.I | re.S,
    )

    text, rescued_copy = remove_class_divs(text, "pk-footer-bottom")

    # If we removed a block that held copyright and no copyright remains, restore one
    has_copy = bool(re.search(r"(?:©|&copy;)\s*2026\s*Pickora Shop", text, re.I))
    if rescued_copy and not has_copy:
        text = re.sub(r"(</footer>)", rescued_copy[0] + r"\1", text, count=1, flags=re.I)

    # Insert disclosure before <footer>
    if 'class="pk-disclosure-footer"' not in text:
        text = re.sub(r"(<footer\b)", DISCLOSURE + r"\1", text, count=1, flags=re.I)

    # Insert legal links above copyright line
    if not re.search(
        r'class="pk-footer-bottom"[^>]*style="[^"]*justify-content:\s*center',
        text,
        re.I,
    ):
        inserted = False
        for pat in (
            r'(<p[^>]*>\s*(?:©|&copy;)\s*2026\s*Pickora Shop[^<]*</p>)',
            r'(<div class="pk-footer-copyright"[^>]*>[\s\S]*?(?:©|&copy;)\s*2026\s*Pickora Shop[\s\S]*?</div>)',
        ):
            if re.search(pat, text, flags=re.I):
                text = re.sub(pat, LEGAL + r"\1", text, count=1, flags=re.I)
                inserted = True
                break
        if not inserted:
            # bare copyright text in footer
            m = re.search(
                r"((?:©|&copy;)\s*2026\s*Pickora Shop\.?\s*All rights reserved\.?)",
                text,
                flags=re.I,
            )
            if m:
                text = text[: m.start()] + LEGAL + text[m.start() :]
            else:
                text = re.sub(r"(</footer>)", LEGAL + r"\1", text, count=1, flags=re.I)

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
    n = 0
    for path in files:
        if process(path):
            n += 1
            print(f"OK: {path.relative_to(ROOT).as_posix()}")
        else:
            print(f"SKIP: {path.relative_to(ROOT).as_posix()}")
    print(f"\nUpdated {n}/{len(files)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
