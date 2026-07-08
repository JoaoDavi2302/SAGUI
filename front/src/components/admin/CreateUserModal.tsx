"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/new-services/poo/shared/api/client";
import {
  createUser,
  type UserRoleDTO,
} from "@/new-services/poo/shared/api/users";
import { ROLE_OPTIONS } from "@/components/admin/RoleSelect";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Aluno" as UserRoleDTO,
  birthDate: "",
  address: "",
};

export function CreateUserModal({
  open,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setError("");
    }
  }, [open]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Informe o nome do usuário.";
    if (!form.email.trim()) return "Informe o e-mail.";
    if (!form.password) return "Informe a senha.";
    if (form.password.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    if (form.password !== form.confirmPassword) {
      return "As senhas não coincidem.";
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        birthDate: form.birthDate || undefined,
        address: form.address.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível cadastrar o usuário.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Novo usuário"
      maxWidth="sm"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            isLoading={loading}
          >
            Cadastrar
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Nome completo"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
          fullWidth
          size="small"
        />

        <TextField
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
          fullWidth
          size="small"
        />

        <FormControl fullWidth size="small" required>
          <InputLabel id="create-user-role-label">Perfil</InputLabel>
          <Select
            labelId="create-user-role-label"
            label="Perfil"
            value={form.role}
            onChange={(event) =>
              updateField("role", event.target.value as UserRoleDTO)
            }
          >
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Senha"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          required
          fullWidth
          size="small"
        />

        <TextField
          label="Confirmar senha"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          required
          fullWidth
          size="small"
        />

        <TextField
          label="Data de nascimento"
          type="date"
          value={form.birthDate}
          onChange={(event) => updateField("birthDate", event.target.value)}
          fullWidth
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Endereço"
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={2}
        />
      </Stack>
    </Modal>
  );
}
