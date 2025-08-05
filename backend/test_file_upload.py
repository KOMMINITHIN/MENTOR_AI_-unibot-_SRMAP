import requests
import io

def test_file_upload():
    print("📁 Testing File Upload System...")
    
    # Login first
    print("\n🔐 Logging in...")
    login_data = {
        "email": "admin@srmap.edu.in",
        "password": "admin123"
    }
    
    response = requests.post(
        "http://localhost:8000/auth/login",
        json=login_data,
        timeout=15
    )
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    data = response.json()
    token = data["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Login successful!")
    
    # Test 1: Upload a text file
    print("\n📄 Test 1: Uploading text file...")
    
    # Create a sample text file
    text_content = """
# Sample Python Code
def hello_world():
    print("Hello, World!")
    return "Success"

# Main execution
if __name__ == "__main__":
    result = hello_world()
    print(f"Result: {result}")
"""
    
    files = {
        'file': ('sample_code.py', io.BytesIO(text_content.encode()), 'text/plain')
    }
    
    upload_response = requests.post(
        "http://localhost:8000/upload",
        headers=headers,
        files=files,
        timeout=30
    )
    
    if upload_response.status_code == 200:
        upload_data = upload_response.json()
        print(f"✅ File uploaded successfully!")
        print(f"📁 File ID: {upload_data['file_id']}")
        print(f"📊 Analysis: {upload_data['analysis']['summary']}")
        print(f"🔍 Content Type: {upload_data['analysis']['content_type']}")
        
        # Test file analysis
        print("\n🤖 Test 2: Analyzing uploaded file...")
        
        analysis_data = {
            "file_content": upload_data['full_content'],
            "question": "Please review this Python code and suggest improvements.",
            "file_type": "code"
        }
        
        analysis_response = requests.post(
            "http://localhost:8000/analyze-file",
            headers=headers,
            json=analysis_data,
            timeout=60
        )
        
        if analysis_response.status_code == 200:
            analysis_result = analysis_response.json()
            print(f"✅ File analysis completed!")
            print(f"🤖 AI Analysis: {analysis_result['analysis'][:200]}...")
            print(f"🔧 Model Used: {analysis_result['model_used']}")
        else:
            print(f"❌ File analysis failed: {analysis_response.text}")
    else:
        print(f"❌ File upload failed: {upload_response.text}")
    
    # Test 2: Upload JSON file
    print("\n📊 Test 3: Uploading JSON file...")
    
    json_content = """{
    "students": [
        {"name": "Alice", "grade": 95, "subject": "Math"},
        {"name": "Bob", "grade": 87, "subject": "Physics"},
        {"name": "Charlie", "grade": 92, "subject": "Chemistry"}
    ],
    "semester": "Fall 2024",
    "total_students": 3
}"""
    
    files = {
        'file': ('student_data.json', io.BytesIO(json_content.encode()), 'application/json')
    }
    
    upload_response = requests.post(
        "http://localhost:8000/upload",
        headers=headers,
        files=files,
        timeout=30
    )
    
    if upload_response.status_code == 200:
        upload_data = upload_response.json()
        print(f"✅ JSON file uploaded successfully!")
        print(f"📊 Analysis: {upload_data['analysis']['summary']}")
        
        # Analyze JSON data
        analysis_data = {
            "file_content": upload_data['full_content'],
            "question": "Analyze this student data and provide insights about performance.",
            "file_type": "data"
        }
        
        analysis_response = requests.post(
            "http://localhost:8000/analyze-file",
            headers=headers,
            json=analysis_data,
            timeout=60
        )
        
        if analysis_response.status_code == 200:
            analysis_result = analysis_response.json()
            print(f"✅ JSON analysis completed!")
            print(f"📈 Data Insights: {analysis_result['analysis'][:200]}...")
        else:
            print(f"❌ JSON analysis failed: {analysis_response.text}")
    else:
        print(f"❌ JSON upload failed: {upload_response.text}")
    
    print("\n🎉 File Upload System Testing Complete!")

if __name__ == "__main__":
    test_file_upload()
