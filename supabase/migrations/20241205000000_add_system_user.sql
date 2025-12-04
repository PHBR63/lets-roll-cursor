-- Migration para criar usuário do sistema para habilidades automáticas
-- Este usuário será usado para criar habilidades de classe automaticamente

-- Criar usuário do sistema se não existir
INSERT INTO public.users (id, username, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system',
  'system@letsroll.app',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Comentário para documentação
COMMENT ON TABLE public.users IS 'Usuários do sistema. O usuário com id 00000000-0000-0000-0000-000000000000 é usado para criar habilidades de classe automaticamente.';

