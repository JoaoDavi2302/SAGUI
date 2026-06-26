# AGENTS.md

## Projeto

SAGUI - Sistema de Gestão Acadêmica Unificada.

O repositório possui front e back, mas as tarefas atuais são apenas no backend.

## Backend

O backend fica na pasta `back/`.

Stack principal:

- Java 17
- Spring Boot
- Maven
- Spring Data JPA
- Spring Security
- JWT
- PostgreSQL
- Lombok

## Arquitetura

Siga a arquitetura em camadas já definida no projeto:

Controller -> Service -> Repository -> Database

Pacotes principais:

- `controller/`: endpoints REST
- `service/`: regras de negócio
- `repository/`: acesso ao banco com Spring Data JPA
- `models/`: entidades JPA
- `dto/`: contratos de entrada e saída da API
- `enums/`: enums do domínio
- `auth/`: autenticação, JWT e segurança

## Regras de implementação

- Não exponha entidades JPA diretamente na API.
- Controllers devem receber e devolver DTOs.
- Regra de negócio deve ficar no service.
- Repository não deve conter regra de negócio.
- Toda entidade nova deve estender `BaseEntity`.
- DTOs devem ser organizados por subpasta de domínio, por exemplo `dto/module/`.
- Não altere `auth/` ou `SecurityConfig` sem necessidade clara.
- Não renomeie classes, pacotes ou campos existentes sem necessidade.
- Não faça refatorações globais fora do escopo da tarefa.
- Faça mudanças pequenas, simples e fáceis de revisar.

## Regras para o módulo 3

As tarefas atuais do módulo 3 são:

- Implementar entidade `Module` com `orderIndex`.
- Implementar entidade `Lesson`.
- Implementar entidade `Attachment`.
- Implementar CRUD de módulos para professor.

Como não há descrição detalhada das issues, siga o padrão já existente do projeto e evite inventar regras de negócio complexas sem confirmação.

## Segurança

- Rotas novas são autenticadas por padrão.
- Para endpoints de professor, use o padrão de autorização já existente no projeto.
- O projeto possui papéis de usuário como Admin, Professor e Aluno.

## Comandos úteis

A partir da pasta `back/`, no Windows:

```bash
.\mvnw.cmd test
```

```bash
.\mvnw.cmd clean package
```

```bash
.\mvnw.cmd spring-boot:run
```

## Antes de finalizar uma tarefa

Informe:

- arquivos criados ou alterados;
- resumo da implementação;
- endpoints adicionados, se houver;
- comandos executados;
- erros encontrados, se houver.
