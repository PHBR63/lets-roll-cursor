import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validation'
import { AbilityFilterSchema, CreateAbilitySchema, UpdateAbilitySchema } from '../middleware/schemas/abilitySchemas'
import { abilityService } from '../services/abilityService'
import { AppError } from '../types/common'

/**
 * Rotas para CRUD de habilidades
 */
export const abilitiesRouter = Router()

abilitiesRouter.use(authenticateToken)

abilitiesRouter.get(
  '/',
  validate({ query: AbilityFilterSchema }),
  async (req: Request, res: Response) => {
    try {
      const result = await abilityService.getAbilities(req.query as { campaignId?: string; isGlobal?: boolean; limit?: number; offset?: number })
      res.json(result)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

abilitiesRouter.post(
  '/',
  validate({ body: CreateAbilitySchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const ability = await abilityService.createAbility(userId, req.body)
      res.status(201).json(ability)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

abilitiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const ability = await abilityService.getAbilityById(req.params.id)
    res.json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

abilitiesRouter.put(
  '/:id',
  validate({ body: UpdateAbilitySchema }),
  async (req: Request, res: Response) => {
    try {
      const ability = await abilityService.updateAbility(req.params.id, req.body)
      res.json(ability)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

abilitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await abilityService.deleteAbility(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
