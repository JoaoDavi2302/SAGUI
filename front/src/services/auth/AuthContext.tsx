// guarda e compartilha qual usuario está logado e se ele está autenticado.
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import database from "@/components/mock.json";

export type Role = "ADMIN" | "PROFESSOR" | "ALUNO";

interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  status: string;
}

interface LoggedUser extends User {
  role: Role;
}

interface AuthContextType {
  user: LoggedUser | null;
  loading: boolean;

  effectiveRole: Role;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedUser | null>(null);

  function getRole(userId: string): Role {
    const userRole = database.user_roles.find((r) => r.user_id === userId);

    const role = database.roles.find((r) => r.id === userRole?.role_id)
      ?.name as Role;

    return role;
  }

  useEffect(() => {
    console.log("AUTH INIT");

    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const id = localStorage.getItem("userId");

    console.log("COOKIE TOKEN:", token);
    console.log("LOCAL USERID:", id);

    if (!token || !id) {
      console.log("SEM SESSÃO");
      setUser(null);
      setLoading(false);
      return;
    }

    const dbUser = database.users.find((u) => u.id === id);

    console.log("DB USER:", dbUser);

    if (!dbUser) {
      console.log("USER INVÁLIDO");
      setUser(null);
      setLoading(false);
      return;
    }

    const role = getRole(dbUser.id);

    console.log("ROLE:", role);

    setUser({ ...dbUser, role });

    console.log("SESSÃO RESTAURADA");
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    console.log("LOGIN");

    // busca compatibilidade de dados do banco com dados de entrada
    const foundUser = database.users.find(
      (u) => u.email === email && u.password_hash === password,
    );

    // busca se usuario existe
    if (!foundUser) {
      // console.log("LOGIN INVALIDO");
      return false;
    }

    const role = getRole(foundUser.id);

    // guardar dados do usuario para acesso rapido
    localStorage.setItem("userId", foundUser.id);
    document.cookie = `token=${foundUser.id}; path=/; max-age=86400`;
    document.cookie = `role=${role}; path=/; max-age=86400`;

    const loggedUser = {
      ...foundUser,
      role,
    };

    //teste de login
    // console.log("LOGIN OK", {
    //   role,
    //   cookies: document.cookie,
    // });

    // recebe dados do usuario logado
    setUser(loggedUser);

    return true;
  }

  function logout() {
    // console.log("LOGOUT");

    // remove dados armazenados em cookie do usuario logado
    localStorage.removeItem("userId");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setUser(null);

    window.location.href = "/login";
  }

  const effectiveRole = user?.role ?? "ALUNO";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        effectiveRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("useUser deve ser usado dentro de AuthProvider");

  return context;
}
