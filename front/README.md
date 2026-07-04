# SAGUI - Sistema de Gestão Acadêmica Unificada

> *Módulo Front-end (Next.js + TypeScript)*

## Como Executar o Projeto Localmente

1. **Clone o repositório ou atualize sua branch `main`:**

   ```
   git checkout main
   git pull origin main
   ```

2. **Instale as dependências (Usamos npm):**

   ```
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**

   ```
   npm run dev
   ```

4. Acesse no seu navegador: `http://localhost:3000`.

## Como Criar uma Nova Página (Rotas no Next.js App Router)

No Next.js, a URL é definida pelo nome da pasta dentro de `src/app`.

1. **Crie a pasta com o nome da rota desejada:**
   - Exemplo: `src/app/disciplinas` (criará a URL `/disciplinas`)
2. **Crie o arquivo principal obrigatório:**
   - Dentro da pasta, crie um arquivo chamado **obrigatóriamente** `page.tsx`.
3. **Rotas Dinâmicas (com ID):**
   - Se você precisa passar um ID (ex: `/cursos/123`), o nome da pasta deve estar entre colchetes.
   - Exemplo: `src/app/cursos/[id]/page.tsx`

## Estilização e Componentes (Regras da UI)

Por favor, **não crie botões, cards ou inputs do zero**. Utilize os componentes que a Anny construiu em `src/components/ui/` (veja o arquivo `comoUsar.md` lá dentro para detalhes).

Se precisar estilizar localmente com CSS/MUI, você pode:

**Opção 1: Estilização in-line (MUI Style)**

```
<Link href="/sobre" style={{ textDecoration: 'none', color: '#1565c0' }}>
  <Typography>Sobre</Typography>
</Link>
```

**Opção 2: Classes CSS (Importando arquivos de estilo)**

```
<Card className="curso-card">
  {/* O estilo .curso-card deve ser definido num arquivo CSS importado */}
</Card>
```

## Dicas e Solução de Problemas

- **Loop de Login?** Se o sistema ficar preso redirecionando você para a tela de login infinitamente, o problema provavelmente está no arquivo `middleware.ts`. Verifique lá se a rota inicial (`/`) está habilitada na lista de `publicRoutes`.
- **Dados Falsos:** Ainda não estamos conectados ao Back-end (Java). Todos os dados devem ser consumidos do arquivo de Mocks (`src/components/mock.json` ou o método definido pela Líder Técnica).
- **Nenhum texto deve ser** ***hardcoded*** **(chumbado) na tela.** Use variáveis vindo do arquivo de mock.

## Plano de Ação: Sprint de 3 Dias (Versão 2.1)

Estamos num Sprint focado de 3 dias para levantar as principais telas do SAGUI.

### Regras do Git (O Fluxo Obrigatório)

1. Antes de codar: `git pull origin main`
2. Crie sua branch: `git checkout -b feature/sua-tela-aqui`
3. Trabalhe, adicione e faça commit das alterações.
4. Mande para o GitHub: `git push -u origin feature/sua-tela-aqui`
5. **Crie um Pull Request (PR) para a `main`.** Ninguém empurra código direto na `main`. A Letícia fará a revisão e o merge.

### O Que Falta Fazer (Backlog Imediato)

*(Se você assumir um desses, avise no grupo!)*

- [ ] Editar dados da disciplina na visão do professor (EAD).
- [ ] Editar dados do módulo na visão do professor (EAD).
- [ ] Editar material/anexos (link e outros) na visão do professor (EAD).
- [ ] CRUD e detalhamento de Aula.
- [ ] Página principal de Cursos (`/cursos`).
- [ ] Detalhes do Curso (Visão do aluno VS Visão do professor).
- [ ] Dashboard Completo (Gráficos e links rápidos).
- [ ] Página de Perfil do usuário.
- [ ] Lista de Atividades.

### Divisão de Responsabilidades

- **Líder (Letícia):** Code review, destravar o time e gerir a arquitetura.
- **UX/UI e Design (Anny e Bia):** Biblioteca de componentes base, acessibilidade e validação de fluxo.
- **Infra do Front (Marcelly):** Auth, middleware de segurança, `AuthContext`.
- **Admin (Juliana):** Cursos, Disciplinas, Usuários.
- **Pedagógico Admin (Lucas):** Módulos, Aulas, Matrículas.
- **Aluno (Yuri):** Visão de consumo, progresso e atividades.
- **Professor (Henrique):** Visão de criação de conteúdo e edição de disciplinas.
- **Dashboard visual (Juan):** Visão das propriedades das caraterísticas de cada perfil.
