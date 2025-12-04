/**
 * Extensão de tipos do Express para incluir user no Request
 */
import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        username?: string
      }
    }
  }
}

