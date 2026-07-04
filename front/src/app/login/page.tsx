"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../services/auth/AuthContext";
import { getPostLoginPath } from "../../services/auth/types";
import { NetworkError } from "../../services/api/client";
import { Button } from "../../components/ui/Button";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

export default function LoginPage() {
  const { login } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const role = await login(email, password);

      if (!role) {
        setError("Email ou senha inválidos");
        return;
      }

      router.replace(getPostLoginPath(role));
    } catch (err) {
      if (err instanceof NetworkError) {
        setError(err.message);
        return;
      }
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        px: 2,
      }}
    >
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            fontSize: "30px",
            fontFamily: "system-ui",
            textAlign: "center",
            mb: 3,
          }}
        >
          //SAGUI
        </Typography>
        <Typography
          sx={{
            fontFamily: "system-ui",
            fontWeight: 400,
            fontSize: "16px",
            color: "#556255",
          }}
        >
          Entre com sua conta para continuar
        </Typography>
      </Stack>
      <Card
        sx={{
          width: 380,
          borderRadius: 2,
          p: 1,
          border: "2px solid rgba(0,0,0,0.3)",
        }}
      >
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Email
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              value={email}
              size="small"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              sx={{ mt: 0.5 }}
            />

            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2 }}>
              Senha
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password}
              size="small"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              slotProps={{
                input: {
                  endAdornment:
                    password.length > 0 ? (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffOutlined />
                          ) : (
                            <VisibilityOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                },
              }}
              sx={{ mt: 0.5 }}
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

            <Typography
              sx={{
                mt: 2,
                textAlign: "center",
                fontSize: 14,
                color: "#556255",
              }}
            >
              Não tem conta?{" "}
              <Link href="/cadastro" style={{ color: "#1976d2", fontWeight: 600 }}>
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
