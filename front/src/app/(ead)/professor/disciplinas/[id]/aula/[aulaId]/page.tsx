"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Box, Typography, TextField, Button, Paper, Divider, 
  IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Breadcrumbs, Link
} from "@mui/material";
import { Save, Add, Delete, ArrowBack, VideoLibrary, Description } from "@mui/icons-material";
import { useDashboard } from "@/components/DashboardProvider";
import toast from "react-hot-toast";

export default function EditorAulaPage() {
  const params = useParams();
  const router = useRouter();
  const { data, handleUpdateConteudoAula } = useDashboard();
  
  const disciplinaId = Number(params.id);
  const aulaId = Number(params.aulaId);

  // Estados do formulário
  const [aula, setAula] = useState<any>(null);
  const [conteudo, setConteudo] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Estado para materiais de apoio (lista de links/arquivos)
  const [materiais, setMateriais] = useState<{titulo: string, url: string}[]>([]);
  const [novoMaterialTitulo, setNovoMaterialTitulo] = useState("");
  const [novoMaterialUrl, setNovoMaterialUrl] = useState("");

  // Carrega os dados da aula ao abrir a página
  useEffect(() => {
    const aulaAtual = data.aulas.find((a: any) => a.id === aulaId);
    if (aulaAtual) {
      setAula(aulaAtual);
      setConteudo(aulaAtual.conteudo || "");
      setVideoUrl(aulaAtual.video_url || "");
      setMateriais(aulaAtual.material_apoio || []);
    }
  }, [aulaId, data.aulas]);

  const handleAddMaterial = () => {
    if (novoMaterialTitulo && novoMaterialUrl) {
      setMateriais([...materiais, { titulo: novoMaterialTitulo, url: novoMaterialUrl }]);
      setNovoMaterialTitulo("");
      setNovoMaterialUrl("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    const novosMateriais = materiais.filter((_, i) => i !== index);
    setMateriais(novosMateriais);
  };

  const handleSalvarAula = () => {
    handleUpdateConteudoAula(aulaId, {
      conteudo: conteudo,
      video_url: videoUrl,
      material_apoio: materiais
    });
    toast.success("Conteúdo da aula salvo com sucesso!");
    // Opcional: router.push(`/professor/disciplinas/${disciplinaId}`) para voltar
  };

  if (!aula) return <Typography sx={{ p: 3 }}>Carregando aula...</Typography>;

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', p: 3 }}>
      {/* Navegação / Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          component="button" 
          variant="body1" 
          onClick={() => router.push(`/professor/disciplinas/${disciplinaId}`)}
          sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}
        >
          <ArrowBack sx={{ mr: 0.5, fontSize: 20 }} />
          Voltar para Disciplina
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>{aula.titulo}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Editor de Aula</Typography>
        <Button variant="contained" startIcon={<Save />} onClick={handleSalvarAula}>
          Salvar Alterações
        </Button>
      </Box>

      {/* Bloco 1: Vídeo */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VideoLibrary sx={{ mr: 1, color: 'primary.main' }} />
          Vídeo Principal (Opcional)
        </Typography>
        <TextField 
          fullWidth 
          label="URL do Vídeo (YouTube, Vimeo, etc.)" 
          variant="outlined" 
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Ex: https://www.youtube.com/watch?v=..."
        />
      </Paper>

      {/* Bloco 2: Conteúdo em Texto */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Description sx={{ mr: 1, color: 'primary.main' }} />
          Estrutura da Aula (Texto base)
        </Typography>
        <TextField 
          fullWidth 
          multiline 
          rows={10} // Área grande para o professor digitar bastante
          label="Escreva o conteúdo da aula aqui..." 
          variant="outlined" 
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
      </Paper>

      {/* Bloco 3: Materiais de Apoio */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Material de Apoio (Links e PDFs)</Typography>
        
        {/* Formulário para adicionar material */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField 
            label="Título do Material" 
            size="small" 
            fullWidth 
            value={novoMaterialTitulo}
            onChange={(e) => setNovoMaterialTitulo(e.target.value)}
          />
          <TextField 
            label="URL (Link do arquivo ou site)" 
            size="small" 
            fullWidth 
            value={novoMaterialUrl}
            onChange={(e) => setNovoMaterialUrl(e.target.value)}
          />
          <Button variant="outlined" startIcon={<Add />} onClick={handleAddMaterial}>
            Adicionar
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Lista de materiais adicionados */}
        {materiais.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            Nenhum material de apoio adicionado.
          </Typography>
        ) : (
          <List>
            {materiais.map((mat, index) => (
              <ListItem key={index} sx={{ bgcolor: '#f8fafc', mb: 1, borderRadius: 1 }}>
                <ListItemText 
                  primary={mat.titulo} 
                  secondary={<a href={mat.url} target="_blank" rel="noreferrer">{mat.url}</a>} 
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" color="error" onClick={() => handleRemoveMaterial(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}