import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/new-services/poo/shared/api/client';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';

export interface StudentReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  disciplineId: string;
  disciplineName: string;
  overallPercentage: number;
  totalModules: number;
  completedModules: number;
  totalActivities: number;
  completedActivities: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyRate: number;
  averageScore: number;
  status: 'APROVADO' | 'REPROVADO' | 'EM_ANDAMENTO';
}

export interface ActivityDetail {
  activityId: string;
  activityTitle: string;
  moduleName: string;
  attemptsUsed: number;
  attemptLimit: number;
  bestScore: number | null;
  minimumScore: number;
  approved: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyRate: number;
}

export interface StudentDetailReport extends StudentReport {
  activities: ActivityDetail[];
  moduleProgress: Array<{
    moduleId: string;
    moduleName: string;
    progressPercentage: number;
    completed: boolean;
    unlocked: boolean;
  }>;
}

export function useProfessorReports() {
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailReport | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [disciplines, setDisciplines] = useState<{ id: string; name: string }[]>([]);

  const loadDisciplines = useCallback(async () => {
    try {
      console.log('🔍 Carregando disciplinas...');
      const response = await apiFetch<{ content: any[] }>('/disciplines?size=100');
      console.log('📚 Disciplinas recebidas:', response);
      
      const disciplineList = (response.content || [])
        .filter((d) => d.status === 'Active')
        .map((d) => ({
          id: d.id,
          name: d.name,
        }));
      
      console.log('✅ Disciplinas filtradas:', disciplineList);
      setDisciplines(disciplineList);
      
      if (disciplineList.length > 0 && !selectedDiscipline) {
        setSelectedDiscipline(disciplineList[0].id);
        console.log('🎯 Disciplina selecionada:', disciplineList[0].name);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar disciplinas:', err);
      setError('Não foi possível carregar as disciplinas.');
    }
  }, [selectedDiscipline]);

  const loadStudents = useCallback(async () => {
    if (!selectedDiscipline) {
      console.log('⏳ Nenhuma disciplina selecionada');
      return;
    }

    console.log('🔍 Carregando alunos para disciplina:', selectedDiscipline);
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ content: any[] }>(
        `/disciplines/${selectedDiscipline}/students/progress?size=100`
      );
      console.log('👨‍🎓 Alunos recebidos:', response);

      const studentsData = (response.content || []).map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        studentEmail: s.studentEmail,
        disciplineId: selectedDiscipline,
        disciplineName: disciplines.find((d) => d.id === selectedDiscipline)?.name || '',
        overallPercentage: s.overallPercentage || 0,
        totalModules: s.totalModules || 0,
        completedModules: s.completedModules || 0,
        totalActivities: 0,
        completedActivities: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracyRate: 0,
        averageScore: 0,
        status: (s.overallPercentage || 0) >= 70 ? 'APROVADO' : 'EM_ANDAMENTO',
      }));

      setStudents(studentsData);
    } catch (err) {
      console.error('❌ Erro ao carregar alunos:', err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedDiscipline, disciplines]);

  const loadStudentDetail = useCallback(async (studentId: string) => {
    if (!selectedDiscipline) return;

    try {
      const progressResponse = await apiFetch<{
        disciplineId: string;
        disciplineName: string;
        overallPercentage: number;
        modules: Array<{
          moduleId: string;
          moduleName: string;
          progressPercentage: number;
          completed: boolean;
          unlocked: boolean;
        }>;
      }>(`/disciplines/${selectedDiscipline}/progress?studentId=${studentId}`);

      const activitiesResponse = await apiFetch<{ content: any[] }>(
        `/activities?studentId=${studentId}&disciplineId=${selectedDiscipline}&size=100`
      );

      const activities: ActivityDetail[] = (activitiesResponse.content || []).map((a) => ({
        activityId: a.id,
        activityTitle: a.title,
        moduleName: a.moduleName || '',
        attemptsUsed: a.attemptsUsed || 0,
        attemptLimit: a.attemptLimit || 3,
        bestScore: a.bestScore || null,
        minimumScore: a.minimumScore || 70,
        approved: a.hasApprovedAttempt || false,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracyRate: 0,
      }));

      const student = students.find((s) => s.studentId === studentId);
      if (!student) return;

      const detail: StudentDetailReport = {
        ...student,
        activities,
        moduleProgress: progressResponse.modules || [],
      };

      setSelectedStudent(detail);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, [selectedDiscipline, students]);

  useEffect(() => {
    loadDisciplines();
  }, []);

  useEffect(() => {
    if (selectedDiscipline) {
      loadStudents();
    }
  }, [selectedDiscipline, loadStudents]);

  return {
    students,
    loading,
    error,
    disciplines,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedStudent,
    loadStudentDetail,
    setSelectedStudent,
    refresh: loadStudents,
  };
}
