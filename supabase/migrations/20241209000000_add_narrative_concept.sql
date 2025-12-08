-- Migration para adicionar campos faltantes aos personagens
-- Conceito narrativo é uma descrição textual do personagem
-- Também permite personagens sem campanha (campaign_id nullable)
-- Garante que todas as colunas necessárias estejam presentes

-- Adicionar coluna origin (se não existir)
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS origin TEXT;

-- Adicionar coluna narrative_concept (se não existir)
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS narrative_concept TEXT;

-- Tornar campaign_id nullable para permitir personagens standalone (sem campanha)
ALTER TABLE public.characters
ALTER COLUMN campaign_id DROP NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.characters.origin IS 'Origem do personagem no sistema Ordem Paranormal. Concede perícias treinadas e poderes automáticos.';
COMMENT ON COLUMN public.characters.narrative_concept IS 'Conceito narrativo do personagem - descrição textual do personagem, sua história e personalidade.';
COMMENT ON COLUMN public.characters.campaign_id IS 'ID da campanha (opcional - permite personagens standalone para testes ou uso futuro)';

-- Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_characters_origin ON public.characters(origin);

