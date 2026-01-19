import re
import string
# import numpy as np
import pandas as pd
# import random
# import matplotlib.pyplot as plt
# import seaborn as sns   # A great visualization library provided by python
from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
# from sklearn.pipeline import Pipeline
# from sklearn.base import TransformerMixin
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
# from sklearn.metrics import pair_confusion_matrix
# from wordcloud import WordCloud
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
# from spacy.lang.en import English
import joblib

df = pd.read_excel('fake_job_postings.xlsx')
# print(df.head())  # Provides heading row and first 5 records
# print(df.shape)     # Provides the total number of rows and columns. OP: (17880, 18)

# print(df.isnull().sum())    # Performs is-null check on each cell and sum() adds the True

col_To_Del = ['job_id', 'telecommuting', 'has_company_logo', 'has_questions', 'salary_range', 'employment_type']
df = df.drop(columns=col_To_Del)   # Drops or Deletes the columns

df.fillna('', inplace=True)     # Replaces blank cells

# ----------------------------------------------------
# Visualizing Fake and Real Job Posts
# ----------------------------------------------------
'''plt.figure(figsize=(15, 5))
sns.countplot(y='fraudulent', data=df)
plt.show()'''
# ----------------------------------------------------

# print(df.groupby('fraudulent')['fraudulent'].count())   # Returns the count of Fake and Real Job Posts

# ----------------------------------------------------
# No. of Jobs and the required experience (Visualize)
# ----------------------------------------------------
'''exp = dict(df.required_experience.value_counts())    # Generates Key-Value pair with different category's and their counts
del exp['']    # Deletes Empty Values
print(exp)'''

'''plt.figure(figsize=(15, 5))
sns.set_theme(style='whitegrid')
plt.bar(exp.keys(), exp.values())
plt.title('No. of Jobs Based on Experience', size=20)
plt.xlabel('Experience', size=10)
plt.ylabel('No. of Jobs', size=10)
plt.xticks(rotation=30)
plt.show()'''
# ----------------------------------------------------


# ----------------------------------------------------
# Getting Country and Visualize top 14 countries
# ----------------------------------------------------
def split(location):
    return location.split(',')[0]

df['country'] = df['location'].apply(split)

'''countr = dict(df.country.value_counts()[:14])
del countr['']

plt.figure(figsize=(15, 5))
sns.set_theme(style='whitegrid')
plt.bar(countr.keys(), countr.values())
plt.title('No. of Jobs Based on Countries', size=20)
plt.xlabel('Country', size=10)
plt.ylabel('No. of Jobs', size=10)
plt.xticks(rotation=30)
plt.show()'''
# ----------------------------------------------------

# ----------------------------------------------------
# Visualize top 14 Education Level required for Job
# ----------------------------------------------------
'''req_edu = dict(df.required_education.value_counts()[:7])
del req_edu['']

plt.figure(figsize=(15, 5))
sns.set_theme(style='whitegrid')
plt.bar(req_edu.keys(), req_edu.values())
plt.title('No. of Jobs Based on Education Level', size=20)
plt.xlabel('Education', size=10)
plt.ylabel('No. of Jobs', size=10)
plt.xticks(rotation=30)
plt.show()'''
# ----------------------------------------------------

# print(df[df.fraudulent==0].title.value_counts()[:10])   # Prints the Titles of Real Jobs
# print(df[df.fraudulent==1].title.value_counts()[:10])   # Prints the Titles of Fake Jobs

# ----------------------------------------------------
# Combining all Columns into single columns text 
# Deleting unnecessary columns
# ----------------------------------------------------
df['text'] = df['title']+' '+df['company_profile']+' '+df['description']+' '+df['requirements']+' '+df['benefits']

col_To_Del = ['title', 'location', 'department', 'company_profile', 'description', 'requirements', 'benefits', 'required_experience', 'required_education', 'industry', 'function', 'country']
df = df.drop(columns=col_To_Del)

# ----------------------------------------------------
# Creating Wordcloud for text in Fake and Real Jobs
# ----------------------------------------------------
'''realJobText = df[df.fraudulent==0].text   # Getting the text for Real Jobs
fakeJobText = df[df.fraudulent==1].text   # Getting the text for Fake Jobs

plt.figure(figsize=(16, 14))
plt.title("Word Cloud for Fake Job Post!!!")
wc = WordCloud(min_font_size=3, max_words=3000, width=1600, height=800, stopwords=STOP_WORDS).generate(str(" ".join(fakeJobText)))
plt.imshow(wc, interpolation='bilinear')
plt.show()

plt.figure(figsize=(16, 14))
plt.title("Word Cloud for Real Job Post!!!")
wc = WordCloud(min_font_size=3, max_words=3000, width=1600, height=800, stopwords=STOP_WORDS).generate(str(" ".join(realJobText)))
plt.imshow(wc, interpolation='bilinear')
plt.show()'''
# ----------------------------------------------------

