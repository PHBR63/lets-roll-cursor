import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { creatureService } from '../services/creatureService'

/**
 * Rotas para CRUD de criaturas
 */
export const creaturesRouter = Router()

creaturesRouter.use(authenticateToken)

creaturesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const creatures = await creatureService.getCreatures(req.query)
    res.json(creatures)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

creaturesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const creature = await creatureService.createCreature(userId, req.body)
    res.status(201).json(creature)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter criaturas de uma campanha
creaturesRouter.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const creatures = await creatureService.getCampaignCreatures(req.params.campaignId)
    res.json(creatures)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

creaturesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const creature = await creatureService.getCreatureById(req.params.id)
    res.json(creature)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

creaturesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const creature = await creatureService.updateCreature(req.params.id, req.body)
    res.json(creature)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

creaturesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await creatureService.deleteCreature(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

