# -----------------------------------------------------------------------------
# Visualize the distribution of fake vs real job posts using Matplotlib
# -----------------------------------------------------------------------------
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_excel(r'Dataset\cleaned_fake_job_postings.xlsx')

plt.figure(figsize=(12, 5))
sns.countplot(y='fraudulent', data=df, palette='Set2', hue='fraudulent', legend=False)
plt.show()
# -----------------------------------------------------------------------------