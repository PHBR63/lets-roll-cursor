import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { sessionService } from '../services/sessionService'

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
sessionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { campaignId, name, notes } = req.body

    if (!campaignId) {
      return res.status(400).json({ error: 'campaignId é obrigatório' })
    }

    const session = await sessionService.createSession(campaignId, {
      name,
      notes,
    })

    res.status(201).json(session)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

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
sessionsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const session = await sessionService.updateSession(req.params.id, req.body)
    res.json(session)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

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
