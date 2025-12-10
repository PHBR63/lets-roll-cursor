import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'

/**
 * Middleware de tratamento de erros
 * Captura erros e retorna resposta JSON formatada com tratamento específico por tipo
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const appError = err as AppError
  const statusCode = appError.statusCode || 500
  const errorCode = appError.code
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown'
  const userAgent = req.headers['user-agent']
  const userId = (req as any).user?.id

  // Log detalhado do erro com contexto completo
  const logContext = {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: errorCode,
      statusCode,
    },
    request: {
      url: req.url,
      method: req.method,
      ip,
      userAgent,
      userId,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? '[REDACTED]' : undefined,
      },
    },
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
    query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    params: req.params && Object.keys(req.params).length > 0 ? req.params : undefined,
  }

  // Log com nível apropriado baseado no status code
  if (statusCode >= 500) {
    logger.error(logContext, 'Server error')
  } else if (statusCode >= 400) {
    logger.warn(logContext, 'Client error')
  } else {
    logger.info(logContext, 'Request error')
  }

  // Tratamento específico por tipo de erro
  const isProduction = process.env.NODE_ENV === 'production'

  // Erros de validação (400)
  if (statusCode === 400) {
    return res.status(400).json({
      error: 'Bad Request',
      message: isProduction ? 'Requisição inválida' : err.message,
      code: errorCode,
    })
  }

  // Não autorizado (401)
  if (statusCode === 401) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Sessão expirada ou token inválido. Faça login novamente.',
      code: errorCode,
    })
  }

  // Proibido (403)
  if (statusCode === 403) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Você não tem permissão para realizar esta ação.',
      code: errorCode,
    })
  }

  // Não encontrado (404)
  if (statusCode === 404) {
    return res.status(404).json({
      error: 'Not Found',
      message: isProduction ? 'Recurso não encontrado' : err.message,
      code: errorCode,
    })
  }

  // Too Many Requests (429) - já tratado pelo rate limiter, mas pode ser chamado aqui também
  if (statusCode === 429) {
    const retryAfter = req.headers['retry-after'] || '900' // 15 minutos padrão
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: parseInt(retryAfter as string, 10),
      code: errorCode,
    })
  }

  // Erros do servidor (500+)
  if (statusCode >= 500) {
    return res.status(statusCode).json({
      error: 'Internal Server Error',
      message: isProduction 
        ? 'Erro interno do servidor. Nossa equipe foi notificada.' 
        : err.message,
      code: errorCode,
      // Em desenvolvimento, incluir stack trace
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    })
  }

  // Erro genérico (fallback)
  res.status(statusCode || 500).json({
    error: 'Error',
    message: isProduction ? 'Ocorreu um erro' : err.message,
    code: errorCode,
  })
}

