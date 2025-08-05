import requests
import json

# Test OpenRouter API
OPENROUTER_API_KEY = "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"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

def test_openrouter():
    print("🧪 Testing OpenRouter API...")
    print(f"🔑 API Key: {OPENROUTER_API_KEY[:20]}...")

    # First test: Check available models
    print("\n1️⃣ Testing models endpoint...")
    try:
        models_response = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            timeout=10
        )
        print(f"📊 Models Status: {models_response.status_code}")
        if models_response.status_code != 200:
            print(f"❌ Models Error: {models_response.text}")
            return
    except Exception as e:
        print(f"💥 Models Exception: {str(e)}")
        return

    # Second test: Try chat completion
    print("\n2️⃣ Testing chat completion...")
    payload = {
        "model": "microsoft/phi-3-mini-128k-instruct:free",
        "messages": [
            {"role": "user", "content": "Hello! Can you say hi back?"}
        ],
        "max_tokens": 50,
        "temperature": 0.7
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "SRM University Mentor Chatbot"
    }
    
    try:
        print("📡 Making API request...")
        response = requests.post(
            OPENROUTER_API_URL,
            json=payload,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            print(f"🤖 AI Response: {data['choices'][0]['message']['content']}")
        else:
            print("❌ FAILED!")
            print(f"📄 Response Text: {response.text}")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    test_openrouter()
