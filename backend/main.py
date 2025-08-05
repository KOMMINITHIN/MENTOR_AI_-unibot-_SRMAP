import os
import re
import time
import hashlib
import sqlite3
import jwt
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator, Field, EmailStr
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
from collections import defaultdict, deque
import bcrypt
from file_processor import FileProcessor

# --- CONFIG ---
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Ollama Configuration (Local AI Models)
OLLAMA_API_URL = "http://localhost:11434/api/chat"
OLLAMA_MODELS_URL = "http://localhost:11434/api/tags"

# AI MODELS - SPECIALIZED MODELS FOR DIFFERENT TASKS
AI_MODELS = {
    "general": {
        "model": "men.01",
        "actual_model": "gemma2:2b",
        "description": "Fast conversational AI for general chat and university questions",
        "max_tokens": 2000
    },
    "code": {
        "model": "men.02",
        "actual_model": "phi3.5:3.8b",
        "description": "Advanced AI for code generation and programming",
        "max_tokens": 2000
    },
    "image": {
        "model": "men.03",
        "actual_model": "gemma2:2b",
        "description": "Fast AI for analysis and reasoning tasks",
        "max_tokens": 1500
    }
}

# JWT Configuration
JWT_SECRET_KEY = "your-super-secret-jwt-key-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Token Limits
TOKEN_LIMITS = {
    "guest": 100,      # 100 tokens per day for non-logged users
    "user": 80000      # 80,000 tokens per month for logged users
}

# Database
DATABASE_PATH = "chatbot.db"
VECTOR_STORE_PATH = "faiss_index.bin"
DOCS_STORE_PATH = "docs_store.npy"

# --- SECURITY CONFIG ---
MAX_MESSAGE_LENGTH = 2000
MAX_MESSAGES_PER_REQUEST = 20
RATE_LIMIT_REQUESTS = 30  # requests per minute per IP
RATE_LIMIT_WINDOW = 60   # seconds
BLOCKED_PATTERNS = [
    r'<script.*?>.*?</script>',  # XSS attempts
    r'javascript:',              # JavaScript injection
    r'data:text/html',          # Data URI attacks
    r'vbscript:',               # VBScript injection
    r'onload\s*=',              # Event handler injection
    r'onerror\s*=',             # Error handler injection
]

# Rate limiting storage (in production, use Redis)
rate_limit_storage = defaultdict(lambda: deque())
blocked_ips = set()

# Guest token tracking (IP-based daily limits)
guest_token_storage = defaultdict(lambda: {"tokens_used": 0, "reset_date": datetime.now().date()})

# Security
security = HTTPBearer(auto_error=False)

# --- DATABASE SETUP ---
def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            tokens_used_this_month INTEGER DEFAULT 0,
            tokens_reset_date TEXT DEFAULT CURRENT_TIMESTAMP,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')

    # Conversations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT DEFAULT 'New Chat',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            tokens_used INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    ''')

    # Uploaded files table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS uploaded_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            processed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()

    # Add role and is_active columns if they don't exist (migration)
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"')
        print("[INFO] Added role column to users table")
    except sqlite3.OperationalError:
        pass  # Column already exists

    try:
        cursor.execute('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1')
        print("[INFO] Added is_active column to users table")
    except sqlite3.OperationalError:
        pass  # Column already exists

    conn.commit()

    # Create or update admin user
    cursor.execute('SELECT id FROM users WHERE email = "admin@srmap.edu.in"')
    existing_admin = cursor.fetchone()

    if existing_admin:
        # Update existing user to admin role
        cursor.execute('UPDATE users SET role = "admin" WHERE email = "admin@srmap.edu.in"')
        conn.commit()
        print("[INFO] Updated existing user to admin role: admin@srmap.edu.in")
    else:
        # Create new admin user
        admin_password_hash = hash_password("admin123")
        cursor.execute('''
            INSERT INTO users (email, username, password_hash, role, tokens_used_this_month)
            VALUES (?, ?, ?, ?, ?)
        ''', ("admin@srmap.edu.in", "admin", admin_password_hash, "admin", 0))
        conn.commit()
        print("[INFO] Default admin user created: admin@srmap.edu.in / admin123")

    conn.close()

