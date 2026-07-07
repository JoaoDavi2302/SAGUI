"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import { CheckOutlined, CloseOutlined } from "@mui/icons-material";
import { useUser } from "@/new-services/auth/AuthContext";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { listCourses } from "@/new-services/poo/shared/api/catalog";
import {
  approveEnrollment,
  type EnrollmentDetailDTO,
  listPendingEnrollmentsPage,
  rejectEnrollment,
} from "@/new-services/poo/shared/api/enrollment";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@/components/ui/Table";

const PAGE_SIZE = 10;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function MatriculasPageContent() {
  const [enrollments, setEnrollments] = useState<EnrollmentDetailDTO[]>([]);
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = useState<"approve" | "reject" | null>(
    null,
  );

  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [enrollmentsResult, coursesResult] = await Promise.allSettled([
        listPendingEnrollmentsPage({ page, size: PAGE_SIZE }),
        listCourses(),
      ]);

      if (enrollmentsResult.status === "fulfilled") {
        const data = enrollmentsResult.value;
        setEnrollments(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setEnrollments([]);
        setTotalPages(0);
        setTotalElements(0);
        setError("Não foi possível carregar as matrículas pendentes.");
      }

      if (coursesResult.status === "fulfilled") {
        setCourseNames(
          Object.fromEntries(
            coursesResult.value.map((course) => [course.id, course.name ?? ""]),
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const pendingCountLabel = useMemo(() => {
    if (totalElements === 0) return "Nenhuma solicitação pendente.";
    if (totalElements === 1) return "1 solicitação aguardando análise.";
    return `${totalElements} solicitações aguardando análise.`;
  }, [totalElements]);

  async function handleAction(
    enrollmentId: string,
    action: "approve" | "reject",
  ) {
    setUpdatingId(enrollmentId);
    setUpdatingAction(action);
    setFeedback("");
    setError("");

    try {
      const result =
        action === "approve"
          ? await approveEnrollment(enrollmentId)
          : await rejectEnrollment(enrollmentId);
      setFeedback(result.message);
      await loadEnrollments();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : action === "approve"
            ? "Não foi possível aprovar a matrícula."
            : "Não foi possível rejeitar a matrícula.",
      );
    } finally {
      setUpdatingId(null);
      setUpdatingAction(null);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 0.5 }}>
        Matrículas
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
        Aprove ou recuse solicitações de matrícula em disciplinas (RF16 / UC18).
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Badge color="warning" label={pendingCountLabel} />
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {feedback ? (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {feedback}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow hoverable={false}>
                  <TableCell isHeader>Aluno</TableCell>
                  <TableCell isHeader>Disciplina</TableCell>
                  <TableCell isHeader>Curso</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader align="right">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow hoverable={false}>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma matrícula pendente no momento.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => {
                    const isUpdating = updatingId === enrollment.id;
                    const isApproving = isUpdating && updatingAction === "approve";
                    const isRejecting = isUpdating && updatingAction === "reject";
                    const courseName = enrollment.courseId
                      ? courseNames[enrollment.courseId] ?? "Curso vinculado"
                      : "—";

                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "#eef2ff",
                                color: "#4338ca",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(enrollment.studentName)}
                            </Avatar>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                              {enrollment.studentName}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                            {enrollment.disciplineName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                          >
                            {courseName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Badge color="warning" label="Pendente" dot />
                        </TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              size="small"
                              color="success"
                              startIcon={<CheckOutlined />}
                              isLoading={isApproving}
                              disabled={isUpdating}
                              onClick={() =>
                                handleAction(enrollment.id, "approve")
                              }
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<CloseOutlined />}
                              isLoading={isRejecting}
                              disabled={isUpdating}
                              onClick={() =>
                                handleAction(enrollment.id, "reject")
                              }
                            >
                              Recusar
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Página {page + 1} de {totalPages} · {totalElements} solicitações
              </Typography>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          ) : totalElements > 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {totalElements} solicitaç{totalElements === 1 ? "ão" : "ões"} no total
            </Typography>
          ) : null}
        </>
      )}
    </Box>
  );
}

export default function MatriculasPage() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <MatriculasPageContent />
    </Suspense>
  );
}
