# Configuração de Variáveis de Ambiente - Frontend

## ⚠️ IMPORTANTE: Segurança das Chaves do Supabase

### Problema: "Forbidden use of secret API key in browser"

Este erro ocorre quando a **SERVICE_ROLE_KEY** (chave secreta) está sendo usada no frontend ao invés da **ANON_KEY** (chave pública).

### Como Resolver

1. **No Vercel (ou plataforma de deploy):**
   - Acesse as configurações do projeto
   - Vá em "Environment Variables"
   - Verifique se `VITE_SUPABASE_ANON_KEY` está configurada com a **ANON KEY** (não a SERVICE_ROLE_KEY)

2. **Como identificar as chaves:**
   - **ANON_KEY**: Chave pública, pode ser exposta no frontend. É um JWT que começa com `eyJ...` e contém `"role": "anon"` no payload
   - **SERVICE_ROLE_KEY**: Chave secreta, NUNCA deve ser usada no frontend. É um JWT que começa com `eyJ...` mas contém `"role": "service_role"` no payload

3. **Onde encontrar as chaves:**
   - Acesse o dashboard do Supabase: https://supabase.com/dashboard
   - Vá em "Project Settings" > "API"
   - Na aba "Legacy anon, service_role API keys":
     - **anon public key**: Use esta no frontend (`VITE_SUPABASE_ANON_KEY`)
     - **service_role key**: Use esta APENAS no backend (nunca no frontend!)

### Variáveis Necessárias no Frontend

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# API Backend (opcional, padrão: http://localhost:3001)
VITE_API_URL=https://seu-backend.com

# App URL para SEO e canonical tags (opcional)
VITE_APP_URL=https://seu-app.vercel.app
```

**⚠️ IMPORTANTE:** 
- NUNCA commite arquivos `.env` com valores reais
- Use apenas a **ANON_KEY** (chave pública) no frontend
- A **SERVICE_ROLE_KEY** deve ser usada APENAS no backend

**⚠️ IMPORTANTE:** Use a chave **anon public** (não a service_role) no frontend!

### Validação Automática

O código agora valida automaticamente se você está usando a chave errada:
- Decodifica o JWT e verifica se `role === "anon"`
- Se detectar `role === "service_role"`, lança um erro claro
- Isso previne o uso acidental da chave secreta no frontend

