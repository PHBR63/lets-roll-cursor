# Configuração do Backend no Render

## ✅ Status do Deploy

- **URL do Backend**: `https://letsroll-backend.onrender.com`
- **Status**: ✅ Deploy bem-sucedido
- **Health Check**: `/health`

## 🔧 Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Render:

### Variáveis Obrigatórias

```env
SUPABASE_URL=https://pzuaszldoomsmtsmbdoy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### Variáveis Opcionais (mas recomendadas)

```env
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.vercel.app,https://seu-dominio.com
PORT=3001
```

**⚠️ IMPORTANTE sobre CORS_ORIGIN:**
- Deve ser a URL **exata** do seu frontend (sem barra no final)
- Pode conter múltiplas URLs separadas por vírgula (sem espaços extras)
- **NÃO** inclua barras no final: use `https://lets-roll.vercel.app` (não `https://lets-roll.vercel.app/`)
- Exemplo para múltiplos domínios: `https://lets-roll.vercel.app,https://letsroll.app`
- Se não configurado, aceita apenas `http://localhost:5173` (desenvolvimento)

### Variáveis Opcionais (Redis - Cache)

```env
REDIS_URL=redis://seu-redis-url:6379
# OU
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-redis
```

**Nota:** Se Redis não estiver configurado, o cache será desabilitado automaticamente (não afeta o funcionamento).

## 📝 Como Configurar no Render

1. Acesse seu serviço no Render Dashboard
2. Vá em **Environment** (ou **Environment Variables**)
3. Clique em **Add Environment Variable**
4. Adicione cada variável uma por uma:

### Passo a Passo

1. **SUPABASE_URL**
   - Key: `SUPABASE_URL`
   - Value: `https://pzuaszldoomsmtsmbdoy.supabase.co`
   - ✅ Salvar

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Sua chave service_role do Supabase
   - ⚠️ **IMPORTANTE**: Use a chave **service_role**, não a anon!
   - ✅ Salvar

3. **CORS_ORIGIN** (importante para produção!)
   - Key: `CORS_ORIGIN`
   - Value: URL do seu frontend no Vercel
   - Exemplo: `https://letsroll.vercel.app`
   - Se tiver múltiplos domínios: `https://letsroll.vercel.app,https://letsroll.app`
   - ✅ Salvar

4. **NODE_ENV** (recomendado)
   - Key: `NODE_ENV`
   - Value: `production`
   - ✅ Salvar

## 🔍 Onde Encontrar as Chaves do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Na seção **Project API keys**:
   - **URL**: Use para `SUPABASE_URL`
   - **service_role key**: Use para `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA no frontend!)

## ✅ Verificação

Após configurar as variáveis:

1. **Reinicie o serviço** no Render (ou aguarde o redeploy automático)
2. Teste o health check:
   ```bash
   curl https://letsroll-backend.onrender.com/health
   ```
   Deve retornar: `{"status":"ok"}`

3. Teste do frontend:
   - Faça login no frontend
   - Verifique se as campanhas carregam
   - Verifique o console do navegador para erros de CORS

## 🐛 Troubleshooting

### Erro: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solução:** Configure `CORS_ORIGIN` no Render com a URL exata do seu frontend.

### Erro: "401 Unauthorized" nas requisições

**Solução:** Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente.

### Erro: "Cannot connect to database"

**Solução:** 
- Verifique se `SUPABASE_URL` está correto
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` é a chave service_role (não anon)

### Deploy travando em "Deploying..."

**Solução:** 
- Verifique os logs do Render
- Certifique-se de que todas as variáveis obrigatórias estão configuradas
- O Redis não é obrigatório - se não configurado, o cache será desabilitado

## 📚 Documentação Adicional

- [Documentação do Render](https://render.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)

