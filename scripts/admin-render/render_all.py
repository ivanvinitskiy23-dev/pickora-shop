"""Run all LOCAL renders into admin-lab/site/."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent


def run(name: str) -> None:
    print(f"==> {name}")
    subprocess.check_call([sys.executable, str(HERE / name)])


def main() -> None:
    # Do NOT re-extract from live HTML here — that would wipe Studio edits in content/*.json
    run("render_home.py")
    run("render_pins.py")
    run("render_products.py")  # also renders category product pages
    print("LOCAL render complete. Preview from repo root: python -m http.server 8765")
    print("  Home:      http://127.0.0.1:8765/admin-lab/site/")
    print("  Products:  http://127.0.0.1:8765/admin-lab/site/products/")
    print("  Kitchen:   http://127.0.0.1:8765/admin-lab/site/home-kitchen/")


if __name__ == "__main__":
    main()
