import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { sessionService } from '../services/sessionService'
import { validate } from '../middleware/validation'
import { CreateSessionSchema, UpdateSessionSchema, SessionFilterSchema } from '../middleware/schemas/sessionSchemas'
import { AppError } from '../types/common'

/**
 * @swagger
 * tags:
 *   - name: Sessions
 *     description: Operações relacionadas a sessões de jogo
 */

/**
 * Rotas para gerenciamento de sessões de jogo
 */
export const sessionsRouter = Router()

sessionsRouter.use(authenticateToken)

// Listar sessões (com filtros)
sessionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { campaignId, active } = req.query

    if (!campaignId) {
      return res.status(400).json({ error: 'campaignId é obrigatório' })
    }

    const activeOnly = active === 'true'
    const sessions = await sessionService.getCampaignSessions(
      campaignId as string,
      activeOnly
    )

    res.json(sessions)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar nova sessão
sessionsRouter.post(
  '/',
  validate({ body: CreateSessionSchema }),
  async (req: Request, res: Response) => {
    try {
      const { campaignId, name, notes } = req.body

      const session = await sessionService.createSession(campaignId, {
        name,
        notes,
      })

      res.status(201).json(session)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Buscar sessão por ID
sessionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const session = await sessionService.getSessionById(req.params.id)
    res.json(session)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar sessão
sessionsRouter.put(
  '/:id',
  validate({ body: UpdateSessionSchema }),
  async (req: Request, res: Response) => {
    try {
      const session = await sessionService.updateSession(req.params.id, req.body)
      res.json(session)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Atualizar board state (rota específica antes da genérica)
sessionsRouter.put('/:id/board-state', async (req: Request, res: Response) => {
  try {
    const session = await sessionService.updateBoardState(
      req.params.id,
      req.body
    )
    res.json(session)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Finalizar sessão
sessionsRouter.post('/:id/end', async (req: Request, res: Response) => {
  try {
    const session = await sessionService.endSession(req.params.id)
    res.json(session)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Rotas de munição abstrata
sessionsRouter.get('/:sessionId/ammunition/:characterId', async (req: Request, res: Response) => {
  try {
    const { ammunitionService } = await import('../services/ammunitionService')
    const state = await ammunitionService.getAmmunitionState(
      req.params.characterId,
      req.params.sessionId
    )
    res.json(state)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

sessionsRouter.post('/:sessionId/ammunition/:characterId/spend', async (req: Request, res: Response) => {
  try {
    const { ammunitionService } = await import('../services/ammunitionService')
    const { amount = 1 } = req.body
    const state = await ammunitionService.spendAmmunition(
      req.params.characterId,
      req.params.sessionId,
      amount
    )
    res.json(state)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

sessionsRouter.post('/:sessionId/ammunition/:characterId/reload', async (req: Request, res: Response) => {
  try {
    const { ammunitionService } = await import('../services/ammunitionService')
    const { amount = 50 } = req.body
    const state = await ammunitionService.reloadAmmunition(
      req.params.characterId,
      req.params.sessionId,
      amount
    )
    res.json(state)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

sessionsRouter.put('/:sessionId/ammunition/:characterId', async (req: Request, res: Response) => {
  try {
    const { ammunitionService } = await import('../services/ammunitionService')
    const { amount } = req.body
    if (amount === undefined) {
      return res.status(400).json({ error: 'amount é obrigatório' })
    }
    const state = await ammunitionService.setAmmunition(
      req.params.characterId,
      req.params.sessionId,
      amount
    )
    res.json(state)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

sessionsRouter.post('/:sessionId/ammunition/reset', async (req: Request, res: Response) => {
  try {
    const { ammunitionService } = await import('../services/ammunitionService')
    const { resetTo = 100 } = req.body
    await ammunitionService.resetSessionAmmunition(req.params.sessionId, resetTo)
    res.json({ message: 'Munição da sessão resetada' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})