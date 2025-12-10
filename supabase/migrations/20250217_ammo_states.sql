-- Extensão do sistema de munição abstrata para estados e modo por arma
-- Adiciona colunas no session_ammunition para suportar:
-- - state: CHEIO, ESTAVEL, BAIXO, ESGOTADO
-- - mode: 'A' (por cena) ou 'B' (por ataques)
-- - attacks_per_spend: número de ataques para gastar 1 nível no modo B
-- - progress: contador de ataques acumulados no modo B
-- - weapon_id: referência opcional à arma (item_id) quando se quiser granular por arma
-- - reload_to_full: permite reconfigurar recarga para Cheio (default true)

ALTER TABLE public.session_ammunition
ADD COLUMN IF NOT EXISTS weapon_id UUID,
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'CHEIO',
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'A',
ADD COLUMN IF NOT EXISTS attacks_per_spend INTEGER,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reload_to_full BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.session_ammunition.state IS 'Estado de munição: CHEIO, ESTAVEL, BAIXO, ESGOTADO';
COMMENT ON COLUMN public.session_ammunition.mode IS 'Modo de consumo: A (por cena) ou B (por ataques)';
COMMENT ON COLUMN public.session_ammunition.attacks_per_spend IS 'Nº de ataques que gastam 1 nível (modo B)';
COMMENT ON COLUMN public.session_ammunition.progress IS 'Progresso de ataques acumulados (modo B)';
COMMENT ON COLUMN public.session_ammunition.weapon_id IS 'Arma associada (opcional) para granular por arma';
COMMENT ON COLUMN public.session_ammunition.reload_to_full IS 'Se true, recarregar volta para CHEIO; se false, volta para ESTAVEL';

-- Índice para consultas por personagem + arma
CREATE INDEX IF NOT EXISTS idx_session_ammunition_weapon
  ON public.session_ammunition(character_id, weapon_id);


