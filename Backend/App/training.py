from river import compose, linear_model, feature_extraction, metrics
from sklearn.model_selection import train_test_split
import pandas as pd
import pickle

df = pd.read_csv('cleaned_fake_job_postings.csv')
model_path = "fake_job_river_model.pkl"

X = df['text']
y = df['fraudulent']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

train_data = list(zip(X_train, y_train))
test_data = list(zip(X_test, y_test));

def initial_training(train_data):
    model = compose.Pipeline(
        ("bow", feature_extraction.BagOfWords(
            stop_words="english",
            lowercase=True,
            ngram_range=(1, 2)
        )),
        ("classifier", linear_model.LogisticRegression())
    )

    accuracy = metrics.Accuracy()
    f1_score = metrics.F1()

    for text, label in train_data:
        model.learn_one(text, label)

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print("Initial training completed")

def initial_testing(test_data):
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    accuracy = metrics.Accuracy()
    f1_score = metrics.F1()

    for text, label in test_data:
        y_pred = model.predict_one(text)
        accuracy.update(label, y_pred)
        f1_score.update(label, y_pred)

    print("Initial testing completed")
    return round((accuracy.get() * 100), 2), round((f1_score.get() * 100), 2)

initial_training(train_data)

test_model_accuracy, test_model_f1_score = initial_testing(test_data)
print("Testing Acc and F1 Score")
print(test_model_accuracy, test_model_f1_score)