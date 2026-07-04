"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useUser } from "./AuthContext";
import {
  listAllLessons,
  listCourses,
  listDisciplines,
  listModules,
} from "../api/catalog";
import { toCatalogDatabase } from "../api/mappers";

import {
  Course,
  Discipline,
  Lesson,
  Material,
  Module,
  Quiz,
} from "@/services/types/database";

interface DataContextType {
  loading: boolean;
  error: string | null;
  courses: Course[];
  disciplines: Discipline[];
  modules: Module[];
  lessons: Lesson[];
  materials: Material[];
  quizzes: Quiz[];
  refresh: () => void;
}

const emptyData: Omit<DataContextType, "refresh"> = {
  loading: false,
  error: null,
  courses: [],
  disciplines: [],
  modules: [],
  lessons: [],
  materials: [],
  quizzes: [],
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [reloadToken, setReloadToken] = useState(0);
  const [data, setData] = useState<DataContextType>({
    ...emptyData,
    loading: true,
    refresh: () => {},
  });

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!user) {
      setData({ ...emptyData, refresh });
      return;
    }

    let cancelled = false;

    async function loadData() {
      setData((prev) => ({ ...prev, loading: true, error: null, refresh }));

      try {
        const [courses, disciplines, modules] = await Promise.all([
          listCourses("Active"),
          listDisciplines(),
          listModules(),
        ]);

        const moduleIds = modules
          .map((module) => module.id)
          .filter((id): id is string => Boolean(id));

        const lessons = await listAllLessons(moduleIds);
        const catalog = toCatalogDatabase(courses, disciplines, modules, lessons);

        if (cancelled) return;

        setData({
          loading: false,
          error: null,
          refresh,
          ...catalog,
          materials: [],
          quizzes: [],
        });
      } catch {
        if (cancelled) return;

        setData({
          ...emptyData,
          refresh,
          error: "Não foi possível carregar os dados do sistema.",
        });
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, reloadToken, refresh]);

  return (
    <DataContext.Provider value={data}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData deve ser usado dentro do DataProvider");
  }

  return context;
}

export interface CatalogDatabase {
  courses: Course[];
  disciplines: Discipline[];
  modules: Module[];
  lessons: Lesson[];
  materials: any[];
  quizzes: any[];
  enrollments: any[];
  module_progress: any[];
  lesson_progress: any[];
  quiz_attempts: any[];
  lesson_materials: any[];
  questions: any[];
  alternatives: any[];
  student_answers: any[];
  users: any[];
  user_roles: any[];
  roles: any[];
}

export function useCatalogDatabase() {
  const { courses, disciplines, modules, lessons, loading, error, refresh } =
    useData();

  const database: CatalogDatabase = {
    courses,
    disciplines,
    modules,
    lessons,
    materials: [],
    quizzes: [],
    enrollments: [],
    module_progress: [],
    lesson_progress: [],
    quiz_attempts: [],
    lesson_materials: [],
    questions: [],
    alternatives: [],
    student_answers: [],
    users: [],
    user_roles: [],
    roles: [],
  };

  return {
    loading,
    error,
    database,
    refresh,
  };
}
