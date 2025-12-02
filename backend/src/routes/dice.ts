import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

/**
 * Rotas para sistema de rolagem de dados
 */
export const diceRouter = Router()

diceRouter.use(authenticateToken)

/**
 * Rola dados baseado na fórmula fornecida
 * Exemplo: 2d6+3, 1d20, etc.
 */
diceRouter.post('/roll', async (req: Request, res: Response) => {
  try {
    const { formula, sessionId, isPrivate } = req.body
    const userId = (req as any).user.id

    // TODO: Implementar lógica de rolagem
    const result = {
      formula,
      result: Math.floor(Math.random() * 20) + 1, // Mock
      userId,
      sessionId,
      isPrivate,
      timestamp: new Date().toISOString(),
    }

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Obtém histórico de rolagens
 */
diceRouter.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar busca de histórico
    res.json({ message: 'Roll history - implementar' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

