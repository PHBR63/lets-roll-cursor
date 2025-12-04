import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'

/**
 * Middleware de autenticação
 * Verifica o token JWT do Supabase no header Authorization
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Adiciona o usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username,
    }

    next()
  } catch (error) {
    logger.error({ error }, 'Auth middleware error')
    return res.status(401).json({ error: 'Erro ao autenticar' })
  }
}

