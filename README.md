# SAGUI — Sistema de Gestão Acadêmica Unificada

Plataforma para gestão de cursos, disciplinas, conteúdos pedagógicos, matrículas, progresso e avaliações. O repositório é um monorepo com API Spring Boot (`back/`) e interface Next.js (`front/`).

---

## Visão geral

O SAGUI atende três perfis de usuário:

| Perfil | Papel principal |
|--------|-----------------|
| **Admin** | CRUD de cursos, disciplinas, usuários, aprovação de matrículas e ativação/inativação de entidades |
| **Professor** | Gestão de conteúdo das disciplinas sob sua responsabilidade (módulos, aulas, anexos, atividades) e acompanhamento de alunos |
| **Aluno** | Solicitação de matrícula, consumo de conteúdo, conclusão de aulas, realização de atividades e acompanhamento de progresso |

Hierarquia pedagógica:

```
Curso
 └── Disciplina (professor responsável)
      └── Módulo (ordem)
           ├── Aula (ordem) + Anexos
           ├── Anexo (nível módulo)
           └── Atividade
                └── Questão → Alternativas
```

---

## visão geral

### Autenticação e usuários

- Login/registro com JWT + refresh token
- Perfis: `Admin`, `Professor`, `Aluno`
- Admin pode criar usuários, alterar role e ativar/desativar contas
- Usuário ativo/inativo controla acesso (`EntityStatus`)
- Perfil editável pelo próprio usuário (`/api/users/me`)

### Catálogo acadêmico

- Admin cadastro e manutenção de **cursos** e **disciplinas**
- Disciplina pertence a um curso e tem **professor responsável**
- Soft-status: entidades podem ser ativadas/inativadas sem exclusão física

### Conteúdo pedagógico

- **Módulos** ordenados (`orderIndex`) dentro da disciplina
- **Aulas** ordenadas dentro do módulo
- **Anexos** (documento, imagem, vídeo/YouTube) ligados a aula e/ou módulo
- Professor gerencia conteúdo das disciplinas em que é responsável; não cria/exclui cursos e disciplinas

### Matrículas

- Aluno solicita matrícula em curso ou disciplina
- Status: `PENDING` → `APPROVED` / `REJECTED` / `CANCELLED`
- Admin aprova ou rejeita solicitações pendentes

### Progresso e trilha

- Aluno marca aula como concluída (`LessonProgress`)
- Progresso agregado por módulo e disciplina
- Acesso a módulo subsequente pode depender da conclusão do anterior (trilha sequencial)

### Avaliações

- Atividade vinculada a um módulo
- Limite padrão de **3 tentativas** (`attemptLimit`)
- Nota mínima padrão de **70%** para aprovação (`minimumScore`)
- Tipos de questão: resposta única (`SINGLE_CHOICE`), múltipla seleção (`MULTIPLE_CHOICE`), verdadeiro/falso (`TRUE_FALSE`)
- Correção automática com base nas alternativas corretas
- Tentativas registradas com score, status e respostas do aluno

### Não funcionais (resumo)

- API REST com Spring Security (JWT)
- Banco PostgreSQL
- Front responsivo (Next.js + MUI + Tailwind)
- Documentação OpenAPI no backend
- Deploy via Docker / Railway (API) e Vercel (front)

---

## Entidades do domínio

Todas as entidades principais (exceto `RefreshToken`) estendem `BaseEntity`:

| Campo | Descrição |
|-------|-----------|
| `id` | UUID |
| `createdAt` / `updatedAt` | Auditoria JPA |
| `status` | `Active` \| `Inactive` |

### Mapa de entidades

