import requests

def simple_test():
    print("🔍 Simple Backend Test...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print("✅ Backend is running!")
        else:
            print("❌ Backend not responding properly")
    except Exception as e:
        print(f"❌ Backend connection failed: {str(e)}")

if __name__ == "__main__":
    simple_test()
