"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { LoggedUser, Role } from "@/new-services/poo/shared/types";
import { apiAuth, apiUsers } from "@/new-services/poo/shared/api";

/* CONTEXT */
interface AuthContextType {
  user: LoggedUser | null;
  loading: boolean;
  effectiveRole: Role;

  login(email: string, password: string): Promise<boolean>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = "http://localhost:8080/api";

/* PROVIDER */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* REFRESH USER */
  async function refreshUser() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        return;
      }

      const data = await apiUsers.me();

      setUser({
        id: data.id, // resolve erro number/string
        name: data.name,
        email: data.email,
        perfil: data.perfil as Role,
      });
    } catch {
      setUser(null);
    }
  }

  /* INIT */
  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, []);

  /* LOGIN */
  async function login(email: string, password: string): Promise<boolean> {
    try {
      const data = await apiAuth.login({ email, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      await refreshUser();

      return true;
    } catch {
      return false;
    }
  }

  /* LOGOUT */
  async function logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await apiAuth.logout(refreshToken);
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);

      window.location.href = "/login";
    }
  }

  const effectiveRole: Role = user?.perfil ?? "ALUNO";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        effectiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* HOOK */
export function useUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useUser deve ser usado dentro de AuthProvider");
  }

  return context;
}

export const useAuth = useUser;