# SAGUI

## Sistema de Gestão Acadêmica Unificada

O SAGUI é uma plataforma desenvolvida para gerenciamento de cursos, permitindo a integração de informações relacionadas a usuários, perfis de acesso, cursos, disciplinas, turmas e atividades educacionais.

A aplicação utiliza uma arquitetura baseada em camadas, separando responsabilidades entre controle de requisições, regras de negócio, persistência de dados e representação das informações.

---

# Arquitetura

O backend do SAGUI segue o padrão de arquitetura em camadas:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Cada camada possui uma responsabilidade específica:

- **Controller:** responsável pelo gerenciamento das requisições HTTP e comunicação com o cliente.
- **Service:** responsável pela implementação das regras de negócio da aplicação.
- **Repository:** responsável pela comunicação e persistência dos dados no banco.
- **Model/Entity:** representa as entidades do domínio do sistema.
- **DTO:** realiza a transferência de dados entre as camadas da aplicação.

A documentação detalhada da arquitetura está disponível em:

[Arquitetura Backend SAGUI](https://drive.google.com/file/d/1ZO2_pUKbFlDJmoYfy8EUBspdjEO6j7Bw/view)

---

# Tecnologias utilizadas

## Backend

- Java
- Spring Boot
- Maven
- Spring Data JPA
- Spring Security

## Banco de dados

- PostgreSQL

## Controle de versão

- Git

---

# Estrutura do projeto

```
SAGUI/
│
├── backend/
│   └── src/
│       └── main/
│           └── java/
│               ├── controller/
│               ├── service/
│               ├── repository/
│               ├── model/
│               └── dto/
│
└── README.md
```

---

# Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

- Java instalado
- Maven instalado
- PostgreSQL configurado
- Git instalado

---

# Configuração do ambiente

O SAGUI utiliza variáveis de ambiente para configuração da aplicação.

As principais variáveis utilizadas são:

```
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
JWT_SECRET
JWT_EXPIRATION
```

Crie o arquivo `.env` conforme as configurações necessárias para execução local.

---

# Executando o projeto

## Clonando o repositório

```bash
git clone <url-do-repositorio>

cd SAGUI
```

---

## Executando o backend

Acesse a pasta do backend:

```bash
cd backend
```

Compile o projeto:

```bash
./mvnw clean install
```

Execute a aplicação:

```bash
./mvnw spring-boot:run
```

Após a inicialização, a API estará disponível no endereço configurado pela aplicação.

---

# Desenvolvimento de novas funcionalidades

Para adicionar uma nova funcionalidade ao SAGUI, siga a organização definida pela arquitetura:

1. Criar ou atualizar a entidade correspondente em `model`.
2. Criar os objetos de transferência necessários em `dto`.
3. Implementar a persistência em `repository`.
4. Implementar as regras de negócio em `service`.
5. Criar os endpoints necessários em `controller`.
6. Criar testes para validar o comportamento implementado.

Fluxo de desenvolvimento:

```
Nova funcionalidade
        ↓
Entity
        ↓
Repository
        ↓
Service
        ↓
Controller
        ↓
Teste
```

---

# Documentação complementar

A documentação completa do projeto está disponível no Google Drive:

[Documentação SAGUI](https://drive.google.com/drive/folders/155k7BYqi0OY1IotQ8XSY7yXVNey7wpMM)

---

## Documentação técnica

### Requisitos do sistema

Documento contendo funcionalidades, regras de negócio e requisitos da aplicação.

[Documento de Requisitos](https://drive.google.com/file/d/1Yc0HquOPEFJWg_2MPEAuqR74tBKgCaPY/view)

---

### Modelagem do banco de dados

Documento contendo entidades, relacionamentos e estrutura de persistência.

[Modelagem do Banco de Dados](https://drive.google.com/file/d/1wyKJDfNyJVW1TCX7bBf4TJWBFEne8-m4/view)

---

### Mapeamento de classes

Documento contendo organização das classes e responsabilidades dos componentes.

[Mapeamento de Classes](https://drive.google.com/file/d/1bhqeKXUE6Xzgpc3J94SVJpPOqKbe3z6M/view)

---

### Arquitetura backend

Documento descrevendo a estrutura interna da aplicação e comunicação entre camadas.

[Arquitetura Backend](https://drive.google.com/file/d/1ZO2_pUKbFlDJmoYfy8EUBspdjEO6j7Bw/view)

---

## Colaboração e versionamento

Documento contendo padrões de Git, branches e fluxo de contribuição.

[Manual de Colaboração e Padrões Git](https://drive.google.com/file/d/17UIj49i5hVA8-kv2AUjLjxTyqQy9sm-d/view)

---

# Fluxo de contribuição

Antes de iniciar alterações:

## Atualizar o projeto

```bash
git pull
```

## Criar uma nova branch

Exemplo:

```bash
git checkout -b feature/nome-da-feature
```

## Realizar alterações

Siga os padrões definidos na arquitetura e mantenha a organização das camadas.

## Testar

Execute os testes disponíveis antes de enviar alterações.

## Pull Request

Após finalizar a implementação:

1. Envie a branch para o repositório.
2. Abra um Pull Request.
3. Aguarde a revisão da equipe.

Para regras detalhadas de colaboração, consulte:

[Manual de Colaboração e Padrões Git](https://drive.google.com/file/d/17UIj49i5hVA8-kv2AUjLjxTyqQy9sm-d/view)

---

# Status do projeto

O SAGUI encontra-se em desenvolvimento contínuo.

Novas funcionalidades, correções e melhorias devem seguir a arquitetura definida e os padrões de colaboração estabelecidos pela equipe.