# --------------------------------------------------------------------------
# Text Extraction from Image
# --------------------------------------------------------------------------
from PIL import Image
import pytesseract
import re

# Load the image from file
image = Image.open(r"Static\job_post.jpg")

# Extract text
text = pytesseract.image_to_string(image)

# Print extracted text
print("Extracted Text:")
print(text)

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)   # remove special characters
    text = re.sub(r"\s+", " ", text)              # normalize spaces
    return text.strip()

print("Cleaned text:")
print(clean_text(text))
# --------------------------------------------------------------------------