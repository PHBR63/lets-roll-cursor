-- ============================================
-- SCRIPT COMPLETO DE SETUP DO BANCO DE DADOS
-- Let's Roll - Supabase
-- ============================================
-- 
-- Este script consolida todas as migrations
-- Execute APENAS se o banco estiver vazio
-- OU execute as migrations individuais na ordem
--
-- ============================================

-- ============================================
-- PARTE 1: SCHEMA INICIAL
-- ============================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para status de campanha
DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'ended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  system_rpg TEXT,
  tags TEXT[],
  status campaign_status DEFAULT 'active',
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para papel na campanha
DO $$ BEGIN
  CREATE TYPE participant_role AS ENUM ('master', 'player', 'observer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de participantes da campanha
CREATE TABLE IF NOT EXISTS public.campaign_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role participant_role DEFAULT 'player',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Tabela de personagens
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  attributes JSONB,
  stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de criaturas
CREATE TABLE IF NOT EXISTS public.creatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  attributes JSONB,
  stats JSONB,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  attributes JSONB,
  rarity TEXT,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de habilidades
CREATE TABLE IF NOT EXISTS public.abilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  cost JSONB,
  attributes JSONB,
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de personagem (inventário)
CREATE TABLE IF NOT EXISTS public.character_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de habilidades de personagem
CREATE TABLE IF NOT EXISTS public.character_abilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  ability_id UUID REFERENCES public.abilities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, ability_id)
);

-- Tabela de sessões de jogo
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens de chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  character_id UUID REFERENCES public.characters(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'message',
  channel TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de rolagens de dados
CREATE TABLE IF NOT EXISTS public.dice_rolls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  character_id UUID REFERENCES public.characters(id),
  formula TEXT NOT NULL,
  result INTEGER NOT NULL,
  details JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de momentos da campanha (stories)
CREATE TABLE IF NOT EXISTS public.campaign_moments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  dice_roll_id UUID REFERENCES public.dice_rolls(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON public.campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user ON public.campaign_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_campaign ON public.characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_characters_user ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_campaign ON public.chat_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_session ON public.dice_rolls(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_campaign ON public.dice_rolls(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sessions_campaign ON public.sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_moments_campaign ON public.campaign_moments(campaign_id);

-- ============================================
-- PARTE 2: UPDATED_AT EM CAMPAIGN_MOMENTS
-- ============================================

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

-- ============================================
-- PARTE 3: CAMPOS ORDEM PARANORMAL
-- ============================================

ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS class TEXT CHECK (class IN ('COMBATENTE', 'ESPECIALISTA', 'OCULTISTA')),
ADD COLUMN IF NOT EXISTS path TEXT,
ADD COLUMN IF NOT EXISTS affinity TEXT CHECK (affinity IN ('SANGUE', 'MORTE', 'ENERGIA', 'CONHECIMENTO', 'MEDO')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conditions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS defense INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '{}';

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

-- ============================================
-- PARTE 4: BOARD STATE
-- ============================================

ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS board_state JSONB DEFAULT '{}';

COMMENT ON COLUMN public.sessions.board_state IS 'Estado do board da sessão: imagem, zoom, posição, tokens e desenhos';

-- ============================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dice_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_moments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS COMPLETAS
-- ============================================

-- ============================================
-- USERS - Perfis de usuário
-- ============================================

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Usuários podem ver perfis de outros usuários (para exibir avatares/nomes)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT TO authenticated
  USING (true);

-- Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Usuários podem inserir seu próprio perfil (quando se registram)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CAMPAIGNS - Campanhas
-- ============================================

-- Participantes podem ver campanhas que participam
DROP POLICY IF EXISTS "Participants can view campaign" ON public.campaigns;
CREATE POLICY "Participants can view campaign" ON public.campaigns
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = campaigns.id
      AND user_id = auth.uid()
    )
  );

-- Mestres podem criar campanhas
DROP POLICY IF EXISTS "Users can create campaigns" ON public.campaigns;
CREATE POLICY "Users can create campaigns" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Mestres podem atualizar/deletar campanhas
DROP POLICY IF EXISTS "Masters can manage campaign" ON public.campaigns;
CREATE POLICY "Masters can manage campaign" ON public.campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = campaigns.id
      AND user_id = auth.uid()
      AND role = 'master'
    )
  );

-- ============================================
-- CAMPAIGN_PARTICIPANTS - Participantes
-- ============================================

-- Participantes podem ver outros participantes de suas campanhas
DROP POLICY IF EXISTS "Participants can view campaign participants" ON public.campaign_participants;
CREATE POLICY "Participants can view campaign participants" ON public.campaign_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = campaign_participants.campaign_id
      AND cp.user_id = auth.uid()
    )
  );

-- Mestres podem adicionar participantes
DROP POLICY IF EXISTS "Masters can add participants" ON public.campaign_participants;
CREATE POLICY "Masters can add participants" ON public.campaign_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = campaign_participants.campaign_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'master'
    )
  );

