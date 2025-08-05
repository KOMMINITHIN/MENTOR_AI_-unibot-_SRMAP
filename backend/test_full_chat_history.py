import requests
import json

def test_full_chat_history():
    print("🧪 Testing Complete Chat History System...")
    
    # Login
    print("\n🔐 Logging in...")
    login_data = {
        "email": "admin@srmap.edu.in",
        "password": "admin123"
    }
    
    response = requests.post(
        "http://localhost:8000/auth/login",
        json=login_data,
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    data = response.json()
    token = data["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Login successful!")
    
    # Test 1: Send message without conversation_id (should create new conversation)
    print("\n💭 Test 1: Sending first message (new conversation)...")
    chat_data = {
        "messages": [
            {"role": "user", "content": "Hello! What is machine learning?"}
        ],
        "task_type": "general"
    }
    
    chat_response = requests.post(
        "http://localhost:8000/chat",
        json=chat_data,
        headers=headers,
        timeout=30
    )
    
    if chat_response.status_code == 200:
        chat_result = chat_response.json()
        conversation_id = chat_result.get('conversation_id')
        print(f"✅ New conversation created: ID {conversation_id}")
        print(f"🤖 AI Response: {chat_result['answer'][:50]}...")
    else:
        print(f"❌ Failed: {chat_response.text}")
        return
    
    # Test 2: Send follow-up message to same conversation
    print(f"\n💭 Test 2: Sending follow-up message to conversation {conversation_id}...")
    chat_data2 = {
        "messages": [
            {"role": "user", "content": "Hello! What is machine learning?"},
            {"role": "assistant", "content": chat_result['answer']},
            {"role": "user", "content": "Can you give me an example?"}
        ],
        "task_type": "general",
        "conversation_id": conversation_id
    }
    
    chat_response2 = requests.post(
        "http://localhost:8000/chat",
        json=chat_data2,
        headers=headers,
        timeout=30
    )
    
    if chat_response2.status_code == 200:
        chat_result2 = chat_response2.json()
        print(f"✅ Follow-up message sent successfully!")
        print(f"🤖 AI Response: {chat_result2['answer'][:50]}...")
    else:
        print(f"❌ Failed: {chat_response2.text}")
        return
    
    # Test 3: Get conversations list
    print("\n📋 Test 3: Getting conversations list...")
    list_response = requests.get(
        "http://localhost:8000/conversations",
        headers=headers,
        timeout=10
    )
    
    if list_response.status_code == 200:
        list_data = list_response.json()
        conversations = list_data["conversations"]
        print(f"✅ Found {len(conversations)} conversations")
        for conv in conversations:
            print(f"  📁 '{conv['title']}' (ID: {conv['id']}) - {conv['updated_at']}")
    else:
        print(f"❌ Failed: {list_response.text}")
        return
    
    # Test 4: Get messages from conversation
    print(f"\n💬 Test 4: Getting messages from conversation {conversation_id}...")
    messages_response = requests.get(
        f"http://localhost:8000/conversations/{conversation_id}/messages",
        headers=headers,
        timeout=10
    )
    
    if messages_response.status_code == 200:
        messages_data = messages_response.json()
        messages = messages_data["messages"]
        print(f"✅ Found {len(messages)} messages in conversation")
        for i, msg in enumerate(messages, 1):
            print(f"  {i}. {msg['role']}: {msg['content'][:40]}...")
    else:
        print(f"❌ Failed: {messages_response.text}")
    
    print("\n🎉 Complete Chat History System Working!")

if __name__ == "__main__":
    test_full_chat_history()
