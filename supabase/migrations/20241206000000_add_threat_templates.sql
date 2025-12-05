-- Tabela de templates de ameaças
-- Permite criar criaturas rapidamente usando VD (Vida/Dificuldade)
CREATE TABLE IF NOT EXISTS public.threat_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT, -- Tipo de ameaça (ex: "Zumbi", "Cultista", "Criatura Paranormal")
  base_attributes JSONB DEFAULT '{}', -- Atributos base (agi, for, int, pre, vig)
  base_stats JSONB DEFAULT '{}', -- Stats base (pv, san, pe, defense)
  skills JSONB DEFAULT '{}', -- Perícias do template
  resistances JSONB DEFAULT '{}', -- RD por tipo de dano
  abilities TEXT[] DEFAULT '{}', -- IDs de habilidades
  conditions TEXT[] DEFAULT '{}', -- Condições iniciais
  is_global BOOLEAN DEFAULT FALSE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_threat_templates_campaign ON public.threat_templates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_threat_templates_global ON public.threat_templates(is_global);
CREATE INDEX IF NOT EXISTS idx_threat_templates_created_by ON public.threat_templates(created_by);

-- Comentários para documentação
COMMENT ON TABLE public.threat_templates IS 'Templates de ameaças para criação rápida de criaturas usando VD (Vida/Dificuldade)';
COMMENT ON COLUMN public.threat_templates.base_attributes IS 'Atributos base da ameaça (serão ajustados por VD)';
COMMENT ON COLUMN public.threat_templates.base_stats IS 'Stats base (PV será multiplicado por VD)';
COMMENT ON COLUMN public.threat_templates.type IS 'Tipo de ameaça para categorização';

-- Habilitar RLS
ALTER TABLE public.threat_templates ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver templates globais e de suas campanhas
CREATE POLICY "Users can view templates in their campaigns"
  ON public.threat_templates
  FOR SELECT
  USING (
    is_global = true
    OR EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = threat_templates.campaign_id
      AND cp.user_id = auth.uid()
    )
  );

-- Política RLS: usuários podem criar templates em suas campanhas
CREATE POLICY "Users can create templates in their campaigns"
  ON public.threat_templates
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      campaign_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.campaign_participants cp
        WHERE cp.campaign_id = threat_templates.campaign_id
        AND cp.user_id = auth.uid()
      )
    )
  );

-- Política RLS: usuários podem atualizar seus próprios templates
CREATE POLICY "Users can update their templates"
  ON public.threat_templates
  FOR UPDATE
  USING (created_by = auth.uid());

-- Política RLS: usuários podem deletar seus próprios templates
CREATE POLICY "Users can delete their templates"
  ON public.threat_templates
  FOR DELETE
  USING (created_by = auth.uid());

