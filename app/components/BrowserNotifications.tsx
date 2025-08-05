"use client";

import { useEffect, useState } from "react";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const showNotification = async (options: NotificationOptions): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Browser notifications not supported");
      return false;
    }

    // Request permission if not granted
    if (permission === "default") {
      const newPermission = await requestPermission();
      if (newPermission !== "granted") {
        return false;
      }
    }

    if (permission === "denied") {
      console.warn("Notification permission denied");
      return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/favicon.ico",
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Auto-close after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error("Error showing notification:", error);
      return false;
    }
  };

  const showAIResponseNotification = (message: string) => {
    // Only show if page is not visible
    if (document.hidden) {
      showNotification({
        title: "Mentor AI",
        body: message.length > 100 ? message.substring(0, 100) + "..." : message,
        icon: "/logo.png",
        tag: "ai-response",
      });
    }
  };

  const showSystemNotification = (title: string, message: string, type: "info" | "warning" | "error" = "info") => {
    const icons = {
      info: "ℹ️",
      warning: "⚠️",
      error: "❌",
    };

    showNotification({
      title: `${icons[type]} ${title}`,
      body: message,
      tag: `system-${type}`,
      requireInteraction: type === "error",
    });
  };

  const showConnectionNotification = (status: "connected" | "disconnected" | "reconnected") => {
    const messages = {
      connected: "Connected to Mentor AI",
      disconnected: "Connection lost - trying to reconnect...",
      reconnected: "Connection restored!",
    };

    const icons = {
      connected: "🟢",
      disconnected: "🔴",
      reconnected: "✅",
    };

    showNotification({
      title: `${icons[status]} ${messages[status]}`,
      body: status === "disconnected" ? "Your messages will be sent when connection is restored." : "",
      tag: "connection-status",
      silent: status === "connected",
    });
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showAIResponseNotification,
    showSystemNotification,
    showConnectionNotification,
  };
}

// Permission Request Component
interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function NotificationPermissionRequest({ 
  onPermissionGranted, 
  onPermissionDenied 
}: NotificationPermissionProps) {
  const { isSupported, permission, requestPermission } = useBrowserNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isSupported || permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="notification-permission denied">
        <div className="permission-content">
          <span className="permission-icon">🔕</span>
          <div className="permission-text">
            <h4>Notifications Blocked</h4>
            <p>Enable notifications in your browser settings to get alerts when AI responds.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleRequest = async () => {
    setIsRequesting(true);
    const result = await requestPermission();
    setIsRequesting(false);

    if (result === "granted") {
      onPermissionGranted?.();
    } else {
      onPermissionDenied?.();
    }
  };

  return (
    <div className="notification-permission">
      <div className="permission-content">
        <span className="permission-icon">🔔</span>
        <div className="permission-text">
          <h4>Stay Updated</h4>
          <p>Get notified when Mentor AI responds, even when you're on another tab.</p>
        </div>
        <button
          type="button"
          onClick={handleRequest}
          disabled={isRequesting}
          className="permission-button"
        >
          {isRequesting ? "Requesting..." : "Enable Notifications"}
        </button>
      </div>
    </div>
  );
}
