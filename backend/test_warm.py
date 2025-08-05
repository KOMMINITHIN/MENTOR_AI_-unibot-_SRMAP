import requests

def test_warm_responses():
    print("🧪 Testing Warm Teacher-like Responses...")
    
    test_messages = [
        "Hi",
        "Hello",
        "Good morning",
        "I need help with my studies",
        "Can you help me?"
    ]
    
    for message in test_messages:
        print(f"\n💬 User: '{message}'")
        
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
                print(f"🤖 Mentor: {data['answer']}")
                print(f"📊 Tokens: {data.get('tokens_used', 0)}")
            else:
                print(f"❌ Error: {response.text}")
                
        except Exception as e:
            print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    test_warm_responses()
