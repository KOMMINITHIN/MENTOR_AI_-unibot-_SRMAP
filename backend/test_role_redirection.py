import requests
import json

def test_role_redirection():
    print("🔄 Testing Role-Based Redirection System...")
    
    # Test 1: Admin login should return role
    print("\n👨‍💼 Test 1: Admin Login...")
    admin_login_data = {
        "email": "admin@srmap.edu.in",
        "password": "admin123"
    }
    
    response = requests.post(
        "http://localhost:8000/auth/login",
        json=admin_login_data,
        timeout=15
    )
    
    if response.status_code == 200:
        data = response.json()
        user = data["user"]
        print(f"✅ Admin login successful!")
        print(f"👤 User: {user['username']}")
        print(f"🛡️ Role: {user['role']}")
        print(f"📧 Email: {user['email']}")
        
        if user['role'] == 'admin':
            print("✅ Role detection working - should redirect to admin panel!")
        else:
            print("❌ Role not detected properly")
    else:
        print(f"❌ Admin login failed: {response.text}")
        return
    
    # Test 2: Regular user login (if exists)
    print("\n👤 Test 2: Regular User Login...")
    
    # First create a regular user
    regular_user_data = {
        "email": "student@srmap.edu.in",
        "username": "student",
        "password": "student123"
    }
    
    # Try to register (might already exist)
    register_response = requests.post(
        "http://localhost:8000/auth/register",
        json=regular_user_data,
        timeout=10
    )
    
    # Now try to login
    login_response = requests.post(
        "http://localhost:8000/auth/login",
        json={
            "email": "student@srmap.edu.in",
            "password": "student123"
        },
        timeout=10
    )
    
    if login_response.status_code == 200:
        data = login_response.json()
        user = data["user"]
        print(f"✅ Regular user login successful!")
        print(f"👤 User: {user['username']}")
        print(f"🛡️ Role: {user.get('role', 'user')}")
        
        if user.get('role', 'user') == 'user':
            print("✅ Regular user role detected - should stay on chat page!")
        else:
            print("❌ Role not detected properly")
    else:
        print(f"❌ Regular user login failed: {login_response.text}")
    
    # Test 3: Admin panel access
    print("\n🔐 Test 3: Admin Panel Access...")
    admin_token = data["token"] if response.status_code == 200 else None
    
    if admin_token:
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        stats_response = requests.get(
            "http://localhost:8000/admin/stats",
            headers=admin_headers,
            timeout=10
        )
        
        if stats_response.status_code == 200:
            print("✅ Admin can access admin endpoints!")
        else:
            print(f"❌ Admin access failed: {stats_response.text}")
    
    print("\n🎉 Role-Based Redirection Testing Complete!")

if __name__ == "__main__":
    test_role_redirection()
