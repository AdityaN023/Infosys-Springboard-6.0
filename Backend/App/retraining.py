from river import compose, linear_model, feature_extraction, metrics
import pickle
import os
from sklearn.model_selection import train_test_split

def create_model():
    return compose.Pipeline(
        ("tfidf", feature_extraction.TFIDF()),
        ("classifier", linear_model.LogisticRegression())
    )
    
def initial_training(train_data, model_path="Model/fake_job_river_model.pkl"):
    model = create_model()
    
    accuracy = metrics.Accuracy()
    f1_score = metrics.F1()

    for text, label in train_data:
        model.learn_one(text, label)
        y_pred = model.predict_one(text)
        accuracy.update(label, y_pred)
        f1_score.update(label, y_pred)

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print("Initial training completed")
    print(accuracy)
    print(f1_score)
    
def initial_testing(test_data, model_path="Model/fake_job_river_model.pkl"):
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    accuracy = metrics.Accuracy()
    f1_score = metrics.F1()

    for text, label in test_data:
        y_pred = model.predict_one(text)
        accuracy.update(label, y_pred)
        f1_score.update(label, y_pred)

    print("Initial testing completed")
    print(accuracy)
    print(f1_score)
    
def retrain_model(new_data, model_path="Model/fake_job_river_model.pkl"):
    if not os.path.exists(model_path):
        raise FileNotFoundError("Model not found. Train initial model first.")

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    metric = metrics.Accuracy()

    for text, label in new_data:
        y_pred = model.predict_one(text)
        model.learn_one(text, label)
        metric.update(label, y_pred)

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print("Model retrained on new data")
    print("Accuracy on new data:", metric)

def predict(text, model_path="Model/fake_job_river_model.pkl"):
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    proba = model.predict_proba_one(text)
    prediction = model.predict_one(text)

    confidence = max(proba.values())

    label = "Fake" if prediction == 1 else "Real"

    print("Prediction:", label)
    print("Confidence:", round(confidence * 100, 2), "%")

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