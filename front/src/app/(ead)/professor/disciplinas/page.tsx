import { 
  Box, Container, Typography, Grid, Card, CardContent, Button, Chip, Stack 
} from "@mui/material";
import { MenuBookOutlined, PeopleAltOutlined, AssignmentOutlined } from "@mui/icons-material";
import mockData from "@/components/mock.json"; // Ajuste o caminho conforme seu projeto

export default function DisciplinasPage() {
  // Simulação de filtro para o professor logado (ID 2)
  const professorId = 2;
  const minhasDisciplinas = mockData.disciplinas.filter(
    (d: any) => Number(d.professor_id) === professorId
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Minhas Disciplinas</Typography>
        <Typography color="text.secondary">
          Gestão completa do seu ambiente de ensino.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {minhasDisciplinas.map((disciplina: any) => (
          <Grid key={disciplina.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {disciplina.nome}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {disciplina.descricao}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip icon={<PeopleAltOutlined />} label="45 Alunos" size="small" />
                  <Chip icon={<AssignmentOutlined />} label="3 Módulos" size="small" />
                </Stack>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  href={`/professor/disciplinas/${disciplina.id}`}
                  sx={{ borderRadius: 2 }}
                >
                  Acessar Turma
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}