# --- AUTH FUNCTIONS ---
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: int, email: str) -> str:
    """Create JWT token for user"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    """Get current user from JWT token (optional)"""
    if not credentials:
        return None

    try:
        payload = verify_jwt_token(credentials.credentials)
        return payload
    except HTTPException:
        return None

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Get current admin user (required)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if not is_admin(current_user["user_id"]):
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user

def get_user_tokens_used(user_id: int) -> int:
    """Get tokens used by user this month"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Check if we need to reset monthly tokens
    cursor.execute('''
        SELECT tokens_used_this_month, tokens_reset_date
        FROM users WHERE id = ?
    ''', (user_id,))

    result = cursor.fetchone()
    if not result:
        conn.close()
        return 0

    tokens_used, reset_date = result
    reset_date = datetime.fromisoformat(reset_date)

    # Reset if it's a new month
    if reset_date.month != datetime.now().month or reset_date.year != datetime.now().year:
        cursor.execute('''
            UPDATE users
            SET tokens_used_this_month = 0, tokens_reset_date = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (user_id,))
        conn.commit()
        tokens_used = 0

    conn.close()
    return tokens_used

def update_user_tokens(user_id: int, tokens_used: int):
    """Update user's token usage"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users
        SET tokens_used_this_month = tokens_used_this_month + ?
        WHERE id = ?
    ''', (tokens_used, user_id))

    conn.commit()
    conn.close()

# --- CONVERSATION FUNCTIONS ---
def create_conversation(user_id: int, title: str = "New Chat") -> int:
    """Create a new conversation and return its ID"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO conversations (user_id, title)
        VALUES (?, ?)
    ''', (user_id, title))

    conversation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return conversation_id

def get_user_conversations(user_id: int) -> List[dict]:
    """Get all conversations for a user"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, title, created_at, updated_at
        FROM conversations
        WHERE user_id = ?
        ORDER BY updated_at DESC
    ''', (user_id,))

    conversations = []
    for row in cursor.fetchall():
        conversations.append({
            "id": row[0],
            "title": row[1],
            "created_at": row[2],
            "updated_at": row[3]
        })

    conn.close()
    return conversations

def get_conversation_messages(conversation_id: int, user_id: int) -> List[dict]:
    """Get all messages for a conversation"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Verify user owns this conversation
    cursor.execute('''
        SELECT id FROM conversations
        WHERE id = ? AND user_id = ?
    ''', (conversation_id, user_id))

    if not cursor.fetchone():
        conn.close()
        return []

    cursor.execute('''
        SELECT role, content, tokens_used, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
    ''', (conversation_id,))

    messages = []
    for row in cursor.fetchall():
        messages.append({
            "role": row[0],
            "content": row[1],
            "tokens_used": row[2],
            "created_at": row[3]
        })

    conn.close()
    return messages

def save_message(conversation_id: int, role: str, content: str, tokens_used: int = 0):
    """Save a message to the database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO messages (conversation_id, role, content, tokens_used)
        VALUES (?, ?, ?, ?)
    ''', (conversation_id, role, content, tokens_used))

    # Update conversation updated_at
    cursor.execute('''
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (conversation_id,))

    conn.commit()
    conn.close()

def update_conversation_title(conversation_id: int, user_id: int, title: str):
    """Update conversation title"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE conversations
        SET title = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    ''', (title, conversation_id, user_id))

    conn.commit()
    conn.close()

def generate_conversation_title(first_message: str) -> str:
    """Generate a meaningful title from the first message"""
    # Simple title generation - take first few words
    words = first_message.split()[:4]
    title = " ".join(words)
    if len(title) > 30:
        title = title[:27] + "..."
    return title or "New Chat"

