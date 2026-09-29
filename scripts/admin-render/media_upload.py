"""Save uploaded images as WebP under wp-content/uploads/YYYY/MM/."""
from __future__ import annotations

import base64
import io
import re
from datetime import datetime
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]


def _slugify(name: str) -> str:
    stem = Path(name).stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return stem or "upload"


def save_webp_upload(
    filename: str,
    data_b64: str,
    *,
    preferred_name: str | None = None,
) -> dict:
    raw = data_b64.split(",", 1)[-1] if "," in data_b64 else data_b64
    blob = base64.b64decode(raw)
    img = Image.open(io.BytesIO(blob))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    now = datetime.now()
    rel_dir = Path("wp-content") / "uploads" / f"{now.year:04d}" / f"{now.month:02d}"
    out_dir = ROOT / rel_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    base = _slugify(preferred_name or filename)
    out_name = f"{base}.webp"
    dest = out_dir / out_name
    n = 2
    while dest.exists():
        out_name = f"{base}-{n}.webp"
        dest = out_dir / out_name
        n += 1

    save_kwargs = {"quality": 82, "method": 6}
    if img.mode == "RGBA":
        img.save(dest, "WEBP", **save_kwargs)
    else:
        img.save(dest, "WEBP", **save_kwargs)

    rel = "/" + str(rel_dir / out_name).replace("\\", "/")
    return {
        "path": rel,
        "width": img.width,
        "height": img.height,
        "bytes": dest.stat().st_size,
    }
