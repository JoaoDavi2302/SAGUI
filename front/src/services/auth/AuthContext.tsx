"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { ApiError } from "../api/client";
import { getMyProfile, loginRequest, logoutRequest, registerRequest } from "./api";
import { UserProfileResponseDTO } from "./api";
import { AuthContextType, LoggedUser, RegisterInput, Role } from "./types";
import { clearSession, getAccessToken, persistSession } from "../api/tokens";

const AuthContext = createContext<AuthContextType | null>(null);

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
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    getMyProfile()
      .then((profile) => setUser(toLoggedUser(profile)))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function establishSession(accesToken: string, refreshToken: string): Promise<Role> {
    persistSession(accesToken, refreshToken);

    const profile = await getMyProfile();
    const loggedUser = toLoggedUser(profile);
    setUser(loggedUser);

    return loggedUser.role;
  }

  async function login(email: string, password: string): Promise<Role | null> {
    try {
      const { accesToken, refreshToken } = await loginRequest(email, password);

      if (!accesToken || !refreshToken) {
        throw new Error("Resposta de login inválida (token ausente)");
      }

      return await establishSession(accesToken, refreshToken);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
        return null;
      }
      throw err;
    }
  }

  async function register(input: RegisterInput): Promise<Role> {
    const { accesToken, refreshToken } = await registerRequest({
      name: input.name,
      email: input.email,
      password: input.password,
      birthDate: input.birthDate,
      address: input.address,
    });

    if (!accesToken || !refreshToken) {
      throw new Error("Resposta de cadastro inválida (token ausente)");
    }

    return establishSession(accesToken, refreshToken);
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

    clearSession();
    setUser(null);

    window.location.href = "/login";
  }

  const effectiveRole = user?.role ?? "ALUNO";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, effectiveRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useUser deve ser usado dentro de AuthProvider");

  return context;
}
