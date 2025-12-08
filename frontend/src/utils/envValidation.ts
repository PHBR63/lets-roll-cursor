/**
 * Validação de variáveis de ambiente
 * Garante que todas as variáveis obrigatórias estão definidas
 */

interface EnvValidationResult {
  valid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Valida variáveis de ambiente obrigatórias
 */
export function validateEnv(): EnvValidationResult {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  const missing: string[] = []
  const warnings: string[] = []

  // Verificar variáveis obrigatórias
  for (const key of required) {
    if (!import.meta.env[key]) {
      missing.push(key)
    }
  }

  // Validações de formato
  if (import.meta.env.VITE_SUPABASE_URL) {
    const url = import.meta.env.VITE_SUPABASE_URL
    if (!url.startsWith('https://')) {
      warnings.push('VITE_SUPABASE_URL should use HTTPS in production')
    }
    if (!url.includes('.supabase.co')) {
      warnings.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL')
    }
  }

  // Validar que não estamos usando SERVICE_ROLE_KEY
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (key.includes('service_role') || key.length > 500) {
      warnings.push('VITE_SUPABASE_ANON_KEY might be a SERVICE_ROLE_KEY (should use ANON_KEY only)')
    }
  }

  // Validar URL da API (opcional, mas recomendado)
  if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
    warnings.push('VITE_API_URL is not set in production')
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Valida e lança erro se variáveis obrigatórias estiverem faltando
 * Use esta função no início da aplicação (main.tsx)
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv()

  if (!result.valid) {
    const errorMessage = `
Missing required environment variables:
${result.missing.map(key => `  - ${key}`).join('\n')}

Please check your .env file or environment configuration.
    `.trim()

    throw new Error(errorMessage)
  }

  // Log warnings em desenvolvimento
  if (result.warnings.length > 0 && !import.meta.env.PROD) {
    console.warn('Environment validation warnings:')
    result.warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`))
  }
}

