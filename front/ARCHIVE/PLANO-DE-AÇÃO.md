# Plano de Ação — Equipe Front-End (LMS) **Versão 1.0**

---

## Decisão Técnica: Stack

- **Framework:** React
- **Estilização:** Tailwind CSS (preferível ao Bootstrap — mais controle, melhor compatibilidade com React, sem conflitos de estilo)
- **Prototipagem:** Figma
- **Gerenciamento de rotas:** React Router
- **Repositório:** a definir (sugestão: GitHub com branches por feature)

> ⚠️ Essa decisão precisa ser tomada e documentada na **Semana 1**, antes de qualquer trabalho paralelo começar. Impacta todo o time.

---

## Distribuição da Equipe

| Pessoa    | Papel                                                                      | Aluno          |
|-----------|----------------------------------------------------------------------------|----------------|
| **Líder** | Arquitetura, decisões técnicas, code review, integração geral              | Letícia        |
| **P1**    | UX Lead — Design system, acessibilidade, defesa das escolhas visuais       | Anny           |
| **P2**    | Prototipagem — Wireframes, fluxos por perfil, alternativas de UI           | -              |
| **P3**    | Implementação — Base compartilhada (login, rotas, componentes globais)     | Marcelly       |
| **P4**    | Implementação — Admin: gestão de entidades (cursos, disciplinas, usuários) | Juliana        |
| **P5**    | Implementação — Admin: conteúdo pedagógico e matrículas                    | Lucas          |
| **P6**    | Implementação — Rota principal: perfil do Aluno                            | Yuri           |
| **P7**    | Implementação — Rota principal: perfil do Professor                        | -              |

---

## Fases e Cronograma

### Fase 0 — Setup e Decisões (Semana 1)
**Todo o time.**

- [x] Criar e configurar repositório (estrutura de pastas, `.gitignore`, `README`)
- [x] Definir e documentar convenções de código (nomenclatura de componentes, organização de arquivos)
- [x] Confirmar stack: React + Tailwind CSS
- [x] Inicializar projeto React com Tailwind configurado
- [ ] Criar workspace compartilhado no Figma - **Anny**
- [ ] Definir paleta de cores e tipografia iniciais (P1 lidera, time aprova) - **Letícia / Anny**
- [x] Alinhar cronograma e canais de comunicação

---

### Fase 1 — UX e Prototipagem (Semanas 2–4)
**P1, P2. Tech Lead acompanha e valida.**

#### P1 — UX Lead
- [ ] Criar design system completo no Figma:
  - Tokens de cor, tipografia e espaçamento
  - Componentes base: botões, inputs, cards, modais, badges, tabelas
  - Estados visuais: hover, foco, erro, desabilitado
- [ ] Definir guia de acessibilidade (baseado em RNF05):
  - Uso de marcação semântica HTML
  - Contraste mínimo de cores (WCAG AA)
  - Navegação por teclado
- [ ] Documentar e defender as escolhas de design para o time
- [ ] Configurar `tailwind.config` com os tokens do design system, para uso por todos os implementadores

#### P2 — Prototipagem
- [ ] Mapear os fluxos de navegação por perfil (Aluno, Professor, Administrador)
- [ ] Criar wireframes de baixa fidelidade para as 16 páginas previstas no documento
- [ ] Evoluir para protótipos de média/alta fidelidade com base no design system de P1
- [ ] Apresentar alternativas de layout para páginas críticas (dashboard administrativo, página de atividades do aluno)
- [ ] Validar protótipos com o Tech Lead antes de passar para implementação

> ✅ **Entregável da Fase 1:** Figma aprovado com design system + protótipos das 16 páginas. Esse material serve como "contrato visual" para toda a implementação.

---

### Fase 2 — Implementação (Semanas 3–7)
**P3, P4, P5, P6, P7. Tech Lead faz code review contínuo.**

> ⚠️ A Fase 2 pode começar na Semana 3, em paralelo com o fim da Fase 1, **desde que os componentes base do design system já estejam definidos por P1**.

---

#### P3 — Base Compartilhada *(prioridade máxima — pré-requisito para o restante do time)*
- [ ] Página de Login (UC01 / UC08 — RF02)
- [ ] Página de Recuperação de Senha (UC02 — RF03 / RNF04)
- [ ] Página de Perfil do Usuário (UC03 / UC09 — RF04)
- [ ] Configuração do sistema de rotas (React Router) com controle de acesso por perfil (RF05)
  - Rotas protegidas por papel: Aluno, Professor, Administrador
  - Redirecionamento automático para login se não autenticado
- [ ] Biblioteca de componentes reutilizáveis globais (baseada no design system de P1):
  - Botões, inputs, modais, cards, tabelas, badges de status

> ⚠️ **P3 é o mais crítico para o time inteiro.** O sistema de rotas e os componentes globais são pré-requisitos para P4, P5, P6 e P7. O Tech Lead deve colaborar nessa frente nas primeiras semanas se necessário.

---

#### P4 — Admin: Gestão de Entidades
- [ ] Dashboard de cadastro de cursos (RF06 / UC16)
  - Listagem com status ativo/inativo
  - Formulário de criação e edição
- [ ] Dashboard de cadastro de disciplinas (RF07 / UC17)
  - Listagem com status ativo/inativo
  - Formulário de criação e edição
- [ ] Gestão de usuários (UC15 — RF01)
  - Listagem de Alunos, Professores e Administradores
  - Ativar/inativar usuários (RNF07)
- [ ] Ativar/inativar entidades diversas (RF24 / UC20)

---

