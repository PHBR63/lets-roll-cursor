-- Script de validação da migration 20241203000000_add_ordem_paranormal_fields.sql
-- Execute este script após aplicar a migration para verificar se tudo está correto

-- 1. Verificar se todas as colunas foram criadas
DO $$
DECLARE
  missing_columns TEXT[];
  required_columns TEXT[] := ARRAY['class', 'path', 'affinity', 'conditions', 'defense', 'skills'];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'characters' 
        AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Colunas faltando: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE '✓ Todas as colunas foram criadas com sucesso';
  END IF;
END $$;

-- 2. Verificar tipos de dados
DO $$
BEGIN
  -- Verificar tipo de class
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'class'
      AND data_type = 'text'
  ) THEN
    RAISE EXCEPTION 'Coluna class não tem tipo TEXT';
  END IF;
  
  -- Verificar tipo de conditions
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'conditions'
      AND udt_name = '_text'
  ) THEN
    RAISE EXCEPTION 'Coluna conditions não é um array TEXT[]';
  END IF;
  
  -- Verificar tipo de skills
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'skills'
      AND data_type = 'jsonb'
  ) THEN
    RAISE EXCEPTION 'Coluna skills não tem tipo JSONB';
  END IF;
  
  RAISE NOTICE '✓ Tipos de dados estão corretos';
END $$;

-- 3. Verificar constraints CHECK
DO $$
BEGIN
  -- Verificar constraint de class
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'class'
      AND constraint_name LIKE '%class%'
  ) THEN
    RAISE WARNING 'Constraint CHECK em class não encontrada (pode ser normal se não foi criada)';
  ELSE
    RAISE NOTICE '✓ Constraint CHECK em class existe';
  END IF;
  
  -- Verificar constraint de affinity
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'affinity'
      AND constraint_name LIKE '%affinity%'
  ) THEN
    RAISE WARNING 'Constraint CHECK em affinity não encontrada (pode ser normal se não foi criada)';
  ELSE
    RAISE NOTICE '✓ Constraint CHECK em affinity existe';
  END IF;
END $$;

-- 4. Verificar valores padrão
DO $$
BEGIN
  -- Verificar default de conditions
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'conditions'
      AND column_default = '{}'
  ) THEN
    RAISE WARNING 'Valor padrão de conditions não é {}';
  ELSE
    RAISE NOTICE '✓ Valor padrão de conditions está correto';
  END IF;
  
  -- Verificar default de defense
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'defense'
      AND column_default = '10'
  ) THEN
    RAISE WARNING 'Valor padrão de defense não é 10';
  ELSE
    RAISE NOTICE '✓ Valor padrão de defense está correto';
  END IF;
  
  -- Verificar default de skills
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'characters' 
      AND column_name = 'skills'
      AND column_default = '''{}''::jsonb'
  ) THEN
    RAISE WARNING 'Valor padrão de skills não é {}::jsonb';
  ELSE
    RAISE NOTICE '✓ Valor padrão de skills está correto';
  END IF;
END $$;

-- 5. Verificar índices
DO $$
DECLARE
  missing_indexes TEXT[];
  required_indexes TEXT[] := ARRAY['idx_characters_class', 'idx_characters_nex'];
  idx TEXT;
BEGIN
  FOREACH idx IN ARRAY required_indexes
  LOOP
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename = 'characters' 
        AND indexname = idx
    ) THEN
      missing_indexes := array_append(missing_indexes, idx);
    END IF;
  END LOOP;
  
  IF array_length(missing_indexes, 1) > 0 THEN
    RAISE EXCEPTION 'Índices faltando: %', array_to_string(missing_indexes, ', ');
  ELSE
    RAISE NOTICE '✓ Todos os índices foram criados com sucesso';
  END IF;
END $$;

-- 6. Verificar comentários
DO $$
DECLARE
  comment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM pg_description d
  JOIN pg_class c ON d.objoid = c.oid
  WHERE c.relname = 'characters'
    AND d.objsubid IN (
      SELECT ordinal_position 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'characters'
        AND column_name IN ('class', 'path', 'affinity', 'conditions', 'defense', 'skills')
    );
  
  IF comment_count < 6 THEN
    RAISE WARNING 'Alguns comentários podem estar faltando (encontrados: %)', comment_count;
  ELSE
    RAISE NOTICE '✓ Comentários de documentação estão presentes';
  END IF;
END $$;

-- 7. Teste de inserção (não persiste dados)
DO $$
DECLARE
  test_campaign_id UUID;
  test_user_id UUID;
BEGIN
  -- Tentar encontrar uma campanha e usuário existentes para teste
  SELECT id INTO test_campaign_id FROM public.campaigns LIMIT 1;
  SELECT id INTO test_user_id FROM public.users LIMIT 1;
  
  IF test_campaign_id IS NULL OR test_user_id IS NULL THEN
    RAISE NOTICE '⚠ Não há dados de teste disponíveis (campanha ou usuário)';
    RAISE NOTICE '  Pulando teste de inserção';
  ELSE
    -- Tentar inserir um personagem de teste (será revertido)
    BEGIN
      INSERT INTO public.characters (
        campaign_id,
        user_id,
        name,
        class,
        path,
        affinity,
        conditions,
        defense,
        attributes,
        stats,
        skills
      ) VALUES (
        test_campaign_id,
        test_user_id,
        'TESTE_MIGRATION',
        'COMBATENTE',
        'Trilha Teste',
        'SANGUE',
        ARRAY['ATORDADO'],
        15,
        '{"agi": 2, "for": 1, "int": 0, "pre": 1, "vig": 2}'::jsonb,
        '{"pv": {"current": 20, "max": 20}, "san": {"current": 12, "max": 12}, "pe": {"current": 2, "max": 2}, "nex": 5}'::jsonb,
        '{"Luta": {"attribute": "FOR", "training": "TRAINED", "bonus": 5}}'::jsonb
      );
      
      -- Remover o registro de teste
      DELETE FROM public.characters WHERE name = 'TESTE_MIGRATION';
      
      RAISE NOTICE '✓ Teste de inserção passou com sucesso';
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro no teste de inserção: %', SQLERRM;
    END;
  END IF;
END $$;

-- Resumo final
SELECT 
  'Validação completa!' as status,
  'Todas as verificações foram executadas' as message;

