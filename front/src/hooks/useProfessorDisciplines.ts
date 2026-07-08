"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/new-services/auth/AuthContext";
import { listDisciplines, type DisciplineDTO } from "@/new-services/poo/shared/api/catalog";
import { ApiError } from "@/new-services/poo/shared/api/client";

export function useProfessorDisciplines() {
  const { user } = useUser();
  const [disciplines, setDisciplines] = useState<DisciplineDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setDisciplines([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const all = await listDisciplines();
      setDisciplines(
        all.filter(
          (discipline) => discipline.responsibleProfessorId === user.id,
        ),
      );
    } catch (err) {
      setDisciplines([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as disciplinas.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { disciplines, loading, error, reload };
}
