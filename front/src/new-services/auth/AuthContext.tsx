"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { LoggedUser, Role } from "@/services/poo/shared/types";

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

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<LoggedUser | null>(null);

  async function refreshUser() {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch(`${API}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      setUser({
        id: data.id,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
      });
    } catch {
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

  async function login(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      localStorage.setItem(
        "accessToken",
        data.accessToken,
      );

      localStorage.setItem(
        "refreshToken",
        data.refreshToken,
      );

      await refreshUser();

      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    try {
      const refreshToken =
        localStorage.getItem("refreshToken");

      if (refreshToken) {
        await fetch(`${API}/auth/logout`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            refreshToken,
          }),
        });
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setUser(null);

      window.location.href = "/login";
    }
  }

  const effectiveRole = user?.perfil ?? "ALUNO";

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

export function useUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useUser deve ser usado dentro de AuthProvider",
    );
  }

  return context;
}

export const useAuth = useUser;