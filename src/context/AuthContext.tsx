"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "demo-trader-auth";

interface AuthContextValue {
  isLoggedIn: boolean;
  userName: string | null;
  ready: boolean;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage; safe to run only on the client.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(stored);
    setReady(true);
  }, []);

  const login = (name: string) => {
    window.localStorage.setItem(STORAGE_KEY, name);
    setUserName(name);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!userName, userName, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