| Entidade | Tabela | Descrição |
|----------|--------|-----------|
| **User** | `users` | Nome, email, senha (hash), role, dados de perfil; implementa `UserDetails` |
| **RefreshToken** | `refresh_tokens` | Token de renovação de sessão (1:1 com usuário) |
| **Course** | `courses` | Curso; N:N com professores e alunos; 1:N disciplinas |
| **Discipline** | `disciplines` | Disciplina de um curso; professor responsável; 1:N módulos |
| **Module** | `modules` | Módulo ordenado da disciplina; aulas, anexos e atividades |
| **Lesson** | `lessons` | Aula ordenada do módulo; anexos |
| **Attachment** | `attachments` | Material (nome, URL, tipo, tamanho); vínculo com lesson e/ou module |
| **Activity** | `activities` | Avaliação do módulo; limite de tentativas e nota mínima |
| **Question** | `questions` | Enunciado, tipo, pontuação; 1:N alternativas |
| **Alternative** | `alternatives` | Texto da opção e flag `correct` |
| **ActivityAttempt** | `activity_attempts` | Tentativa do aluno (número, score, approved, status) |
| **StudentAnswer** | `student_answers` | Resposta por questão; N:N com alternativas selecionadas |
| **Enrollment** | `enrollments` | Matrícula aluno ↔ curso e/ou disciplina + status |
| **LessonProgress** | `lesson_progress` | Conclusão de aula por aluno |

### Enums

| Enum | Valores |
|------|---------|
| `UserRole` | `Admin`, `Professor`, `Aluno` |
| `EntityStatus` | `Active`, `Inactive` |
| `EnrollmentStatus` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `QuestionType` | `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE` |
| `AttemptStatus` | `IN_PROGRESS`, `FINISHED` |
| `AttachmentType` | `DOCUMENT`, `IMAGE`, `VIDEO` |


---

## Estrutura do repositório

```
SAGUI/
├── back/                 # API Spring Boot
├── front/                # App Next.js
├── docker-compose.yml    # PostgreSQL + backend
├── .env                  # Variáveis locais (não versionar segredos)
└── README.md
```

---

## Backend (`back/`)

### Stack

- Java 17, Spring Boot 4
- Spring Web, Data JPA, Security, Validation
- PostgreSQL, JWT, Lombok, Springdoc OpenAPI
- Maven (`./mvnw`)

### Arquitetura em camadas

```
HTTP → Controller → Service → Repository → PostgreSQL
              ↕
           DTO / Model
```

Pacotes organizados **por domínio** (não por camada flat):

```
com.ufpa.SAGUI/
├── auth/                 # SecurityConfig, JwtService, JwtAuthenticationFilter, PasswordConfig
├── config/               # OpenApiConfig, AdminSeeder
├── controller/<dominio>/ # Endpoints REST
├── service/<dominio>/    # Regras de negócio
├── repository/<dominio>/ # Spring Data JPA
├── models/<dominio>/     # Entidades JPA
├── dto/<dominio>/        # Request/Response
├── enums/
├── exception/            # GlobalExceptionHandler
└── util/
```

Domínios: `activity`, `attachment`, `auth`, `course`, `discipline`, `enrollment`, `lesson`, `module`, `progress`, `user`, `security`.

### API (prefixo `/api`)

| Recurso | Base | Principais operações |
|---------|------|----------------------|
| Auth | `/api/auth` | login, register, refresh, logout |
| Users | `/api/users` | listagem, criação, me, activate/deactivate, role |
| Courses | `/api/courses` | CRUD, status, vincular professor |
| Disciplines | `/api/disciplines` | CRUD, status, progresso de alunos, atividades pendentes |
| Modules | `/api/modules` | CRUD, status |
| Lessons | `/api/lessons` | CRUD, status, complete |
| Attachments | `/api/attachments` | CRUD, status, delete |
| Activities | `/api/activities` | CRUD, take, submissions, attempts |
| Enrollments | `/api/enrollments` | solicitar, approve/reject/cancel, pending, my, progress |
| Progress | `/api/modules/...`, `/api/disciplines/...` | acesso e progresso |

### Executar o backend

**Com Docker Compose** (Postgres + API), a partir da raiz:

```bash
docker compose up --build
```

API em `http://localhost:8080`.

**Só local (Maven):**

