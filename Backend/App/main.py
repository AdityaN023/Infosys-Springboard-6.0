from flask import Flask, jsonify, request
from datetime import datetime
import mysql.connector
from river import compose, linear_model, feature_extraction, metrics
from sklearn.model_selection import train_test_split
from flask_cors import CORS
from PIL import Image
import pytesseract
import re, io, os
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
model_path = "Model/fake_job_river_model.pkl"
CORS(app)

# ===============================
# Text Cleaning
# ===============================
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# ===============================
# Prediction Function
# ===============================
def predict_job_posting(text):
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
            
        proba = model.predict_proba_one(text)
        prediction = model.predict_one(text)

        confidence = proba[prediction]

        return "fake" if prediction == 1 else "real", confidence
    except Exception as e:
        print(e)

# ===============================
# Demo Call
# ===============================
@app.get('/')
def check():
    return jsonify({"status": True})
    
# ===============================
# OCR Endpoint
# ===============================
@app.post("/extractText")
def extractText():
    try:
        if "file-upload" not in request.files:
            return jsonify({"success": False, "error": "No image uploaded"}), 400

        image_file = request.files["file-upload"]
        image = Image.open(io.BytesIO(image_file.read()))

        job_text = pytesseract.image_to_string(image)
        job_text = clean_text(job_text)

        return jsonify({
            "success": True,
            "job_text": job_text
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===============================
# Prediction Endpoint
# ===============================
@app.post("/checkJobPost")
def check_job_post():
    try:
        request_JSON = request.get_json()
        job_text = request_JSON.get("job_text", "")

        if not job_text:
            return jsonify({
                "success": False,
                "error": "No job description provided"
            }), 400
            
        con = mysql.connector.connect(host="localhost", user="root", password="#Aditya25", database="infosys_springboard")
        
        if con.is_connected():
            cursor = con.cursor()
            cursor.execute('SELECT model_id FROM model ORDER BY model_id DESC LIMIT 1;')
            row = cursor.fetchone()
            if row is not None:
                model_id = row[0]
            else:
                return jsonify({
                    "success": False,
                    "error": "No any model loaded!!!"
                })

        cursor.close()
        con.close()

        job_text = clean_text(job_text)
        label, confidence = predict_job_posting(job_text)

        return jsonify({
            "success": True,
            "result": label,
            # "model_id": model_id,
            "model_id": 1,
            "confidence_Level": round(confidence * 100, 2)
        })
    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500
        

# ===============================
# Load Model
# ===============================
def initial_testing(test_data):
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    accuracy = metrics.Accuracy()
    f1_score = metrics.F1()

    for text, label in test_data:
        y_pred = model.predict_one(text)
        accuracy.update(label, y_pred)
        f1_score.update(label, y_pred)

    return round((accuracy.get() * 100), 2), round((f1_score.get() * 100), 2)

@app.get("/load_model")
def load_Model():
    try:
        global model_path
        model_path = "Model/fake_job_river_model.pkl"

        KEEP_FILE = os.path.basename(model_path)

        for filename in os.listdir("Model"):
            file_path = os.path.join("Model", filename)

            if filename != KEEP_FILE and os.path.isfile(file_path):
                os.remove(file_path)
                
        df = pd.read_csv(r'Dataset/cleaned_fake_job_postings.csv')

        X = df['text']
        y = df['fraudulent']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        train_data = list(zip(X_train, y_train))
        test_data = list(zip(X_test, y_test));

        test_model_accuracy, test_model_f1_score = initial_testing(test_data)
        print(test_model_accuracy, test_model_f1_score)
            
        con = mysql.connector.connect(host="localhost", user="root", password="#Aditya25", database="infosys_springboard")
        
        if con.is_connected():
            cursor = con.cursor()
            cursor.execute('INSERT INTO model (version, accuracy, f1_score, comments) VALUES (%s, %s, %s, %s);', (f'version_0', test_model_accuracy, test_model_f1_score, 'This is the initial model'))
            con.commit()

        cursor.close()
        con.close()
        
        return jsonify({"success": True})
    except Exception as error:
        print(error)
        return jsonify({"success": False, "error": error})

# ===============================
# Retraining Endpoint
# ===============================
@app.post("/retrain")
def retrain_Model():
    try:
        global model_path
        request_JSON = request.get_json()
        retraining_time = datetime.now()
        flaggedPosts = request_JSON.get("flaggedPosts")
        UserID = request_JSON.get("UserID")
        notes = request_JSON.get("notes")
        version = request_JSON.get("version")
        
        if(len(flaggedPosts) <= 0):
            raise Exception('Flagged Posts does not exists!!!')
        
        df = pd.read_csv(r'Dataset/cleaned_fake_job_postings.csv')

        X = df['text']
        y = df['fraudulent']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        test_data = list(zip(X_test, y_test));
        
        con = mysql.connector.connect(host="localhost", user="root", password="#Aditya25", database="infosys_springboard")
        
        if con.is_connected():
            cursor = con.cursor()

            # check version
            cursor.execute('SELECT 1 FROM model WHERE version = %s;', (version,))
            if cursor.fetchone():
                return jsonify({'success': False, 'error': 'Version already exists.'})
            
            # Loading Model
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            
            # Incremental Learning
            for flaggedPost in flaggedPosts:
                text = flaggedPost.get('job_text')
                label = 1 if flaggedPost.get('result') == 'real' else 0
                
                model.learn_one(text, label)
                
                cursor.execute('UPDATE flaggedpost SET reviewed_by=%s WHERE flag_id=%s', (UserID, flaggedPost.get('flag_id')))
            
            # Storing Updated Model
            model_path = f"Model/fake_job_river_model_{version}.pkl"
            with open(model_path, "wb") as f:
                pickle.dump(model, f)
                           
            test_model_accuracy, test_model_f1_score = initial_testing(test_data)
                
            cursor.execute('INSERT INTO model (version, accuracy, f1_score) VALUES (%s, %s, %s);', (version, test_model_accuracy, test_model_f1_score))
            
            insert_id = cursor.lastrowid
            
            cursor.execute('INSERT INTO retrain (model_id, retrained_by, retraining_time, notes) VALUES (%s, %s, %s, %s);', (insert_id, UserID, retraining_time, notes))
            
            con.commit()
        
        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'success': False, 'error': error})
    finally:
        if cursor:
            cursor.close()
        if con:
            con.close()

if __name__ == "__main__":
    app.run(debug=True)