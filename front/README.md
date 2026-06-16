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