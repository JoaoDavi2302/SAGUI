import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/new-services/auth/AuthContext';
import { listDisciplines } from '@/new-services/poo/shared/api/catalog';
import { listEnrollmentsByDiscipline } from '@/new-services/poo/shared/api/enrollment';
import {
  getEnrollmentProgress,
  listDisciplineStudentsProgress,
} from '@/new-services/poo/shared/api/progress';
import {
  listActivities,
  listActivityAttempts,
  type ActivityAttemptSummaryDTO,
} from '@/new-services/poo/shared/api/activities';
import { listModules } from '@/new-services/poo/shared/api/modules';
import { getApiErrorMessage } from '@/utils/apiErrorMessage';

export interface StudentReport {
  enrollmentId: string;
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

interface DisciplineActivity {
  id: string;
  title: string;
  moduleName: string;
  attemptLimit: number;
  minimumScore: number;
  maxScore: number;
}

interface StudentActivityStats {
  totalActivities: number;
  completedActivities: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyRate: number;
  averageScore: number;
}

function getBestAttempt(
  attempts: ActivityAttemptSummaryDTO[],
  studentId: string,
): ActivityAttemptSummaryDTO | null {
  const studentAttempts = attempts.filter(
    (attempt) => attempt.studentId === studentId,
  );

  if (studentAttempts.length === 0) return null;

  return studentAttempts.reduce((best, current) =>
    current.score > best.score ? current : best,
  );
}

function computeStudentActivityStats(
  studentId: string,
  activities: DisciplineActivity[],
  attemptsByActivity: Map<string, ActivityAttemptSummaryDTO[]>,
): StudentActivityStats {
  let attemptedActivities = 0;
  let completedActivities = 0;
  let totalEarnedScore = 0;
  let totalPossibleScore = 0;
  let scoreSum = 0;

  for (const activity of activities) {
    const attempts = attemptsByActivity.get(activity.id) ?? [];
    const bestAttempt = getBestAttempt(attempts, studentId);

    if (!bestAttempt) continue;

    attemptedActivities += 1;
    totalEarnedScore += bestAttempt.score;
    totalPossibleScore += activity.maxScore;
    scoreSum += bestAttempt.score;

    if (bestAttempt.approved) {
      completedActivities += 1;
    }
  }

  const accuracyRate =
    totalPossibleScore > 0
      ? Math.round((totalEarnedScore / totalPossibleScore) * 100)
      : attemptedActivities > 0
        ? Math.round((completedActivities / attemptedActivities) * 100)
        : 0;

  return {
    totalActivities: attemptedActivities,
    completedActivities,
    correctAnswers: Math.round(totalEarnedScore),
    wrongAnswers: Math.max(0, Math.round(totalPossibleScore - totalEarnedScore)),
    accuracyRate,
    averageScore:
      attemptedActivities > 0
        ? Math.round((scoreSum / attemptedActivities) * 10) / 10
        : 0,
  };
}

function buildActivityDetails(
  studentId: string,
  activities: DisciplineActivity[],
  attemptsByActivity: Map<string, ActivityAttemptSummaryDTO[]>,
): ActivityDetail[] {
  return activities.flatMap((activity) => {
    const attempts = attemptsByActivity.get(activity.id) ?? [];
    const studentAttempts = attempts.filter(
      (attempt) => attempt.studentId === studentId,
    );
    const bestAttempt = getBestAttempt(attempts, studentId);

    if (!bestAttempt) return [];

    const accuracyRate =
      activity.maxScore > 0
        ? Math.round((bestAttempt.score / activity.maxScore) * 100)
        : bestAttempt.approved
          ? 100
          : Math.round(
              (bestAttempt.score / Math.max(activity.minimumScore, 1)) * 100,
            );

    return [
      {
        activityId: activity.id,
        activityTitle: activity.title,
        moduleName: activity.moduleName,
        attemptsUsed: studentAttempts.length,
        attemptLimit: activity.attemptLimit,
        bestScore: bestAttempt.score,
        minimumScore: activity.minimumScore,
        approved: bestAttempt.approved,
        correctAnswers: Math.round(bestAttempt.score),
        wrongAnswers: Math.max(
          0,
          Math.round(activity.maxScore - bestAttempt.score),
        ),
        accuracyRate,
      },
    ];
  });
}

async function loadDisciplineActivities(
  disciplineId: string,
): Promise<DisciplineActivity[]> {
  const modules = await listModules(disciplineId, 'Active');

  const activityLists = await Promise.all(
    modules.map(async (module) => {
      const moduleActivities = await listActivities(module.id);

      return moduleActivities
        .filter((activity) => activity.status === 'Active')
        .map((activity) => ({
          id: activity.id,
          title: activity.title,
          moduleName: module.name,
          attemptLimit: activity.attemptLimit,
          minimumScore: activity.minimumScore,
          // Listagem não precisa do detalhe com questões; maxScore é resolvido nas tentativas.
          maxScore: 0,
        }));
    }),
  );

  return activityLists.flat();
}

async function loadAttemptsByActivity(
  activities: DisciplineActivity[],
): Promise<Map<string, ActivityAttemptSummaryDTO[]>> {
  const attemptsByActivity = new Map<string, ActivityAttemptSummaryDTO[]>();

  await Promise.all(
    activities.map(async (activity) => {
      const attemptsPage = await listActivityAttempts(activity.id, { size: 100 });
      attemptsByActivity.set(activity.id, attemptsPage.content ?? []);
    }),
  );

  return attemptsByActivity;
}

export function useProfessorReports() {
  const { user } = useUser();
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailReport | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [disciplines, setDisciplines] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDisciplines() {
      if (!user?.id) {
        if (!cancelled) {
          setDisciplines([]);
          setSelectedDiscipline(null);
          setStudents([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const all = await listDisciplines();
        if (cancelled) return;

        const disciplineList = all
          .filter(
            (discipline) =>
              discipline.status === 'Active' &&
              discipline.responsibleProfessorId === user.id,
          )
          .map((discipline) => ({
            id: discipline.id,
            name: discipline.name,
          }));

        setDisciplines(disciplineList);

        if (disciplineList.length === 0) {
          setSelectedDiscipline(null);
          setStudents([]);
          setLoading(false);
          return;
        }

        setSelectedDiscipline((current) =>
          current && disciplineList.some((d) => d.id === current)
            ? current
            : disciplineList[0].id,
        );
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar as disciplinas.');
          setDisciplines([]);
          setSelectedDiscipline(null);
          setStudents([]);
          setLoading(false);
        }
      }
    }

    void loadDisciplines();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedDiscipline) return;

    let cancelled = false;
    const disciplineId = selectedDiscipline;
    const disciplineName =
      disciplines.find((d) => d.id === disciplineId)?.name ?? '';

    async function loadStudents() {
      setLoading(true);
      setError(null);

      try {
        const [enrollmentsPage, progressPage, activities] = await Promise.all([
          listEnrollmentsByDiscipline(disciplineId, { page: 0, size: 100 }),
          listDisciplineStudentsProgress(disciplineId, 0, 100),
          loadDisciplineActivities(disciplineId),
        ]);

        if (cancelled) return;

        const attemptsByActivity = await loadAttemptsByActivity(activities);
        if (cancelled) return;

        const progressByStudent = new Map(
          (progressPage.content ?? []).map((item) => [item.studentId, item]),
        );

        const studentsData = (enrollmentsPage.content ?? [])
          .filter((enrollment) => enrollment.status === 'APPROVED')
          .map((enrollment) => {
            const progress = progressByStudent.get(enrollment.studentId);
            const overallPercentage = progress?.overallPercentage ?? 0;
            const activityStats = computeStudentActivityStats(
              enrollment.studentId,
              activities,
              attemptsByActivity,
            );

            return {
              enrollmentId: enrollment.id,
              studentId: enrollment.studentId,
              studentName: enrollment.studentName,
              studentEmail: enrollment.studentEmail ?? '',
              disciplineId,
              disciplineName,
              overallPercentage,
              totalModules: progress?.totalModules ?? 0,
              completedModules: progress?.completedModules ?? 0,
              ...activityStats,
              status:
                overallPercentage >= 70
                  ? ('APROVADO' as const)
                  : activityStats.totalActivities > 0 &&
                      activityStats.accuracyRate < 70
                    ? ('REPROVADO' as const)
                    : ('EM_ANDAMENTO' as const),
            };
          });

        setStudents(studentsData);
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStudents();

    return () => {
      cancelled = true;
    };
  }, [selectedDiscipline, disciplines]);

  const loadStudentDetail = useCallback(
    async (studentId: string) => {
      if (!selectedDiscipline) return;

      const student = students.find((s) => s.studentId === studentId);
      if (!student) return;

      setDetailLoading(true);
      setDetailError(null);
      setSelectedStudent(null);

      try {
        const activities = await loadDisciplineActivities(selectedDiscipline);
        const [progressResponse, attemptsByActivity] = await Promise.all([
          getEnrollmentProgress(student.enrollmentId),
          loadAttemptsByActivity(activities),
        ]);

        const activityStats = computeStudentActivityStats(
          studentId,
          activities,
          attemptsByActivity,
        );
        const activitiesDetail = buildActivityDetails(
          studentId,
          activities,
          attemptsByActivity,
        );

        const detail: StudentDetailReport = {
          ...student,
          ...activityStats,
          activities: activitiesDetail,
          moduleProgress: progressResponse.modules ?? [],
        };

        setSelectedStudent(detail);
      } catch (err) {
        setDetailError(getApiErrorMessage(err));
      } finally {
        setDetailLoading(false);
      }
    },
    [selectedDiscipline, students],
  );

  return {
    students,
    loading,
    error,
    detailError,
    detailLoading,
    disciplines,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedStudent,
    loadStudentDetail,
    setSelectedStudent,
  };
}
