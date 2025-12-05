import rateLimit from 'express-rate-limit'
import { Request } from 'express'

/**
 * Função para obter o IP real do cliente, mesmo atrás de proxy
 */
const getRealIP = (req: Request): string => {
  // Se houver X-Forwarded-For, pegar o primeiro IP (IP real do cliente)
  const forwardedFor = req.headers['x-forwarded-for']
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
    return ips.split(',')[0].trim()
  }
  // Se houver X-Real-IP, usar ele
  const realIP = req.headers['x-real-ip']
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP
  }
  // Fallback para req.ip (já processado pelo Express com trust proxy)
  return req.ip || 'unknown'
}

/**
 * Rate limiter geral: 100 requisições por 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  // Usar função personalizada para obter IP real, ignorando validação do trust proxy
  keyGenerator: (req) => getRealIP(req),
  validate: {
    trustProxy: false, // Desabilitar validação do trust proxy
  },
})

/**
 * Rate limiter para autenticação: 5 requisições por 15 minutos
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requisições
  message: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
  keyGenerator: (req) => getRealIP(req),
  validate: {
    trustProxy: false, // Desabilitar validação do trust proxy
  },
})

/**
 * Rate limiter para criação de recursos: 20 requisições por 15 minutos
 */
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 requisições
  message: 'Muitas criações de recursos, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRealIP(req),
  validate: {
    trustProxy: false, // Desabilitar validação do trust proxy
  },
})

