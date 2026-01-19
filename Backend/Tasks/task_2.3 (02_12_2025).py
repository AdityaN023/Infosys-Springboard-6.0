# ----------------------------------------------------------------------------
# Extract and analyze common words in fake job posts using vectorization
# ----------------------------------------------------------------------------
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

df = pd.read_excel(r'Dataset\cleaned_fake_job_postings.xlsx')

fake_posts = df[df['fraudulent'] == 1]['text'].astype(str)

vectorizer = CountVectorizer(stop_words='english', max_features=20)
word_matrix = vectorizer.fit_transform(fake_posts)

# Convert to dataframe
word_counts = word_matrix.sum(axis=0).A1
words = vectorizer.get_feature_names_out()

common_words_df = pd.DataFrame({
    'word': words,
    'count': word_counts
}).sort_values(by='count', ascending=False)

print("\nTop common words in fake job posts:\n")
print(common_words_df)
# ----------------------------------------------------------------------------