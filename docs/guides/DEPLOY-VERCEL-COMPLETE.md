# ✅ Configuração Vercel - Completa

## 📦 Arquivos Criados/Atualizados

1. **`vercel.json`** (raiz) - Configuração do monorepo (opcional)
2. **`frontend/vercel.json`** - Configuração específica do frontend
3. **`DEPLOY-VERCEL.md`** - Documentação completa de deploy
4. **`package.json`** (raiz) - Scripts atualizados (removido Heroku)
5. **`backend/src/index.ts`** - Removido código de servir frontend

## 🚀 Próximos Passos

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Login no Vercel

```bash
vercel login
```

### 3. Deploy do Frontend

```bash
cd frontend
vercel
```

Siga as instruções:
- **Link to existing project?** → N (primeira vez)
- **Project name** → letsroll-frontend (ou outro)
- **Directory** → `./frontend`
- **Override settings?** → N

### 4. Configurar Variáveis de Ambiente

No dashboard do Vercel:
1. Vá em Settings → Environment Variables
2. Adicione:
   ```
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   VITE_API_URL=https://seu-backend.railway.app
   ```

### 5. Deploy do Backend (Railway)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar projeto
cd backend
railway init

# Adicionar variáveis
railway variables set SUPABASE_URL=sua_url
railway variables set SUPABASE_SERVICE_ROLE_KEY=sua_chave
railway variables set CORS_ORIGIN=https://seu-frontend.vercel.app
railway variables set PORT=3001

# Deploy
railway up
```

### 6. Atualizar Frontend

Após obter a URL do backend:
1. Vercel Dashboard → Settings → Environment Variables
2. Atualize `VITE_API_URL` com a URL do Railway
3. Faça novo deploy ou aguarde deploy automático

## 📋 Checklist

- [x] Arquivos do Heroku removidos
- [x] Configuração Vercel criada
- [x] Documentação criada
- [ ] Vercel CLI instalado
- [ ] Login no Vercel realizado
- [ ] Frontend deployado
- [ ] Variáveis de ambiente configuradas
- [ ] Backend deployado (Railway/Render)
- [ ] Integração funcionando

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

# Ver URL
railway domain
```

## 📚 Documentação Completa

Consulte `DEPLOY-VERCEL.md` para:
- Instruções detalhadas
- Troubleshooting
- Alternativas de deploy
- Configurações avançadas

## ⚠️ Notas Importantes

1. **Frontend e Backend Separados**: 
   - Frontend no Vercel (gratuito)
   - Backend no Railway ($5/mês) ou Render

2. **CORS**: 
   - Configure `CORS_ORIGIN` no backend com a URL do Vercel
   - Exemplo: `https://letsroll-frontend.vercel.app`

3. **Variáveis de Ambiente**:
   - Frontend: `VITE_*` (visíveis no cliente)
   - Backend: Variáveis normais (privadas)

4. **Deploy Automático**:
   - Vercel faz deploy automático ao fazer push para `main`
   - Railway também suporta deploy automático via GitHub

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Railway](https://docs.railway.app)

---

**Status**: ✅ Configuração completa, pronto para deploy!

