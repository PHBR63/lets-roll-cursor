import rateLimit from 'express-rate-limit'

/**
 * Rate limiter geral: 100 requisições por 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
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
})

