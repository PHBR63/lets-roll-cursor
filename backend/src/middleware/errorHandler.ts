import { Request, Response, NextFunction } from 'express'

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
  console.error('Error:', err)

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
  })
}