# --- ADMIN FUNCTIONS ---
def is_admin(user_id: int) -> bool:
    """Check if user is admin"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
    result = cursor.fetchone()
    conn.close()

    return result and result[0] == "admin"

def get_all_users() -> List[dict]:
    """Get all users for admin dashboard"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, email, username, role, tokens_used_this_month,
               created_at, last_login, is_active
        FROM users
        ORDER BY created_at DESC
    ''')

    users = []
    for row in cursor.fetchall():
        users.append({
            "id": row[0],
            "email": row[1],
            "username": row[2],
            "role": row[3],
            "tokens_used": row[4],
            "created_at": row[5],
            "last_login": row[6],
            "is_active": bool(row[7])
        })

    conn.close()
    return users

def update_user_role(user_id: int, new_role: str) -> bool:
    """Update user role (admin only)"""
    if new_role not in ["user", "admin"]:
        return False

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users SET role = ? WHERE id = ?
    ''', (new_role, user_id))

    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def toggle_user_status(user_id: int) -> bool:
    """Toggle user active/inactive status"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users SET is_active = CASE
            WHEN is_active = 1 THEN 0
            ELSE 1
        END
        WHERE id = ?
    ''', (user_id,))

    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success

def get_system_stats() -> dict:
    """Get system statistics for admin dashboard"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Total users
    cursor.execute('SELECT COUNT(*) FROM users')
    total_users = cursor.fetchone()[0]

    # Active users (logged in last 7 days)
    cursor.execute('''
        SELECT COUNT(*) FROM users
        WHERE datetime(last_login) > datetime('now', '-7 days')
    ''')
    active_users = cursor.fetchone()[0]

    # Total conversations
    cursor.execute('SELECT COUNT(*) FROM conversations')
    total_conversations = cursor.fetchone()[0]

    # Total messages
    cursor.execute('SELECT COUNT(*) FROM messages')
    total_messages = cursor.fetchone()[0]

    # Tokens used today
    cursor.execute('''
        SELECT SUM(tokens_used) FROM messages
        WHERE date(created_at) = date('now')
    ''')
    tokens_today = cursor.fetchone()[0] or 0

    conn.close()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "tokens_used_today": tokens_today
    }

def get_all_conversations_admin() -> List[dict]:
    """Get all conversations for admin monitoring"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT c.id, c.title, c.created_at, c.updated_at,
               u.username, u.email,
               COUNT(m.id) as message_count
        FROM conversations c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN messages m ON c.id = m.conversation_id
        GROUP BY c.id
        ORDER BY c.updated_at DESC
        LIMIT 100
    ''')

    conversations = []
    for row in cursor.fetchall():
        conversations.append({
            "id": row[0],
            "title": row[1],
            "created_at": row[2],
            "updated_at": row[3],
            "username": row[4],
            "email": row[5],
            "message_count": row[6]
        })

    conn.close()
    return conversations

# --- SECURITY FUNCTIONS ---
def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

def is_rate_limited(ip: str) -> bool:
    """Check if IP is rate limited"""
    if ip in blocked_ips:
        return True

    now = time.time()
    requests = rate_limit_storage[ip]

    # Remove old requests outside the window
    while requests and requests[0] < now - RATE_LIMIT_WINDOW:
        requests.popleft()

    # Check if rate limit exceeded
    if len(requests) >= RATE_LIMIT_REQUESTS:
        blocked_ips.add(ip)  # Temporarily block aggressive IPs
        return True

    # Add current request
    requests.append(now)
    return False

def get_guest_tokens_used(ip: str) -> int:
    """Get tokens used by guest IP today"""
    guest_data = guest_token_storage[ip]
    today = datetime.now().date()

    # Reset if it's a new day
    if guest_data["reset_date"] != today:
        guest_data["tokens_used"] = 0
        guest_data["reset_date"] = today

    return guest_data["tokens_used"]

def update_guest_tokens(ip: str, tokens_used: int):
    """Update guest IP token usage"""
    guest_data = guest_token_storage[ip]
    today = datetime.now().date()

    # Reset if it's a new day
    if guest_data["reset_date"] != today:
        guest_data["tokens_used"] = 0
        guest_data["reset_date"] = today

    guest_data["tokens_used"] += tokens_used

def is_guest_limit_exceeded(ip: str, additional_tokens: int = 0) -> bool:
    """Check if guest would exceed daily limit"""
    current_tokens = get_guest_tokens_used(ip)
    return (current_tokens + additional_tokens) > TOKEN_LIMITS["guest"]

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS and injection attacks"""
    if not text or not isinstance(text, str):
        return ""

    # Check for blocked patterns
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise HTTPException(status_code=400, detail="Invalid input detected")

    # Basic sanitization
    text = text.strip()
    text = re.sub(r'[<>"\']', '', text)  # Remove potentially dangerous characters

    return text

