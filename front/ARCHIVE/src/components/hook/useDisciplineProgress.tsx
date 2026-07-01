"use client";

import { useMemo } from "react";
import database from "@/components/mock.json";

export function useDisciplineProgress(disciplineId: string | number, studentId?: string | null) {
  return useMemo(() => {
    const id = String(disciplineId);

    const discipline = database.disciplines.find(
      (d: any) => String(d.id) === id
    );

    const modules = database.modules.filter(
      (m: any) => String(m.discipline_id) === id
    );

    const lessons = database.lessons.filter((l: any) =>
      modules.some((m: any) => m.id === l.module_id)
    );

    const lessonProgress = (database.lesson_progress ?? []).filter((p: any) =>
      studentId ? p.student_id === studentId : true
    );

    const isLessonDone = (lessonId: string) =>
      lessonProgress.some(
        (p: any) =>
          p.lesson_id === lessonId &&
          (p.status === "COMPLETED" || p.completed === true)
      );

    const totalLessons = lessons.length;

    const completedLessons = lessons.filter((l: any) =>
      isLessonDone(l.id)
    ).length;

    const progressPercent = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    const moduleProgress = (database.module_progress ?? []).filter((p: any) =>
      studentId ? p.student_id === studentId : true
    );

    const completedModules = moduleProgress.filter((p: any) =>
      p.status === "COMPLETED" &&
      modules.some((m: any) => m.id === p.module_id)
    ).length;

    const modulePercent = modules.length
      ? Math.round((completedModules / modules.length) * 100)
      : 0;

    return {
      discipline,
      modules,
      lessons,
      progressPercent,
      modulePercent,
      completedLessons,
      totalLessons,
      completedModules,
    };
  }, [disciplineId, studentId]);
}