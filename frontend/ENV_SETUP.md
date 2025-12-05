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
   - **ANON_KEY**: Chave pública, pode ser exposta no frontend. Geralmente começa com `eyJ...`
   - **SERVICE_ROLE_KEY**: Chave secreta, NUNCA deve ser usada no frontend. Também começa com `eyJ...` mas é mais longa

3. **Onde encontrar as chaves:**
   - Acesse o dashboard do Supabase: https://supabase.com/dashboard
   - Vá em "Project Settings" > "API"
   - **anon/public key**: Use esta no frontend (`VITE_SUPABASE_ANON_KEY`)
   - **service_role key**: Use esta APENAS no backend (nunca no frontend!)

### Variáveis Necessárias no Frontend

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (ANON KEY, não SERVICE_ROLE_KEY)
VITE_API_URL=https://seu-backend.com (opcional, padrão: http://localhost:3001)
```

### Validação Automática

O código agora valida automaticamente se você está usando a chave errada e mostrará um erro claro se detectar a SERVICE_ROLE_KEY no frontend.

