# ---------------------------------------------------------------------------
# Analyze text length to help identify fake job posts
# ---------------------------------------------------------------------------
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_excel(r'Dataset\cleaned_fake_job_postings.xlsx')

df['description_length'] = df['text'].apply(lambda x: len(str(x).split()))

plt.figure(figsize=(10,6))
df['description_length'].plot(kind='hist', bins=50)
plt.xlabel('Text Length (Words)')
plt.ylabel('Frequency')
plt.title('Distribution of Text Length')
plt.show()
# ---------------------------------------------------------------------------