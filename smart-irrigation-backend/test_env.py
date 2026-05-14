import os
from dotenv import load_dotenv
import sys

print("Current working directory:", os.getcwd())
print("Files in current directory:", os.listdir('.'))
print("-" * 50)

# Check if .env file exists
if os.path.exists('.env'):
    print(".env file exists")
    print("Loading .env file...")
else:
    print(".env file NOT found!")
    sys.exit(1)

# Load .env file
result = load_dotenv(verbose=True)
print(f"load_dotenv() returned: {result}")

print("-" * 50)
# Test reading variables
print(f"FLASK_ENV: {os.getenv('FLASK_ENV')}")
print(f"MODEL_DIR: {os.getenv('MODEL_DIR')}")
print(f"CONFIDENCE_THRESHOLD: {os.getenv('CONFIDENCE_THRESHOLD')}")
print(f"ALLOWED_ORIGINS: {os.getenv('ALLOWED_ORIGINS')}")