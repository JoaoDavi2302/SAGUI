"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/new-services/auth/AuthContext";
import { AuthRequestError } from "@/new-services/auth/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setFieldErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        birthDate: form.birthDate || undefined,
        address: form.address || undefined,
      });

      router.push("/");
    } catch (err) {
      if (err instanceof AuthRequestError) {
        setError(err.message);

        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setError("Não foi possível realizar o cadastro.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 3, align: "center" }}
            >
              Criar conta
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ align: "center", mb: 3 }}
            >
              Novos usuários são cadastrados automaticamente como
              <strong> Aluno</strong>.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                  size="small"
                  label="Nome"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  required
                  fullWidth
                />

                <TextField
                  size="small"
                  label="E-mail"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  required
                  fullWidth
                />

                <TextField
                  size="small"
                //   label="Data de nascimento"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  size="small"
                  label="Endereço"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  size="small"
                  label="Senha"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  label="Confirmar senha"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={22} /> : "Criar conta"}
                </Button>

                <Button variant="text" onClick={() => router.push("/login")}>
                  Já possui uma conta? Entrar
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
