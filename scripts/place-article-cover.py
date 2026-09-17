#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Place an article cover into wp-content/uploads/YYYY/MM/{slug}-cover.webp

Usage:
  python scripts/place-article-cover.py --slug how-to-choose-a-microwave-2026 --source briefs/media-inbox/foo.jpg
  python scripts/place-article-cover.py --slug my-slug --source path/to/generated.png --year 2026 --month 09

Requires Pillow for resize/WebP. If Pillow is missing, copies the source and prints a warning.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    today = date.today()
    p = argparse.ArgumentParser(description="Place Pickora article cover WebP")
    p.add_argument("--slug", required=True)
    p.add_argument("--source", required=True, type=Path)
    p.add_argument("--year", type=int, default=today.year)
    p.add_argument("--month", type=int, default=today.month)
    p.add_argument("--max-kb", type=int, default=250)
    p.add_argument("--width", type=int, default=1200)
    p.add_argument("--height", type=int, default=670)
    args = p.parse_args()

    src = args.source if args.source.is_absolute() else ROOT / args.source
    if not src.exists():
        print(f"ERROR: source not found: {src}", file=sys.stderr)
        return 1

    out_dir = ROOT / "wp-content" / "uploads" / f"{args.year:04d}" / f"{args.month:02d}"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{args.slug}-cover.webp"

    try:
        from PIL import Image  # type: ignore
    except ImportError:
        dest = out.with_suffix(src.suffix.lower())
        shutil.copy2(src, dest)
        print(f"WARN: Pillow not installed; copied as {dest.relative_to(ROOT)}")
        print("Install with: pip install Pillow")
        return 0

    im = Image.open(src).convert("RGB")
    # Center-crop to 1200x670 aspect then resize
    tw, th = args.width, args.height
    target_ratio = tw / th
    w, h = im.size
    ratio = w / h
    if ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        im = im.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        im = im.crop((0, top, w, top + new_h))
    im = im.resize((tw, th), Image.Resampling.LANCZOS)

    quality = 82
    im.save(out, "WEBP", quality=quality, method=6)
    while out.stat().st_size > args.max_kb * 1024 and quality > 50:
        quality -= 6
        im.save(out, "WEBP", quality=quality, method=6)

    kb = out.stat().st_size / 1024
    print(f"OK {out.relative_to(ROOT)} ({kb:.1f} KB, q={quality})")
    print(f"URL /{out.relative_to(ROOT).as_posix()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
