import requests
import json

def test_auth_fixed():
    print("🔧 Testing Fixed Authentication...")
    
    # Test signup with proper password
    print("\n📝 Testing Signup...")
    signup_data = {
        "email": "admin@srmap.edu.in",
        "username": "admin",
        "password": "admin123"  # 7 characters - meets requirement
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/auth/register",
            json=signup_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"📊 Signup Status: {response.status_code}")
        print(f"📄 Signup Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Signup SUCCESS!")
            print(f"👤 User: {data.get('user', {}).get('username', 'Unknown')}")
            print(f"🔢 Tokens: {data.get('user', {}).get('tokens_remaining', 0)}")
        else:
            print(f"❌ Signup FAILED!")
            
    except Exception as e:
        print(f"💥 Signup Exception: {str(e)}")
    
    # Test login with correct password
    print("\n🔐 Testing Login...")
    login_data = {
        "email": "admin@srmap.edu.in",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"📊 Login Status: {response.status_code}")
        print(f"📄 Login Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login SUCCESS!")
            print(f"👤 User: {data.get('user', {}).get('username', 'Unknown')}")
            print(f"🔢 Tokens: {data.get('user', {}).get('tokens_remaining', 0)}")
        else:
            print(f"❌ Login FAILED!")
            
    except Exception as e:
        print(f"💥 Login Exception: {str(e)}")

if __name__ == "__main__":
    test_auth_fixed()
