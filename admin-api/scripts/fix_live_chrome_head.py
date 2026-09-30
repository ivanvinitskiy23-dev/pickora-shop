"""Append missing sticky-header CSS into live_chrome.js and verify."""
from pathlib import Path
import re
import json

root = Path(r"C:\Users\Qwiqly\Documents\pickora-siteV1")
html = (root / "best-coffee-makers-2026" / "index.html").read_text(encoding="utf-8")
js_path = root / "admin-api" / "src" / "live_chrome.js"
text = js_path.read_text(encoding="utf-8")

extra_ids = [
    "pk-global-reset-inline-css",
    "pk-disclosure-footer-inline-css",
    "pk-mobile-menu-footer-fix-inline-css",
]
chunks = []
for sid in extra_ids:
    m = re.search(rf'<style id="{re.escape(sid)}"[^>]*>([\s\S]*?)</style>', html)
    if not m:
        raise SystemExit(f"missing {sid}")
    chunks.append(f'<style id="{sid}">\n{m.group(1)}\n</style>')

append_html = "\n".join(chunks)

m2 = re.search(
    r'export const LIVE_CHROME_HEAD = ("(?:\\.|[^\\"])*");',
    text,
    flags=re.S,
)
if not m2:
    raise SystemExit("cannot parse LIVE_CHROME_HEAD")

head = json.loads(m2.group(1))
if "pk-mobile-menu-footer-fix-inline-css" not in head:
    head = head + "\n" + append_html

new_export = "export const LIVE_CHROME_HEAD = " + json.dumps(head, ensure_ascii=False) + ";"
text = text[: m2.start()] + new_export + text[m2.end() :]
# update comment about missing style
text = text.replace(
    "Missing optional style ids from source: pk-mobile-menu-footer-form-inline-css",
    "Includes pk-mobile-menu-footer-fix-inline-css (sticky header)",
)
js_path.write_text(text, encoding="utf-8")
print("ok head len", len(head), "has sticky", "pk-mobile-menu-footer-fix" in head)
