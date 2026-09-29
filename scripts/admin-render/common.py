"""Shared helpers for admin-lab HTML renders."""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content"
LAB_SITE = ROOT / "admin-lab" / "site"


def load_json(name: str) -> dict:
    return json.loads((CONTENT / name).read_text(encoding="utf-8"))


def abs_url(path: str) -> str:
    if path.startswith("http://") or path.startswith("https://"):
        return path
    if path.startswith("/"):
        return "https://pickora.shop" + path
    return path


def esc(text: str) -> str:
    return html.escape(text or "", quote=True)


def replace_between(haystack: str, start_marker: str, end_marker: str, inner: str) -> str:
    start = haystack.find(start_marker)
    end = haystack.find(end_marker, start)
    if start < 0 or end < 0:
        raise ValueError(f"Markers not found: {start_marker!r} .. {end_marker!r}")
    start_inner = start + len(start_marker)
    return haystack[:start_inner] + "\n" + inner + "\n" + haystack[end:]
