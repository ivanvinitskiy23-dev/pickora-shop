#!/usr/bin/env python3
"""Compress heavy images in wp-content/uploads (Task 1.2)."""

from __future__ import annotations

import json
import re
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
UPLOADS = ROOT / "wp-content" / "uploads"
REPORT_PATH = ROOT / "tools" / "compress-report.json"

MIN_BYTES = 1024 * 1024
TARGET_MAX_BYTES = 250 * 1024
WIDTHS = (1200, 800)
QUALITIES = (82, 80, 78, 75, 72, 68)
IMAGE_EXTS = {".webp", ".jpeg", ".jpg", ".png"}


def file_size(path: Path) -> int:
    return path.stat().st_size


def resize_max_width(img: Image.Image, max_width: int) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    if img.width <= max_width:
        return img
    ratio = max_width / img.width
    new_height = max(1, round(img.height * ratio))
    return img.resize((max_width, new_height), Image.Resampling.LANCZOS)


def save_webp(img: Image.Image, dest: Path) -> tuple[int, int]:
    if img.mode in ("RGBA", "LA", "P"):
        rgb = img.convert("RGBA").convert("RGB")
    elif img.mode != "RGB":
        rgb = img.convert("RGB")
    else:
        rgb = img

    for quality in QUALITIES:
        buffer = BytesIO()
        rgb.save(buffer, format="WEBP", quality=quality, method=6)
        data = buffer.getvalue()
        if len(data) <= TARGET_MAX_BYTES or quality == QUALITIES[-1]:
            dest.write_bytes(data)
            return quality, len(data)
    return QUALITIES[-1], dest.stat().st_size


def save_jpeg(img: Image.Image, dest: Path) -> tuple[int, int]:
    rgb = img.convert("RGB")
    for quality in QUALITIES:
        buffer = BytesIO()
        rgb.save(buffer, format="JPEG", quality=quality, optimize=True, progressive=True)
        data = buffer.getvalue()
        if len(data) <= TARGET_MAX_BYTES or quality == QUALITIES[-1]:
            dest.write_bytes(data)
            return quality, len(data)
    return QUALITIES[-1], dest.stat().st_size


def save_image(img: Image.Image, dest: Path) -> tuple[int, int]:
    ext = dest.suffix.lower()
    if ext == ".webp":
        return save_webp(img, dest)
    if ext in {".jpg", ".jpeg"}:
        return save_jpeg(img, dest)
    if ext == ".png":
        img.save(dest, format="PNG", optimize=True)
        return 100, dest.stat().st_size
    raise ValueError(f"Unsupported extension: {ext}")


def variant_paths(src: Path) -> tuple[Path, Path]:
    stem = src.stem
    if stem.endswith("-scaled"):
        stem = stem[: -len("-scaled")]
    parent = src.parent
    ext = ".webp" if src.suffix.lower() == ".webp" else src.suffix.lower()
    return parent / f"{stem}-1200w{ext}", parent / f"{stem}-800w{ext}"


def should_process(path: Path) -> bool:
    if path.suffix.lower() not in IMAGE_EXTS:
        return False
    size = file_size(path)
    name = path.name.lower()
    if re.search(r"-\d+w\.|-\d+x\d+\.", name):
        return False
    if "-scaled." in name:
        if size > TARGET_MAX_BYTES:
            return True
        try:
            with Image.open(path) as img:
                return img.width > WIDTHS[0]
        except Exception:  # noqa: BLE001
            return False
    if size >= MIN_BYTES:
        scaled = path.with_name(f"{path.stem}-scaled{path.suffix}")
        if scaled.exists() and scaled != path:
            return False
        if size > TARGET_MAX_BYTES:
            return True
    return False


def compress_file(path: Path) -> dict | None:
    before = file_size(path)
    if not should_process(path):
        return None

    try:
        with Image.open(path) as img:
            img.load()
            is_scaled = "-scaled." in path.name.lower()
            entries: list[dict] = []

            if is_scaled:
                resized_1200 = resize_max_width(img, WIDTHS[0])
                quality, after = save_image(resized_1200, path)
                entries.append(
                    {
                        "path": str(path.relative_to(ROOT)),
                        "before": before,
                        "after": after,
                        "quality": quality,
                        "width": resized_1200.width,
                        "height": resized_1200.height,
                        "action": "replace-scaled-1200w",
                    }
                )

                v1200, v800 = variant_paths(path)
                for width, variant in zip(WIDTHS, (v1200, v800)):
                    variant_img = resize_max_width(img, width)
                    variant_before = variant.stat().st_size if variant.exists() else 0
                    q, variant_after = save_image(variant_img, variant)
                    entries.append(
                        {
                            "path": str(variant.relative_to(ROOT)),
                            "before": variant_before,
                            "after": variant_after,
                            "quality": q,
                            "width": variant_img.width,
                            "height": variant_img.height,
                            "action": f"variant-{width}w",
                        }
                    )
            else:
                resized = resize_max_width(img, WIDTHS[0])
                quality, after = save_image(resized, path)
                entries.append(
                    {
                        "path": str(path.relative_to(ROOT)),
                        "before": before,
                        "after": after,
                        "quality": quality,
                        "width": resized.width,
                        "height": resized.height,
                        "action": "compress-original-1200w",
                    }
                )

                v1200, v800 = variant_paths(path)
                for width, variant in zip(WIDTHS, (v1200, v800)):
                    if variant.resolve() == path.resolve():
                        continue
                    variant_img = resize_max_width(img, width)
                    variant_before = variant.stat().st_size if variant.exists() else 0
                    q, variant_after = save_image(variant_img, variant)
                    entries.append(
                        {
                            "path": str(variant.relative_to(ROOT)),
                            "before": variant_before,
                            "after": variant_after,
                            "quality": q,
                            "width": variant_img.width,
                            "height": variant_img.height,
                            "action": f"variant-{width}w",
                        }
                    )

            return {"file": str(path.relative_to(ROOT)), "entries": entries}
    except Exception as exc:  # noqa: BLE001
        print(f"SKIP {path}: {exc}", file=sys.stderr)
        return None


def main() -> int:
    if not UPLOADS.is_dir():
        print(f"Uploads directory not found: {UPLOADS}", file=sys.stderr)
        return 1

    results: list[dict] = []
    total_before = 0
    total_after = 0

    candidates = sorted(
        p for p in UPLOADS.rglob("*") if p.is_file() and should_process(p)
    )

    print(f"Found {len(candidates)} images to process")

    for path in candidates:
        result = compress_file(path)
        if not result:
            continue
        for entry in result["entries"]:
            saved = max(0, entry["before"] - entry["after"])
            total_before += entry["before"]
            total_after += entry["after"]
            print(
                f"{entry['path']}: "
                f"{entry['before'] / 1024:.1f} KB -> {entry['after'] / 1024:.1f} KB "
                f"(q={entry['quality']}, {entry['width']}x{entry['height']})"
            )
        results.append(result)

    saved_bytes = max(0, total_before - total_after)
    summary = {
        "processed_files": len(results),
        "total_before_bytes": total_before,
        "total_after_bytes": total_after,
        "saved_bytes": saved_bytes,
        "saved_kb": round(saved_bytes / 1024, 1),
        "saved_mb": round(saved_bytes / (1024 * 1024), 2),
        "results": results,
    }

    REPORT_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(
        f"\nDone. Saved {summary['saved_mb']} MB "
        f"({summary['saved_kb']} KB). Report: {REPORT_PATH.relative_to(ROOT)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
