"use client";

import { useUser } from "@/services/auth/AuthContext";
import { Container, Paper, Typography, Box, Stack, Divider, Button } from "@mui/material";
import DrawerLayout from "@/components/drawer";

export default function PerfilPage() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <DrawerLayout title="Perfil">
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Informações Pessoais
          </Typography>
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">Nome Completo</Typography>
              <Typography variant="body1">{user.nome}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="caption" color="text.secondary">Email Institucional</Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="caption" color="text.secondary">Data de Nascimento</Typography>
              <Typography variant="body1">{user.dataNascimento || "Não informada"}</Typography>
            </Box>
            
            <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
              Alterar Senha
            </Button>
          </Stack>
        </Paper>
      </Container>
    </DrawerLayout>
  );
}