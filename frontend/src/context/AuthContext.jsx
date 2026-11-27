import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

// Old versions saved the login in localStorage (stays after closing the tab).
// Remove it once, so nobody stays logged in from the old way.
try {
  localStorage.removeItem("alexagro_admin_token");
  localStorage.removeItem("alexagro_admin_profile");
} catch (e) {
  // ignore
}

function readProfile() {
  try {
    const saved = sessionStorage.getItem("alexagro_admin_profile");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(readProfile);

  const saveSession = useCallback((data) => {
    sessionStorage.setItem("alexagro_admin_token", data.token);
    sessionStorage.setItem("alexagro_admin_profile", JSON.stringify(data.admin));
    setAdmin(data.admin);
  }, []);

  // Step 1: password. Normally the server answers { requiresCode: true } and
  // emails a code; the session only starts after verifyCode below.
  const login = useCallback(
    async (username, password) => {
      const { data } = await api.post("/auth/login", { username, password });
      if (data.requiresCode) return data;
      saveSession(data);
      return data;
    },
    [saveSession]
  );

  // Step 2: the 6-digit code from the email.
  const verifyCode = useCallback(
    async (challengeId, code) => {
      const { data } = await api.post("/auth/verify-code", { challengeId, code });
      saveSession(data);
      return data.admin;
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("alexagro_admin_token");
    sessionStorage.removeItem("alexagro_admin_profile");
    localStorage.removeItem("alexagro_admin_token");
    localStorage.removeItem("alexagro_admin_profile");
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, login, verifyCode, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
