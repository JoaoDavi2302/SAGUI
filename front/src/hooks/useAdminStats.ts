import { useState, useEffect, useCallback } from 'react';
import { listUsersPage } from '@/new-services/poo/shared/api/users';
import { listDisciplines } from '@/new-services/poo/shared/api/disciplines';
import { listDisciplineStudentsProgress } from '@/new-services/poo/shared/api/progress';
import { resolveTotalElements } from '@/new-services/poo/shared/api/pagination';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';

interface DisciplineStats {
  disciplineId: string;
  disciplineName: string;
  totalStudents: number;
  averageProgress: number;
  approvedCount: number;
  approvalRate: number;
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  averageScore: number;
  totalActivities: number;
  approvedActivities: number;
  approvalRate: number;
}

export interface AdminStats {
  totalStudents: number;
  totalProfessors: number;
  averageStudentProgress: number;
  overallApprovalRate: number;
  topStudents: StudentPerformance[];
  disciplineStats: DisciplineStats[];
}

const PROGRESS_CONCURRENCY = 5;

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R | null>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      const result = await mapper(items[current]);
      if (result !== null) {
        results.push(result);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [studentsPage, professorsPage, disciplinesPage] = await Promise.all([
        listUsersPage({ page: 0, size: 1, role: 'Aluno' }),
        listUsersPage({ page: 0, size: 1, role: 'Professor' }),
        listDisciplines(undefined, 0, 100),
      ]);

      const disciplines = disciplinesPage.content ?? [];

      const disciplineStats = await mapWithConcurrency(
        disciplines,
        PROGRESS_CONCURRENCY,
        async (discipline) => {
          try {
            const progressResponse = await listDisciplineStudentsProgress(
              discipline.id,
              0,
              100,
            );
            const progressData = progressResponse.content ?? [];

            const avgProgress =
              progressData.length > 0
                ? progressData.reduce(
                    (acc, p) => acc + (p.overallPercentage || 0),
                    0,
                  ) / progressData.length
                : 0;

            const approved = progressData.filter(
              (p) => p.overallPercentage >= 70,
            ).length;

            return {
              disciplineId: discipline.id,
              disciplineName: discipline.name,
              totalStudents: progressData.length,
              averageProgress: Math.round(avgProgress),
              approvedCount: approved,
              approvalRate:
                progressData.length > 0
                  ? Math.round((approved / progressData.length) * 100)
                  : 0,
            } satisfies DisciplineStats;
          } catch {
            return null;
          }
        },
      );

      const avgStudentProgress =
        disciplineStats.length > 0
          ? Math.round(
              disciplineStats.reduce((acc, d) => acc + d.averageProgress, 0) /
                disciplineStats.length,
            )
          : 0;

      const overallApprovalRate =
        disciplineStats.length > 0
          ? Math.round(
              disciplineStats.reduce((acc, d) => acc + d.approvalRate, 0) /
                disciplineStats.length,
            )
          : 0;

      setStats({
        totalStudents: resolveTotalElements(studentsPage),
        totalProfessors: resolveTotalElements(professorsPage),
        averageStudentProgress: avgStudentProgress,
        overallApprovalRate,
        topStudents: [],
        disciplineStats,
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}
