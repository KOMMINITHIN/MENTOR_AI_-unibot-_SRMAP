import requests

def test_friendly_responses():
    print("🧪 Testing Friendly Responses...")
    
    test_messages = [
        "Hi",
        "Hello",
        "Hey there",
        "Good morning",
        "What's up?"
    ]
    
    for message in test_messages:
        print(f"\n💬 Testing: '{message}'")
        
        payload = {
            "messages": [
                {"role": "user", "content": message}
            ],
            "task_type": "general"
        }
        
        try:
            response = requests.post(
                "http://localhost:8000/chat",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"🤖 Response: {data['answer']}")
            else:
                print(f"❌ Error: {response.text}")
                
        except Exception as e:
            print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    test_friendly_responses()
