import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import type { DisciplineDTO } from "@/new-services/poo/shared/api/catalog";

export function DisciplinaCard({ disciplina }: { disciplina: DisciplineDTO }) {
  const description = disciplina.description?.trim();

  return (
    <Card
      sx={{
        borderRadius: 3,
        borderLeft: "6px solid #1976d2",
        transition: "0.3s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <CardContent
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {disciplina.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description
              ? description.length > 50
                ? `${description.substring(0, 50)}...`
                : description
              : "Sem descrição"}
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          href={`/professor/disciplinas/${disciplina.id}`}
        >
          Gerenciar
        </Button>
      </CardContent>
    </Card>
  );
}