1. Suba o Postgres (compose só do serviço `database` ou instância própria).
2. Configure `.env` / variáveis (veja abaixo).
3. Na pasta `back/`:

```bash
./mvnw spring-boot:run
```

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `SPRING_DATASOURCE_URL` | JDBC PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Segredo de assinatura JWT |
| `JWT_EXPIRATION` | Expiração do access token |
| `SAGUI_ADMIN_EMAIL` | Email do admin inicial (default: `admin@sagui.local`) |
| `SAGUI_ADMIN_PASSWORD` | Senha do admin inicial (default: `Admin@123`) |
| `SAGUI_ADMIN_NAME` | Nome do admin (default: `Administrador`) |
| `PORT` | Porta HTTP (default: `8080`) |

O `AdminSeeder` cria o primeiro Admin se ainda não existir nenhum.

---

## Frontend (`front/`)

### Stack

- Next.js 16 (App Router), React 19, TypeScript
- MUI 9 + Emotion, Tailwind CSS 4
- Recharts, Lucide, react-youtube, jsPDF

### Estrutura de pastas

```
front/src/
├── app/                      # Rotas (App Router)
│   ├── login/                # Autenticação
│   ├── register/ / cadastro/
│   ├── dashboard/            # Área administrativa legada / gestão
│   │   ├── cursos/
│   │   ├── disciplinas/
│   │   ├── modulos/
│   │   ├── aulas/
│   │   ├── matriculas/
│   │   └── usuarios/
│   └── (ead)/                # Experiência EAD (agrupador de rota)
│       ├── cursos/           # Lista e detalhe (aluno / admin / professor)
│       ├── disciplinas/
│       ├── aulas/[id]/
│       ├── avaliacoes/       # Atividades do aluno
│       ├── perfil/
│       └── professor/        # Painel do professor (conteúdo, relatórios)
├── components/               # UI compartilhada
│   ├── ui/                   # Botão, Input, Modal, Table, Badge…
│   ├── admin/
│   ├── professor/
│   ├── student/
│   ├── catalog/
│   ├── lesson/
│   ├── auth/
│   └── layout/
├── new-services/             # Camada de API + models / auth
│   ├── auth/
│   └── poo/                  # course, discipline, module, lessons, shared/api…
├── hooks/
├── lib/                      # apiBaseUrl, etc.
├── utils/
└── theme-provider.tsx
```

### Rotas principais (visão por perfil)

| Área | Rotas | Perfil |
|------|-------|--------|
| Auth | `/login`, `/register` | Público |
| EAD — catálogo | `/cursos`, `/disciplinas`, `/aulas/[id]` | Aluno / Admin / Professor (views distintas) |
| EAD — avaliações | `/avaliacoes`, `/avaliacoes/[slug]` | Aluno |
| EAD — professor | `/professor/disciplinas`, `/professor/relatorios` | Professor |
| Perfil | `/perfil` | Todos autenticados |
| Dashboard admin | `/dashboard/*` | Admin (cursos, disciplinas, usuários, matrículas…) |

As páginas EAD frequentemente escolhem a view conforme o role (`student*Page`, `professor*Page`, `admin*Page`).

### Integração com a API

- Base URL: `NEXT_PUBLIC_API_URL` (fallback local: `http://localhost:8080/api`) — ver `src/lib/apiBaseUrl.ts`
- Auth via contexto JWT (`AuthContext`) e políticas de rota
- Preferir componentes de `components/ui/` para UI base

### Executar o frontend

```bash
cd front
cp .env.local.example .env.local   # ajuste NEXT_PUBLIC_API_URL se preciso
npm install
npm run dev
```

App em `http://localhost:3000`.

---

## Fluxos principais

```text
Aluno:  login → matrícula → (aprovação) → módulos/aulas → atividade → resultado → progresso
Professor: login → disciplina → módulo/aula/anexo/atividade → acompanhar tentativas e progresso
Admin: login → curso/disciplina/usuários → aprovar matrículas → ativar/inativar entidades
```


---