-- Mestres podem atualizar/deletar participantes
DROP POLICY IF EXISTS "Masters can manage participants" ON public.campaign_participants;
CREATE POLICY "Masters can manage participants" ON public.campaign_participants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = campaign_participants.campaign_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'master'
    )
  );

-- ============================================
-- CHARACTERS - Personagens
-- ============================================

-- Participantes podem ver personagens de suas campanhas
DROP POLICY IF EXISTS "Users can view characters in their campaigns" ON public.characters;
CREATE POLICY "Users can view characters in their campaigns" ON public.characters
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = characters.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Usuários podem criar personagens em campanhas que participam
DROP POLICY IF EXISTS "Users can create characters" ON public.characters;
CREATE POLICY "Users can create characters" ON public.characters
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = characters.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Donos podem atualizar seus personagens
DROP POLICY IF EXISTS "Users can update own characters" ON public.characters;
CREATE POLICY "Users can update own characters" ON public.characters
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Mestres podem atualizar qualquer personagem de suas campanhas
DROP POLICY IF EXISTS "Masters can update characters" ON public.characters;
CREATE POLICY "Masters can update characters" ON public.characters
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = characters.campaign_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'master'
    )
  );

-- Donos podem deletar seus personagens
DROP POLICY IF EXISTS "Users can delete own characters" ON public.characters;
CREATE POLICY "Users can delete own characters" ON public.characters
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- CREATURES - Criaturas
-- ============================================

-- Participantes podem ver criaturas de suas campanhas ou globais
DROP POLICY IF EXISTS "Users can view creatures" ON public.creatures;
CREATE POLICY "Users can view creatures" ON public.creatures
  FOR SELECT TO authenticated
  USING (
    is_global = true OR
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = creatures.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Mestres podem criar criaturas em suas campanhas ou globais
DROP POLICY IF EXISTS "Masters can create creatures" ON public.creatures;
CREATE POLICY "Masters can create creatures" ON public.creatures
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    (
      is_global = true OR
      EXISTS (
        SELECT 1 FROM public.campaign_participants cp
        WHERE cp.campaign_id = creatures.campaign_id
        AND cp.user_id = auth.uid()
        AND cp.role = 'master'
      )
    )
  );

-- Criadores podem atualizar/deletar suas criaturas
DROP POLICY IF EXISTS "Users can manage own creatures" ON public.creatures;
CREATE POLICY "Users can manage own creatures" ON public.creatures
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- ITEMS - Itens
-- ============================================

-- Participantes podem ver itens de suas campanhas ou globais
DROP POLICY IF EXISTS "Users can view items" ON public.items;
CREATE POLICY "Users can view items" ON public.items
  FOR SELECT TO authenticated
  USING (
    is_global = true OR
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = items.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Mestres podem criar itens em suas campanhas ou globais
DROP POLICY IF EXISTS "Masters can create items" ON public.items;
CREATE POLICY "Masters can create items" ON public.items
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    (
      is_global = true OR
      EXISTS (
        SELECT 1 FROM public.campaign_participants cp
        WHERE cp.campaign_id = items.campaign_id
        AND cp.user_id = auth.uid()
        AND cp.role = 'master'
      )
    )
  );

-- Criadores podem atualizar/deletar seus itens
DROP POLICY IF EXISTS "Users can manage own items" ON public.items;
CREATE POLICY "Users can manage own items" ON public.items
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- ABILITIES - Habilidades
-- ============================================

-- Participantes podem ver habilidades de suas campanhas ou globais
DROP POLICY IF EXISTS "Users can view abilities" ON public.abilities;
CREATE POLICY "Users can view abilities" ON public.abilities
  FOR SELECT TO authenticated
  USING (
    is_global = true OR
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = abilities.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Mestres podem criar habilidades em suas campanhas ou globais
DROP POLICY IF EXISTS "Masters can create abilities" ON public.abilities;
CREATE POLICY "Masters can create abilities" ON public.abilities
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    (
      is_global = true OR
      EXISTS (
        SELECT 1 FROM public.campaign_participants cp
        WHERE cp.campaign_id = abilities.campaign_id
        AND cp.user_id = auth.uid()
        AND cp.role = 'master'
      )
    )
  );

-- Criadores podem atualizar/deletar suas habilidades
DROP POLICY IF EXISTS "Users can manage own abilities" ON public.abilities;
CREATE POLICY "Users can manage own abilities" ON public.abilities
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- CHARACTER_ITEMS - Inventário
-- ============================================

-- Donos podem ver itens de seus personagens
DROP POLICY IF EXISTS "Users can view character items" ON public.character_items;
CREATE POLICY "Users can view character items" ON public.character_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_items.character_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.campaign_participants cp
          WHERE cp.campaign_id = c.campaign_id
          AND cp.user_id = auth.uid()
          AND cp.role = 'master'
        )
      )
    )
  );

