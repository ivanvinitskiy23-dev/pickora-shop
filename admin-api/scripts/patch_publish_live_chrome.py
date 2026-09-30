"""Patch publish_article.js to use live_chrome.js verbatim."""
from pathlib import Path
import re

p = Path(r"C:\Users\Qwiqly\Documents\pickora-siteV1\admin-api\src\publish_article.js")
text = p.read_text(encoding="utf-8")

# 1) Add import
old_import = """import {
  compileBlocksToHtml,
  ensureBlueH1,
  PK_MW_GUIDE_CSS,
  escHtml,
  escAttr,
} from "./article_blocks.js";

export { compileBlocksToHtml, ensureBlueH1 };
"""
new_import = """import {
  compileBlocksToHtml,
  ensureBlueH1,
  PK_MW_GUIDE_CSS,
  escHtml,
  escAttr,
} from "./article_blocks.js";
import {
  LIVE_CHROME_HEAD_LINKS,
  LIVE_CHROME_HEAD_STYLES,
  LIVE_HEADER_HTML,
  buildLiveFooterHtml,
} from "./live_chrome.js";

export { compileBlocksToHtml, ensureBlueH1 };
"""
if old_import not in text:
    raise SystemExit("import block not found")
text = text.replace(old_import, new_import, 1)

# 2) Remove reinvented LIVE_HEADER_CSS + LIVE_FOOTER_CSS constants
m = re.search(
    r"\nconst LIVE_HEADER_CSS = `[\s\S]*?^`;\n\nconst LIVE_FOOTER_CSS = `[\s\S]*?^`;\n",
    text,
    flags=re.M,
)
if not m:
    raise SystemExit("LIVE_HEADER/FOOTER CSS block not found")
text = text[: m.start()] + "\n" + text[m.end() :]

# 3) Inject live chrome links/styles in <head> and drop reinvented CSS refs
old_head_css = """${LIVE_HEADER_CSS}
${LIVE_FOOTER_CSS}

/* skip link */"""
new_head_css = """/* Article-only styles below; header/footer chrome = LIVE_CHROME_* */

/* skip link */"""
if old_head_css not in text:
    raise SystemExit("LIVE_HEADER_CSS injection site not found")
text = text.replace(old_head_css, new_head_css, 1)

# Insert chrome head after <head> / early meta — find analyticsHead or style start
# Put links+styles right before the big <style> critical block
needle = "<!-- structured data -->"
if needle not in text:
    raise SystemExit("structured data marker missing")
text = text.replace(
    needle,
    f"""${{LIVE_CHROME_HEAD_LINKS}}
${{LIVE_CHROME_HEAD_STYLES}}
<!-- structured data -->""",
    1,
)

# 4) Replace custom header HTML with LIVE_HEADER_HTML
header_pat = re.compile(
    r"<!-- ═══ Header / Nav[\s\S]*?</header>\n",
    re.M,
)
m = header_pat.search(text)
if not m:
    raise SystemExit("header block not found")
text = text[: m.start()] + "<!-- ═══ Header (exact live chrome) ═══ -->\n${LIVE_HEADER_HTML}\n" + text[m.end() :]

# 5) Replace custom footer HTML with buildLiveFooterHtml(year)
footer_pat = re.compile(
    r"<!-- ═══ Footer[\s\S]*?</footer>\n",
    re.M,
)
m = footer_pat.search(text)
if not m:
    raise SystemExit("footer block not found")
text = (
    text[: m.start()]
    + "<!-- ═══ Footer (exact live chrome) ═══ -->\n${buildLiveFooterHtml(year)}\n"
    + text[m.end() :]
)

# 6) footerAssets already has pickora-nav — keep scripts; CSS already in LIVE_CHROME_HEAD_LINKS
# Remove duplicate CSS link from footerAssets to avoid double-load (optional)
text = text.replace(
    """const footerAssets = `<!-- site chrome assets -->
<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-nav.css?v=5">
<script src="https://pickora.shop/assets/js/pickora-nav.js?v=5" defer></script>
<link rel="stylesheet" href="https://pickora.shop/assets/css/pickora-mobile-fixes.css?v=2">
<script src="https://pickora.shop/assets/js/pickora-product-anchors.js" defer></script>""",
    """const footerAssets = `<!-- site chrome scripts (CSS loaded in LIVE_CHROME_HEAD_LINKS) -->
<script src="https://pickora.shop/assets/js/pickora-nav.js?v=5" defer></script>
<script src="https://pickora.shop/assets/js/pickora-product-anchors.js" defer></script>""",
    1,
)

p.write_text(text, encoding="utf-8")
print("patched", p)
print("has LIVE_HEADER_CSS const?", "const LIVE_HEADER_CSS" in text)
print("has LIVE_HEADER_HTML inject?", "${LIVE_HEADER_HTML}" in text)
print("has buildLiveFooterHtml?", "${buildLiveFooterHtml(year)}" in text)
print("has LIVE_CHROME_HEAD_STYLES?", "${LIVE_CHROME_HEAD_STYLES}" in text)
