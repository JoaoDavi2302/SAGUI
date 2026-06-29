"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../services/auth/AuthContext";

// USO DO UI/BUTTON
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

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
      const success = await login(email, password);

      if (!success) {
        setError("Email ou senha inválidos");
        return;
      }

      // teste de login, redirecionando
      console.log("LOGIN SUCCESS");

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
          {/* HEADER */}
          {/* FORM */}
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

              {/* Exemplo de uso do Button*/}

              {/* 
              exemplos detipos específicos que o  botão aceitará
              Variant = 'contained' | 'outlined' | 'text' | 'soft'; // adicionado 'soft'
              Color = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'; */
              }

              <Button variant="contained" color="primary" isLoading={loading}>
                Exemplo/Teste
              </Button>
              <Button variant="outlined" color="error" isLoading={loading}>
                Exemplo/Teste
              </Button>


              <Input 
                label="Teste" 
                placeholder="Testando...."
              />
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
