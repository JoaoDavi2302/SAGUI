"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/services/AuthContext";

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

export default function LoginPage() {
  const { login } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(email, password);

      if (!success) {
        setError("Email ou senha inválidos");
        return;
      }

      // home neutra (decisão correta do seu fluxo)
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: 380,
          borderRadius: 3,
          p: 1,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <CardContent>
          {/* HEADER */}
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Sagui
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entre com sua conta para continuar
            </Typography>
          </Stack>

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

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
                "Entrar"
              )}
            </Button>

            {/* extra UX */}
            <Stack
              sx={{
                direction: "row",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <Typography variant="caption" sx={{ cursor: "pointer" }}>
                Esqueci minha senha
              </Typography>

              <Typography variant="caption" sx={{ cursor: "pointer" }}>
                Criar conta
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
