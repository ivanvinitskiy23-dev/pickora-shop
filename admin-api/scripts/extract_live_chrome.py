# Extract live article chrome into JS module for Worker preview/publish.
from pathlib import Path
import re
import json

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "best-coffee-makers-2026" / "index.html"
OUT = ROOT / "admin-api" / "src" / "live_chrome.js"

html = SRC.read_text(encoding="utf-8")

STYLE_IDS = [
    "pk-global-reset-inline-css",
    "pk-tap-targets-inline-css",
    "wp-block-site-title-inline-css",
    "wp-block-group-inline-css",
    "wp-block-social-links-inline-css",
    "wp-block-columns-inline-css",
    "global-styles-inline-css",
    "core-block-supports-inline-css",
    "pk-disclosure-footer-inline-css",
    "pk-footer-bottom-inline-css",
    "pk-mobile-menu-footer-fix-inline-css",
    "pk-ml-footer-dark",
]

styles = []
for sid in STYLE_IDS:
    m = re.search(rf'<style id="{re.escape(sid)}"[^>]*>([\s\S]*?)</style>', html)
    if not m:
        print("MISSING style", sid)
        continue
    styles.append(f'<style id="{sid}">\n{m.group(1)}\n</style>')
    print("ok style", sid, len(m.group(1)))

hm = re.search(r'(<header class="site-header[\s\S]*?</header>)', html)
fm = re.search(r'(<footer class="site-footer[\s\S]*?</footer>)', html)
if not hm or not fm:
    raise SystemExit("header/footer not found")

header = hm.group(1)
footer = fm.group(1)
# Replace hardcoded copyright year with token for runtime
footer = re.sub(r"©\s*\d{4}", "© ${year}", footer, count=1)
print("header", len(header), "footer", len(footer))

# For footer MailerLite: keep as-is from live (exact look). Worker template will interpolate year.

head_links = """
<link rel="stylesheet" href="https://pickora.shop/wp-includes/blocks/navigation/style.min.css?ver=7.0" media="all">
<link rel="stylesheet" href="https://pickora.shop/wp-content/themes/hostinger-ai-theme/assets/css/style.min.css?ver=2.0.22" media="all">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700,800&display=swap" media="all">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400,500,600,700&display=swap" media="all">
<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-nav.css?v=5" media="all">
<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-mobile-fixes.css?v=2" media="all">
""".strip()

# Build JS module with JSON strings (safe escaping)
payload = {
    "headLinks": head_links,
    "headStyles": "\n".join(styles),
    "headerHtml": header,
    "footerHtmlTemplate": footer,  # contains ${year} — WAIT: JSON will keep literal ${year}
}

# footer uses ${year} as placeholder; in JS we'll replace at runtime
# Avoid template literal issues: export JSON.stringify'd constants

js = f"""/**
 * Live Pickora chrome extracted from best-coffee-makers-2026/index.html
 * Do not hand-edit — regenerate via: node/python admin-api/scripts/extract_live_chrome.py
 */
export const LIVE_CHROME_HEAD_LINKS = {json.dumps(payload['headLinks'], ensure_ascii=False)};
export const LIVE_CHROME_HEAD_STYLES = {json.dumps(payload['headStyles'], ensure_ascii=False)};
export const LIVE_HEADER_HTML = {json.dumps(payload['headerHtml'], ensure_ascii=False)};
const LIVE_FOOTER_HTML_TEMPLATE = {json.dumps(payload['footerHtmlTemplate'], ensure_ascii=False)};
export function buildLiveFooterHtml(year) {{
  return LIVE_FOOTER_HTML_TEMPLATE.replace(/\\$\\{{year\\}}/g, String(year));
}}
"""

OUT.write_text(js, encoding="utf-8")
print("wrote", OUT, "bytes", OUT.stat().st_size)
