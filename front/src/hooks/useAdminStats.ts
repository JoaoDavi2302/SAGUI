import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/new-services/poo/shared/api/client';
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

interface AdminStats {
  totalStudents: number;
  totalProfessors: number;
  averageStudentProgress: number;
  overallApprovalRate: number;
  topStudents: StudentPerformance[];
  disciplineStats: DisciplineStats[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar todos os usuários (alunos e professores)
      const usersResponse = await apiFetch<{ content: any[] }>('/users?size=100');
      const allUsers = usersResponse.content || [];

      const students = allUsers.filter((u) => u.role === 'Aluno');
      const professors = allUsers.filter((u) => u.role === 'Professor');

      // Buscar estatísticas por disciplina (se o endpoint existir)
      // Ou calcular a partir dos dados disponíveis
      let disciplineStats: DisciplineStats[] = [];
      let studentPerformances: StudentPerformance[] = [];

      // Tentar buscar progresso dos alunos por disciplina
      try {
        const disciplinesResponse = await apiFetch<{ content: any[] }>('/disciplines?size=100');
        const disciplines = disciplinesResponse.content || [];

        for (const discipline of disciplines) {
          try {
            const progressResponse = await apiFetch<{ content: any[] }>(
              `/disciplines/${discipline.id}/students/progress?size=100`
            );
            const progressData = progressResponse.content || [];

            const avgProgress = progressData.length > 0
              ? progressData.reduce((acc, p) => acc + (p.overallPercentage || 0), 0) / progressData.length
              : 0;

            const approved = progressData.filter((p) => p.overallPercentage >= 70).length;

            disciplineStats.push({
              disciplineId: discipline.id,
              disciplineName: discipline.name,
              totalStudents: progressData.length,
              averageProgress: Math.round(avgProgress),
              approvedCount: approved,
              approvalRate: progressData.length > 0 ? Math.round((approved / progressData.length) * 100) : 0,
            });
          } catch {
            // Disciplina sem progresso
          }
        }
      } catch {
        // Erro ao buscar disciplinas
      }

      // Calcular estatísticas gerais
      const avgStudentProgress = disciplineStats.length > 0
        ? Math.round(disciplineStats.reduce((acc, d) => acc + d.averageProgress, 0) / disciplineStats.length)
        : 0;

      const overallApprovalRate = disciplineStats.length > 0
        ? Math.round(disciplineStats.reduce((acc, d) => acc + d.approvalRate, 0) / disciplineStats.length)
        : 0;

      setStats({
        totalStudents: students.length,
        totalProfessors: professors.length,
        averageStudentProgress: avgStudentProgress,
        overallApprovalRate: overallApprovalRate,
        topStudents: studentPerformances,
        disciplineStats: disciplineStats,
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}
