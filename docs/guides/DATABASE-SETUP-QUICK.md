# ⚡ Setup Rápido do Banco de Dados

Guia rápido para configurar o banco de dados após o deploy no Vercel.

## 🚀 Passo a Passo Rápido

### 1. Executar Migrations (5 minutos)

1. Acesse [Supabase Dashboard](https://app.supabase.com) → Seu Projeto → **SQL Editor**

2. **Opção A - Script Completo (Recomendado para banco novo):**
   - Abra: `supabase/migrations/00-SETUP-COMPLETO.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Clique em **Run**
   - ✅ Pronto!

3. **Opção B - Migrations Individuais (Se já tem dados):**
   - Execute na ordem:
     1. `20241201000000_initial_schema.sql`
     2. `20241202000000_add_updated_at_to_campaign_moments.sql`
     3. `20241203000000_add_ordem_paranormal_fields.sql`
     4. `20241204000000_add_board_state.sql`

### 2. Criar Storage Buckets (2 minutos)

1. Supabase Dashboard → **Storage** → **New bucket**

2. **Bucket 1:**
   - Name: `campaign-images`
   - Public: ✅ SIM
   - Create

3. **Bucket 2:**
   - Name: `avatars`
   - Public: ✅ SIM
   - Create

### 3. Configurar Políticas de Storage (3 minutos)

No SQL Editor, execute:

```sql
-- Políticas para campaign-images
CREATE POLICY "Users can upload campaign images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'campaign-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view campaign images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'campaign-images');

-- Políticas para avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

### 4. Habilitar Realtime (1 minuto)

No SQL Editor, execute:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dice_rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creatures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_participants;
```

### 5. Configurar Variáveis no Vercel (2 minutos)

1. Vercel Dashboard → Seu Projeto → **Settings** → **Environment Variables**

2. Adicione/Verifique:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   VITE_API_URL=https://seu-backend.railway.app
   ```

3. **Onde encontrar:**
   - Supabase Dashboard → **Settings** → **API**
   - Project URL → `VITE_SUPABASE_URL`
   - Project API keys → `anon` `public` → `VITE_SUPABASE_ANON_KEY`

### 6. Testar (2 minutos)

1. Acesse sua app no Vercel
2. Tente fazer login/registro
3. Verifique no Supabase: **Authentication** → **Users**

## ✅ Checklist

- [ ] Migrations executadas
- [ ] Buckets criados (`campaign-images`, `avatars`)
- [ ] Políticas de storage configuradas
- [ ] Realtime habilitado
- [ ] Variáveis configuradas no Vercel
- [ ] Teste de login funcionando

## 📚 Documentação Completa

Para mais detalhes, consulte: `CONFIGURAR-BANCO-DADOS-SUPABASE.md`

---

**Tempo total estimado**: ~15 minutos

