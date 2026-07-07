"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { LoggedUser, Role } from "@/services/poo/shared/types";
import {
  clearSessionCookies,
  clearStoredTokens,
  fetchMe,
  getAccessToken,
  loginRequest,
  logoutRequest,
  registerRequest,
  setSessionCookies,
  type RegisterInput,
} from "./authApi";

interface AuthContextType {
  user: LoggedUser | null;
  loading: boolean;
  effectiveRole: Role;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedUser | null>(null);

  async function refreshUser() {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setUser(null);
      return;
    }

    try {
      const profile = await fetchMe(accessToken);
      setUser(profile);
      setSessionCookies(profile.role);
    } catch {
      clearStoredTokens();
      clearSessionCookies();
      setUser(null);
    }
  }

  useEffect(() => {
    async function init() {
      await refreshUser();
      setLoading(false);
    }

    init();
  }, []);

  async function establishSession(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

    const profile = await fetchMe(tokens.accessToken);
    setUser(profile);
    setSessionCookies(profile.role);
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const tokens = await loginRequest(email, password);
      await establishSession(tokens);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        return false;
      }

      if (error instanceof Error && error.message === "INVALID_AUTH_RESPONSE") {
        throw new Error("AUTH_RESPONSE_INVALID");
      }

      throw error;
    }
  }

  async function register(data: RegisterInput): Promise<boolean> {
    try {
      const tokens = await registerRequest(data);
      await establishSession(tokens);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_AUTH_RESPONSE") {
        throw new Error("AUTH_RESPONSE_INVALID");
      }

      throw error;
    }
  }

  async function logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await logoutRequest(refreshToken);
    } finally {
      clearStoredTokens();
      clearSessionCookies();
      setUser(null);
      window.location.href = "/login";
    }
  }

  const effectiveRole: Role = user?.role ?? "Aluno";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        effectiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useUser deve ser usado dentro de AuthProvider");
  }

  return context;
}

export const useAuth = useUser;
