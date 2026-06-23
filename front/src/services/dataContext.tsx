// centraliza e compartilha dados da aplicação (banco) entre componentes React.
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import database from "../components/mock.json";
import { useUser } from "./AuthContext";

import {
  Course,
  Discipline,
  Lesson,
  Material,
  Module,
  Quiz,
  User,
} from "@/services/types/database";

interface DataContextType {
  loading: boolean;

  courses: Course[];
  disciplines: Discipline[];
  modules: Module[];
  lessons: Lesson[];
  materials: Material[];
  quizzes: Quiz[];

  professor?: User;
  student?: User;
  admin?: User;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DataContextType>({
    loading: true,

    courses: [],
    disciplines: [],
    modules: [],
    lessons: [],
    materials: [],
    quizzes: [],
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);

      setData({
        loading: false,

        courses: [],
        disciplines: [],
        modules: [],
        lessons: [],
        materials: [],
        quizzes: [],
      });

      return;
    }

    // MOCK JSON

    setData({
      loading: false,

      courses: database.courses,

      disciplines: database.disciplines,

      modules: database.modules,

      lessons: database.lessons,

      materials: database.materials,

      quizzes: database.quizzes,

      professor: database.users.find(
        (u) =>
          database.user_roles.some(
            (r) =>
              r.user_id === u.id &&
              database.roles.find((role) => role.id === r.role_id)?.name ===
                "PROFESSOR"
          )
      ),

      student: database.users.find(
        (u) =>
          database.user_roles.some(
            (r) =>
              r.user_id === u.id &&
              database.roles.find((role) => role.id === r.role_id)?.name ===
                "ALUNO"
          )
      ),

      admin: database.users.find(
        (u) =>
          database.user_roles.some(
            (r) =>
              r.user_id === u.id &&
              database.roles.find((role) => role.id === r.role_id)?.name ===
                "ADMIN"
          )
      ),
    });

    setLoading(false);

    // API

    /*
    async function loadData() {
      setLoading(true);

      try {
        const res = await fetch("/api/data", {
          credentials: "include",
        });

        if (!res.ok)
          throw new Error("Erro ao carregar dados");

        const data = await res.json();

        setData({
          loading: false,
          ...data,
        });

      } finally {
        setLoading(false);
      }
    }

    loadData();
    */
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        ...data,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context)
    throw new Error("useData deve ser usado dentro do DataProvider");

  return context;
}