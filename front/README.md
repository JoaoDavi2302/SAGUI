# Criar página
1. criar pasta com nome da rota
    ex: /disciplinas
2. criar page.tsx dentro de pasta (será o index)
3. caso queira passar um id indicar nome da pasta "(nome-da-pagina)"
    ex: /curso/id ou /curso/nome-do-curso
Ou caso queira uma subpagina /curso/disciplina, criar pasta com index do nome da rota

# Estilização
Mui pode estilizar direto no tsx atravez do style
Exemplo:
```
<Link
href="/sobre"
style={{
    textDecoration:
    'none',
    color: 'inherit',
}}
>
<Typography>
    Sobre
</Typography>
</Link>
```

Ou passar classeName
Exemplo:
- Componente card
    ```
    <Card className="curso-card">
    ```
- styles.css
    ```
    .curso-card {
    border-radius: 16px;

    padding: 16px;

    transition: 0.3s;

    border: 1px solid #ddd;
    }

    .curso-card:hover {
    transform: translateY(-4px);

    box-shadow:
        0 10px 30px
        rgba(0, 0, 0, 0.15);
    }

    .curso-title {
    color: #1565c0;

    font-weight: 700;

    margin-bottom: 12px;
    }

    .curso-description {
    color: #666;

    margin-bottom: 16px;
    }

    .curso-button {
    text-transform: none;
    }
    ```

    Evitar mexer em responsividade sem criar breakpoints

*** se ficar em loop de login, verificar public routes em middleware e habilitar "/"
*** rever logica do mock (se dados fake batem)

** O que falta
[] editar dados da disciplina da visão do professor (ead)
[] editar dados da do modulo visão do professor (ead)
[] editar material (link e outros) da visão do professor (ead)
[] editar aula
[x] pagina de cursos
[x] detalhes do curso (visualização somente do curso para aluno e todos os cursos que o professor faz parte na visão do professor)
[x] atividades (lista)
[] detalhes de atividades (do modulo)
[] perfil
[] dashboard homepage
[x] dashboard disciplinas
[] dashboard editar/adicionar disciplinas
[] dashboard cursos
[] dashboard editar/adicionar cursos
[] dashboard materiais
[] dashboard editar/adicionar materiais
[] dashboard usuarios
[] dashboard editar/adicionar usuarios
[] dashboard aulas
[] dashboard editar/adicionar aulas

cursos ok
homepage ok
disciplinas ok
acessar aula ok
atividades ok (melhorar detalhes da atividade)
materiais pendente informações do backend (corrigir poo quando houver)

