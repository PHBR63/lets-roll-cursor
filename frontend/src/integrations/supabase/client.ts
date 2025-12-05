import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Validar que estamos usando a chave anônima, não a service_role key
// A service_role key geralmente começa com "eyJ" mas tem um padrão diferente
// A anon key também começa com "eyJ", mas vamos validar pelo tamanho e estrutura
if (supabaseAnonKey.includes('service_role') || supabaseAnonKey.length > 500) {
  console.error('ERRO CRÍTICO: Parece que você está usando a SERVICE_ROLE_KEY no frontend!')
  console.error('Use apenas a ANON_KEY no frontend. A SERVICE_ROLE_KEY deve ser usada apenas no backend.')
  throw new Error('Forbidden use of secret API key in browser. Use only ANON_KEY in frontend.')
}

/**
 * Cliente Supabase para uso no frontend
 * IMPORTANTE: Use apenas VITE_SUPABASE_ANON_KEY, nunca a SERVICE_ROLE_KEY
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
})

