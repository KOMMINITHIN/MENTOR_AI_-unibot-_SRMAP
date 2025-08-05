"use client";

import { useState } from "react";
import { X, Clock, Zap, Shield, Star } from "lucide-react";
import "./LimitModal.css";

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  limitInfo: {
    tokens_used: number;
    tokens_limit: number;
    reset_time: string;
  };
}

export default function LimitModal({ isOpen, onClose, onSignUp, onSignIn, limitInfo }: LimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="limit-modal-overlay">
      <div className="limit-modal">
        <div className="limit-modal-header">
          <h2>Daily Limit Reached</h2>
          <button type="button" onClick={onClose} className="limit-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="limit-modal-content">
          <div className="limit-info-section">
            <div className="limit-icon">
              <Clock size={24} />
            </div>
            <div className="limit-details">
              <h3>🚫 Not in history</h3>
              <p>Guest chats won't appear in your history. For safety purposes, we may keep a copy of your chat for up to 30 days.</p>
            </div>
          </div>

          <div className="limit-info-section">
            <div className="limit-icon">
              <Zap size={24} />
            </div>
            <div className="limit-details">
              <h3>⚡ Daily token limit</h3>
              <p>You've used {limitInfo.tokens_used} of {limitInfo.tokens_limit} daily tokens. Limit resets at {limitInfo.reset_time}.</p>
            </div>
          </div>

          <div className="limit-info-section">
            <div className="limit-icon">
              <Shield size={24} />
            </div>
            <div className="limit-details">
              <h3>🔒 Limited features</h3>
              <p>Guest mode has restricted access. Sign up for full features and 80,000 tokens per month.</p>
            </div>
          </div>

          <div className="upgrade-section">
            <div className="upgrade-header">
              <Star size={20} />
              <h3>Upgrade to Full Access</h3>
            </div>
            <div className="upgrade-benefits">
              <div className="benefit">
                <span className="benefit-icon">💬</span>
                <span>80,000 tokens per month</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📚</span>
                <span>Chat history saved</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📁</span>
                <span>10MB file uploads</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🎤</span>
                <span>Voice features</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">⚙️</span>
                <span>Custom settings</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🎯</span>
                <span>Priority support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="limit-modal-actions">
          <button type="button" onClick={onSignUp} className="signup-btn">
            <Star size={16} />
            Sign Up - Free
          </button>
          <button type="button" onClick={onSignIn} className="signin-btn">
            Sign In
          </button>
          <button type="button" onClick={onClose} className="continue-btn">
            Continue as Guest
          </button>
        </div>

        <div className="limit-modal-footer">
          <p>🎓 Join thousands of SRM AP students already using Mentor AI!</p>
        </div>
      </div>
    </div>
  );
}
