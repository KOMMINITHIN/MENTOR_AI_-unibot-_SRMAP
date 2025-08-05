"use client";

import "./LoadingComponents.css";

// Spinner Component
export function Spinner({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <div 
      className="spinner" 
      style={{ 
        width: size, 
        height: size, 
        borderColor: `${color}33`,
        borderTopColor: color 
      }}
    />
  );
}

// Button Loading State
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function LoadingButton({ 
  loading, 
  children, 
  onClick, 
  disabled, 
  className = "", 
  type = "button" 
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`loading-button ${className} ${loading ? 'loading' : ''}`}
    >
      {loading && <Spinner size={16} />}
      <span className={loading ? 'loading-text' : ''}>{children}</span>
    </button>
  );
}

// Message Skeleton Loader
export function MessageSkeleton() {
  return (
    <div className="message-skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-line-1"></div>
        <div className="skeleton-line skeleton-line-2"></div>
        <div className="skeleton-line skeleton-line-3"></div>
      </div>
    </div>
  );
}

// Typing Indicator
export function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );
}

// Progress Bar
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  progress, 
  color = "#667eea", 
  height = 4, 
  showPercentage = false 
}: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div 
        className="progress-bar" 
        style={{ height }}
      >
        <div 
          className="progress-fill"
          style={{ 
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: color 
          }}
        />
      </div>
      {showPercentage && (
        <span className="progress-text">{Math.round(progress)}%</span>
      )}
    </div>
  );
}

// File Upload Progress
interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
}

export function FileUploadProgress({ fileName, progress, status }: FileUploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return "📤";
      case "processing":
        return "⚙️";
      case "complete":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📄";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "complete":
        return "Complete";
      case "error":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <div className="file-upload-progress">
      <div className="file-info">
        <span className="file-icon">{getStatusIcon()}</span>
        <div className="file-details">
          <div className="file-name">{fileName}</div>
          <div className="file-status">{getStatusText()}</div>
        </div>
      </div>
      <ProgressBar 
        progress={progress} 
        color={status === "error" ? "#f56565" : "#48bb78"}
        showPercentage={true}
      />
    </div>
  );
}

// Pulse Loading (for avatars, images)
export function PulseLoader({ width = 40, height = 40, className = "" }: { 
  width?: number; 
  height?: number; 
  className?: string; 
}) {
  return (
    <div 
      className={`pulse-loader ${className}`}
      style={{ width, height }}
    />
  );
}

// Connection Status Indicator
interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected" | "slow";
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "connected":
        return { color: "#48bb78", text: "Connected", icon: "🟢" };
      case "connecting":
        return { color: "#ed8936", text: "Connecting...", icon: "🟡" };
      case "disconnected":
        return { color: "#f56565", text: "Disconnected", icon: "🔴" };
      case "slow":
        return { color: "#ed8936", text: "Slow connection", icon: "🟡" };
      default:
        return { color: "#a0aec0", text: "Unknown", icon: "⚪" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="connection-status">
      <span className="connection-icon">{statusInfo.icon}</span>
      <span 
        className="connection-text"
        style={{ color: statusInfo.color }}
      >
        {statusInfo.text}
      </span>
      {status === "connecting" && <Spinner size={12} />}
    </div>
  );
}
