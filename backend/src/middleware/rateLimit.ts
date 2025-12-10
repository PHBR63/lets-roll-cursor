import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'
import { logger } from '../utils/logger'

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
 * Handler customizado para rate limit exceeded
 * Adiciona logs detalhados e headers Retry-After
 */
const rateLimitHandler = (req: Request, res: Response, options: { windowMs: number; max: number; message: string }) => {
  const ip = getRealIP(req)
  const retryAfter = Math.ceil(options.windowMs / 1000) // Segundos até resetar
  
  // Log detalhado do rate limit
  logger.warn({
    ip,
    url: req.url,
    method: req.method,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
    limit: options.max,
    windowMs: options.windowMs,
    retryAfter,
  }, 'Rate limit exceeded')

  // Adicionar headers padrão
  res.set({
    'Retry-After': retryAfter.toString(),
    'X-RateLimit-Limit': options.max.toString(),
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': new Date(Date.now() + options.windowMs).toISOString(),
  })

  res.status(429).json({
    error: 'Too Many Requests',
    message: options.message,
    retryAfter,
    limit: options.max,
    windowMs: options.windowMs,
  })
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
  handler: rateLimitHandler,
  // Log quando rate limit está próximo
  onLimitReached: (req: Request, res: Response, options: { windowMs: number; max: number }) => {
    const ip = getRealIP(req)
    logger.info({
      ip,
      url: req.url,
      method: req.method,
      limit: options.max,
    }, 'Rate limit reached')
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
  handler: rateLimitHandler,
  onLimitReached: (req: Request, res: Response, options: { windowMs: number; max: number }) => {
    const ip = getRealIP(req)
    logger.warn({
      ip,
      url: req.url,
      method: req.method,
      limit: options.max,
      type: 'auth',
    }, 'Auth rate limit reached - possível tentativa de brute force')
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
  handler: rateLimitHandler,
  onLimitReached: (req: Request, res: Response, options: { windowMs: number; max: number }) => {
    const ip = getRealIP(req)
    logger.info({
      ip,
      url: req.url,
      method: req.method,
      limit: options.max,
      type: 'create',
    }, 'Create rate limit reached')
  },
})

