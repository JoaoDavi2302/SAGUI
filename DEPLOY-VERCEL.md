# Deploy SAGUI — Vercel (front) + Railway (back) + Neon (DB)

Arquitetura de produção:

```
[Vercel] Next.js (front/)  ──►  [Railway] Spring Boot (back/)  ──►  [Neon] PostgreSQL
```

A Vercel hospeda **somente o frontend**. O backend Java **não roda na Vercel** — use Railway (já tem `back/railway.toml`).

---

## Pré-requisitos

- Conta [Vercel](https://vercel.com) conectada ao GitHub
- Conta [Railway](https://railway.app) (backend)
- Banco [Neon](https://neon.tech) (já configurado localmente em `.env.neon`)
- Repo: https://github.com/JoaoDavi2302/SAGUI

---

## Passo 1 — Banco (Neon) ✓ provavelmente pronto

1. Abra o console Neon do projeto `sagui`
2. Copie a connection string (pooler, `sa-east-1`)
3. Guarde para o Passo 2

---

## Passo 2 — Backend no Railway (~5 min)

1. https://railway.app/new → **Deploy from GitHub repo** → `JoaoDavi2302/SAGUI`
2. **Root Directory**: `back`
3. Railway detecta o `Dockerfile` automaticamente
4. Em **Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://...` (do Neon) |
| `SPRING_DATASOURCE_USERNAME` | usuário Neon |
| `SPRING_DATASOURCE_PASSWORD` | senha Neon |
| `JWT_SECRET` | string longa aleatória (mesma do `.env.neon` local) |
| `JWT_EXPIRATION` | `86400000` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,https://SEU-PROJETO.vercel.app` |
| `SAGUI_ADMIN_EMAIL` | `admin@sagui.local` |
| `SAGUI_ADMIN_PASSWORD` | senha forte |
| `SAGUI_ADMIN_NAME` | `Administrador` |

5. **Settings → Networking → Generate Domain** → anote a URL pública  
   Ex.: `https://sagui-api-production.up.railway.app`

6. Teste: `https://SUA-URL-RAILWAY/swagger-ui.html`

---

## Passo 3 — Frontend na Vercel (~3 min)

### Opção A — Dashboard (recomendado)

1. https://vercel.com/new → importar `JoaoDavi2302/SAGUI`
2. Configurar:
   - **Framework Preset**: Next.js
   - **Root Directory**: `front` ← importante (monorepo)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
3. **Environment Variables**:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://SUA-URL-RAILWAY/api` |

4. Deploy → anote a URL (ex.: `https://sagui.vercel.app`)

### Opção B — CLI (automatizado)

```bash
cd front
npx vercel login
npx vercel link          # escolhe o time e cria/vincula projeto
npx vercel env add NEXT_PUBLIC_API_URL production
# cole: https://SUA-URL-RAILWAY/api
npx vercel --prod
```

---

## Passo 4 — Fechar o ciclo CORS

Depois que a Vercel gerar a URL final:

1. Volte ao Railway → Variables
2. Atualize `CORS_ALLOWED_ORIGINS`:
   ```
   http://localhost:3000,https://sagui-XXXX.vercel.app
   ```
3. Railway redeploya automaticamente

---

## Passo 5 — Validar

- [ ] `https://SUA-URL-RAILWAY/swagger-ui.html` abre
- [ ] `https://SEU-PROJETO.vercel.app/login` carrega
- [ ] Login com admin funciona
- [ ] Navegação pós-login sem erro de CORS no DevTools (F12 → Network)

---

## Deploy contínuo (automático)

Após configurar uma vez:

- **Push na `main`** → Vercel redeploya o front automaticamente
- **Push na `main`** (pasta `back/`) → Railway redeploya o back

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| CORS error no browser | URL Vercel não está em `CORS_ALLOWED_ORIGINS` | Atualizar variável no Railway |
| API retorna 401 em tudo | `NEXT_PUBLIC_API_URL` errada | Deve terminar em `/api` |
| Build Vercel falha | Root Directory não é `front` | Corrigir nas Settings |
| Backend não sobe | `JWT_SECRET` vazio | Definir no Railway |
| DB connection refused | URL JDBC sem `?sslmode=require` | Usar string do Neon com SSL |

---

## Arquivos já preparados neste repo

- `front/vercel.json` — config Vercel
- `front/.env.example` — variáveis do front
- `back/.env.example` — variáveis do back
- `back/railway.toml` — config Railway
- CORS configurável via `CORS_ALLOWED_ORIGINS`
