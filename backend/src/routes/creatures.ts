import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { creatureService } from '../services/creatureService'
import { validate } from '../middleware/validation'
import { CreatureFilterSchema, CreateCreatureSchema, UpdateCreatureSchema } from '../middleware/schemas/creatureSchemas'
import { AppError } from '../types/common'

/**
 * Rotas para CRUD de criaturas
 */
export const creaturesRouter = Router()

creaturesRouter.use(authenticateToken)

creaturesRouter.get(
  '/',
  validate({ query: CreatureFilterSchema }),
  async (req: Request, res: Response) => {
    try {
      const result = await creatureService.getCreatures(req.query as { campaignId?: string; isGlobal?: boolean; limit?: number; offset?: number })
      res.json(result)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

creaturesRouter.post(
  '/',
  validate({ body: CreateCreatureSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const creature = await creatureService.createCreature(userId, req.body)
      res.status(201).json(creature)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

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

creaturesRouter.put(
  '/:id',
  validate({ body: UpdateCreatureSchema }),
  async (req: Request, res: Response) => {
    try {
      const creature = await creatureService.updateCreature(req.params.id, req.body)
      res.json(creature)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

creaturesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await creatureService.deleteCreature(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

