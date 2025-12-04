import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * Middleware de tratamento de erros
 * Captura erros e retorna resposta JSON formatada
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({ err, url: req.url, method: req.method }, 'Request error')

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message,
  })
}

