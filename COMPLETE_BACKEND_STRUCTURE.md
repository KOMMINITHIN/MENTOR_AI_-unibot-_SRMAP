# 🔧 **COMPLETE BACKEND STRUCTURE & REQUIREMENTS**

## 📁 **BACKEND DIRECTORY STRUCTURE**

```
backend/
├── main.py                     # Main FastAPI application (1,368 lines)
├── file_processor.py           # File upload and processing utilities
├── ingest.py                   # RAG system data ingestion script
├── requirements.txt            # Python dependencies
├── README.md                   # Backend documentation
├── chatbot.db                  # SQLite database file
├── faiss_index.bin            # FAISS vector store for RAG
├── docs_store.npy             # Document store for RAG system
├── links.txt                  # URLs for RAG data ingestion
├── pdfs/                      # PDF documents for RAG
│   ├── data.pdf              # University data
│   └── srm_ap_knowledge_base.txt  # Comprehensive university info
├── uploads/                   # User uploaded files storage
└── __pycache__/              # Python cache files
```

## 📋 **COMPLETE REQUIREMENTS.txt**

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
pydantic[email]==2.5.0
sqlite3
requests==2.31.0
python-magic==0.4.27
PyPDF2==3.0.1
python-docx==1.1.0
openpyxl==3.1.2
Pillow==10.1.0
beautifulsoup4==4.12.2
sentence-transformers==2.2.2
faiss-cpu==1.7.4
numpy==1.24.3
scikit-learn==1.3.2
nltk==3.8.1
```

## 🗄️ **DATABASE SCHEMA**

### **Users Table**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER DEFAULT 0,
    tokens_limit INTEGER DEFAULT 80000,
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Conversations Table**
```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### **Messages Table**
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
);
```

### **Files Table**
```sql
CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔧 **MAIN.PY STRUCTURE**

### **Imports and Configuration (Lines 1-100)**
```python
# Core FastAPI imports
from fastapi import FastAPI, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Data processing and ML
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Authentication and security
import bcrypt
import jwt
from datetime import datetime, timedelta

# Database and file handling
import sqlite3
import os
import time
from collections import defaultdict, deque

# Configuration constants
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
OLLAMA_API_URL = "http://localhost:11434/api/chat"
DATABASE_PATH = "chatbot.db"
VECTOR_STORE_PATH = "faiss_index.bin"
DOCS_STORE_PATH = "docs_store.npy"
JWT_SECRET_KEY = "your-secret-key-here"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
```

### **Security and Rate Limiting (Lines 101-200)**
```python
# XSS Protection patterns
XSS_PATTERNS = [
    r'<script.*?>.*?</script>',
    r'javascript:',
    r'data:text/html',
    r'vbscript:',
    r'onload\s*=',
    r'onerror\s*=',
]

# Rate limiting configuration
RATE_LIMIT_REQUESTS = 30
RATE_LIMIT_WINDOW = 60
MAX_MESSAGE_LENGTH = 2000
MAX_MESSAGES_PER_REQUEST = 20

# Token limits
TOKEN_LIMITS = {
    "guest": 100,
    "user": 80000
}

# Storage for rate limiting and guest tracking
rate_limit_storage = defaultdict(lambda: deque())
blocked_ips = set()
guest_token_storage = defaultdict(lambda: {"tokens_used": 0, "reset_date": datetime.now().date()})
```

### **Database Functions (Lines 201-400)**
```python
def init_database():
    """Initialize SQLite database with all required tables"""
    
def get_user_by_username(username: str):
    """Retrieve user by username"""
    
def get_user_by_email(email: str):
    """Retrieve user by email"""
    
def create_user(username: str, email: str, password: str):
    """Create new user with hashed password"""
    
def verify_password(plain_password: str, hashed_password: str):
    """Verify password against hash"""
    
def update_user_tokens(user_id: int, tokens_used: int):
    """Update user token usage"""
    
def get_user_conversations(user_id: int):
    """Get all conversations for a user"""
    
def create_conversation(user_id: int, title: str):
    """Create new conversation"""
    
def get_conversation_messages(conversation_id: int, user_id: int):
    """Get messages for a conversation"""
    
def save_message(conversation_id: int, role: str, content: str, tokens_used: int = 0):
    """Save message to database"""
```

### **Authentication Functions (Lines 401-500)**
```python
def create_jwt_token(data: dict):
    """Create JWT token with expiration"""
    
def verify_jwt_token(token: str):
    """Verify and decode JWT token"""
    
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    
async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get admin user with role verification"""
```

### **Security Functions (Lines 501-600)**
```python
def sanitize_input(text: str):
    """Sanitize user input against XSS"""
    
def is_rate_limited(ip: str):
    """Check if IP is rate limited"""
    
def get_guest_tokens_used(ip: str):
    """Get guest token usage"""
    
def update_guest_tokens(ip: str, tokens_used: int):
    """Update guest token usage"""
    
def is_guest_limit_exceeded(ip: str, estimated_tokens: int):
    """Check if guest would exceed daily limit"""
```

### **RAG System Functions (Lines 601-700)**
```python
def search_index(query, top_k=4):
    """Search FAISS index for relevant documents"""
    
def get_rag_context(query: str):
    """Get relevant context from RAG system"""
    
# Load vector store and documents
model = SentenceTransformer(EMBEDDING_MODEL)
if os.path.exists(VECTOR_STORE_PATH) and os.path.exists(DOCS_STORE_PATH):
    index = faiss.read_index(VECTOR_STORE_PATH)
    docs = np.load(DOCS_STORE_PATH, allow_pickle=True).tolist()
else:
    index = faiss.IndexFlatL2(384)
    docs = []
```

