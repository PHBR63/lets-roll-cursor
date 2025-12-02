-- Adiciona coluna updated_at à tabela campaign_moments
-- Para manter consistência com outras tabelas do sistema

ALTER TABLE public.campaign_moments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela campaign_moments
DROP TRIGGER IF EXISTS update_campaign_moments_updated_at ON public.campaign_moments;
CREATE TRIGGER update_campaign_moments_updated_at
    BEFORE UPDATE ON public.campaign_moments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

