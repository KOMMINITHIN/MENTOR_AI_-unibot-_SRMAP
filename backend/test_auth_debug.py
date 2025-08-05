import requests
import json

def test_auth_debug():
    print("🔍 Debugging Authentication...")
    
    # Test signup
    print("\n📝 Testing Signup...")
    signup_data = {
        "email": "admin@srmap.edu.in",
        "username": "admin",
        "password": "admin"
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
            token = data.get('token', '')
            print(f"🎫 Token: {token[:20]}...")
        else:
            print(f"❌ Signup FAILED!")
            
    except Exception as e:
        print(f"💥 Signup Exception: {str(e)}")
    
    # Test login
    print("\n🔐 Testing Login...")
    login_data = {
        "email": "admin@srmap.edu.in",
        "password": "admin"
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
        else:
            print(f"❌ Login FAILED!")
            
    except Exception as e:
        print(f"💥 Login Exception: {str(e)}")

if __name__ == "__main__":
    test_auth_debug()