### **API Endpoints (Lines 701-1368)**

#### **Authentication Endpoints**
```python
@app.post("/auth/register")
async def register(user_data: UserRegister):
    """User registration with validation"""

@app.post("/auth/login")
async def login(user_data: UserLogin):
    """User login with JWT token generation"""

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
```

#### **Chat Endpoints**
```python
@app.post("/chat")
async def chat(req: ChatRequest, request: Request, current_user: dict = Depends(get_current_user)):
    """Main chat endpoint with RAG integration"""
    # 1. Input validation and sanitization
    # 2. Rate limiting check
    # 3. Token limit verification
    # 4. RAG context retrieval
    # 5. Ollama API call
    # 6. Response processing
    # 7. Database storage
    # 8. Token usage update
```

#### **Conversation Endpoints**
```python
@app.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get user conversations"""

@app.post("/conversations")
async def create_new_conversation(conversation_data: ConversationCreate, current_user: dict = Depends(get_current_user)):
    """Create new conversation"""

@app.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages_endpoint(conversation_id: int, current_user: dict = Depends(get_current_user)):
    """Get conversation messages"""
```

#### **File Upload Endpoints**
```python
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """File upload with processing"""

@app.post("/analyze-file")
async def analyze_file_with_ai(request: dict, current_user: dict = Depends(get_current_user)):
    """AI-powered file analysis"""
```

#### **Admin Endpoints**
```python
@app.post("/admin/login")
async def admin_login(admin_data: AdminLogin):
    """Admin authentication"""

@app.get("/admin/stats")
async def get_admin_stats(admin_user: dict = Depends(get_admin_user)):
    """System statistics"""

@app.get("/admin/users")
async def get_all_users_admin(admin_user: dict = Depends(get_admin_user)):
    """User management"""

@app.put("/admin/users/{user_id}/role")
async def update_user_role_endpoint(user_id: int, role_data: dict, admin_user: dict = Depends(get_admin_user)):
    """Update user role"""
```

#### **Utility Endpoints**
```python
@app.get("/health")
async def health_check():
    """Health check endpoint"""

@app.get("/metrics")
async def get_metrics():
    """System metrics"""
```

## 🔧 **FILE_PROCESSOR.PY STRUCTURE**

```python
class FileProcessor:
    """Handle file upload and processing"""
    
    def __init__(self):
        self.upload_dir = "uploads"
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
    def save_file(self, file: UploadFile, user_id: int = None):
        """Save uploaded file to disk"""
        
    def process_file(self, file_path: str, filename: str, file_type: str):
        """Process file and extract content"""
        
    def extract_text_from_pdf(self, file_path: str):
        """Extract text from PDF files"""
        
    def extract_text_from_docx(self, file_path: str):
        """Extract text from Word documents"""
        
    def extract_text_from_image(self, file_path: str):
        """Extract text from images using OCR"""
        
    def analyze_code_file(self, file_path: str):
        """Analyze code files for bugs and improvements"""
```

## 🔧 **INGEST.PY STRUCTURE**

```python
# RAG system data ingestion
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
VECTOR_STORE_PATH = "faiss_index.bin"
DOCS_STORE_PATH = "docs_store.npy"
LINKS_PATH = "links.txt"
PDFS_DIR = "pdfs"

def chunk_text(text, chunk_size=400, overlap=50):
    """Split text into overlapping chunks"""
    
def extract_text_from_url(url):
    """Extract text content from web pages"""
    
def extract_text_from_pdf(pdf_path):
    """Extract text from PDF files"""
    
def main():
    """Main ingestion process"""
    # 1. Process URLs from links.txt
    # 2. Process PDFs from pdfs/ directory
    # 3. Create embeddings using SentenceTransformer
    # 4. Build FAISS index
    # 5. Save index and documents
```

## 🚀 **DEPLOYMENT REQUIREMENTS**

### **System Requirements**
- **Python**: 3.8 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 5GB free space
- **CPU**: Multi-core processor recommended

### **Python Dependencies Installation**
```bash
pip install fastapi uvicorn python-multipart
pip install python-jose[cryptography] passlib[bcrypt]
pip install pydantic[email] requests python-magic
pip install PyPDF2 python-docx openpyxl Pillow
pip install beautifulsoup4 sentence-transformers
pip install faiss-cpu numpy scikit-learn nltk
```

### **Environment Setup**
```bash
# Create uploads directory
mkdir uploads

# Initialize database
python -c "from main import init_database; init_database()"

# Run RAG ingestion
python ingest.py

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔒 **SECURITY FEATURES**

### **Input Validation**
- XSS pattern detection and sanitization
- SQL injection prevention
- File type validation
- Size limit enforcement

### **Authentication**
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Token expiration handling

### **Rate Limiting**
- IP-based rate limiting (30 requests/minute)
- Guest token limits (100/day)
- User token limits (80,000/month)
- Automatic limit reset

### **CORS Security**
- Configured allowed origins
- Credential handling
- Method restrictions
- Header validation

## 📊 **MONITORING & METRICS**

### **Health Check**
- Database connectivity
- Ollama service status
- Vector store availability
- System resource usage

### **Metrics Tracking**
- Active rate limits
- Blocked IPs
- Vector store document count
- FAISS index size
- User activity statistics

This comprehensive backend structure provides a robust, scalable, and secure foundation for the Mentor AI system with complete RAG integration, user management, and file processing capabilities.
