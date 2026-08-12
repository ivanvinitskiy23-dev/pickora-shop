#!/usr/bin/env python3
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
issues = []
for html in sorted(root.rglob("*.html")):
    if "wp-content" in html.parts or "tools" in html.parts:
        continue
    text = html.read_text(encoding="utf-8")
    for i, tag in enumerate(re.findall(r"<img\b[^>]*>", text, re.I)):
        if "popup-image" in tag or 'class="emoji"' in tag:
            continue
        src_match = re.search(r'src=(["\'])(.*?)\1', tag, re.I)
        srcv = src_match.group(2) if src_match else ""
        if not srcv or "${" in srcv:
            if "loading=" not in tag.lower():
                issues.append((html.relative_to(root), i, "template img missing loading"))
            continue
        for req in ("loading=", "decoding=", "width=", "height="):
            if req not in tag.lower():
                issues.append((html.relative_to(root), i, f"missing {req[:-1]}"))

print(f"issues: {len(issues)}")
for item in issues:
    print(item)
