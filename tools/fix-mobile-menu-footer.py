#!/usr/bin/env python3
"""Alias: run fix-nav-sanitize.py (unified header/nav + footer gap CSS)."""

from pathlib import Path
import runpy

if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).with_name("fix-nav-sanitize.py")), run_name="__main__")
