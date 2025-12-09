/**
 * Utilitários de sanitização e validação
 * Proteção contra XSS e validação de inputs
 */

/**
 * Sanitizar string HTML usando DOMPurify (se disponível)
 * Fallback para escape básico
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: apenas escape básico
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Client-side: tentar usar DOMPurify se disponível
  try {
    // Dynamic import para não aumentar bundle se não usar
    const DOMPurify = require('dompurify')
    if (DOMPurify && DOMPurify.sanitize) {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href'],
      })
    }
  } catch {
    // DOMPurify não disponível, usar escape básico
  }

  // Fallback: escape básico
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validar e sanitizar URL
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url)
    
    // Permitir apenas http, https, mailto, tel
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }

    // Verificar se é URL válida
    return parsed.href
  } catch {
    return null
  }
}

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitizar string (remover caracteres perigosos)
 */
export function sanitizeString(input: string, maxLength?: number): string {
  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Validar e sanitizar número
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input

  if (isNaN(num)) {
    return null
  }

  if (min !== undefined && num < min) {
    return null
  }

  if (max !== undefined && num > max) {
    return null
  }

  return num
}

/**
 * Validar arquivo upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // em bytes
    allowedTypes?: string[]
    maxFileNameLength?: number
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], maxFileNameLength = 255 } = options

  // Validar tamanho
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
    }
  }

  // Validar tipo
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
    }
  }

  // Validar nome do arquivo
  if (file.name.length > maxFileNameLength) {
    return {
      valid: false,
      error: `Nome do arquivo muito longo. Máximo: ${maxFileNameLength} caracteres`,
    }
  }

  // Validar caracteres perigosos no nome
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
  if (dangerousChars.test(file.name)) {
    return {
      valid: false,
      error: 'Nome do arquivo contém caracteres inválidos',
    }
  }

  return { valid: true }
}

/**
 * Escape caracteres especiais para uso em regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validar senha (força mínima)
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial')
  }

  // Calcular força
  if (password.length >= 12 && errors.length === 0) {
    strength = 'strong'
  } else if (password.length >= 8 && errors.length <= 1) {
    strength = 'medium'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}

