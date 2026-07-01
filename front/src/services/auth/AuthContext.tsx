"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { ApiError } from "../api/client";
import { LoginRequest, getMyProfile, logoutRequest } from "./api";
import { UserProfileResponseDTO } from "./api";
import { AuthContextType, LoggedUser, Role } from "./types";
import { getCookie, setCookie, clearCookie } from "../api/cookies";

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function toLoggedUser(profile: UserProfileResponseDTO): LoggedUser {
  if (!profile.id || !profile.name || !profile.email || !profile.role || !profile.status) {
    throw new Error("Perfil de usuário incompleto retornado pela API");
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    status: profile.status,
    role: profile.role.toUpperCase() as Role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedUser | null>(null);

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    getMyProfile().then((profile) => setUser(toLoggedUser(profile))).catch(() => {
        // token inválido/expirado ou perfil incompleto
        clearCookie("token");
        localStorage.removeItem("refreshToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    try {
      const { accesToken, refreshToken } = await LoginRequest(email, password);

      if (!accesToken || !refreshToken) {
        throw new Error("Resposta de login inválida (token ausente)");
      }

      const exp = decodeJwtExp(accesToken);
      const maxAge = exp ? exp - Math.floor(Date.now() / 1000) : 86400;

      setCookie("token", accesToken, maxAge);
      localStorage.setItem("refreshToken", refreshToken);

      const profile = await getMyProfile();
      setUser(toLoggedUser(profile));

      return true;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        return false;
      }
      throw err;
    }
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // segue limpando o estado local mesmo se o back falhar
      }
    }

    localStorage.removeItem("refreshToken");
    clearCookie("token");
    setUser(null);

    window.location.href = "/login";
  }

  const effectiveRole = user?.role ?? "ALUNO";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, effectiveRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useUser deve ser usado dentro de AuthProvider");

  return context;
}