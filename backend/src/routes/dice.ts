import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { diceService } from '../services/diceService'
import { validate } from '../middleware/validation'
import { DiceRollSchema } from '../middleware/schemas/diceSchemas'
import { AppError } from '../types/common'

/**
 * @swagger
 * tags:
 *   - name: Dice
 *     description: Operações relacionadas a rolagem de dados
 */

/**
 * Rotas para sistema de rolagem de dados
 */
export const diceRouter = Router()

diceRouter.use(authenticateToken)

/**
 * Rola dados baseado na fórmula fornecida
 * Exemplo: 2d6+3, 1d20, etc.
 */
diceRouter.post(
  '/roll',
  validate({ body: DiceRollSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const { formula, sessionId, campaignId, characterId, isPrivate } = req.body

      const result = await diceService.rollDice({
        formula,
        userId,
        campaignId,
        sessionId: sessionId || null,
        characterId: characterId || null,
        isPrivate: isPrivate || false,
      })

      res.json(result)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

/**
 * Obtém histórico de rolagens
 */
diceRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const { sessionId, campaignId, limit } = req.query

    if (!sessionId && !campaignId) {
      return res.status(400).json({ error: 'sessionId ou campaignId é obrigatório' })
    }

    const history = await diceService.getRollHistory(
      sessionId as string,
      campaignId as string,
      limit ? parseInt(limit as string, 10) : 50
    )

    res.json(history)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
