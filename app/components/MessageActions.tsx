"use client";

import { useState } from "react";
import { Copy, Share2, ThumbsUp, ThumbsDown, Volume2, Check } from "lucide-react";
import "./MessageActions.css";

interface MessageActionsProps {
  message: {
    role: string;
    content: string;
    tokens_used?: number;
  };
  onReaction: (reaction: 'like' | 'dislike') => void;
  onSpeak: (text: string) => void;
}

export default function MessageActions({ message, onReaction, onSpeak }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Dispatch custom event for toast notification
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: "Message copied to clipboard!", type: "success" }
      }));
    } catch (err) {
      console.error('Failed to copy text:', err);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: "Failed to copy message", type: "error" }
      }));
    }
  };

  const shareMessage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Chat Message',
          text: message.content,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  const handleReaction = (reactionType: 'like' | 'dislike') => {
    setReaction(reactionType);
    onReaction(reactionType);
  };

  const speakMessage = () => {
    onSpeak(message.content);
  };

  return (
    <div className="message-actions">
      {/* Copy Button */}
      <button
        type="button"
        onClick={copyToClipboard}
        className="action-btn copy-btn"
        title="Copy message"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={shareMessage}
        className="action-btn share-btn"
        title="Share message"
      >
        <Share2 size={14} />
      </button>

      {/* Speak Button */}
      <button
        type="button"
        onClick={speakMessage}
        className="action-btn speak-btn"
        title="Read aloud"
      >
        <Volume2 size={14} />
      </button>

      {/* Reaction Buttons (only for AI messages) */}
      {message.role === 'assistant' && (
        <div className="reaction-buttons">
          <button
            type="button"
            onClick={() => handleReaction('like')}
            className={`action-btn reaction-btn ${reaction === 'like' ? 'active' : ''}`}
            title="Good response"
          >
            <ThumbsUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleReaction('dislike')}
            className={`action-btn reaction-btn ${reaction === 'dislike' ? 'active' : ''}`}
            title="Poor response"
          >
            <ThumbsDown size={14} />
          </button>
        </div>
      )}

      {/* Copy Success Indicator */}
      {copied && (
        <div className="copy-success">
          Copied!
        </div>
      )}
    </div>
  );
}
