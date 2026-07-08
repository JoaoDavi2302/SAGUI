"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useUser } from "@/new-services/auth/AuthContext";
import { ApiError } from "@/new-services/poo/shared/api/client";
import { UserProfileDTO } from "@/new-services/poo/shared/api/catalog";
import {
  activateUser,
  changeUserRole,
  deactivateUser,
  listUsersPage,
  UserRoleDTO,
} from "@/new-services/poo/shared/api/users";
import { EntityStatusToggle } from "@/components/admin/EntityStatusToggle";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { RoleSelect } from "@/components/admin/RoleSelect";
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
import type { EntityStatus } from "@/new-services/poo/shared/api/catalog";

const PAGE_SIZE = 10;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function UsuariosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const committedQuery = (searchParams.get("user") ?? "").trim();
  const { user: currentUser } = useUser();

  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<"role" | "status" | null>(
    null,
  );
  const [feedback, setFeedback] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [committedQuery]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listUsersPage({
        page,
        size: PAGE_SIZE,
        search: committedQuery || undefined,
      });
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      setError("Não foi possível carregar os usuários.");
      setUsers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, committedQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(userId: string, role: UserRoleDTO) {
    setUpdatingId(userId);
    setUpdatingField("role");
    setFeedback("");
    setError("");

    try {
      const updated = await changeUserRole(userId, role);
      setUsers((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, ...updated } : item)),
      );
      setFeedback("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível alterar o perfil do usuário.",
      );
      await loadUsers();
    } finally {
      setUpdatingId(null);
      setUpdatingField(null);
    }
  }

  async function handleStatusChange(userId: string, status: EntityStatus) {
    setUpdatingId(userId);
    setUpdatingField("status");
    setFeedback("");
    setError("");

    try {
      const updated =
        status === "Active"
          ? await activateUser(userId)
          : await deactivateUser(userId);
      setUsers((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, ...updated } : item)),
      );
      setFeedback(
        status === "Active"
          ? "Usuário ativado com sucesso."
          : "Usuário inativado com sucesso.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível alterar o status do usuário.",
      );
      await loadUsers();
    } finally {
      setUpdatingId(null);
      setUpdatingField(null);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>
        Usuários
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3 }}>
        Gerencie contas, perfis de acesso e status dos usuários do sistema.
      </Typography>

      {committedQuery ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {totalElements === 1
              ? `Exibindo o usuário encontrado para "${committedQuery}".`
              : `Exibindo ${totalElements} resultado(s) para "${committedQuery}".`}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push("/dashboard/usuarios")}
          >
            Limpar busca
          </Button>
        </Box>
      ) : null}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {feedback && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {feedback}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }}>Usuários cadastrados</Typography>
          {!loading && totalElements > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {totalElements} usuário{totalElements === 1 ? "" : "s"} no total
            </Typography>
          ) : null}
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
        >
          Novo usuário
        </Button>
      </Box>

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
                  <TableCell isHeader>Usuário</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Perfil</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow hoverable={false}>
                    <TableCell colSpan={3}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {committedQuery
                            ? "Nenhum usuário encontrado para essa busca."
                            : "Nenhum usuário cadastrado ainda."}
                        </Typography>
                        {!committedQuery ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateModalOpen(true)}
                          >
                            Cadastrar usuário
                          </Button>
                        ) : null}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((item) => {
                    const isSelf = item.id === currentUser?.id;
                    const isUpdating = updatingId === item.id;
                    const isUpdatingRole = isUpdating && updatingField === "role";
                    const isUpdatingStatus =
                      isUpdating && updatingField === "status";
                    const isInactive = item.status === "Inactive";

                    return (
                      <TableRow
                        key={item.id}
                        sx={{ opacity: isInactive ? 0.72 : 1 }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: isInactive ? "#f3f4f6" : "#eef2ff",
                                color: isInactive ? "#9ca3af" : "#4338ca",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(item.name)}
                            </Avatar>
                            <Box>
                              <Box
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    color: "#1f2937",
                                  }}
                                >
                                  {item.name}
                                </Typography>
                                {isSelf && <Badge color="info" label="Você" />}
                              </Box>
                              <Typography
                                sx={{ fontSize: "0.8rem", color: "#6b7280", mt: 0.25 }}
                              >
                                {item.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <EntityStatusToggle
                            compact
                            status={isInactive ? "Inactive" : "Active"}
                            disabled={isSelf}
                            loading={isUpdatingStatus}
                            onToggle={(next) => handleStatusChange(item.id!, next)}
                          />
                          {isSelf && (
                            <Typography
                              variant="caption"
                              sx={{ display: "block", color: "#9ca3af", mt: 0.75 }}
                            >
                              Não é possível inativar a própria conta
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <RoleSelect
                            value={(item.role ?? "Aluno") as UserRoleDTO}
                            disabled={isSelf}
                            loading={isUpdatingRole}
                            onChange={(role) => handleRoleChange(item.id!, role)}
                          />
                          {isSelf && (
                            <Typography
                              variant="caption"
                              sx={{ display: "block", color: "#9ca3af", mt: 0.75 }}
                            >
                              Não é possível alterar o próprio perfil
                            </Typography>
                          )}
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
                Página {page + 1} de {totalPages} · {totalElements} usuários
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
          ) : null}
        </>
      )}

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setFeedback("Usuário cadastrado com sucesso.");
          setPage(0);
          loadUsers();
        }}
      />
    </Box>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <UsuariosPageContent />
    </Suspense>
  );
}
