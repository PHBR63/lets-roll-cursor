import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { momentService } from '../services/momentService'

/**
 * Rotas para CRUD de momentos da campanha (stories)
 */
export const momentsRouter = Router()

momentsRouter.use(authenticateToken)

momentsRouter.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const moments = await momentService.getCampaignMoments(req.params.campaignId)
    res.json(moments)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

momentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const moment = await momentService.createMoment(req.body)
    res.status(201).json(moment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter momentos de uma sessão (rota específica antes da genérica)
momentsRouter.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar getSessionMoments no momentService
    const moments = await momentService.getCampaignMoments('')
    res.json(moments)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter momento por ID (rota genérica depois das específicas)
momentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar getMomentById no momentService
    const moments = await momentService.getCampaignMoments('')
    const moment = moments.find((m: any) => m.id === req.params.id)
    if (!moment) {
      return res.status(404).json({ error: 'Momento não encontrado' })
    }
    res.json(moment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar momento
momentsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar updateMoment no momentService
    const moment = await momentService.createMoment({ ...req.body, id: req.params.id })
    res.json(moment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

momentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await momentService.deleteMoment(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