-- Donos podem gerenciar itens de seus personagens
DROP POLICY IF EXISTS "Users can manage character items" ON public.character_items;
CREATE POLICY "Users can manage character items" ON public.character_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_items.character_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.campaign_participants cp
          WHERE cp.campaign_id = c.campaign_id
          AND cp.user_id = auth.uid()
          AND cp.role = 'master'
        )
      )
    )
  );

-- ============================================
-- CHARACTER_ABILITIES - Habilidades de personagem
-- ============================================

-- Donos podem ver habilidades de seus personagens
DROP POLICY IF EXISTS "Users can view character abilities" ON public.character_abilities;
CREATE POLICY "Users can view character abilities" ON public.character_abilities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_abilities.character_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.campaign_participants cp
          WHERE cp.campaign_id = c.campaign_id
          AND cp.user_id = auth.uid()
        )
      )
    )
  );

-- Donos podem gerenciar habilidades de seus personagens
DROP POLICY IF EXISTS "Users can manage character abilities" ON public.character_abilities;
CREATE POLICY "Users can manage character abilities" ON public.character_abilities
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.characters c
      WHERE c.id = character_abilities.character_id
      AND (
        c.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.campaign_participants cp
          WHERE cp.campaign_id = c.campaign_id
          AND cp.user_id = auth.uid()
          AND cp.role = 'master'
        )
      )
    )
  );

-- ============================================
-- SESSIONS - Sessões de jogo
-- ============================================

-- Participantes podem ver sessões de suas campanhas
DROP POLICY IF EXISTS "Participants can view sessions" ON public.sessions;
CREATE POLICY "Participants can view sessions" ON public.sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = sessions.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Mestres podem criar/atualizar/deletar sessões
DROP POLICY IF EXISTS "Masters can manage sessions" ON public.sessions;
CREATE POLICY "Masters can manage sessions" ON public.sessions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = sessions.campaign_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'master'
    )
  );

-- ============================================
-- CHAT_MESSAGES - Mensagens de chat
-- ============================================

-- Participantes podem ver mensagens de suas campanhas
DROP POLICY IF EXISTS "Participants can view chat messages" ON public.chat_messages;
CREATE POLICY "Participants can view chat messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = chat_messages.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Participantes podem enviar mensagens
DROP POLICY IF EXISTS "Participants can send chat messages" ON public.chat_messages;
CREATE POLICY "Participants can send chat messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = chat_messages.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Usuários podem atualizar/deletar suas próprias mensagens
DROP POLICY IF EXISTS "Users can manage own messages" ON public.chat_messages;
CREATE POLICY "Users can manage own messages" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- DICE_ROLLS - Rolagens de dados
-- ============================================

-- Participantes podem ver rolagens públicas ou suas próprias
-- Mestres podem ver todas as rolagens (incluindo privadas)
DROP POLICY IF EXISTS "Participants can view dice rolls" ON public.dice_rolls;
CREATE POLICY "Participants can view dice rolls" ON public.dice_rolls
  FOR SELECT TO authenticated
  USING (
    is_private = false OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.campaign_participants cp
      WHERE cp.campaign_id = dice_rolls.campaign_id
      AND cp.user_id = auth.uid()
      AND cp.role = 'master'
    )
  );

-- Participantes podem fazer rolagens
DROP POLICY IF EXISTS "Participants can roll dice" ON public.dice_rolls;
CREATE POLICY "Participants can roll dice" ON public.dice_rolls
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = dice_rolls.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Usuários podem atualizar/deletar suas próprias rolagens
DROP POLICY IF EXISTS "Users can manage own dice rolls" ON public.dice_rolls;
CREATE POLICY "Users can manage own dice rolls" ON public.dice_rolls
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own dice rolls" ON public.dice_rolls;
CREATE POLICY "Users can delete own dice rolls" ON public.dice_rolls
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- CAMPAIGN_MOMENTS - Momentos da campanha
-- ============================================

-- Participantes podem ver momentos de suas campanhas
DROP POLICY IF EXISTS "Participants can view moments" ON public.campaign_moments;
CREATE POLICY "Participants can view moments" ON public.campaign_moments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = campaign_moments.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Participantes podem criar momentos
DROP POLICY IF EXISTS "Participants can create moments" ON public.campaign_moments;
CREATE POLICY "Participants can create moments" ON public.campaign_moments
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.campaign_participants
      WHERE campaign_id = campaign_moments.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Criadores podem atualizar/deletar seus momentos
DROP POLICY IF EXISTS "Users can manage own moments" ON public.campaign_moments;
CREATE POLICY "Users can manage own moments" ON public.campaign_moments
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- PARTE 6: REALTIME
-- ============================================

-- Habilitar Realtime para tabelas necessárias
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dice_rolls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.creatures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_participants;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

SELECT 'Setup completo executado com sucesso!' as status;

