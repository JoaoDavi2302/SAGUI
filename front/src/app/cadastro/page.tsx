"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

import { Button } from "@/components/ui/Button";
import CadastroShell from "@/components/auth/CadastroShell";
import { useUser } from "@/services/auth/AuthContext";
import { AuthRequestError } from "@/services/auth/authApi";

function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
      {label}
      {required && (
        <Typography component="span" color="error.main">
          {" "}
          *
        </Typography>
      )}
    </Typography>
  );
}

export default function CadastroPage() {
  const { register } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateClient(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Informe seu nome.";
    } else if (name.trim().length > 100) {
      errors.name = "Nome com no máximo 100 caracteres.";
    }

    if (!email.trim()) {
      errors.email = "Informe seu email.";
    }

    if (!password) {
      errors.password = "Informe uma senha.";
    } else if (password.length < 6) {
      errors.password = "Senha com no mínimo 6 caracteres.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirme a senha.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem.";
    }

    if (!birthDate) {
      errors.birthDate = "Informe sua data de nascimento.";
    } else if (new Date(birthDate) >= new Date()) {
      errors.birthDate = "Data de nascimento inválida.";
    }

    if (address.trim().length > 300) {
      errors.address = "Endereço com no máximo 300 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateClient()) {
      setError("Verifique os campos destacados.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        birthDate,
        address: address.trim() || undefined,
      });

      router.replace("/");
    } catch (err) {
      if (err instanceof AuthRequestError) {
        if (err.code === "VALIDATION" && err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }

        setError(err.message);
        return;
      }

      if (err instanceof Error && err.message === "AUTH_RESPONSE_INVALID") {
        setError(
          "Conta criada, mas a resposta do servidor veio incompleta. Tente entrar com seu email e senha.",
        );
        return;
      }

      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const passwordToggle =
    password.length > 0 || confirmPassword.length > 0 ? (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
        >
          {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
        </IconButton>
      </InputAdornment>
    ) : null;

  return (
    <CadastroShell>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Criar conta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Preencha as informações para criar sua conta.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Nome completo" required />
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Email" required />
            <TextField
              fullWidth
              size="small"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Data de nascimento" required />
            <TextField
              fullWidth
              size="small"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={Boolean(fieldErrors.birthDate)}
              helperText={fieldErrors.birthDate}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Endereço" />
            <TextField
              fullWidth
              size="small"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              placeholder="Rua, número, cidade"
              error={Boolean(fieldErrors.address)}
              helperText={fieldErrors.address}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Senha" required />
            <TextField
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password ?? "Mínimo de 6 caracteres"}
              slotProps={{ input: { endAdornment: passwordToggle } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Confirmar senha" required />
            <TextField
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword}
              slotProps={{ input: { endAdornment: passwordToggle } }}
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: 1.2,
            fontWeight: 600,
            borderRadius: 2,
          }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Criar conta"
          )}
        </Button>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 2, justifyContent: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            Já tem conta?
          </Typography>
          <Typography
            component={Link}
            href="/login"
            variant="caption"
            sx={{ fontWeight: 600, textDecoration: "none", color: "primary.main" }}
          >
            Entrar
          </Typography>
        </Stack>
      </Box>
    </CadastroShell>
  );
}