def validate_messages(messages: List[dict]) -> List[dict]:
    """Validate and sanitize message list"""
    if not messages or len(messages) > MAX_MESSAGES_PER_REQUEST:
        raise HTTPException(status_code=400, detail="Invalid message count")

    validated_messages = []
    for msg in messages:
        if not isinstance(msg, dict) or "content" not in msg or "role" not in msg:
            raise HTTPException(status_code=400, detail="Invalid message format")

        content = sanitize_input(msg["content"])
        if len(content) > MAX_MESSAGE_LENGTH:
            raise HTTPException(status_code=400, detail="Message too long")

        role = msg["role"]
        if role not in ["user", "assistant", "system"]:
            raise HTTPException(status_code=400, detail="Invalid message role")

        validated_messages.append({"role": role, "content": content})

    return validated_messages

# --- PYDANTIC MODELS ---
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChatRequest(BaseModel):
    messages: List[dict] = Field(..., min_length=1, max_length=MAX_MESSAGES_PER_REQUEST)
    task_type: str = Field(default="general", pattern="^(general|code|image)$")
    conversation_id: Optional[int] = None

    @validator('messages')
    def validate_messages_format(cls, v):
        """Validate message format and content"""
        return validate_messages(v)

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ConversationUpdate(BaseModel):
    title: str

class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(user|admin)$")

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

# --- INIT ---
app = FastAPI(title="Mentor Chatbot API", version="3.0.0")

# Initialize file processor
file_processor = FileProcessor()

# Initialize database
init_database()

# Secure CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-domain.vercel.app"  # Add your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

model = SentenceTransformer(EMBEDDING_MODEL)

# --- LOAD VECTOR STORE ---
if os.path.exists(VECTOR_STORE_PATH) and os.path.exists(DOCS_STORE_PATH):
    index = faiss.read_index(VECTOR_STORE_PATH)
    docs = np.load(DOCS_STORE_PATH, allow_pickle=True).tolist()
else:
    index = faiss.IndexFlatL2(384)
    docs = []
    print("[WARNING] FAISS index or docs store not found. Please run ingest.py first.")

def search_index(query, top_k=4):
    if index.ntotal == 0:
        return []
    q_emb = model.encode([query]).astype(np.float32)
    D, I = index.search(q_emb, top_k)
    return [docs[i] for i in I[0] if i < len(docs)]

def is_university_question(user_input):
    university_keywords = [
        "university", "semester", "course", "syllabus", "exam", "professor", "faculty", "department",
        "admission", "grade", "credits", "class", "lecture", "assignment", "student", "campus",
        "CSE", "PHY", "coding skills", "probability", "statistics", "web technology", "database"
    ]
    return any(word.lower() in user_input.lower() for word in university_keywords)

