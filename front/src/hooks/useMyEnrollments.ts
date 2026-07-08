import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/new-services/poo/shared/api/client';
import {
  listMyEnrollmentsPage,
  requestEnrollment,
  cancelEnrollment,
  type EnrollmentDetailResponse,
} from '@/new-services/poo/shared/api/enrollments';

interface UseMyEnrollmentsReturn {
  enrollments: EnrollmentDetailResponse[];
  approvedEnrollments: EnrollmentDetailResponse[];
  pendingEnrollments: EnrollmentDetailResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  requestEnrollment: (disciplineId: string) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
}

export function useMyEnrollments(): UseMyEnrollmentsReturn {
  const [enrollments, setEnrollments] = useState<EnrollmentDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listMyEnrollmentsPage(0, 100);
      setEnrollments(response.content);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar matrículas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRequestEnrollment = useCallback(async (disciplineId: string) => {
    try {
      await requestEnrollment({ disciplineId });
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error('Erro ao solicitar matrícula.');
    }
  }, [load]);

  const handleCancelEnrollment = useCallback(async (enrollmentId: string) => {
    try {
      await cancelEnrollment(enrollmentId);
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error('Erro ao cancelar matrícula.');
    }
  }, [load]);

  const approvedEnrollments = enrollments.filter((e) => e.status === 'APPROVED');
  const pendingEnrollments = enrollments.filter((e) => e.status === 'PENDING');

  return {
    enrollments,
    approvedEnrollments,
    pendingEnrollments,
    loading,
    error,
    refresh: load,
    requestEnrollment: handleRequestEnrollment,
    cancelEnrollment: handleCancelEnrollment,
  };
}