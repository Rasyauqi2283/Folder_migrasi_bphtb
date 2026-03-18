#!/usr/bin/env python3
"""Generate an empty ground truth JSON template for a new sample.
Usage: python scripts/generate_ground_truth_template.py sample_002
Creates dataset/ground_truth/sample_002.json from template.
"""

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "dataset" / "ground_truth" / "sample_template.json"
GT_DIR = ROOT / "dataset" / "ground_truth"


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate_ground_truth_template.py <stem>")
        sys.exit(1)
    stem = sys.argv[1].strip()
    if not stem.replace("_", "").replace("-", "").isalnum():
        print("Stem should be alphanumeric (e.g. sample_001)")
        sys.exit(1)
    if not TEMPLATE.exists():
        print("Template not found:", TEMPLATE)
        sys.exit(1)
    out = GT_DIR / f"{stem}.json"
    with open(TEMPLATE, "r", encoding="utf-8") as f:
        data = json.load(f)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Created", out, "- fill with actual values for image", stem + ".jpg")


if __name__ == "__main__":
    main()
