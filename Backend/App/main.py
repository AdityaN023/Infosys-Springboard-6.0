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
            "model_id": model_id,
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
def initial_training(train_data):
    model = compose.Pipeline(
            ("tfidf", feature_extraction.TFIDF(ngram_range=(1, 2))),
            ("classifier", linear_model.LogisticRegression())
        )
    accuracy = metrics.Accuracy()
    f1_score = metrics.F1()

    for text, label in train_data:
        y_pred = model.predict_one(text)
        accuracy.update(label, y_pred)
        f1_score.update(label, y_pred)
        model.learn_one(text, label)

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    print("Initial training completed")
    return round((accuracy.get() * 100), 2), round((f1_score.get() * 100), 2)

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

@app.get("/load_model")
def load_Model():
    try:        
        if os.path.exists(model_path):
            os.unlink(model_path)
            
        data = [
            # Legitimate job posts (0)
            ("Hiring Software Engineer with Java and Spring Boot experience",0),
            ("Looking for Python Developer skilled in Django and REST APIs",0),
            ("Data Analyst role requiring SQL, Excel, and Power BI",0),
            ("Frontend Developer with React.js and modern CSS frameworks",0),
            ("Backend Engineer needed with Node.js and MongoDB experience",0),
            ("DevOps Engineer with AWS, Docker, and Kubernetes knowledge",0),
            ("Machine Learning Engineer with Python and TensorFlow experience",0),
            ("Data Scientist role focusing on predictive analytics",0),
            ("Mobile App Developer for Android applications in Kotlin",0),
            ("iOS Developer required with Swift and UIKit experience",0),
            ("Full Stack Developer with MERN stack experience",0),
            ("Hiring QA Engineer with manual and automation testing skills",0),
            ("System Administrator with Linux server management experience",0),
            ("Cloud Engineer with Azure deployment experience",0),
            ("Cybersecurity Analyst with SOC experience",0),
            ("Network Engineer with routing and switching expertise",0),
            ("UI UX Designer with Figma and user research skills",0),
            ("Business Analyst with requirement gathering experience",0),
            ("Product Manager for SaaS based applications",0),
            ("Technical Support Engineer with troubleshooting skills",0),

            ("Junior Software Developer freshers can apply",0),
            ("Hiring Intern for Web Development using HTML CSS JavaScript",0),
            ("Graduate Trainee Engineer position in IT services",0),
            ("Looking for Data Engineering intern with Python skills",0),
            ("Research Assistant role in AI and Data Science",0),
            ("Hiring Software Architect with microservices experience",0),
            ("Looking for ERP consultant with SAP knowledge",0),
            ("Hiring Database Administrator with MySQL expertise",0),
            ("Game Developer with Unity and C# experience",0),
            ("Embedded Systems Engineer with C and microcontrollers",0),

            ("Hiring HR Executive with recruitment experience",0),
            ("Marketing Analyst role with data-driven approach",0),
            ("Digital Marketing Executive with SEO SEM experience",0),
            ("Content Writer with technical writing skills",0),
            ("Hiring Graphic Designer with Adobe Photoshop",0),
            ("Sales Engineer with B2B experience",0),
            ("Operations Manager with supply chain expertise",0),
            ("Financial Analyst with accounting background",0),
            ("Hiring Project Coordinator for IT projects",0),
            ("Technical Lead with team management experience",0),

            ("Hiring AI Engineer with NLP experience",0),
            ("Looking for Blockchain Developer with Solidity knowledge",0),
            ("Hiring Robotics Engineer with ROS experience",0),
            ("Data Visualization Engineer with Tableau expertise",0),
            ("Hiring Python Trainer for corporate training",0),
            ("Looking for Software Consultant with client-facing skills",0),
            ("Hiring Technical Recruiter for IT hiring",0),
            ("Hiring Product Support Engineer",0),
            ("Hiring ERP Functional Consultant",0),
            ("Looking for Network Security Engineer",0),
            ("Full time role with PF ESI and benefits", 0),
            ("Onsite interview required at company office", 0),
            ("CTC based on experience and skills", 0),
            ("Employment offer letter provided after interview", 0),
            ("Background verification mandatory", 0),
            # Spam / fake job posts (1)
            ("Pay processing fee before joining", 1),
            ("UPI payment required to activate job", 1),
            ("WhatsApp recruiter no company email", 1),
            ("No offer letter instant earning", 1),
            ("Earn money daily with referral scheme", 1),
            ("No experience required earn money from home",1),
            ("Work from home and earn ₹5000 per day",1),
            ("Simple typing job earn daily income",1),
            ("Pay registration fee and get instant job",1),
            ("Earn unlimited money without skills",1),
            ("Click link and start earning today",1),
            ("Data entry job easy work high income",1),
            ("Part time job earn money from mobile",1),
            ("Guaranteed job after small payment",1),
            ("Online job without interview",1),

            ("Earn money while sleeping",1),
            ("Make money fast no experience needed",1),
            ("Earn ₹30000 per week from home",1),
            ("Easy work big income apply now",1),
            ("No skills no interview earn daily",1),
            ("Work only 1 hour per day earn big",1),
            ("Instant joining no documents required",1),
            ("Pay fee and receive job confirmation",1),
            ("Home based job earn instantly",1),
            ("Click here to earn money today",1),

            ("Online captcha typing job high salary",1),
            ("Earn money by watching ads",1),
            ("Unlimited earning opportunity apply now",1),
            ("Work from home copy paste job",1),
            ("Earn money just by chatting",1),
            ("Earn without doing anything",1),
            ("Simple form filling job",1),
            ("Earn daily income without investment",1),
            ("No age limit earn money",1),
            ("Guaranteed income scheme",1),

            ("Earn money from WhatsApp",1),
            ("Telegram job earn instantly",1),
            ("No office work earn from home",1),
            ("Easy job high payment apply fast",1),
            ("Instant payout daily income job",1),
            ("Earn money by clicking links",1),
            ("Zero investment earn big money",1),
            ("Pay joining fee today",1),
            ("Online job limited slots hurry",1),
            ("Earn money with smartphone",1),

            ("Simple job huge income no risk",1),
            ("Earn money without verification",1),
            ("Online work no skills required",1),
            ("Pay now and start earning",1),
            ("Easy task big reward",1),
            ("Instant approval job",1),
            ("Earn money daily no experience",1),
            ("Home job unlimited income",1),
            ("Earn money fast today",1),
            ("Click and earn instantly",1),
        ]
        
        train_data, test_data = train_test_split(data,
            test_size=0.3,
            shuffle=True,
            stratify=[label for _, label in data],
            random_state=42
        )
        
        train_model_accuracy, train_model_f1_score = initial_training(train_data)
        test_model_accuracy, test_model_f1_score = initial_testing(test_data)
        # print(train_model_accuracy, train_model_f1_score)
        # print(test_model_accuracy, test_model_f1_score)
            
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
        request_JSON = request.get_json()
        retraining_time = datetime.now()
        flaggedPosts = request_JSON.get("flaggedPosts")
        UserID = request_JSON.get("UserID")
        notes = request_JSON.get("notes")
        version = request_JSON.get("version")
        
        if(len(flaggedPosts) <= 0):
            raise Exception('Flagged Posts does not exists!!!')
        data = [
            # Legitimate job posts (0)
            ("Hiring Software Engineer with Java and Spring Boot experience",0),
            ("Looking for Python Developer skilled in Django and REST APIs",0),
            ("Data Analyst role requiring SQL, Excel, and Power BI",0),
            ("Frontend Developer with React.js and modern CSS frameworks",0),
            ("Backend Engineer needed with Node.js and MongoDB experience",0),
            ("DevOps Engineer with AWS, Docker, and Kubernetes knowledge",0),
            ("Machine Learning Engineer with Python and TensorFlow experience",0),
            ("Data Scientist role focusing on predictive analytics",0),
            ("Mobile App Developer for Android applications in Kotlin",0),
            ("iOS Developer required with Swift and UIKit experience",0),
            ("Full Stack Developer with MERN stack experience",0),
            ("Hiring QA Engineer with manual and automation testing skills",0),
            ("System Administrator with Linux server management experience",0),
            ("Cloud Engineer with Azure deployment experience",0),
            ("Cybersecurity Analyst with SOC experience",0),
            ("Network Engineer with routing and switching expertise",0),
            ("UI UX Designer with Figma and user research skills",0),
            ("Business Analyst with requirement gathering experience",0),
            ("Product Manager for SaaS based applications",0),
            ("Technical Support Engineer with troubleshooting skills",0),

            ("Junior Software Developer freshers can apply",0),
            ("Hiring Intern for Web Development using HTML CSS JavaScript",0),
            ("Graduate Trainee Engineer position in IT services",0),
            ("Looking for Data Engineering intern with Python skills",0),
            ("Research Assistant role in AI and Data Science",0),
            ("Hiring Software Architect with microservices experience",0),
            ("Looking for ERP consultant with SAP knowledge",0),
            ("Hiring Database Administrator with MySQL expertise",0),
            ("Game Developer with Unity and C# experience",0),
            ("Embedded Systems Engineer with C and microcontrollers",0),

            ("Hiring HR Executive with recruitment experience",0),
            ("Marketing Analyst role with data-driven approach",0),
            ("Digital Marketing Executive with SEO SEM experience",0),
            ("Content Writer with technical writing skills",0),
            ("Hiring Graphic Designer with Adobe Photoshop",0),
            ("Sales Engineer with B2B experience",0),
            ("Operations Manager with supply chain expertise",0),
            ("Financial Analyst with accounting background",0),
            ("Hiring Project Coordinator for IT projects",0),
            ("Technical Lead with team management experience",0),

            ("Hiring AI Engineer with NLP experience",0),
            ("Looking for Blockchain Developer with Solidity knowledge",0),
            ("Hiring Robotics Engineer with ROS experience",0),
            ("Data Visualization Engineer with Tableau expertise",0),
            ("Hiring Python Trainer for corporate training",0),
            ("Looking for Software Consultant with client-facing skills",0),
            ("Hiring Technical Recruiter for IT hiring",0),
            ("Hiring Product Support Engineer",0),
            ("Hiring ERP Functional Consultant",0),
            ("Looking for Network Security Engineer",0),
            ("Full time role with PF ESI and benefits", 0),
            ("Onsite interview required at company office", 0),
            ("CTC based on experience and skills", 0),
            ("Employment offer letter provided after interview", 0),
            ("Background verification mandatory", 0),
            # Spam / fake job posts (1)
            ("Pay processing fee before joining", 1),
            ("UPI payment required to activate job", 1),
            ("WhatsApp recruiter no company email", 1),
            ("No offer letter instant earning", 1),
            ("Earn money daily with referral scheme", 1),
            ("No experience required earn money from home",1),
            ("Work from home and earn ₹5000 per day",1),
            ("Simple typing job earn daily income",1),
            ("Pay registration fee and get instant job",1),
            ("Earn unlimited money without skills",1),
            ("Click link and start earning today",1),
            ("Data entry job easy work high income",1),
            ("Part time job earn money from mobile",1),
            ("Guaranteed job after small payment",1),
            ("Online job without interview",1),

            ("Earn money while sleeping",1),
            ("Make money fast no experience needed",1),
            ("Earn ₹30000 per week from home",1),
            ("Easy work big income apply now",1),
            ("No skills no interview earn daily",1),
            ("Work only 1 hour per day earn big",1),
            ("Instant joining no documents required",1),
            ("Pay fee and receive job confirmation",1),
            ("Home based job earn instantly",1),
            ("Click here to earn money today",1),

            ("Online captcha typing job high salary",1),
            ("Earn money by watching ads",1),
            ("Unlimited earning opportunity apply now",1),
            ("Work from home copy paste job",1),
            ("Earn money just by chatting",1),
            ("Earn without doing anything",1),
            ("Simple form filling job",1),
            ("Earn daily income without investment",1),
            ("No age limit earn money",1),
            ("Guaranteed income scheme",1),

            ("Earn money from WhatsApp",1),
            ("Telegram job earn instantly",1),
            ("No office work earn from home",1),
            ("Easy job high payment apply fast",1),
            ("Instant payout daily income job",1),
            ("Earn money by clicking links",1),
            ("Zero investment earn big money",1),
            ("Pay joining fee today",1),
            ("Online job limited slots hurry",1),
            ("Earn money with smartphone",1),

            ("Simple job huge income no risk",1),
            ("Earn money without verification",1),
            ("Online work no skills required",1),
            ("Pay now and start earning",1),
            ("Easy task big reward",1),
            ("Instant approval job",1),
            ("Earn money daily no experience",1),
            ("Home job unlimited income",1),
            ("Earn money fast today",1),
            ("Click and earn instantly",1),
        ]
        
        con = mysql.connector.connect(host="localhost", user="root", password="#Aditya25", database="infosys_springboard")
        
        if con.is_connected():
            cursor = con.cursor()

            # check version
            cursor.execute('SELECT 1 FROM model WHERE version = %s;', (version,))
            if cursor.fetchone():
                raise Exception('Version already exists')
            
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
            with open(model_path, "wb") as f:
                pickle.dump(model, f)
                
            train_data, test_data = train_test_split(data,
                test_size=0.3,
                shuffle=True,
                stratify=[label for _, label in data],
                random_state=42
            )
                
            test_model_accuracy, test_model_f1_score = initial_testing(test_data)
                
            cursor.execute('INSERT INTO model (version, accuracy, f1_score) VALUES (%s, %s, %s);', (version, test_model_accuracy, test_model_f1_score))
            
            insert_id = cursor.lastrowid
            
            cursor.execute('INSERT INTO retrain (model_id, retrained_by, retraining_time, notes) VALUES (%s, %s, %s, %s);', (insert_id, UserID, retraining_time, notes))
            
            con.commit()
        
        return jsonify({'success': True})
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'error': error})
    finally:
        if cursor:
            cursor.close()
        if con:
            con.close()

if __name__ == "__main__":
    app.run(debug=True)