#### P5 — Admin: Conteúdo Pedagógico e Matrículas
- [ ] Dashboard de cadastro de módulos (RF08 / UC10) — visão do Administrador
- [ ] Dashboard de cadastro de aulas (RF09 / UC11) — visão do Administrador
- [ ] Dashboard de cadastro de atividades (RF10 / UC12) — visão do Administrador
- [ ] Dashboard de aprovação de matrículas (RF16 / UC18)
  - Listagem de solicitações pendentes
  - Ações de aprovar / recusar
- [ ] Dashboard de permissões em grupo (UC19)

> ⚠️ **Atenção à interface com P6:** A página de solicitação de matrícula tem uma face para o Aluno (P6) e uma face para o Administrador (P5). Definir com o Tech Lead qual dos dois cria o componente compartilhado — ou se P3 assume essa responsabilidade.

---

#### P6 — Rota Principal: Perfil do Aluno
- [ ] Página de visualização de cursos (RF14 / UC05)
- [ ] Página de visualização de disciplinas
- [ ] Página de visualização de módulos (com indicador de progresso)
- [ ] Página de visualização de aulas (RF14)
- [ ] Página de realização de atividades (RF17 / UC06):
  - Suporte aos tipos: múltipla seleção (checkbox), resposta única (radio), verdadeiro/falso (RF18)
  - Exibir resultado automático após envio (RF19 / UC07)
  - Controle de tentativas: até 3 por módulo (RF20 / RN08)
  - Bloqueio de avanço para o próximo módulo antes de concluir o atual (RF21 / RN07)
  - Indicador de aprovação: desempenho > 70% (RF22 / RN09)
- [ ] Página de solicitação de matrícula (RF15 / UC04)

---

#### P7 — Rota Principal: Perfil do Professor
- [ ] Dashboard de gerenciamento de conteúdos — visão do Professor (UC14)
- [ ] Dashboard de cadastro e edição de módulos (RF08 / UC10) — visão do Professor
- [ ] Dashboard de cadastro e edição de aulas (RF09 / UC11) — visão do Professor
  - Upload/vinculação de anexos: documentos, imagens, vídeos (RF11 / RNF06)
- [ ] Dashboard de cadastro e edição de atividades (RF10 / UC12) — visão do Professor
  - Criação de questões por tipo: múltipla seleção, resposta única, verdadeiro/falso (RF18)
  - Cadastro das respostas corretas (base para RF19)
- [ ] Restrição visual: ocultar ou desabilitar ações de criar/excluir cursos e disciplinas (RF13 / RN04)

---

### Fase 3 — Integração e Refinamento (Semanas 7–8)
**Todo o time. P1 retorna como suporte de acessibilidade. P2 apoia qualquer frente atrasada.**

- [ ] Revisão geral de acessibilidade com checklist de P1 (RNF05)
- [ ] Padronização visual entre as sub-frentes (garantir consistência de componentes)
- [ ] Integração com as APIs do back-end (substituição dos dados mockados)
- [ ] Testes manuais de fluxo completo por perfil:
  - Fluxo completo do Aluno: login → matrícula → módulo → atividade → resultado
  - Fluxo completo do Professor: login → criar módulo → criar aula → criar atividade
  - Fluxo completo do Administrador: login → criar curso → aprovar matrícula → inativar entidade
- [ ] Correção de inconsistências e bugs visuais
- [ ] Entrega final para o time de QA

---

## Entregáveis por Fase

| Fase | Entregável |
|------|------------|
| Fase 0 | Repositório configurado, stack definida, workspace Figma criado |
| Fase 1 | Design system + protótipos aprovados das 16 páginas |
| Fase 2 | 16 páginas implementadas e funcionando com dados mockados |
| Fase 3 | Front-end integrado, acessível e validado, pronto para QA |

---

## Páginas do Sistema (Referência — Seção 6 do documento)

| Nº | Página | Perfil | Responsável |
|----|--------|--------|-------------|
| 1 | Login | Todos | P3 |
| 2 | Recuperação de senha | Todos | P3 |
| 3 | Perfil do usuário | Todos | P3 |
| 4 | Dashboard de gerenciamento de conteúdos | Admin / Professor | P5 / P7 |
| 5 | Dashboard de permissões em grupo | Admin | P5 |
| 6 | Dashboard de cadastro de cursos | Admin | P4 |
| 7 | Dashboard de cadastro de disciplinas | Admin | P4 |
| 8 | Dashboard de cadastro de módulos | Professor / Admin | P7 / P5 |
| 9 | Dashboard de cadastro de aulas | Professor / Admin | P7 / P5 |
| 10 | Dashboard de cadastro de atividades | Professor / Admin | P7 / P5 |
| 11 | Visualização de cursos | Todos | P6 |
| 12 | Visualização de disciplinas | Todos | P6 |
| 13 | Visualização de módulos | Todos | P6 |
| 14 | Visualização de aulas | Todos | P6 |
| 15 | Visualização de atividades | Aluno | P6 |
| 16 | Matrícula de aluno | Aluno / Admin | P6 / P5 |

---

## Notas Finais

- **P1 e P2** têm maior carga nas primeiras semanas e ficam mais livres após a Fase 1. A partir da Semana 5, P2 deve apoiar qualquer frente de implementação que estiver atrasada.
- **P3 é prioridade.** O sistema de rotas e os componentes globais desbloqueiam o trabalho de P4–P7. Considere reforço do Tech Lead nessa frente se necessário.
- **Comunicação entre P5 e P6** é essencial na parte de matrículas — alinhem o componente compartilhado antes de implementar.
- **O `tailwind.config` gerado por P1** deve ser commitado no repositório antes que qualquer pessoa de P3–P7 comece a escrever código.
- **Dados mockados primeiro:** toda a implementação da Fase 2 deve funcionar com dados locais (mock). A integração real com o back-end fica para a Fase 3.
