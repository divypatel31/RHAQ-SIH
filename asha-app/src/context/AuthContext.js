import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { saveSession, loadSession, clearSession } from "../services/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // On app start, restore a previously saved session so the worker stays
  // logged in even with no connectivity at launch.
  useEffect(() => {
    (async () => {
      const session = await loadSession();
      if (session) setUser(session.user);
      setBootstrapping(false);
    })();
  }, []);

  async function login(phone, password) {
    const res = await api.post("/auth/login", { phone, password });
    const { token, ...userData } = res.data;
    await saveSession(token, userData);
    setUser(userData);
    return userData;
  }

  async function logout() {
    await clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, bootstrapping, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
