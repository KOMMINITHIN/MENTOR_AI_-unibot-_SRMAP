"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import "./ToastNotification.css";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastIcon = ({ type }: { type: Toast["type"] }) => {
  switch (type) {
    case "success":
      return <CheckCircle size={20} />;
    case "error":
      return <AlertCircle size={20} />;
    case "warning":
      return <AlertTriangle size={20} />;
    case "info":
    default:
      return <Info size={20} />;
  }
};

export default function ToastNotification({ toasts, onRemove }: ToastNotificationProps) {
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(toast.id);
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, onRemove]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="toast-content">
            <div className="toast-icon">
              <ToastIcon type={toast.type} />
            </div>
            <div className="toast-message">
              {toast.message}
            </div>
            {toast.action && (
              <button
                type="button"
                onClick={toast.action.onClick}
                className="toast-action"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="toast-close"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
          <div className="toast-progress">
            <div 
              className="toast-progress-bar"
              style={{
                animationDuration: `${toast.duration || 4000}ms`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Toast Hook for easy usage
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => {
    addToast({ message, type: "success", duration });
  };

  const showError = (message: string, duration?: number) => {
    addToast({ message, type: "error", duration });
  };

  const showInfo = (message: string, duration?: number) => {
    addToast({ message, type: "info", duration });
  };

  const showWarning = (message: string, duration?: number) => {
    addToast({ message, type: "warning", duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