# ----------------------------------------------------
# Pre-Processing the Data
# ----------------------------------------------------
# Create our list of punctuation marks
punctuation = string.punctuation

# Loading the following file by installing using: python -m spacy download en
nlp = spacy.load('en_core_web_sm')

# Load English tokenizer, tagger, parser, NER and word vectors
# parser = English()

# Creating Tokenizer Function
'''def spacy_Tokenizer(text):
    mytokens = nlp(text)
    # mytokens = parser(text) # Create our token object, which is used to create doc with linguistic notations
    
    # Limit each token and convert into lower case
    mytokens = [word.lemma_.lower().strip() if word.lemma_ != "-PRON-" else word.lower_ for word in mytokens]
    
    # Remove all the stop words
    mytokens = [word for word in mytokens if word not in STOP_WORDS and word not in punctuation]
    print(mytokens)
    return mytokens'''
    
def spacy_Tokenizer(text):
    doc = nlp(text)
    tokens = []

    for token in doc:

        # skip punctuation and spaces
        if token.is_punct or token.is_space:
            continue

        lemma = token.lemma_.lower().strip()

        if lemma == "-pron-":
            continue

        # remove stopwords AFTER lemmatizing
        if lemma in STOP_WORDS:
            continue

        # keep numbers and alphanumeric tokens
        lemma = re.sub(r"[^a-zA-Z0-9]", "", lemma)

        # skip empty tokens after cleanup
        if len(lemma) < 2:
            continue

        tokens.append(lemma)

    return tokens

# Base Function to Clean Text
# def clean_text(text):
#     return text.strip().lower()     # Removing Spaces and converting text into Lowercase

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)   # remove special characters
    text = re.sub(r"\s+", " ", text)              # normalize spaces
    return text.strip()

# Custom transformer using spacy
'''class predictors (TransformerMixin):
    def transform (self, X, **transforn_params):
        return [clean_text(text) for text in X]     # Cleaning text
    
    def fit(self, X, y=None, **fit_params):
        return self
    
    def get_params (self, deep=True):
        return {}'''

# df['text'] = df.text.apply(clean_text)
# ----------------------------------------------------

# ----------------------------------------------------
# Convert text into numeric
# ----------------------------------------------------
tfidf = TfidfVectorizer(preprocessor=clean_text, tokenizer=spacy_Tokenizer, max_features=15000, token_pattern=None, ngram_range=(1,2))
tfidf_X = tfidf.fit_transform(df['text'])
df1 = pd.DataFrame(tfidf_X.toarray(), columns=tfidf.get_feature_names_out())
df.drop(columns='text', axis=1, inplace=True)
main_df = pd.concat([df1, df], axis=1)
# print(main_df.head())
# ----------------------------------------------------

# ----------------------------------------------------
# Train - Test Splitting
# ----------------------------------------------------
X = main_df.iloc[:,:-1]
Y = main_df.iloc[:,-1]

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.3)    # 70% Training and 30% Testing
# print(X_train.shape)
# print(Y_train.shape)
# print(X_test.shape)
# print(Y_test.shape)
# ----------------------------------------------------

# ----------------------------------------------------
# Model Training using Random Forest Model
# ----------------------------------------------------
# rfc = RandomForestClassifier(n_jobs=3, oob_score=True, n_estimators=100, criterion='entropy', class_weight='balanced')
# rfc = LinearSVC()
rfc = LogisticRegression(max_iter=1000)
model = rfc.fit(X_train, Y_train)
# ----------------------------------------------------

# ----------------------------------------------------
# Printing Accuracy, Classification Report and Confusion Matrix
# ----------------------------------------------------
pred_Y = model.predict(X_test)
score = accuracy_score(Y_test, pred_Y)

print("Accuracy Score:", score*100)
print("Classification Report:", classification_report(Y_test, pred_Y))
print("Confusion Matrix:", confusion_matrix(Y_test, pred_Y))
# ----------------------------------------------------

# ----------------------------------------------------
# Storing Model and Tfidf Vectorizer
# ----------------------------------------------------
# joblib.dump(model, 'support_vector_classifier.pkl')
joblib.dump(model, 'logistic_regression_model.pkl')
joblib.dump(tfidf, 'tfidf_vectorizer.pkl')
# ----------------------------------------------------