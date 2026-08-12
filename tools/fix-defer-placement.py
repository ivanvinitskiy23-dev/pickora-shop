#!/usr/bin/env python3
"""Fix broken </script defer> and correctly add defer on opening <script> tags in head."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEAD_RE = re.compile(r"(?is)(<head\b[^>]*>)(.*?)(</head>)")


def fix_head(head_inner: str) -> tuple[str, int]:
    # Undo bad placement: </script defer> -> </script>
    content = re.sub(r"</script\s+defer\s*>", "</script>", head_inner, flags=re.IGNORECASE)

    fixed = 0

    def defer_open(match: re.Match[str]) -> str:
        nonlocal fixed
        full = match.group(0)
        attrs = match.group(1)
        if not re.search(r"\bsrc=", attrs, re.IGNORECASE):
            return full
        if re.search(r"\b(async|defer)\b", attrs, re.IGNORECASE):
            return full
        # Insert defer before closing > of opening tag
        new = f"<script{attrs} defer>"
        fixed += 1
        return new

    # Only opening tags with src=
    content = re.sub(
        r"<script(\b[^>]*\bsrc\s*=\s*[\"'][^\"']+[\"'][^>]*)>",
        defer_open,
        content,
        flags=re.IGNORECASE,
    )
    return content, fixed


def main() -> int:
    total = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "wp-content" in path.parts or "tools" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        match = HEAD_RE.search(text)
        if not match:
            continue
        new_inner, n = fix_head(match.group(2))
        # Also fix any remaining </script defer> outside head just in case
        new_text = text[: match.start(2)] + new_inner + text[match.end(2) :]
        new_text = re.sub(r"</script\s+defer\s*>", "</script>", new_text, flags=re.IGNORECASE)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            print(f"{path.relative_to(ROOT).as_posix()}: defer fixed/added={n}")
            total += 1
    print(f"\nUpdated {total} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
