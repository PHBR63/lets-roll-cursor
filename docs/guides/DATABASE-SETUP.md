# 🗄️ Configurar Banco de Dados Completo - Supabase

Este guia passo a passo vai te ajudar a configurar completamente o banco de dados no Supabase após o deploy no Vercel.

## 📋 Pré-requisitos

1. Conta no Supabase ([app.supabase.com](https://app.supabase.com))
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## 🚀 Passo 1: Executar Migrations

### 1.1 Acessar SQL Editor

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**

### 1.2 Executar Migrations na Ordem

Execute cada migration **na ordem abaixo**, uma de cada vez:

#### Migration 1: Schema Inicial
1. Abra o arquivo: `supabase/migrations/20241201000000_initial_schema.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou `Ctrl+Enter`)
5. Aguarde a confirmação: "Success. No rows returned"

#### Migration 2: Updated At em Campaign Moments
1. Abra: `supabase/migrations/20241202000000_add_updated_at_to_campaign_moments.sql`
2. Copie e cole no SQL Editor
3. Execute

#### Migration 3: Campos Ordem Paranormal
1. Abra: `supabase/migrations/20241203000000_add_ordem_paranormal_fields.sql`
2. Copie e cole no SQL Editor
3. Execute

#### Migration 4: Board State
1. Abra: `supabase/migrations/20241204000000_add_board_state.sql`
2. Copie e cole no SQL Editor
3. Execute

### 1.3 Validar Migrations

Execute o script de validação:

1. Abra: `supabase/migrations/validate_ordem_paranormal.sql`
2. Copie e cole no SQL Editor
3. Execute
4. Verifique se todas as mensagens são `✓` (sucesso)

## 📦 Passo 2: Configurar Storage Buckets

### 2.1 Criar Bucket para Imagens de Campanha

1. No Supabase Dashboard, vá em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `campaign-images`
   - **Public bucket**: ✅ **SIM** (marcado)
   - **File size limit**: `5 MB` (ou conforme necessário)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
4. Clique em **Create bucket**

### 2.2 Criar Bucket para Avatares

1. Clique em **New bucket** novamente
2. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **SIM**
   - **File size limit**: `2 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
3. Clique em **Create bucket**

### 2.3 Configurar Políticas de Storage

Para cada bucket criado, configure as políticas:

#### Política para `campaign-images`:

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Users can upload campaign images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaign-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir leitura pública
CREATE POLICY "Public can view campaign images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-images');

-- Permitir atualização para o dono
CREATE POLICY "Users can update own campaign images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaign-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir deleção para o dono
CREATE POLICY "Users can delete own campaign images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaign-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política para `avatars`:

```sql
-- Permitir upload para usuários autenticados (apenas seu próprio avatar)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir leitura pública
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Permitir atualização para o dono
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir deleção para o dono
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Como aplicar:**
1. Vá em **Storage** → **Policies**
2. Selecione o bucket (`campaign-images` ou `avatars`)
3. Clique em **New Policy**
4. Escolha **For full customization**
5. Cole o SQL da política correspondente
6. Clique em **Review** e depois **Save policy**
7. Repita para todas as políticas

## 🔄 Passo 3: Configurar Realtime

### 3.1 Habilitar Realtime nas Tabelas

No SQL Editor, execute:

```sql
-- Habilitar Realtime para tabelas necessárias
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dice_rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creatures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_participants;
```

### 3.2 Verificar Realtime

1. Vá em **Database** → **Replication**
2. Verifique se as tabelas acima aparecem na lista
3. Certifique-se de que estão **habilitadas** (toggle verde)

## 🔐 Passo 4: Refinar Políticas RLS (Opcional mas Recomendado)

As políticas básicas já foram criadas na migration inicial. Você pode refiná-las conforme necessário.

### 4.1 Verificar Políticas Existentes

No SQL Editor:

```sql
-- Ver todas as políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 4.2 Políticas Adicionais Recomendadas

```sql
-- Personagens: usuários podem ver personagens de suas campanhas
CREATE POLICY "Users can view characters in their campaigns"
ON public.characters FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_participants
    WHERE campaign_id = characters.campaign_id
    AND user_id = auth.uid()
  )
);

-- Personagens: donos podem atualizar seus personagens
CREATE POLICY "Users can update own characters"
ON public.characters FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Chat: participantes podem ver mensagens da campanha
CREATE POLICY "Participants can view chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_participants
    WHERE campaign_id = chat_messages.campaign_id
    AND user_id = auth.uid()
  )
);

-- Chat: participantes podem enviar mensagens
CREATE POLICY "Participants can send chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.campaign_participants
    WHERE campaign_id = chat_messages.campaign_id
    AND user_id = auth.uid()
  )
);

-- Rolagens: participantes podem ver rolagens da campanha
CREATE POLICY "Participants can view dice rolls"
ON public.dice_rolls FOR SELECT
TO authenticated
USING (
  is_private = false OR user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.campaign_participants cp
    WHERE cp.campaign_id = dice_rolls.campaign_id
    AND cp.user_id = auth.uid()
    AND cp.role = 'master'
  )
);

-- Rolagens: participantes podem fazer rolagens
CREATE POLICY "Participants can roll dice"
ON public.dice_rolls FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.campaign_participants
    WHERE campaign_id = dice_rolls.campaign_id
    AND user_id = auth.uid()
  )
);
```

## ✅ Passo 5: Validação Final

### 5.1 Verificar Tabelas

```sql
-- Listar todas as tabelas
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver:
- ✅ users
- ✅ campaigns
- ✅ campaign_participants
- ✅ characters
- ✅ creatures
- ✅ items
- ✅ abilities
- ✅ character_items
- ✅ character_abilities
- ✅ sessions
- ✅ chat_messages
- ✅ dice_rolls
- ✅ campaign_moments

### 5.2 Verificar Colunas de Characters

```sql
-- Verificar campos Ordem Paranormal
SELECT 
  column_name, 
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'characters'
  AND column_name IN ('class', 'path', 'affinity', 'conditions', 'defense', 'skills')
ORDER BY ordinal_position;
```

### 5.3 Verificar Storage Buckets

1. Vá em **Storage**
2. Verifique se os buckets existem:
   - ✅ `campaign-images`
   - ✅ `avatars`

### 5.4 Verificar Realtime

1. Vá em **Database** → **Replication**
2. Verifique se as tabelas estão habilitadas:
   - ✅ `chat_messages`
   - ✅ `dice_rolls`
   - ✅ `sessions`
   - ✅ `characters`
   - ✅ `creatures`
   - ✅ `campaign_participants`

## 🔧 Passo 6: Configurar Variáveis de Ambiente no Vercel

Após configurar o banco, atualize as variáveis no Vercel:

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Configure/Verifique:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_API_URL=https://seu-backend.railway.app
```

**Onde encontrar:**
- `VITE_SUPABASE_URL`: Supabase Dashboard → Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

## 🧪 Passo 7: Testar

### 7.1 Teste de Conexão

1. Acesse sua aplicação no Vercel
2. Tente fazer login/registro
3. Verifique se o usuário é criado no Supabase:
   - Supabase Dashboard → **Authentication** → **Users**

### 7.2 Teste de Storage

1. Tente fazer upload de uma imagem de campanha
2. Verifique se aparece em:
   - Supabase Dashboard → **Storage** → `campaign-images`

### 7.3 Teste de Realtime

1. Abra a aplicação em duas abas
2. Envie uma mensagem no chat
3. Verifique se aparece em tempo real na outra aba

## 📝 Checklist Completo

### Migrations
- [ ] Migration 1: Schema inicial executada
- [ ] Migration 2: Updated_at executada
- [ ] Migration 3: Ordem Paranormal executada
- [ ] Migration 4: Board state executada
- [ ] Validação executada com sucesso

### Storage
- [ ] Bucket `campaign-images` criado
- [ ] Bucket `avatars` criado
- [ ] Políticas de storage configuradas
- [ ] Teste de upload funcionando

### Realtime
- [ ] Realtime habilitado para `chat_messages`
- [ ] Realtime habilitado para `dice_rolls`
- [ ] Realtime habilitado para `sessions`
- [ ] Realtime habilitado para `characters`
- [ ] Realtime habilitado para `creatures`
- [ ] Realtime habilitado para `campaign_participants`

### RLS
- [ ] Políticas básicas ativas
- [ ] Políticas adicionais configuradas (opcional)
- [ ] Teste de permissões funcionando

### Variáveis de Ambiente
- [ ] `VITE_SUPABASE_URL` configurada no Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` configurada no Vercel
- [ ] `VITE_API_URL` configurada no Vercel

### Testes
- [ ] Login/Registro funcionando
- [ ] Upload de imagens funcionando
- [ ] Chat em tempo real funcionando
- [ ] Rolagens de dados funcionando

## 🆘 Troubleshooting

### Erro: "relation does not exist"
- **Causa**: Migration não foi executada
- **Solução**: Execute todas as migrations na ordem

### Erro: "permission denied"
- **Causa**: RLS bloqueando acesso
- **Solução**: Verifique políticas RLS e ajuste conforme necessário

### Erro: "bucket not found"
- **Causa**: Bucket não foi criado
- **Solução**: Crie os buckets conforme Passo 2

### Realtime não funciona
- **Causa**: Realtime não habilitado na tabela
- **Solução**: Execute o SQL do Passo 3.1

### Upload de imagem falha
- **Causa**: Políticas de storage incorretas
- **Solução**: Verifique e ajuste políticas conforme Passo 2.3

## 🔗 Links Úteis

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs - Storage](https://supabase.com/docs/guides/storage)
- [Supabase Docs - Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Docs - RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Última atualização**: Dezembro 2024

