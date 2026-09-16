"use client";
import { createContext, useCallback, useEffect, useState } from "react";
import { JwtResponse } from "@/types/api";
import * as authApi from "@/services/api/auth";

type UserStored = { id: number; name: string; email: string; role: string; token: string };

type AuthContextType = {
  user: UserStored | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserStored | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(t);
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const persist = (jwt: JwtResponse) => {
    const stored: UserStored = { id: jwt.id, name: jwt.name, email: jwt.email, role: jwt.role, token: jwt.token };
    localStorage.setItem("token", jwt.token);
    localStorage.setItem("user", JSON.stringify(stored));
    setToken(jwt.token);
    setUser(stored);
  };

  const login = useCallback(async (email: string, password: string) => {
    const jwt = await authApi.login({ email, password });
    persist(jwt);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password });
    // auto-login after register
    const jwt = await authApi.login({ email, password });
    persist(jwt);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isAdmin: user?.role === "ADMIN", loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
