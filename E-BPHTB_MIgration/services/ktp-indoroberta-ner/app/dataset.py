"""
Membaca CSV BIO (token per baris) menjadi Hugging Face Dataset untuk token classification.
Format CSV: Kolom A = token, Kolom B = label (B-NIK, I-NAMA, O, ...).
Pemisah dokumen: baris yang dimulai dengan "KTP " (mis. KTP 1, KTP 2).
"""
from __future__ import annotations

import csv
import os
import re
from pathlib import Path
from typing import Any

from datasets import Dataset, DatasetDict


def default_csv_path() -> Path:
    env = os.getenv("KTP_BIO_CSV", "").strip()
    if env:
        return Path(env)
    # Relatif dari services/ktp-indoroberta-ner/
    here = Path(__file__).resolve().parent.parent
    preferred = here / "dataset_ktp_bio.csv"
    if preferred.is_file():
        return preferred
    return (
        here.parent.parent
        / "database"
        / "migrations"
        / "Percobaan Indoroberta - Sheet1 (1).csv"
    )


def parse_ktp_bio_csv(path: Path | str) -> tuple[list[dict[str, Any]], list[str]]:
    """
    Returns (examples, sorted_label_list).
    Each example: {"tokens": [...], "ner_tags": [...]}
    """
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"Dataset CSV tidak ditemukan: {path}")

    examples: list[dict[str, Any]] = []
    tokens: list[str] = []
    labels: list[str] = []
    label_set: set[str] = set()

    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header:
            raise ValueError("CSV kosong")

        for row in reader:
            if not row or not str(row[0]).strip():
                continue
            a = str(row[0]).strip()
            b = str(row[1]).strip() if len(row) > 1 else ""
            # Pemisah dokumen
            if re.match(r"^KTP\s+\d+$", a, re.I):
                if tokens:
                    examples.append({"tokens": tokens, "ner_tags": labels})
                tokens, labels = [], []
                continue
            if "Kolom A" in a and "Token" in a:
                continue

            if not b:
                b = "O"
            label_set.add(b)
            tokens.append(a)
            labels.append(b)

        if tokens:
            examples.append({"tokens": tokens, "ner_tags": labels})

    # Pastikan O ada untuk padding eval
    label_set.add("O")
    sorted_labels = sorted(label_set, key=lambda x: (x.split("-")[-1] if "-" in x else x, x))
    return examples, sorted_labels


def build_hf_dataset(
    csv_path: Path | str | None = None,
    test_ratio: float = 0.2,
    seed: int = 42,
) -> tuple[DatasetDict, dict[str, int], dict[int, str]]:
    """
    DatasetDict train/test + label2id + id2label.
    """
    path = Path(csv_path) if csv_path else default_csv_path()
    examples, label_names = parse_ktp_bio_csv(path)
    if not examples:
        raise ValueError("Tidak ada contoh KTP di CSV")

    label2id = {l: i for i, l in enumerate(label_names)}
    id2label = {i: l for l, i in label2id.items()}

    ds = Dataset.from_list([dict(e) for e in examples])
    if len(examples) >= 2 and test_ratio > 0:
        split = ds.train_test_split(test_size=test_ratio, seed=seed)
        dsd = DatasetDict(train=split["train"], test=split["test"])
    else:
        dsd = DatasetDict(train=ds)

    return dsd, label2id, id2label
