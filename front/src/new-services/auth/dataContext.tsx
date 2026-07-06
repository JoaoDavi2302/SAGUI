"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useUser } from "./AuthContext";

import {
  CourseEntity,
  DisciplineEntity,
  LessonEntity,
  ModuleEntity,
} from "@/services/poo/shared/types";

interface DataContextType {
  loading: boolean;

  courses: CourseEntity[];
  disciplines: DisciplineEntity[];
  modules: ModuleEntity[];
  lessons: LessonEntity[];

  refresh(): Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const API = "http://localhost:8080/api";

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineEntity[]>([]);
  const [modules, setModules] = useState<ModuleEntity[]>([]);
  const [lessons, setLessons] = useState<LessonEntity[]>([]);

  async function api<T>(url: string): Promise<T> {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    return response.json();
  }

  async function refresh() {
    if (!user) {
      setCourses([]);
      setDisciplines([]);
      setModules([]);
      setLessons([]);
      return;
    }

    setLoading(true);

    try {
      const [
        coursesResponse,
        disciplinesResponse,
        modulesResponse,
        lessonsResponse,
      ] = await Promise.all([
        api<CourseEntity[]>("/courses"),
        api<DisciplineEntity[]>("/disciplines"),
        api<ModuleEntity[]>("/modules"),
        api<LessonEntity[]>("/lessons"),
      ]);

      setCourses(coursesResponse);
      setDisciplines(disciplinesResponse);
      setModules(modulesResponse);
      setLessons(lessonsResponse);
    } catch (error) {
      console.error(error);

      setCourses([]);
      setDisciplines([]);
      setModules([]);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        loading,
        courses,
        disciplines,
        modules,
        lessons,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error(
      "useData deve ser usado dentro de DataProvider",
    );
  }

  return context;
}