# --- AUTH ENDPOINTS ---
@app.post("/auth/register")
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ? OR username = ?',
                      (user_data.email, user_data.username))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User already exists")

        # Hash password and create user
        password_hash = hash_password(user_data.password)
        cursor.execute('''
            INSERT INTO users (email, username, password_hash)
            VALUES (?, ?, ?)
        ''', (user_data.email, user_data.username, password_hash))

        user_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # Create JWT token
        token = create_jwt_token(user_id, user_data.email)

        return JSONResponse(content={
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "email": user_data.email,
                "username": user_data.username,
                "tokens_remaining": TOKEN_LIMITS["user"]
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/auth/login")
async def login(user_data: UserLogin):
    """Login user"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Get user
        cursor.execute('''
            SELECT id, username, password_hash, tokens_used_this_month, role
            FROM users WHERE email = ?
        ''', (user_data.email,))

        user = cursor.fetchone()
        if not user or not verify_password(user_data.password, user[2]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_id, username, _, tokens_used, role = user

        # Update last login
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()

        # Create JWT token
        token = create_jwt_token(user_id, user_data.email)

        return JSONResponse(content={
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user_id,
                "email": user_data.email,
                "username": username,
                "role": role or "user",
                "tokens_used": tokens_used,
                "tokens_remaining": TOKEN_LIMITS["user"] - tokens_used
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT username, email, tokens_used_this_month, created_at, role
            FROM users WHERE id = ?
        ''', (current_user["user_id"],))

        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        username, email, tokens_used, created_at, role = user
        conn.close()

        return JSONResponse(content={
            "user": {
                "id": current_user["user_id"],
                "email": email,
                "username": username,
                "role": role or "user",
                "tokens_used": tokens_used,
                "tokens_remaining": TOKEN_LIMITS["user"] - tokens_used,
                "created_at": created_at
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Get user info failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user info")

# --- CONVERSATION ENDPOINTS ---
@app.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for the current user"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        conversations = get_user_conversations(current_user["user_id"])
        return JSONResponse(content={"conversations": conversations})
    except Exception as e:
        print(f"[ERROR] Get conversations failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get conversations")

@app.post("/conversations")
async def create_new_conversation(
    conversation_data: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new conversation"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        conversation_id = create_conversation(
            current_user["user_id"],
            conversation_data.title
        )
        return JSONResponse(content={
            "conversation_id": conversation_id,
            "title": conversation_data.title
        })
    except Exception as e:
        print(f"[ERROR] Create conversation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")

@app.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages_endpoint(
    conversation_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get all messages for a specific conversation"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        messages = get_conversation_messages(conversation_id, current_user["user_id"])
        return JSONResponse(content={"messages": messages})
    except Exception as e:
        print(f"[ERROR] Get conversation messages failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get messages")

@app.put("/conversations/{conversation_id}")
async def update_conversation_title_endpoint(
    conversation_id: int,
    conversation_data: ConversationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update conversation title"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        update_conversation_title(
            conversation_id,
            current_user["user_id"],
            conversation_data.title
        )
        return JSONResponse(content={"message": "Title updated successfully"})
    except Exception as e:
        print(f"[ERROR] Update conversation title failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update title")

# --- ADMIN ENDPOINTS ---
@app.post("/admin/login")
async def admin_login(admin_data: AdminLogin):
    """Admin login with separate authentication"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Get admin user
        cursor.execute('''
            SELECT id, username, password_hash, role
            FROM users WHERE email = ? AND role = 'admin'
        ''', (admin_data.email,))

        user = cursor.fetchone()
        if not user or not verify_password(admin_data.password, user[2]):
            raise HTTPException(status_code=401, detail="Invalid admin credentials")

        user_id, username, _, role = user

        # Update last login
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()

        # Create JWT token
        token = create_jwt_token(user_id, admin_data.email)

        return JSONResponse(content={
            "message": "Admin login successful",
            "token": token,
            "user": {
                "id": user_id,
                "email": admin_data.email,
                "username": username,
                "role": role
            }
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Admin login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Admin login failed")

@app.get("/admin/stats")
async def get_admin_stats(admin_user: dict = Depends(get_admin_user)):
    """Get system statistics for admin dashboard"""
    try:
        stats = get_system_stats()
        return JSONResponse(content={"stats": stats})
    except Exception as e:
        print(f"[ERROR] Get admin stats failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")

@app.get("/admin/users")
async def get_all_users_admin(admin_user: dict = Depends(get_admin_user)):
    """Get all users for admin management"""
    try:
        users = get_all_users()
        return JSONResponse(content={"users": users})
    except Exception as e:
        print(f"[ERROR] Get all users failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get users")

@app.put("/admin/users/{user_id}/role")
async def update_user_role_endpoint(
    user_id: int,
    role_data: UserRoleUpdate,
    admin_user: dict = Depends(get_admin_user)
):
    """Update user role (admin only)"""
    try:
        success = update_user_role(user_id, role_data.role)
        if success:
            return JSONResponse(content={"message": f"User role updated to {role_data.role}"})
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Update user role failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update user role")

@app.put("/admin/users/{user_id}/toggle-status")
async def toggle_user_status_endpoint(
    user_id: int,
    admin_user: dict = Depends(get_admin_user)
):
    """Toggle user active/inactive status"""
    try:
        success = toggle_user_status(user_id)
        if success:
            return JSONResponse(content={"message": "User status toggled successfully"})
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Toggle user status failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to toggle user status")

@app.get("/admin/conversations")
async def get_all_conversations_admin_endpoint(admin_user: dict = Depends(get_admin_user)):
    """Get all conversations for admin monitoring"""
    try:
        conversations = get_all_conversations_admin()
        return JSONResponse(content={"conversations": conversations})
    except Exception as e:
        print(f"[ERROR] Get admin conversations failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get conversations")

# --- FILE UPLOAD ENDPOINTS ---
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload and process files with AI analysis"""

    try:
        # Set file size limits based on authentication
        if current_user:
            MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB for logged in users
            user_id = current_user["user_id"]
        else:
            MAX_FILE_SIZE = 2 * 1024 * 1024   # 2MB for guests
            user_id = None

        file_content = await file.read()

        if len(file_content) > MAX_FILE_SIZE:
            limit_mb = MAX_FILE_SIZE // (1024 * 1024)
            auth_msg = "Sign up for 10MB limit!" if not current_user else ""
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {limit_mb}MB. {auth_msg}")

        # Process the file
        result = file_processor.process_file(
            file_content=file_content,
            filename=file.filename,
            file_type=file.content_type
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "File processing failed"))

        # Store file info in database (optional, only for logged in users)
        file_id = None
        if user_id:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO uploaded_files (user_id, filename, file_type, file_size, processed_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user_id, file.filename, result["file_type"], result["file_size"]))

            file_id = cursor.lastrowid
            conn.commit()
            conn.close()

        return JSONResponse(content={
            "message": "File processed successfully",
            "file_id": file_id,
            "filename": file.filename,
            "analysis": {
                "content_type": result.get("content_type"),
                "analysis_type": result.get("analysis_type"),
                "summary": result.get("summary"),
                "text_content": result.get("text_content", "")[:1000] + "..." if len(result.get("text_content", "")) > 1000 else result.get("text_content", "")
            },
            "full_content": result.get("text_content", "")
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] File upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="File upload failed")

@app.post("/analyze-file")
async def analyze_file_with_ai(
    request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Analyze uploaded file content with AI"""
    # Allow both guests and logged in users

    try:
        file_content = request.get("file_content", "")
        question = request.get("question", "Please analyze this file and provide insights.")
        file_type = request.get("file_type", "unknown")

        if not file_content:
            raise HTTPException(status_code=400, detail="No file content provided")

        # Create analysis prompt based on file type
        analysis_prompts = {
            "code": "You are a code analysis expert. Analyze this code for bugs, improvements, and best practices:",
            "document": "You are a document analysis expert. Summarize and analyze this document:",
            "image": "You are an OCR and image analysis expert. Analyze this extracted text from an image:",
            "data": "You are a data analysis expert. Analyze this data and provide insights:",
            "spreadsheet": "You are a spreadsheet analysis expert. Analyze this data and provide insights:"
        }

        system_prompt = analysis_prompts.get(file_type, "You are a file analysis expert. Analyze this content:")

        # Prepare AI request
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"File content:\n{file_content}\n\nQuestion: {question}"}
        ]

        # Use general model for file analysis
        model_config = AI_MODELS.get("general", AI_MODELS["general"])
        selected_model = model_config["actual_model"]

        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": False
        }

        # Make API request to Ollama
        response = requests.post(
            OLLAMA_API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=120
        )

        if response.status_code == 200:
            data = response.json()
            answer = data["message"]["content"]

            return JSONResponse(content={
                "analysis": answer,
                "file_type": file_type,
                "model_used": model_config["model"]
            })
        else:
            raise HTTPException(status_code=503, detail="AI analysis service unavailable")

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] File analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="File analysis failed")

