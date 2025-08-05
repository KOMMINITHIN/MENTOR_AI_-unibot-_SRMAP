import requests
import json

def test_admin_system():
    print("🔐 Testing Admin System...")
    
    # Test admin login
    print("\n👨‍💼 Testing Admin Login...")
    admin_login_data = {
        "email": "admin@srmap.edu.in",
        "password": "admin123"
    }
    
    response = requests.post(
        "http://localhost:8000/admin/login",
        json=admin_login_data,
        timeout=15
    )
    
    if response.status_code == 200:
        data = response.json()
        admin_token = data["token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print(f"✅ Admin login successful!")
        print(f"👤 Admin: {data['user']['username']} ({data['user']['role']})")
    else:
        print(f"❌ Admin login failed: {response.text}")
        return
    
    # Test system stats
    print("\n📊 Testing System Statistics...")
    stats_response = requests.get(
        "http://localhost:8000/admin/stats",
        headers=admin_headers,
        timeout=10
    )
    
    if stats_response.status_code == 200:
        stats_data = stats_response.json()
        stats = stats_data["stats"]
        print(f"✅ System stats retrieved!")
        print(f"  👥 Total Users: {stats['total_users']}")
        print(f"  🟢 Active Users: {stats['active_users']}")
        print(f"  💬 Total Conversations: {stats['total_conversations']}")
        print(f"  📝 Total Messages: {stats['total_messages']}")
        print(f"  🔢 Tokens Used Today: {stats['tokens_used_today']}")
    else:
        print(f"❌ Failed to get stats: {stats_response.text}")
    
    # Test get all users
    print("\n👥 Testing User Management...")
    users_response = requests.get(
        "http://localhost:8000/admin/users",
        headers=admin_headers,
        timeout=10
    )
    
    if users_response.status_code == 200:
        users_data = users_response.json()
        users = users_data["users"]
        print(f"✅ Found {len(users)} users:")
        for user in users:
            status = "🟢 Active" if user['is_active'] else "🔴 Inactive"
            print(f"  {user['id']}. {user['username']} ({user['email']}) - {user['role']} - {status}")
    else:
        print(f"❌ Failed to get users: {users_response.text}")
        return
    
    # Test role update (find a regular user to promote)
    regular_users = [u for u in users if u['role'] == 'user']
    if regular_users:
        test_user = regular_users[0]
        print(f"\n🔄 Testing Role Update for user {test_user['username']}...")
        
        role_update_response = requests.put(
            f"http://localhost:8000/admin/users/{test_user['id']}/role",
            json={"role": "admin"},
            headers=admin_headers,
            timeout=10
        )
        
        if role_update_response.status_code == 200:
            print(f"✅ User {test_user['username']} promoted to admin!")
            
            # Change back to user
            role_update_back = requests.put(
                f"http://localhost:8000/admin/users/{test_user['id']}/role",
                json={"role": "user"},
                headers=admin_headers,
                timeout=10
            )
            
            if role_update_back.status_code == 200:
                print(f"✅ User {test_user['username']} demoted back to user!")
            else:
                print(f"❌ Failed to demote user: {role_update_back.text}")
        else:
            print(f"❌ Failed to promote user: {role_update_response.text}")
    
    # Test conversations monitoring
    print("\n💬 Testing Conversation Monitoring...")
    conv_response = requests.get(
        "http://localhost:8000/admin/conversations",
        headers=admin_headers,
        timeout=10
    )
    
    if conv_response.status_code == 200:
        conv_data = conv_response.json()
        conversations = conv_data["conversations"]
        print(f"✅ Found {len(conversations)} conversations:")
        for conv in conversations[:3]:  # Show first 3
            print(f"  📁 '{conv['title']}' by {conv['username']} ({conv['message_count']} messages)")
    else:
        print(f"❌ Failed to get conversations: {conv_response.text}")
    
    print("\n🎉 Admin System Testing Complete!")

if __name__ == "__main__":
    test_admin_system()
