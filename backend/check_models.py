import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print(f"🔑 Using Key: {api_key[:5]}...")

try:
    client = genai.Client(api_key=api_key)
    print("\n✅ Authentication Successful! Fetching available models...\n")
    
    # Just print the names directly
    for model in client.models.list():
        print(f"Found Model: {model.name}")

except Exception as e:
    print(f"\n❌ Error: {e}")