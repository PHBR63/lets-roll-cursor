/**
 * Rate Limiting no Frontend
 * Limita requisições e ações para prevenir abuso
 */

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  key?: string
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Verificar se ação está dentro do limite de taxa
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const { maxRequests, windowMs } = options
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Se não há entrada ou expirou, criar nova
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, newEntry)
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // Se excedeu o limite
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  // Incrementar contador
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Limpar entradas expiradas do store
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Limpar entradas expiradas a cada minuto
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 1000)
}

/**
 * Wrapper para função com rate limiting
 */
export function withRateLimit<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: RateLimitOptions
): T {
  const key = options.key || fn.name || 'anonymous'

  return ((...args: Parameters<T>) => {
    const check = checkRateLimit(key, options)

    if (!check.allowed) {
      throw new Error(
        `Rate limit excedido. Tente novamente em ${Math.ceil((check.resetAt - Date.now()) / 1000)} segundos.`
      )
    }

    return fn(...args)
  }) as T
}

/**
 * Debounce com rate limiting
 */
export function debounceWithRateLimit<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
  rateLimitOptions: RateLimitOptions
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  const key = rateLimitOptions.key || fn.name || 'debounced'

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      const check = checkRateLimit(key, rateLimitOptions)

      if (check.allowed) {
        fn(...args)
      } else {
        console.warn('Rate limit excedido, ação ignorada')
      }

      timeoutId = null
    }, delay)
  }) as T
}

/**
 * Retry com backoff exponencial e rate limiting
 */
export async function retryWithRateLimit<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    rateLimit?: RateLimitOptions
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    rateLimit,
  } = options

  let lastError: Error | unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Verificar rate limit se fornecido
    if (rateLimit) {
      const key = rateLimit.key || 'retry'
      const check = checkRateLimit(key, rateLimit)

      if (!check.allowed) {
        await new Promise((resolve) =>
          setTimeout(resolve, check.resetAt - Date.now())
        )
      }
    }

    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Se não é a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt),
          maxDelay
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

