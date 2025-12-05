-- Tabela de munição abstrata por sessão
-- Sistema Ordem Paranormal: munição não é rastreada individualmente,
-- mas sim de forma abstrata por cena/sessão (0-100, onde 100 = totalmente abastecido)
CREATE TABLE IF NOT EXISTS public.session_ammunition (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  ammunition INTEGER DEFAULT 100 CHECK (ammunition >= 0 AND ammunition <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, session_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_session_ammunition_character ON public.session_ammunition(character_id);
CREATE INDEX IF NOT EXISTS idx_session_ammunition_session ON public.session_ammunition(session_id);
CREATE INDEX IF NOT EXISTS idx_session_ammunition_composite ON public.session_ammunition(character_id, session_id);

-- Comentários para documentação
COMMENT ON TABLE public.session_ammunition IS 'Munição abstrata por personagem por sessão (0-100, onde 100 = totalmente abastecido)';
COMMENT ON COLUMN public.session_ammunition.ammunition IS 'Munição abstrata restante (0-100)';

-- Habilitar RLS
ALTER TABLE public.session_ammunition ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver munição de personagens em campanhas que participam
CREATE POLICY "Users can view ammunition in their campaigns"
  ON public.session_ammunition
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      JOIN public.characters c ON c.campaign_id = cp.campaign_id
      WHERE c.id = session_ammunition.character_id
      AND cp.user_id = auth.uid()
    )
  );

-- Política RLS: usuários podem atualizar munição de seus próprios personagens
CREATE POLICY "Users can update ammunition of their characters"
  ON public.session_ammunition
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = session_ammunition.character_id
      AND c.user_id = auth.uid()
    )
  );

-- Política RLS: usuários podem inserir munição para seus próprios personagens
CREATE POLICY "Users can insert ammunition for their characters"
  ON public.session_ammunition
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = session_ammunition.character_id
      AND c.user_id = auth.uid()
    )
  );

-- Política RLS: mestres podem atualizar munição de qualquer personagem em suas campanhas
CREATE POLICY "Masters can update ammunition in their campaigns"
  ON public.session_ammunition
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      JOIN public.characters c ON c.campaign_id = cp.campaign_id
      WHERE c.id = session_ammunition.character_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'master'
    )
  );

