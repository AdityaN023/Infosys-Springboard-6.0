import pandas as pd
import pickle
import os

from river import compose
from river import linear_model
from river import feature_extraction
from river import metrics

# ----------------------------
# Load dataset
# ----------------------------
data = [
    ("We are hiring a Data Analyst with SQL and Excel experience", 0),
    ("Backend Engineer role using Node.js and REST APIs", 0),
    ("Frontend Developer needed with React and JavaScript", 0),
    ("DevOps Engineer with AWS and Docker experience", 0),
    ("Junior Software Developer with training provided", 0),

    ("Earn money from home simple typing job", 1),
    ("Pay registration fee and start earning today", 1),
    ("Unlimited income no skills required", 1),
    ("Work from home earn thousands per week", 1),
    ("Click link and earn money instantly", 1),
]

# ----------------------------
# Create pipeline
# ----------------------------

model = compose.Pipeline(
    ("vectorizer", feature_extraction.TFIDF(lowercase=True, ngram_range=(1, 2), stop_words="english")),
    ("classifier", linear_model.LogisticRegression())
)

metric = metrics.Accuracy()

# ----------------------------
# Train incrementally
# ----------------------------
for text, label in data:
    y_pred = model.predict_one(text)
    model.learn_one(text, label)
    metric.update(label, y_pred)

print("Training completed")
print("F1 Score:", metric)

# ----------------------------
# Save model & vectorizer
# ----------------------------
os.makedirs("Model", exist_ok=True)

with open("Model/fake_job_river.pkl", "wb") as f:    
    pickle.dump(model, f)

print("Model saved successfully")