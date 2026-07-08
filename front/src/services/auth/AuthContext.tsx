"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

<<<<<<< HEAD
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
=======
import database from "../../components/mock.json";
import { LoggedUser } from "@/services/poo/shared/types";
import { Role } from "@/services/poo/shared/types";

interface User {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  ativo: boolean;
}

// interface LoggedUser extends User {
//   role: Role;
// }
>>>>>>> origin/develop

interface AuthContextType {
  user: LoggedUser | null;
  loading: boolean;
  effectiveRole: Role;
  login: (email: string, password: string) => Promise<LoggedUser | null>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedUser | null>(null);

<<<<<<< HEAD
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
=======
  function getRole(userId: number): Role {
    const user = database.usuarios.find((u) => u.id === userId);

    return (user?.perfil ?? "ALUNO") as Role;
  }

  useEffect(() => {
    console.log("AUTH INIT");

    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const id = Number(localStorage.getItem("userId"));

    console.log("COOKIE TOKEN:", token);
    console.log("LOCAL USERID:", id);

    if (!token || !id) {
      console.log("SEM SESSÃO");
      setUser(null);
>>>>>>> origin/develop
      setLoading(false);
    }

<<<<<<< HEAD
    init();
=======
    const dbUser = database.usuarios.find((u) => u.id === id);

    console.log("DB USER:", dbUser);

    if (!dbUser) {
      console.log("USER INVÁLIDO");
      setUser(null);
      setLoading(false);
      return;
    }

    const role = getRole(dbUser.id);

    setUser({
      id: dbUser.id,
      nome: dbUser.nome,
      email: dbUser.email,
      perfil: role,
    });

    console.log("SESSÃO RESTAURADA");
    setLoading(false);
>>>>>>> origin/develop
  }, []);

  async function establishSession(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);

<<<<<<< HEAD
    const profile = await fetchMe(tokens.accessToken);
    setUser(profile);
    setSessionCookies(profile.role);
  }
=======
    // busca compatibilidade de dados do banco com dados de entrada
    const foundUser = database.usuarios.find(
      (u) => u.email === email && u.senha_hash === password,
    );
>>>>>>> origin/develop

  async function login(email: string, password: string): Promise<LoggedUser | null> {
    try {
      const tokens = await loginRequest(email, password);
      await establishSession(tokens);
      const accessToken = getAccessToken();
      if (!accessToken) return null;
      return await fetchMe(accessToken);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        return null;
      }

      if (error instanceof Error && error.message === "INVALID_AUTH_RESPONSE") {
        throw new Error("AUTH_RESPONSE_INVALID");
      }

      throw error;
    }
<<<<<<< HEAD
=======

    const role = getRole(foundUser.id);

    // guardar dados do usuario para acesso rapido
    localStorage.setItem("userId", String(foundUser.id));
    document.cookie = `token=${foundUser.id}; path=/; max-age=86400`;
    document.cookie = `role=${role}; path=/; max-age=86400`;

    const loggedUser: LoggedUser = {
      id: foundUser.id,
      nome: foundUser.nome,
      email: foundUser.email,
      perfil: role,
    };

    //teste de login
    // console.log("LOGIN OK", {
    //   role,
    //   cookies: document.cookie,
    // });

    // recebe dados do usuario logado
    setUser(loggedUser);

    return true;
>>>>>>> origin/develop
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

<<<<<<< HEAD
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
=======
  const effectiveRole = user?.perfil ?? "ALUNO";
>>>>>>> origin/develop

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
<<<<<<< HEAD

export const useAuth = useUser;
=======
export const useAuth = () => useContext(AuthContext);
>>>>>>> origin/develop
