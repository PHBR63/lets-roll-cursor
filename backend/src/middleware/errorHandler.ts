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
  // Log detalhado do erro
  logger.error({ 
    err, 
    errorMessage: err.message,
    errorStack: err.stack,
    url: req.url, 
    method: req.method,
    body: req.body,
    user: req.user?.id
  }, 'Request error')

  // Em produção, não expor detalhes do erro, mas logar tudo
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: isProduction ? 'Erro interno' : err.message,
  })
}

