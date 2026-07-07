"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useUser } from "@/new-services/auth/AuthContext";
import { ApiError } from "@/new-services/poo/shared/api/client";
import {
  getProfile,
  getRoleLabel,
  updateProfile,
} from "@/new-services/poo/shared/api/profile";
import { getRoleOption } from "@/components/admin/RoleSelect";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
      {label}
      {required ? (
        <Typography component="span" color="error.main">
          {" "}
          *
        </Typography>
      ) : null}
    </Typography>
  );
}

export default function PerfilPage() {
  const { user, loading: authLoading, refreshUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError("");

    try {
      const profile = await getProfile();
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setBirthDate(profile.birthDate ?? "");
      setAddress(profile.address ?? "");
      setRoleLabel(getRoleLabel(profile.role));
      setStatus(profile.status === "Inactive" ? "Inactive" : "Active");
    } catch {
      setError("Não foi possível carregar seu perfil.");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadProfile();
    }
  }, [authLoading, user, loadProfile]);

  function validate(): string | null {
    if (!name.trim()) return "Informe seu nome.";
    if (!email.trim()) return "Informe seu e-mail.";

    const changingPassword =
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0;

    if (changingPassword) {
      if (!currentPassword) return "Informe a senha atual para alterá-la.";
      if (!newPassword) return "Informe a nova senha.";
      if (newPassword.length < 6) {
        return "A nova senha deve ter no mínimo 6 caracteres.";
      }
      if (newPassword !== confirmPassword) {
        return "A confirmação da nova senha não confere.";
      }
    }

    if (birthDate && new Date(birthDate) >= new Date()) {
      return "Data de nascimento inválida.";
    }

    if (address.trim().length > 300) {
      return "Endereço com no máximo 300 caracteres.";
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFeedback("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const changingPassword = Boolean(currentPassword || newPassword);

    setSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        birthDate: birthDate || undefined,
        address: address.trim() || undefined,
        ...(changingPassword
          ? {
              currentPassword,
              newPassword,
            }
          : {}),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refreshUser();
      await loadProfile();
      setFeedback("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadingProfile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const passwordToggle = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShowPasswords((current) => !current)}
        edge="end"
      >
        {showPasswords ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>
        Perfil
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3 }}>
        Atualize seus dados pessoais e senha de acesso.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap" }}>
        <Badge color="info" label={roleLabel || getRoleOption(user.role).label} />
        <Badge
          color={status === "Active" ? "success" : "neutral"}
          label={status === "Active" ? "Conta ativa" : "Conta inativa"}
          dot
        />
      </Stack>

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

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}
      >
        <Typography sx={{ fontWeight: 700, mb: 2 }}>
          Informações pessoais
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Nome completo" required />
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="E-mail" required />
            <TextField
              fullWidth
              size="small"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Data de nascimento" />
            <TextField
              fullWidth
              size="small"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FieldLabel label="Endereço" />
            <TextField
              fullWidth
              size="small"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              multiline
              minRows={2}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
          Alterar senha
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Preencha apenas se quiser trocar sua senha.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <FieldLabel label="Senha atual" />
            <TextField
              fullWidth
              size="small"
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              slotProps={{ input: { endAdornment: passwordToggle } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Nova senha" />
            <TextField
              fullWidth
              size="small"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Confirmar nova senha" />
            <TextField
              fullWidth
              size="small"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            mt: 3,
            flexWrap: "wrap",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            disabled={saving}
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setError("");
              setFeedback("");
              loadProfile();
            }}
          >
            Descartar
          </Button>
          <Button type="submit" variant="contained" isLoading={saving}>
            Salvar alterações
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
