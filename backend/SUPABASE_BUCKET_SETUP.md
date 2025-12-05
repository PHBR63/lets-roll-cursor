# Configuração do Bucket de Imagens no Supabase

## Problema

O erro `Bucket não encontrado. Configure o bucket "campaign-images" no Supabase.` ocorre quando o bucket de storage não está configurado no Supabase.

## Solução

### Passo 1: Acessar o Supabase Storage

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral

### Passo 2: Criar o Bucket

1. Clique em **New bucket**
2. Configure:
   - **Name**: `campaign-images`
   - **Public bucket**: ✅ **Marcar como público** (para que as imagens sejam acessíveis publicamente)
   - **File size limit**: `5242880` (5MB em bytes) ou deixe vazio para sem limite
   - **Allowed MIME types**: Deixe vazio ou adicione: `image/jpeg,image/png,image/gif,image/webp`

3. Clique em **Create bucket**

### Passo 3: Configurar Políticas de Acesso (RLS)

Após criar o bucket, você precisa configurar as políticas de acesso:

1. Clique no bucket `campaign-images`
2. Vá em **Policies**
3. Clique em **New policy**
4. Selecione **For full customization**
5. Configure:

**Policy Name**: `Allow authenticated users to upload`
**Allowed operation**: `INSERT`
**Policy definition**:
```sql
(authenticated() AND (bucket_id = 'campaign-images'))
```

6. Crie outra política:

**Policy Name**: `Allow public read access`
**Allowed operation**: `SELECT`
**Policy definition**:
```sql
(bucket_id = 'campaign-images')
```

### Passo 4: Verificar

Após configurar, tente criar uma campanha novamente. O upload de imagem deve funcionar.

## Nota Importante

- O bucket deve ser **público** para que as imagens sejam acessíveis no frontend
- Se você não quiser usar imagens, pode criar campanhas sem imagem - o sistema continuará funcionando normalmente
- O tamanho máximo de arquivo é 5MB (configurado no código)

## Troubleshooting

### Erro: "new row violates row-level security policy"

**Solução**: Verifique se as políticas RLS estão configuradas corretamente (Passo 3).

### Erro: "Bucket is not public"

**Solução**: Marque o bucket como público ao criá-lo (Passo 2).

### Erro: "File too large"

**Solução**: O arquivo excede 5MB. Reduza o tamanho da imagem ou aumente o limite no código.

