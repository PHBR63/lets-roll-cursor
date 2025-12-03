# Migrations do Supabase - Let's Roll

Este diretório contém todas as migrations SQL do banco de dados.

## 📋 Ordem de Execução

As migrations devem ser executadas na seguinte ordem:

1. `20241201000000_initial_schema.sql` - Schema inicial do banco
2. `20241202000000_add_updated_at_to_campaign_moments.sql` - Adiciona updated_at em campaign_moments
3. `20241203000000_add_ordem_paranormal_fields.sql` - Campos do sistema Ordem Paranormal
4. `20241204000000_add_board_state.sql` - Estado do board da sessão

## ⚡ Script Completo (Alternativa)

Se preferir executar tudo de uma vez, use:
- `00-SETUP-COMPLETO.sql` - Consolida todas as migrations em um único script

**⚠️ ATENÇÃO**: Use o script completo apenas se o banco estiver vazio ou se tiver certeza de que não há conflitos.

## 🚀 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo de migration
6. Clique em **Run** (ou pressione `Ctrl+Enter`)

### Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# Aplicar todas as migrations pendentes
supabase db push

# Ou aplicar uma migration específica
supabase migration up 20241203000000_add_ordem_paranormal_fields
```

### Opção 3: Via Script SQL Direto

Você pode executar o SQL diretamente no seu cliente PostgreSQL preferido conectando-se ao banco do Supabase.

## ✅ Validação

Após executar a migration `20241203000000_add_ordem_paranormal_fields.sql`, verifique se as colunas foram criadas:

```sql
-- Verificar estrutura da tabela characters
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'characters'
ORDER BY ordinal_position;

-- Verificar índices criados
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'characters';
```

Você deve ver as seguintes colunas novas:
- `class` (TEXT)
- `path` (TEXT)
- `affinity` (TEXT)
- `conditions` (TEXT[])
- `defense` (INTEGER)
- `skills` (JSONB)

E os seguintes índices:
- `idx_characters_class`
- `idx_characters_nex`

## 🔄 Rollback

Se precisar reverter a migration `20241203000000_add_ordem_paranormal_fields.sql`:

```sql
-- Remover índices
DROP INDEX IF EXISTS public.idx_characters_nex;
DROP INDEX IF EXISTS public.idx_characters_class;

-- Remover colunas
ALTER TABLE public.characters
DROP COLUMN IF EXISTS skills,
DROP COLUMN IF EXISTS defense,
DROP COLUMN IF EXISTS conditions,
DROP COLUMN IF EXISTS affinity,
DROP COLUMN IF EXISTS path,
DROP COLUMN IF EXISTS class;
```

**⚠️ ATENÇÃO:** Fazer rollback pode causar perda de dados se houver personagens usando esses campos!

## 📝 Notas

- Todas as migrations usam `IF NOT EXISTS` para evitar erros se executadas múltiplas vezes
- Os valores padrão são seguros e não quebram dados existentes
- A migration é idempotente (pode ser executada múltiplas vezes sem problemas)

