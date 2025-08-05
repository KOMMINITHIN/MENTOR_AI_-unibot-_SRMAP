import requests
import json

def test_ollama():
    print("🧪 Testing Ollama connection...")
    
    # Test Ollama API
    payload = {
        "model": "mistral:latest",
        "messages": [
            {"role": "user", "content": "Hello! Say hi back in one sentence."}
        ],
        "stream": False
    }
    
    try:
        print("📡 Making request to Ollama...")
        response = requests.post(
            "http://localhost:11434/api/chat",
            json=payload,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            print(f"🤖 AI Response: {data['message']['content']}")
        else:
            print("❌ FAILED!")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    test_ollama()
