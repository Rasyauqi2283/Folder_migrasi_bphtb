"""
Fine-tuning IndoBERT untuk token classification (BIO NER) pada dataset KTP CSV.
Output: ./model/indoroberta-ktp-ner (atau MODEL_OUTPUT_DIR).
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path

import numpy as np
from sklearn.metrics import classification_report
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    DataCollatorForTokenClassification,
    Trainer,
    TrainingArguments,
)

from app.dataset import build_hf_dataset, default_csv_path


def tokenize_and_align_labels(examples, tokenizer, label2id: dict[str, int]):
    tokenized_inputs = tokenizer(
        examples["tokens"],
        truncation=True,
        is_split_into_words=True,
        padding=False,
    )
    all_labels = []
    for i, labels in enumerate(examples["ner_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label2id[labels[word_idx]])
            else:
                label_ids.append(-100)
            previous_word_idx = word_idx
        all_labels.append(label_ids)
    tokenized_inputs["labels"] = all_labels
    return tokenized_inputs


def compute_metrics_factory(label_names: list[str]):
    def compute_metrics(eval_pred):
        predictions, labels = eval_pred
        predictions = np.argmax(predictions, axis=2)
        true_preds = []
        true_labels = []
        for pred_row, lab_row in zip(predictions, labels):
            for p, l in zip(pred_row, lab_row):
                if l != -100:
                    true_preds.append(label_names[p])
                    true_labels.append(label_names[l])
        if not true_preds:
            return {"f1": 0.0, "precision": 0.0, "recall": 0.0}
        rep = classification_report(
            true_labels,
            true_preds,
            output_dict=True,
            zero_division=0,
        )
        return {
            "precision": rep.get("weighted avg", {}).get("precision", 0.0),
            "recall": rep.get("weighted avg", {}).get("recall", 0.0),
            "f1": rep.get("weighted avg", {}).get("f1-score", 0.0),
        }

    return compute_metrics


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model",
        default=os.getenv("INDOBERT_MODEL", "indobenchmark/indobert-lite-base-p2"),
        help="Hugging Face model id",
    )
    parser.add_argument(
        "--csv",
        default="",
        help="Path ke dataset_ktp_bio.csv (default: KTP_BIO_CSV atau migrations CSV)",
    )
    parser.add_argument(
        "--output",
        default=os.getenv("MODEL_OUTPUT_DIR", "./model/indoroberta-ktp-ner"),
        help="Folder simpan model",
    )
    parser.add_argument("--epochs", type=float, default=15.0)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=3e-5)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    csv_path = Path(args.csv) if args.csv else default_csv_path()
    dsd, label2id, id2label = build_hf_dataset(csv_path=csv_path, seed=args.seed)
    label_names = [id2label[i] for i in range(len(id2label))]

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModelForTokenClassification.from_pretrained(
        args.model,
        num_labels=len(label2id),
        id2label=id2label,
        label2id=label2id,
    )

    def tok_map(batch):
        return tokenize_and_align_labels(batch, tokenizer, label2id)

    tokenized = dsd.map(
        tok_map,
        batched=True,
        remove_columns=dsd["train"].column_names,
    )

    collator = DataCollatorForTokenClassification(tokenizer)

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    eval_kw = "epoch" if "test" in tokenized else "no"
    common_args = dict(
        output_dir=str(out_dir / "checkpoints"),
        learning_rate=args.lr,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        weight_decay=0.01,
        save_strategy="epoch",
        load_best_model_at_end="test" in tokenized,
        metric_for_best_model="f1" if "test" in tokenized else None,
        greater_is_better=True,
        seed=args.seed,
        logging_steps=10,
        report_to="none",
    )
    try:
        training_args = TrainingArguments(eval_strategy=eval_kw, **common_args)
    except TypeError:
        training_args = TrainingArguments(evaluation_strategy=eval_kw, **common_args)

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized.get("test"),
        tokenizer=tokenizer,
        data_collator=collator,
        compute_metrics=compute_metrics_factory(label_names) if "test" in tokenized else None,
    )

    trainer.train()
    if "test" in tokenized:
        print(trainer.evaluate())

    model.save_pretrained(str(out_dir))
    tokenizer.save_pretrained(str(out_dir))
    print(f"Model disimpan ke: {out_dir.resolve()}")


if __name__ == "__main__":
    main()
