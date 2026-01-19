# =========================================================
# Fake Job Posting Detection using DistilBERT
# =========================================================
import numpy as np
import pandas as pd
import torch

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)

from transformers.utils import logging
logging.set_verbosity_error()  # Disable HF logs

# =========================================================
# Load Dataset
# =========================================================
df = pd.read_csv("Dataset\\cleaned_fake_job_postings.csv")

# =========================================================
# Train-Test Split
# =========================================================
X_train, X_test, y_train, y_test = train_test_split(
    df["text"],
    df["fraudulent"],
    test_size=0.3,
    random_state=42,
    stratify=df["fraudulent"]
)

# =========================================================
# Tokenizer
# =========================================================
tokenizer = DistilBertTokenizerFast.from_pretrained(
    "distilbert-base-uncased"
)

train_encodings = tokenizer(
    X_train.tolist(),
    truncation=True,
    padding=True,
    max_length=256
)

test_encodings = tokenizer(
    X_test.tolist(),
    truncation=True,
    padding=True,
    max_length=256
)

# =========================================================
# Dataset
# =========================================================
class JobDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels.values

    def __getitem__(self, idx):
        return {
            "input_ids": torch.tensor(self.encodings["input_ids"][idx]),
            "attention_mask": torch.tensor(self.encodings["attention_mask"][idx]),
            "labels": torch.tensor(self.labels[idx])
        }

    def __len__(self):
        return len(self.labels)

train_dataset = JobDataset(train_encodings, y_train)
test_dataset = JobDataset(test_encodings, y_test)

# =========================================================
# Model
# =========================================================
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=2
)

# =========================================================
# Training Arguments (No Logging)
# =========================================================
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    weight_decay=0.01,
    logging_strategy="no",
    report_to="none",
    disable_tqdm=True
)

# =========================================================
# Metrics
# =========================================================
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    return {"accuracy": accuracy_score(labels, preds)}

# =========================================================
# Trainer
# =========================================================
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics
)

# =========================================================
# Train
# =========================================================
trainer.train()

# =========================================================
# Evaluate
# =========================================================
predictions = trainer.predict(test_dataset)
y_pred = np.argmax(predictions.predictions, axis=1)

print("Accuracy:", accuracy_score(y_test, y_pred) * 100)
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# =========================================================
# Save Model
# =========================================================
model.save_pretrained("distilbert_fakejob_model")
tokenizer.save_pretrained("distilbert_fakejob_model")