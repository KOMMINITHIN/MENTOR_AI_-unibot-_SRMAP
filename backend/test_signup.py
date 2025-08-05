import requests
import json

def test_signup():
    print("🧪 Testing signup endpoint...")
    
    # Test signup
    signup_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
    }
    
    try:
        print("📡 Testing signup...")
        response = requests.post(
            "http://localhost:8000/auth/register",
            json=signup_data,
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Signup SUCCESS!")
        else:
            print("❌ Signup FAILED!")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

def test_chat():
    print("\n🧪 Testing chat endpoint...")
    
    # Test chat without auth
    chat_data = {
        "messages": [
            {"role": "user", "content": "Hello! Say hi back."}
        ],
        "task_type": "general"
    }
    
    try:
        print("📡 Testing chat...")
        response = requests.post(
            "http://localhost:8000/chat",
            json=chat_data,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Chat SUCCESS!")
        else:
            print("❌ Chat FAILED!")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    test_signup()
    test_chat()
