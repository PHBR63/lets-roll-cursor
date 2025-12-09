import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables')
  console.error('[Supabase] ❌ Erro crítico:', error.message)
  console.error('[Supabase] VITE_SUPABASE_URL:', supabaseUrl ? 'Definido' : 'FALTANDO')
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definido' : 'FALTANDO')
  throw error
}

// Validar que estamos usando a chave anônima, não a service_role key
// A service_role key geralmente é mais longa e pode conter "service_role" no payload JWT
// Vamos fazer uma validação básica: se a chave for muito longa (>400 chars) ou contiver indicadores de service_role
try {
  // Tentar decodificar o JWT para verificar o tipo de chave
  const parts = supabaseAnonKey.split('.')
  if (parts.length === 3) {
    // Decodificar o payload (segunda parte do JWT)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    // Se contém 'role' e não é 'anon', provavelmente é service_role
    if (payload.role && payload.role !== 'anon' && payload.role !== 'authenticated') {
      console.error('ERRO CRÍTICO: Parece que você está usando a SERVICE_ROLE_KEY no frontend!')
      console.error('Use apenas a ANON_KEY no frontend. A SERVICE_ROLE_KEY deve ser usada apenas no backend.')
      throw new Error('Forbidden use of secret API key in browser. Use only ANON_KEY in frontend.')
    }
  }
} catch (e) {
  // Se não conseguir decodificar, fazer validação simples
  if (supabaseAnonKey.includes('service_role') || supabaseAnonKey.length > 500) {
    console.error('ERRO CRÍTICO: Parece que você está usando a SERVICE_ROLE_KEY no frontend!')
    console.error('Use apenas a ANON_KEY no frontend. A SERVICE_ROLE_KEY deve ser usada apenas no backend.')
    throw new Error('Forbidden use of secret API key in browser. Use only ANON_KEY in frontend.')
  }
}

/**
 * Cliente Supabase para uso no frontend
 * IMPORTANTE: Use apenas VITE_SUPABASE_ANON_KEY, nunca a SERVICE_ROLE_KEY
 * 
 * Inicialização lazy para evitar problemas de ordem de carregamento
 */
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      console.log('[Supabase] Criando cliente...')
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: typeof window !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
      console.log('[Supabase] Cliente criado com sucesso')
    } catch (error) {
      console.error('[Supabase] ❌ Erro ao criar cliente:', error)
      // Em caso de erro, tentar novamente após um delay
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            console.log('[Supabase] Tentando recriar cliente após erro...')
            supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                storage: localStorage,
                persistSession: true,
                autoRefreshToken: true,
              },
            })
            console.log('[Supabase] Cliente recriado com sucesso após retry')
          } catch (retryError) {
            console.error('[Supabase] ❌ Erro ao recriar cliente após retry:', retryError)
            // Não lançar erro aqui para não quebrar a aplicação
          }
        }, 100)
      }
      // Não lançar erro imediatamente, permitir que a aplicação continue
      // O erro será lançado apenas quando tentar usar o cliente
    }
  }
  return supabaseClient
}

// Exportar como getter para garantir inicialização correta
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    try {
      const client = getSupabaseClient()
      if (!client) {
        throw new Error('Supabase client não foi inicializado')
      }
      const value = (client as any)[prop]
      if (typeof value === 'function') {
        return value.bind(client)
      }
      return value
    } catch (error) {
      console.error('[Supabase] Erro ao acessar propriedade:', prop, error)
      // Retornar função vazia para evitar quebra da aplicação
      if (typeof prop === 'string' && prop.includes('auth')) {
        return () => Promise.resolve({ data: null, error: error as Error })
      }
      throw error
    }
  },
})

