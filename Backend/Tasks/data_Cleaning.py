import pandas as pd
import re

# Reading the excel data
df = pd.read_csv(r'Dataset\fake_job_postings.csv')

col_To_Del = ['job_id', 'telecommuting', 'has_company_logo', 'has_questions', 'salary_range', 'employment_type']
df = df.drop(columns=col_To_Del)   # Drops or Deletes the columns

# Fill all empty cells with ""
df.fillna('', inplace=True)     # Replaces blank cells

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)   # remove special characters
    text = re.sub(r"\s+", " ", text)              # normalize spaces
    return text.strip()

for col in ["title", "company_profile", "description", "requirements", "employment_type", "required_education", "required_experience", "industry", "function"]:
    if col in df.columns:
        df[col] = df[col].astype(str).apply(clean_text)
        df[col] = df[col].str.lower().str.strip()
        
df['text'] = (
    df['title'] + ' ' +
    df['company_profile'] + ' ' +
    df['description'] + ' ' +
    df['requirements'] + ' ' +
    df['benefits']
)

df['text'] = df['text'].astype(str).fillna('')

df = df.drop_duplicates(subset=['text']).reset_index(drop=True)

col_To_Del = ['title', 'location', 'department', 'company_profile', 'description', 'requirements', 'benefits', 'required_experience', 'required_education', 'industry', 'function']
df = df.drop(columns=col_To_Del)

# Export cleaned file
df.to_csv(r'Dataset\cleaned_fake_job_postings.csv', index=False)
print("File Created Successfully...");