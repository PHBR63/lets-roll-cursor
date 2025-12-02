import { Router } from 'express'

/**
 * Rotas de autenticação
 * A autenticação principal é feita pelo Supabase no frontend
 * Estas rotas podem ser usadas para funcionalidades adicionais se necessário
 */
export const authRouter = Router()

authRouter.get('/me', (req, res) => {
  res.json({ message: 'Auth endpoint - implementar se necessário' })
})

