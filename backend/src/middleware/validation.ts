import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

/**
 * Middleware de validação genérico usando Zod
 * Valida o body, query ou params da requisição
 */
export function validate(schema: {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body)
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query)
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Erro de validação',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        })
      }
      next(error)
    }
  }
}

