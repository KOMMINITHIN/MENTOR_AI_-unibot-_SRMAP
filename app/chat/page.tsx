"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Menu, Plus, MessageSquare, Settings, LogOut, LogIn, Paperclip } from "lucide-react";
import FileUpload from "../components/FileUpload";
import VoiceButton from "../components/VoiceButton";
import SpeakingIndicator from "../components/SpeakingIndicator";
import MessageActions from "../components/MessageActions";
import UserProfile from "../components/UserProfile";
import LimitModal from "../components/LimitModal";
import ToastNotification, { useToast } from "../components/ToastNotification";
import { LoadingButton, TypingIndicator } from "../components/LoadingComponents";
import { useBrowserNotifications, NotificationPermissionRequest } from "../components/BrowserNotifications";
import "./chatgpt-styles.css";

const BACKEND_URL = "http://localhost:8000";

interface User {
  id: number;
  email: string;
  username: string;
  role?: string;
  tokens_used: number;
  tokens_remaining: number;
  created_at?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  tokens_used?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! 😊 I'm Mentor, your friendly AI teacher here to help with anything you need. Whether it's studies, coding, or just a chat - I'm here for you! How can I support you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [taskType, setTaskType] = useState("general");
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState({ tokens_used: 0, tokens_limit: 100, reset_time: "midnight" });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showInfo, showWarning } = useToast();

  // Browser notifications
  const { showAIResponseNotification } = useBrowserNotifications();

  // Listen for toast events from components
  useEffect(() => {
    const handleToastEvent = (event: any) => {
      const { message, type } = event.detail;
      switch (type) {
        case "success":
          showSuccess(message);
          break;
        case "error":
          showError(message);
          break;
        case "info":
          showInfo(message);
          break;
        case "warning":
          showWarning(message);
          break;
      }
    };

    window.addEventListener('showToast', handleToastEvent);
    return () => window.removeEventListener('showToast', handleToastEvent);
  }, [showSuccess, showError, showInfo, showWarning]);

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo(token);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        loadConversations(token);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
      localStorage.removeItem("token");
    }
  };

  // Load conversations for authenticated user
  const loadConversations = async (token: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/conversations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  // Load messages from a conversation
  const loadConversation = async (conversationId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/conversations/${conversationId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    setMessages([
      { role: "assistant", content: "Hi there! 😊 I'm Mentor, your friendly AI teacher here to help with anything you need. Whether it's studies, coding, or just a chat - I'm here for you! How can I support you today?" }
    ]);
    setCurrentConversationId(null);
  };

  // Handle file analysis results
  const handleFileAnalyzed = (analysis: any) => {
    const fileMessage = {
      role: "assistant" as const,
      content: `📁 **File Analysis: ${analysis.filename}**\n\n${analysis.analysis}\n\n*Analyzed using ${analysis.model_used}*`,
      isFileAnalysis: true
    };

    setMessages((msgs) => [...msgs, fileMessage]);
    setShowFileUpload(false);
  };

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  // Handle text-to-speech
  const handleSpeakText = (text: string) => {
    // This will be handled by the VoiceInput component
    const speechEvent = new CustomEvent('speakText', { detail: text });
    window.dispatchEvent(speechEvent);
  };

  // Handle message reactions
  const handleMessageReaction = (messageIndex: number, reaction: 'like' | 'dislike') => {
    console.log(`Message ${messageIndex} reaction: ${reaction}`);
    showInfo(`Feedback recorded: ${reaction === 'like' ? '👍' : '👎'}`);
    // Here you could send feedback to the backend for model improvement
  };



  // Handle profile update
  const handleUpdateUser = (userData: any) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
    // Here you could send update to backend
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const body = authMode === "login"
        ? { email, password }
        : { email, password, username };

      console.log("Sending auth request to:", `${BACKEND_URL}${endpoint}`);

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      });

      console.log("Auth response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setShowAuth(false);
        console.log("Auth successful:", data.user);

        showSuccess(`Welcome back, ${data.user.username}! 🎉`);

        // Redirect admin users to admin dashboard
        if (data.user.role === "admin") {
          localStorage.setItem("admin_token", data.token);
          showInfo("Redirecting to admin dashboard...");
          window.location.href = "/admin";
          return;
        }
      } else {
        const errorText = await res.text();
        console.error("Auth error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail && Array.isArray(errorData.detail)) {
            // Handle validation errors
            const errors = errorData.detail.map((err: any) => err.msg).join(", ");
            showError(`Validation error: ${errors}`);
          } else {
            showError(errorData.detail || "Authentication failed");
          }
        } catch {
          showError(`Authentication failed: ${res.status} ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      showError("Connection error. Please check if the server is running.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMessages([{ role: "assistant", content: "Hey! 👋 How can I help you today?" }]);
    showInfo("Logged out successfully. See you soon! 👋");
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.length > 2000) {
      alert("Message too long. Please keep it under 2000 characters.");
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage],
          task_type: taskType,
          conversation_id: currentConversationId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = "Sorry, something went wrong.";

        if (res.status === 429) {
          // Check if it's a guest limit exceeded error
          if (errorData.detail?.error === "daily_limit_exceeded") {
            setLimitInfo({
              tokens_used: errorData.detail.tokens_used,
              tokens_limit: errorData.detail.tokens_limit,
              reset_time: errorData.detail.reset_time
            });
            setShowLimitModal(true);
            return;
          }
          errorMessage = errorData.detail || "Rate limit exceeded. Please try again later.";
        } else if (res.status === 401) {
          errorMessage = "Please log in to continue chatting.";
          setShowAuth(true);
        } else if (res.status === 400) {
          errorMessage = errorData.detail || "Invalid input.";
        } else if (res.status === 503) {
          errorMessage = "AI service temporarily unavailable.";
        }

        setMessages((msgs) => [...msgs, { role: "assistant", content: errorMessage }]);
        return;
      }

      const data = await res.json();
      const botReply = data.answer || "Sorry, I couldn't get a response.";

      const assistantMessage: Message = {
        role: "assistant",
        content: botReply
      };

      setMessages((msgs) => [...msgs, assistantMessage]);

      // Auto-speak AI response if speech is enabled
      setTimeout(() => {
        const speechEvent = new CustomEvent('speakText', { detail: botReply });
        window.dispatchEvent(speechEvent);
      }, 500);

      // Show browser notification if page is hidden
      showAIResponseNotification(botReply);

      // Show success toast for authenticated users
      if (data.is_authenticated) {
        showSuccess(`Response generated • ${data.tokens_used} tokens used`);
      }

      // Update user token info if available
      if (data.tokens_remaining !== undefined && user) {
        setUser(prev => prev ? {
          ...prev,
          tokens_remaining: data.tokens_remaining,
          tokens_used: (prev.tokens_used || 0) + (data.tokens_used || 0)
        } : null);
      }

      // Update conversation ID if new conversation was created
      if (data.conversation_id && !currentConversationId) {
        setCurrentConversationId(data.conversation_id);
        // Refresh conversations list
        const token = localStorage.getItem("token");
        if (token) loadConversations(token);
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      showError("Failed to send message. Please try again.");
      setMessages((msgs) => [...msgs, {
        role: "assistant",
        content: "Network error. Please check your connection and try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatgpt-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button type="button" className="new-chat-btn" onClick={startNewConversation}>
            <Plus size={16} />
            New chat
          </button>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="sidebar-content">
          <div className="chat-history">
            {user && conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`chat-item ${currentConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <MessageSquare size={16} />
                  <span className="chat-title">{conv.title}</span>
                </div>
              ))
            ) : (
              <div className="chat-item">
                <MessageSquare size={16} />
                {user ? "No conversations yet" : "Current Chat"}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-info">
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="token-info">
                  {user.tokens_remaining} tokens left
                </div>
                <div className="user-actions">
                  <button
                    type="button"
                    className="settings-btn"
                    onClick={() => setShowProfile(true)}
                    title="Profile & Settings"
                  >
                    <Settings size={14} />
                  </button>
                  {user.role === "admin" && (
                    <button
                      type="button"
                      className="admin-panel-btn"
                      onClick={() => window.location.href = "/admin"}
                    >
                      🛡️ Admin Panel
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="logout-btn"
                onClick={logout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button type="button" className="login-btn" onClick={() => setShowAuth(true)}>
              <LogIn size={16} />
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        {/* Header */}
        <div className="chat-header">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu size={20} />
          </button>
          <div className="header-title">
            <h1>Mentor</h1>
            <span className="model-info">Local AI • {user ? 'Authenticated' : 'Guest Mode'}</span>
          </div>
          <div className="task-selector">
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              title="Select AI Model"
              aria-label="Select AI Model"
            >
              <option value="general">💬 men.01</option>
              <option value="code">💻 men.02</option>
              <option value="image">🧠 men.03</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                {msg.tokens_used && (
                  <div className="message-meta">
                    {msg.tokens_used} tokens used
                  </div>
                )}
                <MessageActions
                  message={msg}
                  onReaction={(reaction) => handleMessageReaction(i, reaction)}
                  onSpeak={handleSpeakText}
                />
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* File Upload Area */}
        {showFileUpload && (
          <div className="file-upload-area">
            <FileUpload onFileAnalyzed={handleFileAnalyzed} user={user} />
          </div>
        )}

        {/* Speaking Indicator */}
        <SpeakingIndicator />

        {/* Input Area */}
        <div className="input-area">
          <form onSubmit={sendMessage} className="input-form">
            <div className="input-container">
              <VoiceButton
                onTranscript={handleVoiceTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="file-upload-btn"
                title={user ? "Upload files (10MB limit)" : "Upload files (2MB limit - Sign up for more!)"}
              >
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="message-input"
              />
              <LoadingButton
                type="submit"
                loading={loading}
                disabled={!input.trim()}
                className="send-button"
              >
                <Send size={16} />
              </LoadingButton>
            </div>
          </form>
          <div className="input-footer">
            Mentor can make mistakes. Check important info.
            {!user && (
              <span> • <button type="button" onClick={() => setShowAuth(true)} className="link-btn">Sign in</button> for 80,000 tokens/month</span>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="auth-modal">
          <div className="auth-content">
            <div className="auth-header">
              <h2>{authMode === "login" ? "Welcome back" : "Create account"}</h2>
              <button type="button" onClick={() => setShowAuth(false)} className="close-btn">×</button>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="auth-input"
              />
              {authMode === "register" && (
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  required
                  className="auth-input"
                />
              )}
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
                className="auth-input"
              />
              <button type="submit" className="auth-submit">
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === "login" ? (
                <span>
                  Don't have an account?
                  <button type="button" onClick={() => setAuthMode("register")} className="link-btn">Sign up</button>
                </span>
              ) : (
                <span>
                  Already have an account?
                  <button type="button" onClick={() => setAuthMode("login")} className="link-btn">Sign in</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfile && user && (
        <UserProfile
          user={user}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Limit Modal */}
      <LimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onSignUp={() => {
          setShowLimitModal(false);
          setAuthMode("register");
          setShowAuth(true);
        }}
        onSignIn={() => {
          setShowLimitModal(false);
          setAuthMode("login");
          setShowAuth(true);
        }}
        limitInfo={limitInfo}
      />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {/* Browser Notification Permission */}
      <NotificationPermissionRequest
        onPermissionGranted={() => showSuccess("Notifications enabled! 🔔")}
        onPermissionDenied={() => showWarning("Notifications disabled. You can enable them later in settings.")}
      />
    </div>
  );
}