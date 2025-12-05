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
 * Constrói uma URL completa da API
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = normalizeApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3001')
  
  // Garantir que o endpoint começa com /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  return `${baseUrl}${normalizedEndpoint}`
}

