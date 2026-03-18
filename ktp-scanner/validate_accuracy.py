#!/usr/bin/env python3
"""
Validate KTP scanner accuracy against ground truth.
Usage:
  python validate_accuracy.py [--service-url http://localhost:8001] [--dataset path/to/dataset]
  If --service-url is omitted, runs OCR locally (no server needed).
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Field keys used for scoring (same as stats totalFields)
FIELDS = [
    "nik",
    "nama",
    "ttl",
    "alamat",
    "jenisKelamin",
    "golonganDarah",
    "agama",
    "statusPerkawinan",
    "pekerjaan",
    "kewarganegaraan",
    "berlakuHingga",
]


def levenshtein_similarity(a: str, b: str) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    a, b = a.strip().upper(), b.strip().upper()
    n, m = len(a), len(b)
    if n == 0 or m == 0:
        return 0.0
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    max_len = max(n, m)
    return 1.0 - (dp[n][m] / max_len)


def normalize_ttl(ttl) -> str:
    if ttl is None:
        return ""
    if isinstance(ttl, dict):
        return "|".join([str(ttl.get("tempat", "")), str(ttl.get("tanggal", ""))])
    return str(ttl)


def field_score(ground: str, predicted: str, exact_only: bool = False) -> float:
    if ground is None:
        ground = ""
    if predicted is None:
        predicted = ""
    g, p = str(ground).strip(), str(predicted).strip()
    if g == p:
        return 1.0
    if exact_only:
        return 0.0
    sim = levenshtein_similarity(g, p)
    if sim >= 0.85:
        return 0.5
    return 0.0


def score_sample(ground: dict, predicted: dict, exact_only: bool = False) -> float:
    total = 0.0
    for key in FIELDS:
        g = ground.get(key)
        p = predicted.get(key)
        if key == "ttl":
            g = normalize_ttl(g)
            p = normalize_ttl(p)
        else:
            g = str(g) if g is not None else ""
            p = str(p) if p is not None else ""
        total += field_score(g, p, exact_only)
    return total / len(FIELDS) if FIELDS else 0.0


def run_local_ocr(image_path: str) -> dict:
    """Run OCR using local app (no HTTP)."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from app.ocr_pipeline import extract_ktp
    return extract_ktp(image_path=image_path)


def run_remote_ocr(image_path: str, base_url: str) -> dict:
    """Run OCR via POST /scan."""
    import requests
    with open(image_path, "rb") as f:
        files = {"fotoktp": (os.path.basename(image_path), f)}
        r = requests.post(f"{base_url.rstrip('/')}/scan", files=files, timeout=60)
    r.raise_for_status()
    return r.json()


def main():
    ap = argparse.ArgumentParser(description="Validate KTP scanner accuracy")
    ap.add_argument("--service-url", default="", help="Python service base URL (e.g. http://localhost:8001). If empty, run OCR locally.")
    ap.add_argument("--dataset", default=None, help="Dataset root (default: ./dataset)")
    ap.add_argument("--exact-only", action="store_true", help="Score 1 only for exact match, 0 otherwise")
    args = ap.parse_args()
    dataset_root = Path(args.dataset or os.path.join(os.path.dirname(__file__), "dataset"))
    images_dir = dataset_root / "images"
    gt_dir = dataset_root / "ground_truth"
    if not gt_dir.is_dir():
        print("No ground_truth directory found. Create dataset/ground_truth/ and add sample_001.json, ...")
        sys.exit(1)
    gt_files = sorted(gt_dir.glob("*.json"))
    if not gt_files:
        print("No ground truth JSON files in", gt_dir)
        sys.exit(1)
    scores = []
    for gt_path in gt_files:
        stem = gt_path.stem
        if stem == "sample_template":
            continue
        image_path = images_dir / f"{stem}.jpg"
        if not image_path.exists():
            image_path = images_dir / f"{stem}.jpeg"
        if not image_path.exists():
            image_path = images_dir / f"{stem}.png"
        if not image_path.exists():
            print("Skip", stem, "(no image)")
            continue
        with open(gt_path, "r", encoding="utf-8") as f:
            ground = json.load(f)
        try:
            if args.service_url:
                predicted = run_remote_ocr(str(image_path), args.service_url)
            else:
                predicted = run_local_ocr(str(image_path))
        except Exception as e:
            print("Error", stem, e)
            scores.append(0.0)
            continue
        if predicted.get("error"):
            print("OCR error", stem, predicted.get("error"))
            scores.append(0.0)
            continue
        s = score_sample(ground, predicted, exact_only=args.exact_only)
        scores.append(s)
        print(f"  {stem}: {s * 100:.1f}%")
    if not scores:
        print("No samples scored.")
        sys.exit(1)
    overall = sum(scores) / len(scores) * 100
    print(f"Overall accuracy: {overall:.1f}% ({len(scores)} samples)")
    target = 90.0
    if overall >= target:
        print(f"Target {target}% met.")
    else:
        print(f"Target {target}% not met.")
    sys.exit(0 if overall >= target else 1)


if __name__ == "__main__":
    main()
