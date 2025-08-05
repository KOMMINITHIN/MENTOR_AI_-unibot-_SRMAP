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
