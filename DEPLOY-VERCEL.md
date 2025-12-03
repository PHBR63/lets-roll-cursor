# 🚀 Deploy no Vercel - Let's Roll

Este documento descreve como fazer o deploy da aplicação Let's Roll no Vercel.

## 📋 Pré-requisitos

1. Conta no Vercel ([vercel.com](https://vercel.com))
2. Conta no GitHub (para deploy automático)
3. Conta no Supabase configurada
4. Node.js instalado localmente (para testes)

## 🏗️ Arquitetura de Deploy

O Vercel funciona melhor com **deploy separado** do frontend e backend:

- **Frontend**: Deploy direto no Vercel (otimizado para React/Vite)
- **Backend**: Deploy como projeto separado no Vercel ou em outro serviço (Railway, Render, etc)

## 🎯 Opção 1: Deploy Separado (Recomendado)

### Frontend no Vercel + Backend em Outro Serviço

#### 1.1 Deploy do Frontend no Vercel

1. **Conectar Repositório:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Conecte seu repositório GitHub
   - Selecione o diretório `frontend`

2. **Configurar Projeto:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Variáveis de Ambiente:**
   ```
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   VITE_API_URL=https://seu-backend.railway.app
   ```

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Acesse a URL fornecida

#### 1.2 Deploy do Backend (Railway/Render)

**Railway:**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

**Render:**
- Acesse [render.com](https://render.com)
- Crie novo Web Service
- Conecte repositório
- Configure:
  - **Build Command**: `cd backend && npm install && npm run build`
  - **Start Command**: `cd backend && npm start`
  - **Environment**: Node

## 🎯 Opção 2: Backend como Serverless Functions (Vercel)

Para usar serverless functions no Vercel, é necessário converter as rotas Express para funções serverless.

### 2.1 Estrutura de Serverless Functions

Crie a estrutura `api/` no frontend:

```
frontend/
  api/
    auth/
      [...route].ts
    campaigns/
      [...route].ts
    characters/
      [...route].ts
    ...
```

### 2.2 Exemplo de Serverless Function

```typescript
// frontend/api/campaigns/[...route].ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { campaignsRouter } from '../../../backend/src/routes/campaigns'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Adaptar rotas Express para Vercel
  // ...
}
```

**Nota**: Esta opção requer refatoração significativa do backend.

## 🎯 Opção 3: Monorepo com Vercel (Mais Complexo)

### 3.1 Configuração do Monorepo

1. **Criar `vercel.json` na raiz:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

2. **Configurar variáveis de ambiente** para ambos frontend e backend

3. **Deploy:**
```bash
vercel --prod
```

## 📦 Deploy Passo a Passo (Opção 1 - Recomendada)

### Passo 1: Preparar Frontend

1. Certifique-se de que `frontend/vercel.json` está configurado
2. Verifique que `VITE_API_URL` aponta para o backend
3. **IMPORTANTE**: O projeto está organizado com frontend em `frontend/`

### Passo 2: Deploy Frontend no Vercel

#### Via Dashboard (Recomendado):

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New Project**
3. Conecte seu repositório GitHub
4. **Configure Root Directory**: Selecione `frontend`
5. O Vercel detectará automaticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Adicione variáveis de ambiente
7. Clique em **Deploy**

#### Via CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy do frontend (a partir da raiz)
cd frontend
vercel

# Ou deploy de produção
vercel --prod
```

### Passo 3: Configurar Variáveis de Ambiente

No dashboard do Vercel:
1. Vá em Settings → Environment Variables
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (URL do backend)

### Passo 4: Deploy do Backend (Railway)

```bash
# No diretório raiz
cd backend

# Inicializar Railway
railway init

# Adicionar variáveis
railway variables set SUPABASE_URL=sua_url
railway variables set SUPABASE_SERVICE_ROLE_KEY=sua_chave
railway variables set CORS_ORIGIN=https://seu-frontend.vercel.app

# Deploy
railway up
```

### Passo 5: Atualizar Frontend

Após obter a URL do backend:
1. Vá no Vercel Dashboard
2. Settings → Environment Variables
3. Atualize `VITE_API_URL` com a URL do Railway
4. Faça novo deploy

## 🔍 Verificar Deploy

### Frontend

```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs

# Abrir no navegador
vercel open
```

### Backend (Railway)

```bash
# Ver logs
railway logs

# Ver status
railway status
```

## 🛠️ Comandos Úteis

### Vercel CLI

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy produção
vercel --prod

# Ver deployments
vercel ls

# Ver logs
vercel logs

# Remover deploy
vercel remove

# Listar projetos
vercel projects ls
```

### Railway CLI

```bash
# Login
railway login

# Inicializar
railway init

# Deploy
railway up

# Ver logs
railway logs

# Ver variáveis
railway variables

# Adicionar variável
railway variables set CHAVE=valor
```

## ⚠️ Troubleshooting

### Build Falha no Frontend

```bash
# Ver logs detalhados
vercel logs

# Testar build localmente
cd frontend
npm run build
```

### Erro de CORS

- Verifique `CORS_ORIGIN` no backend
- Adicione a URL do Vercel: `https://seu-app.vercel.app`

### Erro de Variáveis de Ambiente

- Verifique se todas as variáveis estão configuradas
- Variáveis do Vite devem começar com `VITE_`
- Faça novo deploy após adicionar variáveis

### Backend Não Responde

- Verifique logs do Railway/Render
- Verifique se `PORT` está configurado corretamente
- Verifique se o backend está rodando

## 📊 Monitoramento

### Vercel Analytics

- Acesse: Dashboard → Analytics
- Veja métricas de performance
- Monitore erros

### Railway Metrics

- Acesse: Dashboard → Metrics
- Veja uso de recursos
- Monitore logs

## 🔄 Atualizações

### Deploy Automático

O Vercel faz deploy automático quando você faz push para:
- `main` → Produção
- Outras branches → Preview

### Deploy Manual

```bash
# Frontend
cd frontend
vercel --prod

# Backend (Railway)
cd backend
railway up
```

## 💰 Custos

### Vercel

- **Hobby (Gratuito)**: 
  - 100GB bandwidth/mês
  - Deploys ilimitados
  - Domínio personalizado
  - SSL automático

- **Pro ($20/mês)**:
  - Tudo do Hobby +
  - Analytics avançado
  - Mais bandwidth

### Railway

- **Starter ($5/mês)**:
  - $5 crédito/mês
  - 512MB RAM
  - 1GB storage

- **Developer ($20/mês)**:
  - $20 crédito/mês
  - 2GB RAM
  - 5GB storage

## 📝 Checklist de Deploy

### Frontend (Vercel)
- [ ] Conta no Vercel criada
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente
- [ ] Deploy realizado
- [ ] App acessível

### Backend (Railway/Render)
- [ ] Conta no Railway/Render criada
- [ ] Projeto criado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] Deploy realizado
- [ ] API respondendo

### Integração
- [ ] Frontend apontando para backend correto
- [ ] CORS configurado
- [ ] Testes básicos realizados
- [ ] Logs verificados

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Dashboard](https://railway.app)
- [Railway Docs](https://docs.railway.app)
- [Render Dashboard](https://render.com)
- [Supabase Dashboard](https://app.supabase.com)

## ✅ Recomendação Final

**Para este projeto, recomendo:**

1. **Frontend**: Vercel (gratuito, otimizado para React/Vite)
2. **Backend**: Railway (fácil setup, $5/mês)

Esta combinação oferece:
- ✅ Deploy rápido e fácil
- ✅ Custo baixo
- ✅ Performance excelente
- ✅ Escalabilidade automática
- ✅ SSL automático

---

**Última atualização**: Dezembro 2024

