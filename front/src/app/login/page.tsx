"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { useUser } from "../../new-services/auth/AuthContext";
=======
import { useUser } from "../../services/auth/AuthContext";
import Image from "next/image";
import Logo from "../../../public/Longa-logo.svg";

// USO DO UI/BUTTON
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
>>>>>>> origin/develop

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
<<<<<<< HEAD
    <AuthShell>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Entrar
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Email
        </Typography>
=======
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
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Image
          src={Logo}
          alt="logo"
          style={{ width: "220px", alignSelf: "center", marginBottom: "-15px" }}
        />
        <Typography
          sx={{
            fontFamily: "system-ui",
            fontWeight: 400,
            fontSize: "16px",
            color: "#556255",
          }}
        >
          Plataforma academica de estudos
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
>>>>>>> origin/develop

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

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/develop
  );
}
