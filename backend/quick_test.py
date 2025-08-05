import requests
import json

def quick_test():
    print("🚀 Quick System Test...")
    
    # Test simple chat
    payload = {
        "messages": [
            {"role": "user", "content": "Hi"}
        ],
        "task_type": "general"
    }
    
    try:
        print("📡 Testing chat...")
        response = requests.post(
            "http://localhost:8000/chat",
            json=payload,
            timeout=45  # Longer timeout for model loading
        )
        
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS!")
            print(f"🤖 Model: {data.get('model_used', 'Unknown')}")
            print(f"💬 Response: {data['answer'][:50]}...")
        else:
            print(f"❌ FAILED: {response.text}")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    quick_test()
