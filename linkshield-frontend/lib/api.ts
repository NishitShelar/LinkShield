const API_BASE = "https://api.linkshld.xyz"

export const api = {
  // Auth
  register: (data: any) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: (data: any) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Google OAuth
  googleAuth: (idToken: string) =>
    fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }).then((r) => r.json()),

  // Email verification
  verifyEmail: (token: string) => fetch(`${API_BASE}/api/auth/verify-email/${token}`).then((r) => r.json()),

  // Password reset
  forgotPassword: (email: string) =>
    fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((r) => r.json()),

  resetPassword: (token: string, password: string) =>
    fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then((r) => r.json()),

  // Get current user
  getCurrentUser: (token: string) =>
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  // Links
  createLink: (data: any, token?: string) => {
    if (token) {
      return fetch(`${API_BASE}/api/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json());
    } else {
      return fetch(`${API_BASE}/api/links/anonymous`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      }).then((r) => r.json());
    }
  },

  getLinks: (token: string) =>
    fetch(`${API_BASE}/api/links`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  deleteLink: (id: string, token: string) =>
    fetch(`${API_BASE}/api/links/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  // Analytics
  getUserAnalytics: (token: string) =>
    fetch(`${API_BASE}/api/analytics/user`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  // Admin
  getAdminDashboard: (token: string) =>
    fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getAdminUsers: (token: string) =>
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getAdminUser: (id: string, token: string) =>
    fetch(`${API_BASE}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  deleteAdminUser: (id: string, token: string) =>
    fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getAdminLinks: (token: string) =>
    fetch(`${API_BASE}/api/admin/links`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getAdminLink: (id: string, token: string) =>
    fetch(`${API_BASE}/api/admin/links/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  deleteAdminLink: (id: string, token: string) =>
    fetch(`${API_BASE}/api/admin/links/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getLinkAnalytics: (id: string, token: string) =>
    fetch(`${API_BASE}/api/analytics/link/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getAdminLinkClicks: (id: string, token: string) =>
    fetch(`${API_BASE}/api/admin/links/${id}/clicks`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
}
