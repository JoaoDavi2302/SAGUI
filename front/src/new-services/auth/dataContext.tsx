"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import databaseJson from "@/components/mock.json";
import type { Database } from "@/new-services/poo/shared/types";

const database = databaseJson as Database;

import { useUser } from "./AuthContext";

import {
  CourseEntity,
  DisciplineEntity,
  LessonEntity,
  AttachmentEntity,
  ModuleEntity,
  ActivityEntity,
  UserEntity,
} from "@/new-services/poo/shared/types";

interface DataContextType {
  loading: boolean;

  courses: CourseEntity[];
  disciplines: DisciplineEntity[];
  modules: ModuleEntity[];
  lessons: LessonEntity[];
  attachments: AttachmentEntity[];
  activities: ActivityEntity[];

  professor?: UserEntity;
  student?: UserEntity;
  admin?: UserEntity;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DataContextType>({
    loading: true,

    courses: [],
    disciplines: [],
    modules: [],
    lessons: [],
    attachments: [],
    activities: [],
  });

  useEffect(() => {
    if (!user) {
      setData({
        loading: false,
        courses: [],
        disciplines: [],
        modules: [],
        lessons: [],
        attachments: [],
        activities: [],
      });

      setLoading(false);
      return;
    }

    setData({
      loading: false,

      courses: database.cursos,
      disciplines: database.disciplinas,
      modules: database.modulos,
      lessons: database.aulas,
      attachments: database.anexos,
      activities: database.atividades,

      professor: database.usuarios.find((u) => u.perfil === "Professor"),
      student: database.usuarios.find((u) => u.perfil === "Aluno"),
      admin: database.usuarios.find((u) => u.perfil === "Admin"),
    });

    setLoading(false);
  }, [user]);

  return (
    <DataContext.Provider value={{ ...data, loading }}>
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