"use client";

import { useState, useEffect } from "react";
import { Users, MessageSquare, BarChart3, Settings, Shield, UserCheck, UserX } from "lucide-react";
import "./admin-styles.css";

const BACKEND_URL = "http://localhost:8000";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  tokens_used: number;
  created_at: string;
  last_login: string;
  is_active: boolean;
}

interface Stats {
  total_users: number;
  active_users: number;
  total_conversations: number;
  total_messages: number;
  tokens_used_today: number;
}

interface Conversation {
  id: number;
  title: string;
  username: string;
  email: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState("admin@srmap.edu.in");
  const [password, setPassword] = useState("admin123");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.token);
        setAdminUser(data.user);
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Admin login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Connection error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const headers = { "Authorization": `Bearer ${token}` };

    try {
      // Load stats
      const statsResponse = await fetch(`${BACKEND_URL}/admin/stats`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load users
      const usersResponse = await fetch(`${BACKEND_URL}/admin/users`, { headers });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Load conversations
      const convResponse = await fetch(`${BACKEND_URL}/admin/conversations`, { headers });
      if (convResponse.ok) {
        const convData = await convResponse.json();
        setConversations(convData.conversations);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        alert(`User role updated to ${newRole}`);
        loadDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to update role");
      }
    } catch (error) {
      console.error("Role update error:", error);
      alert("Failed to update user role");
    }
  };

  const toggleUserStatus = async (userId: number) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/admin/users/${userId}/toggle-status`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        alert("User status updated");
        loadDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to update status");
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      alert("Failed to toggle user status");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <Shield size={48} />
            <h1>Admin Dashboard</h1>
            <p>SRM AP University Chatbot</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
            />
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-input"
            />
            <button type="submit" disabled={loading} className="admin-login-btn">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <Shield size={24} />
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} />
            Users
          </button>
          <button 
            className={`nav-item ${activeTab === "conversations" ? "active" : ""}`}
            onClick={() => setActiveTab("conversations")}
          >
            <MessageSquare size={20} />
            Conversations
          </button>
        </nav>
        
        <div className="admin-footer">
          <div className="admin-user">
            <span>{adminUser?.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            <h1>System Overview</h1>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <Users size={24} />
                  <div>
                    <h3>{stats.total_users}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <UserCheck size={24} />
                  <div>
                    <h3>{stats.active_users}</h3>
                    <p>Active Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <MessageSquare size={24} />
                  <div>
                    <h3>{stats.total_conversations}</h3>
                    <p>Conversations</p>
                  </div>
                </div>
                <div className="stat-card">
                  <BarChart3 size={24} />
                  <div>
                    <h3>{stats.tokens_used_today}</h3>
                    <p>Tokens Today</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-content">
            <h1>User Management</h1>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Tokens Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{user.tokens_used}</td>
                      <td>
                        <div className="action-buttons">
                          <select 
                            value={user.role} 
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="role-select"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={`status-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                          >
                            {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "conversations" && (
          <div className="conversations-content">
            <h1>Conversation Monitoring</h1>
            <div className="conversations-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>User</th>
                    <th>Messages</th>
                    <th>Created</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conv) => (
                    <tr key={conv.id}>
                      <td>{conv.id}</td>
                      <td>{conv.title}</td>
                      <td>{conv.username}</td>
                      <td>{conv.message_count}</td>
                      <td>{new Date(conv.created_at).toLocaleDateString()}</td>
                      <td>{new Date(conv.updated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
