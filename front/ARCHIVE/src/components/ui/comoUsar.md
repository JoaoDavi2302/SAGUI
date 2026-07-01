No arquivo de uso:


# BUTTON 


import { Badge } from '@/components/ui/Badge';

 {/* Exemplo de uso do Button*/}

 
exemplos detipos específicos que o  botão aceitará
Variant = 'contained' | 'outlined' | 'text' | 'soft'; // adicionado 'soft'
Color = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'; 


<Button variant="contained" color="primary" isLoading={loading}>
  Exemplo/Teste
</Button>
<Button variant="outlined" color="error" isLoading={loading}>
  Exemplo/Teste
</Button>


# BADGE

import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  return (
    <div className="flex flex-wrap gap-3 p-6">
      
      {/* Variante Soft (Padrão) - Ideal para Status de Sistemas */}
      <Badge color="success" label="Concluído" dot />
      <Badge color="warning" label="Análise Pendente" dot />
      <Badge color="error" label="Erro Crítico" dot />
      
      {/* Variante Diferente para Categorias ou Neutros */}
      <Badge color="neutral" label="Rascunho" />
      <Badge color="secondary" variant="outlined" label="Tag Secundária" />
      
      {/* Variante Totalmente Preenchida (MUI Original) */}
      <Badge color="primary" variant="filled" label="Admin" />

    </div>
  );
}



# CARD

import { Card, CardHeader, CardContent, CardActions } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ExemploPage() {
  return (
    <div className="p-6 max-w-sm">
      
      {/* Criando um Card interativo */}
      <Card hoverable>
        
        {/* Cabeçalho com Título e o nosso Badge de Status do lado */}
        <CardHeader 
          title="Matrícula Acadêmica" 
          subheader="ID: #2026-098"
          action={<Badge color="warning" label="Pendente" dot />}
        />
        
        {/* Conteúdo do Card */}
        <CardContent>
          <p className="font-medium text-gray-800 mb-1">Aluno: João Davi</p>
          <p>O processo de envio da documentação está aguardando a validação da secretaria acadêmica do SAGUI.</p>
        </CardContent>
        
        {/* Ações com o nosso Botão customizado */}
        <CardActions>
          <Button variant="text" color="secondary">Ignorar</Button>
          <Button variant="contained" color="primary">Analisar</Button>
        </CardActions>

      </Card>

    </div>
  );
}


# INPUT

import { Input } from '@/components/ui/Input';

// Exemplo de uso em formulário:
<Input 
  label="Usuário ou E-mail" 
  placeholder="Digite seu e-mail institucional"
/>


