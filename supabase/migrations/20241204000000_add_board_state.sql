-- Migration para adicionar estado do board na sessão
-- Permite salvar posição, zoom, tokens e desenhos

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS board_state JSONB DEFAULT '{}';

-- Estrutura esperada de board_state:
-- {
--   "imageUrl": "string",
--   "zoom": 1.0,
--   "position": { "x": 0, "y": 0 },
--   "tokens": [
--     {
--       "id": "string",
--       "x": 0,
--       "y": 0,
--       "name": "string",
--       "imageUrl": "string",
--       "color": "string",
--       "size": 40,
--       "type": "character" | "creature" | "generic",
--       "entityId": "string" // ID do personagem ou criatura
--     }
--   ],
--   "drawings": [
--     {
--       "id": "string",
--       "type": "line" | "circle" | "rect",
--       "points": [{ "x": 0, "y": 0 }],
--       "color": "string",
--       "strokeWidth": 2,
--       "layer": "annotations"
--     }
--   ],
--   "layers": {
--     "background": true,
--     "tokens": true,
--     "annotations": true
--   }
-- }

COMMENT ON COLUMN public.sessions.board_state IS 'Estado do board da sessão: imagem, zoom, posição, tokens e desenhos';

