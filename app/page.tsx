"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Bot, MessageSquare, Mic, Upload, Settings, History, 
  Crown, Bell, Globe, Code, Calculator, FileText, Palette, Star,
  CheckCircle, Zap, Shield, Users, Menu, X, Play, ChevronRight
} from "lucide-react";
import "./landing.css";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <MessageSquare size={24} />,
      title: "Smart AI Assistant",
      description: "Advanced conversational AI designed specifically for university students with natural responses"
    },
    {
      icon: <Mic size={24} />,
      title: "Voice in 12 Languages",
      description: "Speak and listen in Hindi, Telugu, Tamil, English and 8 other languages"
    },
    {
      icon: <Upload size={24} />,
      title: "File Analysis",
      description: "Upload documents, images, and code for instant AI-powered analysis and insights"
    },
    {
      icon: <Globe size={24} />,
      title: "University Knowledge",
      description: "Comprehensive SRM AP information including courses, facilities, and student services"
    },
    {
      icon: <Code size={24} />,
      title: "Code Assistant",
      description: "Debug code, get explanations, and improve your programming skills"
    },
    {
      icon: <Calculator size={24} />,
      title: "Study Helper",
      description: "Solve math problems, explain concepts, and assist with academic work"
    }
  ];

  const stats = [
    { number: "3", label: "AI Models", description: "Specialized models for different tasks" },
    { number: "12", label: "Languages", description: "Voice and text support" },
    { number: "80K", label: "Tokens/Month", description: "For authenticated users" },
    { number: "100%", label: "Free", description: "No hidden costs or fees" }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <Bot className="brand-icon" />
            <span className="brand-text">Mentor AI</span>
            <span className="version-badge">beta</span>
          </div>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#demo" className="nav-link">Demo</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
            <Link href="/chat" className="nav-link nav-cta">
              Try Now Free
              <ArrowRight size={16} />
            </Link>
          </div>

          <button 
            className="nav-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={16} />
              <span>New: Voice Features & File Analysis</span>
            </div>
            
            <h1 className="hero-title">
              Your Personal AI Study Companion for
              <span className="gradient-text"> SRM AP University</span>
            </h1>

            <p className="hero-description">
              Advanced AI assistant with voice support in 12 languages, file analysis,
              and university-specific knowledge to help you excel in your studies.
            </p>
            
            <div className="hero-actions">
              <Link href="/chat" className="btn-primary">
                <MessageSquare size={20} />
                Start Chatting Free
                <ArrowRight size={16} />
              </Link>
              
              <button className="btn-secondary" onClick={() => document.getElementById('demo')?.scrollIntoView()}>
                <Play size={20} />
                Watch Demo
              </button>
            </div>
            
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-description">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="chat-preview">
              <div className="chat-header">
                <div className="chat-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="chat-title">Mentor AI Chat</span>
              </div>
              <div className="chat-messages">
                <div className="message user">
                  <span>🎤 Explain quantum physics in simple terms</span>
                </div>
                <div className="message ai">
                  <span>🤖 Quantum physics is like...</span>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
              <div className="chat-input">
                <Mic className="input-icon" />
                <span>Type or speak your question...</span>
                <Upload className="input-icon" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Modern Learning</h2>
            <p>Everything you need for an exceptional AI-powered learning experience</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="demo">
        <div className="container">
          <div className="section-header">
            <h2>See Mentor AI in Action</h2>
            <p>Watch how our advanced features work together seamlessly</p>
          </div>
          
          <div className="demo-grid">
            <div className="demo-item">
              <div className="demo-icon">
                <Mic size={32} />
              </div>
              <h3>Voice Interaction</h3>
              <p>Speak in Hindi, Telugu, Tamil, English and 8 other languages</p>
              <Link href="/chat" className="demo-link">
                Try Voice Chat <ChevronRight size={16} />
              </Link>
            </div>

            <div className="demo-item">
              <div className="demo-icon">
                <Upload size={32} />
              </div>
              <h3>File Analysis</h3>
              <p>Upload documents, images, or code for instant AI analysis</p>
              <Link href="/chat" className="demo-link">
                Upload File <ChevronRight size={16} />
              </Link>
            </div>

            <div className="demo-item">
              <div className="demo-icon">
                <Globe size={32} />
              </div>
              <h3>University Assistant</h3>
              <p>Get answers about SRM AP courses, facilities, and student life</p>
              <Link href="/chat" className="demo-link">
                Ask Questions <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that works best for you</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Guest</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">0</span>
                  <span className="period">/day</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><CheckCircle size={16} /> 100 tokens per day</li>
                <li><CheckCircle size={16} /> Basic chat features</li>
                <li><CheckCircle size={16} /> 2MB file uploads</li>
                <li><CheckCircle size={16} /> No registration required</li>
              </ul>
              <Link href="/chat" className="pricing-btn">
                Start Free
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-badge">Recommended</div>
              <div className="pricing-header">
                <h3>Student</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li><CheckCircle size={16} /> 80,000 tokens per month</li>
                <li><CheckCircle size={16} /> All voice features</li>
                <li><CheckCircle size={16} /> 10MB file uploads</li>
                <li><CheckCircle size={16} /> Chat history saved</li>
                <li><CheckCircle size={16} /> Custom settings</li>
                <li><CheckCircle size={16} /> University knowledge base</li>
              </ul>
              <Link href="/chat" className="pricing-btn">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Learning Experience?</h2>
            <p>Join thousands of SRM AP students already using Mentor AI for better learning outcomes.</p>
            <div className="cta-actions">
              <Link href="/chat" className="btn-primary">
                <MessageSquare size={20} />
                Start Learning Now
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Bot size={24} />
              <span>Mentor AI</span>
            </div>
            <div className="footer-links">
              <Link href="/chat">Chat</Link>
              <Link href="#features">Features</Link>
              <Link href="#demo">Demo</Link>
              <Link href="#pricing">Pricing</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Mentor AI. Built for SRM AP University students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
