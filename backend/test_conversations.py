import requests
import json

def test_conversations():
    print("🧪 Testing Chat History & Conversations...")
    
    # First login to get token
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
    
    # Test creating a conversation
    print("\n💬 Creating new conversation...")
    conv_response = requests.post(
        "http://localhost:8000/conversations",
        json={"title": "Test Chat"},
        headers=headers,
        timeout=10
    )
    
    if conv_response.status_code == 200:
        conv_data = conv_response.json()
        conversation_id = conv_data["conversation_id"]
        print(f"✅ Conversation created: ID {conversation_id}")
    else:
        print(f"❌ Failed to create conversation: {conv_response.text}")
        return
    
    # Test sending a message with conversation_id
    print("\n💭 Sending message to conversation...")
    chat_data = {
        "messages": [
            {"role": "user", "content": "Hello! This is a test message."}
        ],
        "task_type": "general",
        "conversation_id": conversation_id
    }
    
    chat_response = requests.post(
        "http://localhost:8000/chat",
        json=chat_data,
        headers=headers,
        timeout=30
    )
    
    if chat_response.status_code == 200:
        chat_result = chat_response.json()
        print(f"✅ Message sent successfully!")
        print(f"🤖 AI Response: {chat_result['answer'][:50]}...")
        print(f"💬 Conversation ID: {chat_result.get('conversation_id')}")
    else:
        print(f"❌ Failed to send message: {chat_response.text}")
        return
    
    # Test getting conversations list
    print("\n📋 Getting conversations list...")
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
            print(f"  📁 {conv['title']} (ID: {conv['id']})")
    else:
        print(f"❌ Failed to get conversations: {list_response.text}")
        return
    
    # Test getting messages from conversation
    print(f"\n💬 Getting messages from conversation {conversation_id}...")
    messages_response = requests.get(
        f"http://localhost:8000/conversations/{conversation_id}/messages",
        headers=headers,
        timeout=10
    )
    
    if messages_response.status_code == 200:
        messages_data = messages_response.json()
        messages = messages_data["messages"]
        print(f"✅ Found {len(messages)} messages")
        for msg in messages:
            print(f"  {msg['role']}: {msg['content'][:30]}...")
    else:
        print(f"❌ Failed to get messages: {messages_response.text}")
    
    print("\n🎉 Chat History Testing Complete!")

if __name__ == "__main__":
    test_conversations()
