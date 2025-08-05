"use client";

import { useState, useEffect } from "react";
import { User, Settings, Edit3, Save, X, Camera, Languages, Volume2, Palette, Bell } from "lucide-react";
import "./UserProfile.css";

interface UserProfileProps {
  user: any;
  onUpdateUser: (userData: any) => void;
  onClose: () => void;
}

interface UserSettings {
  language: string;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  theme: string;
  notifications: boolean;
  avatar: string;
}

export default function UserProfile({ user, onUpdateUser, onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<UserSettings>({
    language: "en-US",
    voiceEnabled: true,
    autoSpeak: true,
    theme: "dark",
    notifications: true,
    avatar: ""
  });

  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "Student at SRM AP University"
  });

  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "te-IN", name: "Telugu", flag: "🇮🇳" },
    { code: "ta-IN", name: "Tamil", flag: "🇮🇳" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
    { code: "ar-SA", name: "Arabic", flag: "🇸🇦" }
  ];

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    
    // Dispatch settings change event
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: newSettings }));
  };

  const handleSaveProfile = () => {
    onUpdateUser(editData);
    setIsEditing(false);
  };

  const generateAvatar = (name: string) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'];
    const color = colors[name.length % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.slice(1)}&color=fff&size=128`;
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>
            {activeTab === "profile" ? "👤 Profile" : "⚙️ Settings"}
          </h2>
          <button type="button" onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} />
            Profile
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-tab">
              <div className="avatar-section">
                <div className="avatar-container">
                  <img
                    src={settings.avatar || generateAvatar(user?.username || "User")}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <button type="button" className="avatar-edit-btn">
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div className="profile-info">
                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData({...editData, username: e.target.value})}
                        className="profile-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="profile-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        className="profile-textarea"
                        rows={3}
                      />
                    </div>
                    <div className="edit-actions">
                      <button type="button" onClick={handleSaveProfile} className="save-btn">
                        <Save size={16} />
                        Save
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-display">
                    <div className="profile-field">
                      <h3>{user?.username}</h3>
                      <p className="user-role">{user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}</p>
                    </div>
                    <div className="profile-field">
                      <label>Email</label>
                      <p>{user?.email}</p>
                    </div>
                    <div className="profile-field">
                      <label>Bio</label>
                      <p>{editData.bio}</p>
                    </div>
                    <div className="profile-field">
                      <label>Member Since</label>
                      <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently"}</p>
                    </div>
                    <div className="profile-field">
                      <label>Tokens Used</label>
                      <p>{user?.tokens_used || 0} / {user?.tokens_remaining || 0} remaining</p>
                    </div>
                    <button type="button" onClick={() => setIsEditing(true)} className="edit-btn">
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-tab">
              <div className="settings-section">
                <div className="setting-item">
                  <div className="setting-info">
                    <Languages size={20} />
                    <div>
                      <h4>Language</h4>
                      <p>Choose your preferred language for voice and interface</p>
                    </div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => saveSettings({...settings, language: e.target.value})}
                    className="setting-select"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Volume2 size={20} />
                    <div>
                      <h4>Voice Features</h4>
                      <p>Enable voice input and text-to-speech</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.voiceEnabled}
                      onChange={(e) => saveSettings({...settings, voiceEnabled: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Volume2 size={20} />
                    <div>
                      <h4>Auto-Speak Responses</h4>
                      <p>Automatically read AI responses aloud</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoSpeak}
                      onChange={(e) => saveSettings({...settings, autoSpeak: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Palette size={20} />
                    <div>
                      <h4>Theme</h4>
                      <p>Choose your preferred color theme</p>
                    </div>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => saveSettings({...settings, theme: e.target.value})}
                    className="setting-select"
                  >
                    <option value="dark">🌙 Dark</option>
                    <option value="light">☀️ Light</option>
                    <option value="auto">🔄 Auto</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <Bell size={20} />
                    <div>
                      <h4>Notifications</h4>
                      <p>Receive notifications for important updates</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => saveSettings({...settings, notifications: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
