import { Card, CardContent, Typography, Button, Box } from "@mui/material";

export function DisciplinaCard({ disciplina }: { disciplina: any }) {
  return (
    <Card sx={{ borderRadius: 3, borderLeft: "6px solid #1976d2", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {disciplina.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {disciplina.descricao ? disciplina.descricao.substring(0, 50) : "Sem descrição"}...
          </Typography>
        </Box>
        <Button variant="text" size="small" href={`/professor/disciplinas/${disciplina.id}/alunos`}>
          Gerenciar
        </Button>
      </CardContent>
    </Card>
  );
}