import requests
import json
import time

def test_model(task_type, model_name):
    print(f"\n🧪 Testing {model_name} ({task_type})...")
    
    payload = {
        "messages": [
            {"role": "user", "content": "Hello! Say hi back in one sentence."}
        ],
        "task_type": task_type
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json=payload,
            timeout=30
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        print(f"📊 Status: {response.status_code}")
        print(f"⏱️ Response Time: {response_time:.2f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS!")
            print(f"🤖 Model Used: {data.get('model_used', 'Unknown')}")
            print(f"💬 Response: {data['answer'][:100]}...")
            print(f"🔢 Tokens Used: {data.get('tokens_used', 0)}")
        else:
            print(f"❌ FAILED!")
            print(f"📄 Error: {response.text}")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

def test_auth():
    print("\n🔐 Testing Authentication...")
    
    # Test with new user
    signup_data = {
        "email": "newuser@test.com",
        "username": "newuser123",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/auth/register",
            json=signup_data,
            timeout=10
        )
        
        print(f"📊 Signup Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Signup SUCCESS!")
            print(f"👤 User: {data['user']['username']}")
            print(f"🎫 Token: {data['token'][:20]}...")
            print(f"🔢 Tokens Remaining: {data['user']['tokens_remaining']}")
            return data['token']
        else:
            print(f"❌ Signup FAILED: {response.text}")
            return None
            
    except Exception as e:
        print(f"💥 Auth Exception: {str(e)}")
        return None

if __name__ == "__main__":
    print("🚀 Testing Complete System...")
    
    # Test authentication
    token = test_auth()
    
    # Test all 3 models
    test_model("general", "men.01")
    test_model("code", "men.02") 
    test_model("image", "men.03")
    
    print("\n🎉 Testing Complete!")
