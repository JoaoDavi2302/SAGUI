"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../services/auth/AuthContext";
import { getPostLoginPath } from "../../services/auth/types";
import { ApiError, NetworkError } from "../../services/api/client";
import { Button } from "../../components/ui/Button";
import {
  mapApiFieldErrors,
  REGISTER_LIMITS,
  RegisterFieldErrors,
  validateRegisterForm,
} from "../../services/auth/registerValidation";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "15px",
        color: "#374151",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </Typography>
  );
}

function FormField({
  label,
  optional = false,
  hint,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.75 }}>
        {label}
        {optional && (
          <Typography
            component="span"
            variant="caption"
            sx={{ ml: 0.5, color: "text.secondary", fontWeight: 400 }}
          >
            (opcional)
          </Typography>
        )}
      </Typography>

      {children}

      {(error || hint) && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.75,
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {error ?? hint}
        </Typography>
      )}
    </Box>
  );
}

export default function CadastroPage() {
  const { register } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  function clearFieldError(field: keyof RegisterFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validation = validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
      birthDate,
      address,
    });

    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const trimmedAddress = address.trim();

    try {
      const role = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(birthDate ? { birthDate } : {}),
        ...(trimmedAddress ? { address: trimmedAddress } : {}),
      });
      router.replace(getPostLoginPath(role));
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(mapApiFieldErrors(err.fields));
        setError(err.message);
        return;
      }
      if (err instanceof NetworkError) {
        setError(err.message);
        return;
      }
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      bgcolor: "#fff",
    },
  };

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
        py: 3,
      }}
    >
      <Box sx={{ mb: 3, textAlign: "center", maxWidth: 820 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "30px",
            fontFamily: "system-ui",
            mb: 1,
          }}
        >
          //SAGUI
        </Typography>
        <Typography
          sx={{
            fontFamily: "system-ui",
            fontWeight: 600,
            fontSize: "18px",
            color: "#1a1a1a",
            mb: 0.5,
          }}
        >
          Cadastro de aluno
        </Typography>
        <Typography
          sx={{
            fontFamily: "system-ui",
            fontWeight: 400,
            fontSize: "16px",
            color: "#556255",
          }}
        >
          Crie sua conta para começar
        </Typography>
      </Box>

      <Card
        sx={{
          width: "100%",
          maxWidth: 820,
          borderRadius: 2,
          p: 1,
          border: "2px solid rgba(0,0,0,0.3)",
        }}
      >
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <SectionTitle>Crie a sua conta</SectionTitle>

            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormField label="Nome" error={fieldErrors.name}>
                  <TextField
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    autoComplete="name"
                    required
                    error={Boolean(fieldErrors.name)}
                    placeholder="Seu nome completo"
                    slotProps={{
                      htmlInput: { maxLength: REGISTER_LIMITS.nameMax },
                    }}
                    sx={inputSx}
                  />
                </FormField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormField label="Email" error={fieldErrors.email}>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    autoComplete="email"
                    required
                    error={Boolean(fieldErrors.email)}
                    placeholder="seu@email.com"
                    slotProps={{
                      htmlInput: { maxLength: REGISTER_LIMITS.emailMax },
                    }}
                    sx={inputSx}
                  />
                </FormField>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <FormField label="Endereço" optional error={fieldErrors.address}>
                  <TextField
                    fullWidth
                    size="small"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearFieldError("address");
                    }}
                    autoComplete="street-address"
                    error={Boolean(fieldErrors.address)}
                    placeholder="Rua, número, bairro, cidade"
                    slotProps={{
                      htmlInput: { maxLength: REGISTER_LIMITS.addressMax },
                    }}
                    sx={inputSx}
                  />
                </FormField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormField
                  label="Data de nascimento"
                  optional
                  error={fieldErrors.birthDate}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      clearFieldError("birthDate");
                    }}
                    autoComplete="bday"
                    error={Boolean(fieldErrors.birthDate)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                </FormField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormField
                  label="Senha"
                  hint={`Mínimo de ${REGISTER_LIMITS.passwordMin} caracteres`}
                  error={fieldErrors.password}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    autoComplete="new-password"
                    required
                    error={Boolean(fieldErrors.password)}
                    placeholder="Crie uma senha"
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
                    sx={inputSx}
                  />
                </FormField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormField
                  label="Confirmar senha"
                  error={fieldErrors.confirmPassword}
                >
                  <TextField
                    fullWidth
                    size="small"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    autoComplete="new-password"
                    required
                    error={Boolean(fieldErrors.confirmPassword)}
                    placeholder="Repita a senha"
                    slotProps={{
                      input: {
                        endAdornment:
                          confirmPassword.length > 0 ? (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOffOutlined />
                                ) : (
                                  <VisibilityOutlined />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ) : null,
                      },
                    }}
                    sx={inputSx}
                  />
                </FormField>
              </Grid>
            </Grid>

            <Typography
              sx={{
                display: "block",
                mt: 3,
                fontSize: 13,
                color: "#556255",
                lineHeight: 1.5,
              }}
            >
              Contas de professor e administrador são criadas pela gestão do
              sistema.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.2,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Cadastrar"
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
              Já tem conta?{" "}
              <Link href="/login" style={{ color: "#1976d2", fontWeight: 600 }}>
                Entrar
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
