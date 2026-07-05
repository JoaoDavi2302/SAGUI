//area pro perfil
'use client';
import { useUser } from "@/services/auth/AuthContext";
import { Box, Card, CardContent, Typography, Divider, Chip, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import { GitHub, LinkedIn, Language, Email } from "@mui/icons-material";

export default function PerfilPage() {
  const { user, effectiveRole } = useUser();

  if (!user) {
    return <Box sx={{ p: 3 }}>Carregando...</Box>;
  }

  // Links externos fictícios para simular o perfil profissional
  const professionalLinks = [
    { icon: <GitHub />, text: "GitHub", url: "https://github.com/usuario" },
    { icon: <LinkedIn />, text: "LinkedIn", url: "https://linkedin.com/in/usuario" },
    { icon: <Language />, text: "Portfólio", url: "https://meusite.com" },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Meu Perfil</Typography>

      <Card sx={{ borderRadius: 3, p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{user.nome}</Typography>
            <Chip label={effectiveRole} color="primary" variant="outlined" />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">Informações de Contato</Typography>
          <List>
            <ListItem>
              <ListItemIcon><Email /></ListItemIcon>
              <ListItemText primary={user.email} />
            </ListItem>
          </List>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Links Profissionais
          </Typography>
          <List>
            {professionalLinks.map((link, index) => (
              <ListItemButton key={index} component="a" href={link.url} target="_blank">
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.text} />
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}