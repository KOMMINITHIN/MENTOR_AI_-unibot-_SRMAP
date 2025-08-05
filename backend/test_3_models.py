import requests
import time

def test_model(task_type, expected_model):
    print(f"\n🧪 Testing {task_type} → {expected_model}")
    
    payload = {
        "messages": [
            {"role": "user", "content": "Hello! Say hi back."}
        ],
        "task_type": task_type
    }
    
    start_time = time.time()
    
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json=payload,
            timeout=60
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        print(f"📊 Status: {response.status_code}")
        print(f"⏱️ Time: {response_time:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS!")
            print(f"🤖 Model: {data.get('model_used', 'Unknown')}")
            print(f"💬 Response: {data['answer'][:60]}...")
        else:
            print(f"❌ FAILED: {response.text}")
            
    except Exception as e:
        print(f"💥 Exception: {str(e)}")

if __name__ == "__main__":
    print("🚀 Testing All 3 Specialized Models...")
    
    test_model("general", "men.01")
    test_model("code", "men.02") 
    test_model("image", "men.03")
    
    print("\n🎉 All models tested!")
