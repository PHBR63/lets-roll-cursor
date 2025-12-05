/**
 * Normaliza a URL da API removendo barras no final
 * Evita URLs duplicadas como //api/campaigns
 */
export function normalizeApiUrl(baseUrl: string): string {
  if (!baseUrl) return 'http://localhost:3001'
  
  // Remover barras no final
  return baseUrl.replace(/\/+$/, '')
}

/**
 * Obtém a URL base da API normalizada
 * Use esta função em vez de import.meta.env.VITE_API_URL diretamente
 */
export function getApiBaseUrl(): string {
  return normalizeApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3001')
}

/**
 * Constrói uma URL completa da API
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl()
  
  // Garantir que o endpoint começa com /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  return `${baseUrl}${normalizedEndpoint}`
}

