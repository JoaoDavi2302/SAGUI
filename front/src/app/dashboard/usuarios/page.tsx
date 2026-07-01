"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useUser } from "@/services/auth/AuthContext";
import { ApiError } from "@/services/api/client";
import { UserProfileDTO } from "@/services/api/catalog";
import {
  activateUser,
  changeUserRole,
  deactivateUser,
  listUsers,
  UserRoleDTO,
} from "@/services/api/users";
import { EntityStatusToggle } from "@/components/admin/EntityStatusToggle";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@/components/ui/Table";
import type { EntityStatus } from "@/services/api/catalog";

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function UsuariosPage() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<"role" | "status" | null>(
    null,
  );
  const [feedback, setFeedback] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listUsers();
      setUsers(
        data.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "pt-BR")),
      );
    } catch {
      setError("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 0.5 }}>
        Usuários
      </Typography>
      <Typography sx={{ fontSize: 14, color: "gray", mb: 3 }}>
        Gerencie contas, perfis de acesso e status dos usuários do sistema.
      </Typography>

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
                  <Typography variant="body2" color="text.secondary">
                    Nenhum usuário encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((item) => {
                const isSelf = item.id === currentUser?.id;
                const isUpdating = updatingId === item.id;
                const isUpdatingRole = isUpdating && updatingField === "role";
                const isUpdatingStatus = isUpdating && updatingField === "status";
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
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                              sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1f2937" }}
                            >
                              {item.name}
                            </Typography>
                            {isSelf && (
                              <Badge color="info" label="Você" />
                            )}
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
    </Box>
  );
}