# --- CHAT ENDPOINT ---
@app.post("/chat")
async def chat(req: ChatRequest, request: Request, current_user: dict = Depends(get_current_user)):
    # Rate limiting check
    client_ip = get_client_ip(request)
    if is_rate_limited(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )

    try:
        # Check token limits
        is_authenticated = current_user is not None
        if is_authenticated:
            user_id = current_user["user_id"]
            tokens_used = get_user_tokens_used(user_id)
            token_limit = TOKEN_LIMITS["user"]

            if tokens_used >= token_limit:
                raise HTTPException(
                    status_code=429,
                    detail=f"Monthly token limit ({token_limit}) exceeded. Limit resets next month."
                )
        else:
            # Guest user - IP-based daily tracking
            token_limit = TOKEN_LIMITS["guest"]

            # Estimate tokens for this request
            user_message = req.messages[-1]["content"]
            estimated_tokens = len(user_message.split()) * 2  # Rough estimate including response

            # Check if guest would exceed daily limit
            if is_guest_limit_exceeded(client_ip, estimated_tokens):
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "daily_limit_exceeded",
                        "message": f"Daily limit of {token_limit} tokens exceeded. Sign up for 80,000 tokens/month!",
                        "tokens_used": get_guest_tokens_used(client_ip),
                        "tokens_limit": token_limit,
                        "reset_time": "midnight"
                    }
                )

        # Get user message (already validated by pydantic)
        user_message = req.messages[-1]["content"]

        # Handle conversation for authenticated users
        conversation_id = None
        if is_authenticated:
            if req.conversation_id:
                # Use existing conversation
                conversation_id = req.conversation_id
            else:
                # Create new conversation
                title = generate_conversation_title(user_message)
                conversation_id = create_conversation(user_id, title)

        # University context retrieval
        context_chunks = []
        context_type = "general"
        if is_university_question(user_message):
            context_chunks = search_index(user_message)
            context = "\n".join([c["text"] for c in context_chunks])
            context_type = "university" if context_chunks else "general"
        else:
            context = ""

        # Select AI model based on task type
        model_config = AI_MODELS.get(req.task_type, AI_MODELS["general"])
        selected_model = model_config["actual_model"]
        display_model = model_config["model"]

        # System prompt
        system_prompt = (
            "You are Mentor, a caring and supportive AI teacher for SRM University AP students, created by Kommi Nithin.\n"
            "- Always greet back warmly when someone says hi/hello (like 'Hi there! 😊' or 'Hello! Great to see you!')\n"
            "- Be like a friendly, encouraging teacher who genuinely cares about students\n"
            "- Use warm, supportive language with appropriate emojis\n"
            "- Always be positive, encouraging, and ready to help with anything\n"
            "- Show enthusiasm for helping students learn and grow\n"
            "- Be conversational and approachable, never formal or distant\n"
            "- Make every student feel valued and supported\n"
            "- Respond with the warmth and care of a favorite teacher"
        )
        if context:
            system_prompt += f"\n\nContext:\n{context}"

        # Prepare Ollama API request
        payload = {
            "model": selected_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                *req.messages
            ],
            "stream": False
        }
        headers = {
            "Content-Type": "application/json"
        }

        # Make API request to Ollama
        response = requests.post(
            OLLAMA_API_URL,
            json=payload,
            headers=headers,
            timeout=120  # Increased timeout for model loading
        )

        if response.status_code == 200:
            data = response.json()
            answer = data["message"]["content"]

            # Calculate tokens used (approximate)
            tokens_used_estimate = len(user_message.split()) + len(answer.split())

            # Update user tokens if authenticated
            if is_authenticated:
                update_user_tokens(user_id, tokens_used_estimate)
                remaining_tokens = token_limit - get_user_tokens_used(user_id)

                # Save messages to conversation
                if conversation_id:
                    save_message(conversation_id, "user", user_message, 0)
                    save_message(conversation_id, "assistant", answer, tokens_used_estimate)
            else:
                # Update guest tokens
                update_guest_tokens(client_ip, tokens_used_estimate)
                remaining_tokens = token_limit - get_guest_tokens_used(client_ip)

            # If university context, append citation
            if context_type == "university" and context_chunks:
                source_url = context_chunks[0]["source"]
                answer += f"\n\nLearn more: [{source_url}]({source_url})"

            return JSONResponse(content={
                "answer": answer,
                "context_type": context_type,
                "sources_used": len(context_chunks),
                "tokens_used": tokens_used_estimate,
                "tokens_remaining": max(0, remaining_tokens),
                "model_used": display_model,
                "is_authenticated": is_authenticated,
                "conversation_id": conversation_id
            })
        else:
            # Log error for debugging
            print(f"[ERROR] Ollama API failed: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=503,
                detail="AI service temporarily unavailable. Please try again."
            )

    except HTTPException:
        # Re-raise HTTP exceptions (rate limiting, validation errors)
        raise
    except Exception as e:
        # Log unexpected errors
        print(f"[ERROR] Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again."
        )

# --- HEALTH CHECK ENDPOINT ---
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "features": {
            "input_validation": True,
            "rate_limiting": True,
            "cors_security": True,
            "error_handling": True
        }
    }

# --- METRICS ENDPOINT ---
@app.get("/metrics")
async def get_metrics():
    """Basic metrics for monitoring"""
    return {
        "active_rate_limits": len(rate_limit_storage),
        "blocked_ips": len(blocked_ips),
        "vector_store_docs": len(docs) if docs else 0,
        "faiss_index_size": index.ntotal if index else 0
    }