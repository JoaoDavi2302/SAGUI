"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../new-services/auth/AuthContext";

import {
  Box,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

import { Button } from "../../components/ui/Button";
import AuthShell from "@/components/auth/AuthShell";

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
      const profile = await login(email, password);

      if (!profile) {
        setError("Email ou senha inválidos");
        return;
      }

      router.replace(profile.role === "Admin" ? "/dashboard" : "/");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Entrar
        </Typography>

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

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 2, justifyContent: "center", alignItems: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            Não tem conta?
          </Typography>
          <Typography
            component={Link}
            href="/cadastro"
            variant="caption"
            sx={{ fontWeight: 600, textDecoration: "none", color: "primary.main" }}
          >
            Criar conta
          </Typography>
        </Stack>
      </Box>
    </AuthShell>
  );
}
