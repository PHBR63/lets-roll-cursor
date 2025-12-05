-- Migration para adicionar campo de origem (Origin) aos personagens
-- Origens concedem perícias treinadas e poderes automáticos

-- Adicionar coluna origin
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS origin TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.characters.origin IS 'Origem do personagem no sistema Ordem Paranormal. Concede perícias treinadas e poderes automáticos.';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_characters_origin ON public.characters(origin);

