-- Migration para adicionar campos específicos do sistema Ordem Paranormal RPG
-- Atualiza a tabela characters para suportar o sistema completo

-- Adicionar campos específicos do sistema
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS class TEXT CHECK (class IN ('COMBATENTE', 'ESPECIALISTA', 'OCULTISTA')),
ADD COLUMN IF NOT EXISTS path TEXT, -- Trilha do personagem
ADD COLUMN IF NOT EXISTS affinity TEXT CHECK (affinity IN ('SANGUE', 'MORTE', 'ENERGIA', 'CONHECIMENTO', 'MEDO')) DEFAULT NULL, -- Afinidade paranormal (50% NEX)
ADD COLUMN IF NOT EXISTS conditions TEXT[] DEFAULT '{}', -- Array de condições ativas
ADD COLUMN IF NOT EXISTS defense INTEGER DEFAULT 10; -- Defesa calculada

-- Atualizar estrutura JSONB de attributes para formato Ordem Paranormal
-- Estrutura esperada:
-- {
--   "agi": 0,  -- Agilidade
--   "for": 0,  -- Força
--   "int": 0,  -- Intelecto
--   "pre": 0,  -- Presença
--   "vig": 0   -- Vigor
-- }

-- Atualizar estrutura JSONB de stats para formato Ordem Paranormal
-- Estrutura esperada:
-- {
--   "pv": {
--     "current": 20,
--     "max": 20
--   },
--   "san": {
--     "current": 12,
--     "max": 12
--   },
--   "pe": {
--     "current": 2,
--     "max": 2
--   },
--   "nex": 5  -- Nível de Exposição (0-99)
-- }

-- Adicionar coluna para perícias (skills) se necessário
-- Perícias podem ser armazenadas em JSONB ou em tabela separada
-- Por enquanto, vamos usar JSONB na tabela characters
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '{}';

-- Estrutura esperada de skills:
-- {
--   "Luta": {
--     "attribute": "FOR",
--     "training": "TRAINED",
--     "bonus": 5
--   },
--   "Pontaria": {
--     "attribute": "AGI",
--     "training": "UNTRAINED",
--     "bonus": 0
--   },
--   ...
-- }

-- Comentários para documentação
COMMENT ON COLUMN public.characters.class IS 'Classe do personagem no sistema Ordem Paranormal: COMBATENTE, ESPECIALISTA ou OCULTISTA';
COMMENT ON COLUMN public.characters.path IS 'Trilha (especialização) do personagem dentro da classe';
COMMENT ON COLUMN public.characters.affinity IS 'Afinidade paranormal com elemento (obtida aos 50% NEX): SANGUE, MORTE, ENERGIA, CONHECIMENTO ou MEDO';
COMMENT ON COLUMN public.characters.conditions IS 'Array de condições ativas que afetam o personagem';
COMMENT ON COLUMN public.characters.defense IS 'Defesa calculada do personagem (10 + Agilidade + bônus de equipamentos)';
COMMENT ON COLUMN public.characters.attributes IS 'Atributos do sistema Ordem Paranormal: agi, for, int, pre, vig';
COMMENT ON COLUMN public.characters.stats IS 'Recursos do personagem: pv (current/max), san (current/max), pe (current/max), nex';
COMMENT ON COLUMN public.characters.skills IS 'Perícias do personagem com atributo base, nível de treinamento e bônus';

-- Criar índices para buscas comuns
CREATE INDEX IF NOT EXISTS idx_characters_class ON public.characters(class);
CREATE INDEX IF NOT EXISTS idx_characters_nex ON public.characters((stats->>'nex'));

