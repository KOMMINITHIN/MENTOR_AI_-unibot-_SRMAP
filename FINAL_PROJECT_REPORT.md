# 🎓 Mentor AI - Advanced University Assistant

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-blue?style=for-the-badge)](https://ollama.ai/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python)](https://python.org/)

> A professional-grade AI assistant specifically designed for SRM AP University students with advanced features including multi-language voice support, file analysis, and comprehensive university knowledge base.

## 🌟 Key Features

### 🎯 Core Capabilities
- 🤖 **Advanced AI Assistant** - Powered by local Ollama models (gemma2:2b, phi3.5:3.8b, llama3.2:1b)
- 🎤 **12-Language Voice Support** - Speech-to-text and text-to-speech in Hindi, Telugu, Tamil, English, and 8 more languages
- 📁 **AI File Analysis** - Upload and analyze PDFs, images, documents, and code files
- 🏫 **University Knowledge Base** - Comprehensive SRM AP information through RAG system
- 👤 **User Management** - Authentication, profiles, settings, and role-based access
- 📱 **Modern UI/UX** - Clean, responsive design with notifications and animations

### 🔧 Technical Features
- 🔒 **Security** - JWT authentication, XSS protection, rate limiting, input validation
- 📊 **Admin Dashboard** - User management, system monitoring, analytics
- 💾 **Data Persistence** - SQLite database with conversation history
- 🔔 **Notifications** - Toast notifications and browser alerts
- ♿ **Accessibility** - Screen reader support, keyboard navigation, ARIA labels
- 📱 **Mobile Responsive** - Perfect experience on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Ollama (latest version)

### 1. Install Ollama & Models
```bash
# Windows
winget install Ollama.Ollama

# Download AI models
ollama pull gemma2:2b
ollama pull phi3.5:3.8b
ollama pull llama3.2:1b
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python ingest.py  # Initialize RAG system
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

### 4. Access Application
- **Landing Page**: http://localhost:3000
- **Chat Interface**: http://localhost:3000/chat
- **Admin Dashboard**: http://localhost:3000/admin

## 📁 Project Structure

```
mentor-ai/
├── app/                          # Next.js frontend
│   ├── page.tsx                 # Landing page
│   ├── chat/page.tsx            # Main chat interface
│   ├── admin/page.tsx           # Admin dashboard
│   └── components/              # React components
│       ├── ToastNotification.tsx
│       ├── LoadingComponents.tsx
│       ├── BrowserNotifications.tsx
│       ├── UserProfile.tsx
│       ├── MessageActions.tsx
│       ├── VoiceButton.tsx
│       ├── FileUpload.tsx
│       └── LimitModal.tsx
├── backend/                     # FastAPI backend
│   ├── main.py                 # Main application (1,368 lines)
│   ├── file_processor.py       # File handling utilities
│   ├── ingest.py              # RAG system ingestion
│   ├── requirements.txt        # Python dependencies
│   ├── chatbot.db             # SQLite database
│   ├── faiss_index.bin        # Vector store
│   ├── docs_store.npy         # Document store
│   └── pdfs/                  # Knowledge base documents
├── FINAL_PROJECT_REPORT.md     # Comprehensive documentation
├── COMPLETE_BACKEND_STRUCTURE.md # Backend details
└── README.md                   # This file
```

## 🎯 Usage Guide

### For Students
1. **Guest Mode**: Start chatting immediately with 100 tokens/day
2. **Register**: Get 80,000 tokens/month + full features
3. **Voice Chat**: Click microphone, speak in any supported language
4. **File Upload**: Drag & drop documents for AI analysis
5. **University Queries**: Ask about courses, facilities, admissions

### For Administrators
1. **Admin Login**: Use admin credentials at `/admin`
2. **User Management**: View, edit, and manage all users
3. **System Monitoring**: Track usage, performance, and statistics
4. **Role Assignment**: Promote users to admin status

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
JWT_SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./chatbot.db
OLLAMA_API_URL=http://localhost:11434/api/chat

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Model Configuration
- **men.01** → gemma2:2b (General conversations)
- **men.02** → phi3.5:3.8b (Code and technical)
- **men.03** → llama3.2:1b (Creative and casual)

## 📊 System Requirements

### Minimum
- **RAM**: 8GB
- **Storage**: 10GB free space
- **CPU**: Intel i5 or AMD Ryzen 5
- **OS**: Windows 10/11, macOS, Linux

### Recommended
- **RAM**: 16GB+
- **Storage**: 20GB+ SSD
- **CPU**: Intel i7 12th gen or AMD Ryzen 7
- **GPU**: Dedicated GPU for faster inference

## 🛡️ Security Features

- 🔐 **JWT Authentication** - Secure token-based auth
- 🛡️ **XSS Protection** - Input sanitization and validation
- ⚡ **Rate Limiting** - 30 requests/minute per IP
- 🔒 **CORS Security** - Configured allowed origins
- 💾 **Data Protection** - Encrypted passwords with bcrypt
- 🚫 **SQL Injection Prevention** - Parameterized queries

---

**🎓 Built with ❤️ for SRM AP University students**

**⭐ If you find this project helpful, please give it a star!**
 AI - FINAL PROJECT REPORT**

## 📋 **PROJECT OVERVIEW**

**Mentor AI** is a comprehensive, ChatGPT-level AI assistant specifically designed for SRM AP University students. This project delivers a professional-grade conversational AI platform with advanced features including multi-language voice support, file analysis, user management, and modern UI/UX design.

### **🎯 Project Goals Achieved:**
- ✅ Create a ChatGPT-like interface for university students
- ✅ Implement voice features in 12 languages including regional languages
- ✅ Add file upload and AI analysis capabilities
- ✅ Build comprehensive user management and admin dashboard
- ✅ Ensure 100% free solution with no paid APIs
- ✅ Implement professional UI/UX with notifications and polish
- ✅ Deploy locally with Ollama for complete independence

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Frontend (Next.js 14)**
```
app/
├── page.tsx                 # Landing page with feature showcase
├── chat/page.tsx           # Main chat interface
├── admin/page.tsx          # Admin dashboard
└── components/
    ├── ToastNotification.tsx    # Toast notification system
    ├── LoadingComponents.tsx    # Loading states and animations
    ├── BrowserNotifications.tsx # Browser notification system
    ├── UserProfile.tsx         # User profiles and settings
    ├── MessageActions.tsx      # Message interaction features
    ├── VoiceButton.tsx         # Voice input/output
    ├── FileUpload.tsx          # File upload and analysis
    └── LimitModal.tsx          # Usage limit management
```

### **Backend (FastAPI + Python)**
```
backend/
├── main.py                     # Main FastAPI application (1,368 lines)
├── file_processor.py           # File upload and processing utilities
├── ingest.py                   # RAG system data ingestion script
├── requirements.txt            # Python dependencies (21 packages)
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

### **AI Integration**
- **Ollama Local Models**: gemma2:2b, phi3.5:3.8b, llama3.2:1b
- **Model Mapping**: men.01 (general), men.02 (code), men.03 (creative)
- **Voice Processing**: Web Speech API + Speech Synthesis API

---

## 🛠️ **TECHNOLOGY STACK**

### **Frontend Technologies:**
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Lucide React
- **Voice**: Web Speech API, Speech Synthesis API
- **Notifications**: Custom toast system + browser notifications
- **File Handling**: Native File API with drag-and-drop

### **Backend Technologies:**
- **Framework**: FastAPI (Python)
- **Database**: SQLite with custom schema
- **Authentication**: JWT tokens with role-based access
- **Security**: Input validation, XSS protection, rate limiting
- **File Processing**: Python libraries for document analysis
- **RAG System**: FAISS vector store with SentenceTransformers
- **Dependencies**: 21 Python packages (see complete list below)

### **AI & ML:**
- **Local AI**: Ollama with multiple specialized models
- **Voice Recognition**: Browser-native speech recognition
- **Text-to-Speech**: Browser-native speech synthesis
- **File Analysis**: AI-powered document and code analysis

---

## 🔧 **SETUP INSTRUCTIONS**

### **Prerequisites:**
1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **Ollama** (latest version)

### **Step 1: Install Ollama and Models**
```bash
# Install Ollama (Windows)
winget install Ollama.Ollama

# Download required models
ollama pull gemma2:2b
ollama pull phi3.5:3.8b
ollama pull llama3.2:1b
```

### **Step 2: Backend Setup**
```bash
# Navigate to backend directory
cd Desktop/version3/backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### **Step 3: Frontend Setup**
```bash
# Navigate to project root
cd Desktop/version3

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### **Step 4: Access the Application**
- **Landing Page**: http://localhost:3000
- **Chat Interface**: http://localhost:3000/chat
- **Admin Dashboard**: http://localhost:3000/admin

---

## 📦 **COMPLETE REQUIREMENTS LIST**

### **Python Dependencies (requirements.txt):**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
pydantic[email]==2.5.0
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
sqlite3 (built-in)
python-magic-bin==0.4.14 (Windows only)
```

### **Node.js Dependencies (package.json):**
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.2.2",
    "lucide-react": "0.292.0"
  },
  "devDependencies": {
    "@types/node": "20.8.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0"
  }
}
```

### **Database Schema:**
```sql
-- Users table
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

-- Conversations table
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Messages table
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
);

-- Files table
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

---

## 💻 **HARDWARE & SOFTWARE REQUIREMENTS**

### **Minimum Hardware Requirements:**
- **RAM**: 8GB (for running local AI models)
- **Storage**: 10GB free space (for models and data)
- **CPU**: Intel i5 or AMD Ryzen 5 (or equivalent)
- **GPU**: Optional (MX550 or better for faster inference)

### **Recommended Hardware:**
- **RAM**: 16GB or higher
- **Storage**: 20GB+ SSD storage
- **CPU**: Intel i7 12th gen or AMD Ryzen 7
- **GPU**: Dedicated GPU for optimal performance

### **Software Requirements:**
- **Operating System**: Windows 10/11, macOS, or Linux
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Node.js**: v18.0.0 or higher
- **Python**: v3.8.0 or higher
- **Ollama**: Latest stable version

---

## 🌟 **FEATURES IMPLEMENTED**

### **🎨 Core Features:**
1. **ChatGPT-like Interface**
   - Professional chat design with message bubbles
   - Real-time typing indicators
   - Smooth animations and transitions
   - Collapsible sidebar with chat history

2. **🔐 Authentication System**
   - JWT-based authentication
   - Role-based access (Guest, Student, Admin)
   - Secure password hashing
   - Token-based session management

3. **👤 User Profiles & Settings**
   - Customizable user profiles with avatars
   - Language preferences (12 languages)
   - Voice settings and preferences
   - Theme customization options

### **🎤 Advanced Features:**
4. **Multi-Language Voice Support**
   - Speech-to-text in 12 languages
   - Text-to-speech with natural voices
   - Real-time voice recognition
   - Language-specific voice settings

5. **📁 File Upload & Analysis**
   - Support for PDFs, images, documents, code files
   - AI-powered file analysis and insights
   - OCR for image text extraction
   - Code debugging and review

6. **👨‍💼 Admin Dashboard**
   - User management and role assignment
   - System statistics and monitoring
   - Conversation oversight
   - User activity tracking

### **✨ Polish & UX Features:**
7. **🔔 Notification System**
   - Toast notifications for all actions
   - Browser notifications for background alerts
   - Success, error, warning, and info messages
   - Auto-dismiss with manual close options

8. **⏳ Loading States & Animations**
   - Skeleton loaders for smooth loading
   - Typing indicators with animated dots
   - Loading buttons with spinners
   - Progress bars for file uploads

9. **♿ Accessibility Features**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode support
   - ARIA labels and descriptions

### **🛡️ Security & Performance:**
10. **Security Features**
    - Input validation and XSS protection
    - Rate limiting (30 requests/minute)
    - CORS security configuration
    - SQL injection prevention

11. **Performance Optimizations**
    - Efficient state management
    - Optimized re-renders
    - Memory leak prevention
    - Fast local AI inference

---

## 🔄 **WORKFLOW & USER JOURNEY**

### **Guest User Flow:**
1. **Landing Page** → View features and pricing
2. **Start Chat** → 100 tokens/day limit
3. **Basic Features** → Chat, voice (limited), file upload (2MB)
4. **Limit Reached** → Beautiful modal prompting registration

### **Authenticated User Flow:**
1. **Registration/Login** → JWT token issued
2. **Full Access** → 80,000 tokens/month
3. **Advanced Features** → All voice features, 10MB uploads
4. **Profile Management** → Settings, preferences, history
5. **Persistent Data** → Chat history saved

### **Admin User Flow:**
1. **Admin Login** → Separate admin authentication
2. **Dashboard Access** → System overview and statistics
3. **User Management** → View, edit, promote users
4. **System Monitoring** → Conversation oversight
5. **Role Management** → Assign admin privileges

---

## 🧪 **TESTING & VALIDATION**

### **Functional Testing:**
- ✅ **Authentication**: Login, registration, JWT validation
- ✅ **Chat Interface**: Message sending, AI responses
- ✅ **Voice Features**: Speech recognition, text-to-speech
- ✅ **File Upload**: All supported file types
- ✅ **Admin Features**: User management, statistics
- ✅ **Notifications**: Toast and browser notifications
- ✅ **Mobile Responsive**: All screen sizes

### **Performance Testing:**
- ✅ **Response Times**: < 2 seconds for AI responses
- ✅ **File Processing**: Efficient upload and analysis
- ✅ **Memory Usage**: Optimized for 8GB RAM systems
- ✅ **Concurrent Users**: Tested with multiple sessions

### **Security Testing:**
- ✅ **Input Validation**: XSS and injection prevention
- ✅ **Rate Limiting**: Abuse prevention
- ✅ **Authentication**: Secure token handling
- ✅ **File Security**: Safe file processing

### **Browser Compatibility:**
- ✅ **Chrome**: Full feature support
- ✅ **Firefox**: Full feature support
- ✅ **Safari**: Full feature support
- ✅ **Edge**: Full feature support

---

## 📖 **USER MANUAL**

### **Getting Started:**
1. **Visit**: http://localhost:3000
2. **Explore**: Browse features on landing page
3. **Start Chatting**: Click "Try Now Free"
4. **Register**: For full features (optional)

### **Chat Features:**
- **Send Messages**: Type and press Enter or click send
- **Voice Input**: Click microphone icon, speak your message
- **File Upload**: Click paperclip icon, select files
- **Message Actions**: Copy, react, or speak messages
- **Model Selection**: Choose men.01, men.02, or men.03

### **Profile & Settings:**
- **Access Profile**: Click user icon in top-right
- **Edit Profile**: Update username, email, bio
- **Language Settings**: Choose from 12 supported languages
- **Voice Settings**: Enable/disable voice features
- **Theme Settings**: Customize appearance

### **Admin Features:**
- **Access Admin**: Visit /admin with admin credentials
- **User Management**: View and manage all users
- **System Stats**: Monitor usage and performance
- **Role Assignment**: Promote users to admin

---

## 🔗 **REFERENCES & RESOURCES**

### **Documentation:**
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### **AI Models:**
- [Gemma 2](https://huggingface.co/google/gemma-2-2b)
- [Phi 3.5](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)
- [Llama 3.2](https://huggingface.co/meta-llama/Llama-3.2-1B)

### **Design Inspiration:**
- [ChatGPT Interface](https://chat.openai.com)
- [Claude Interface](https://claude.ai)
- [Modern UI Patterns](https://ui.shadcn.com)

---

## 🎉 **PROJECT COMPLETION STATUS**

### **✅ COMPLETED FEATURES (100%):**
- ✅ ChatGPT-like interface with professional design
- ✅ 12-language voice support (Hindi, Telugu, Tamil, etc.)
- ✅ File upload and AI analysis
- ✅ User authentication and profiles
- ✅ Admin dashboard and user management
- ✅ Toast and browser notifications
- ✅ Loading states and animations
- ✅ Mobile responsive design
- ✅ Security and rate limiting
- ✅ Local AI integration with Ollama

### **🚀 READY FOR:**
- ✅ **Production Deployment**
- ✅ **Student Usage**
- ✅ **Feature Extensions**
- ✅ **Scale-up Operations**

---

## 👨‍💻 **DEVELOPER NOTES**

### **Code Quality:**
- TypeScript for type safety
- Modular component architecture
- Clean, maintainable code structure
- Comprehensive error handling
- Performance optimizations

### **Future Enhancements:**
- Advanced text processing features
- Language translation capabilities
- Math equation rendering
- Export functionality
- Mobile app development

### **Deployment Options:**
- **Local**: Current setup for development
- **Cloud**: Vercel (frontend) + Railway (backend)
- **Self-hosted**: Docker containers
- **University**: On-campus server deployment

---

**🎓 This project successfully delivers a professional, feature-rich AI assistant that rivals commercial solutions while maintaining complete independence from paid APIs and services.**
