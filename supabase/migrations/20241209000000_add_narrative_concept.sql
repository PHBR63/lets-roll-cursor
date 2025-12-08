-- Migration para adicionar campo de conceito narrativo aos personagens
-- Conceito narrativo é uma descrição textual do personagem
-- Também permite personagens sem campanha (campaign_id nullable)

-- Adicionar coluna narrative_concept
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS narrative_concept TEXT;

-- Tornar campaign_id nullable para permitir personagens standalone (sem campanha)
ALTER TABLE public.characters
ALTER COLUMN campaign_id DROP NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN public.characters.narrative_concept IS 'Conceito narrativo do personagem - descrição textual do personagem, sua história e personalidade.';
COMMENT ON COLUMN public.characters.campaign_id IS 'ID da campanha (opcional - permite personagens standalone para testes ou uso futuro)';

