# 🚀 Guia de Setup Local - Let's Roll

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase configurada
- Banco de dados configurado (veja `DATABASE-SETUP.md`)

## Passo 1: Instalar Dependências

```bash
# Na raiz do projeto
npm run install:all

# Ou manualmente:
cd frontend && npm install
cd ../backend && npm install
```

## Passo 2: Configurar Variáveis de Ambiente

### Frontend (`frontend/.env`)

Crie o arquivo `frontend/.env` com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)

Crie o arquivo `backend/.env` com:

```env
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Onde encontrar as chaves do Supabase:**
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** > **API**
3. Copie:
   - **URL** → `VITE_SUPABASE_URL` e `SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA exponha no frontend!)

## Passo 3: Configurar Banco de Dados

Execute as migrations no Supabase:

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Execute o arquivo `supabase/migrations/00-SETUP-COMPLETO.sql`
   - Ou execute as migrations individuais na ordem:
     - `20241201000000_initial_schema.sql`
     - `20241202000000_add_updated_at_to_campaign_moments.sql`
     - `20241203000000_add_ordem_paranormal_fields.sql`
     - `20241204000000_add_board_state.sql`

Para mais detalhes, veja `docs/guides/DATABASE-SETUP.md`

## Passo 4: Iniciar os Servidores

### Opção 1: Ambos simultaneamente (recomendado)

```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Opção 2: Separadamente

**Terminal 1 - Frontend:**
```bash
npm run dev:frontend
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
```

## Verificação

1. ✅ Frontend deve abrir em http://localhost:5173
2. ✅ Backend deve responder em http://localhost:3001/health
3. ✅ Console do navegador sem erros de conexão
4. ✅ Pode fazer login/registro

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se os arquivos `.env` foram criados corretamente
- Verifique se as variáveis estão com os nomes corretos
- Reinicie os servidores após criar/editar `.env`

### Erro: "Cannot connect to database"
- Verifique se as migrations foram executadas
- Verifique se as chaves do Supabase estão corretas
- Verifique se o projeto Supabase está ativo

### Erro: "CORS error"
- Verifique se `CORS_ORIGIN` no backend está como `http://localhost:5173`
- Verifique se o frontend está rodando na porta 5173

### Porta já em uso
- Frontend: Altere a porta no `vite.config.ts` ou pare o processo na porta 5173
- Backend: Altere `PORT` no `.env` ou pare o processo na porta 3001

## Scripts Disponíveis

```bash
# Instalar todas as dependências
npm run install:all

# Rodar frontend e backend juntos
npm run dev

# Rodar apenas frontend
npm run dev:frontend

# Rodar apenas backend
npm run dev:backend

# Build do frontend
npm run build

# Build do backend
npm run build:backend

# Testes do backend
cd backend && npm test
```

## Próximos Passos

Após o setup:
1. Crie uma conta no sistema
2. Crie uma campanha
3. Explore as funcionalidades!

