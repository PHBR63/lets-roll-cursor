import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { abilityService } from '../services/abilityService'

/**
 * Rotas para CRUD de habilidades
 */
export const abilitiesRouter = Router()

abilitiesRouter.use(authenticateToken)

// Listar habilidades
abilitiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const abilities = await abilityService.getAbilities(req.query)
    res.json(abilities)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar habilidade
abilitiesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const ability = await abilityService.createAbility(userId, req.body)
    res.status(201).json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter habilidade por ID
abilitiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const ability = await abilityService.getAbilityById(req.params.id)
    res.json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar habilidade
abilitiesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const ability = await abilityService.updateAbility(req.params.id, req.body)
    res.json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Deletar habilidade
abilitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await abilityService.deleteAbility(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter habilidades de uma campanha
abilitiesRouter.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const abilities = await abilityService.getCampaignAbilities(req.params.campaignId)
    res.json(abilities)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atribuir habilidade a personagem
abilitiesRouter.post('/assign', async (req: Request, res: Response) => {
  try {
    const { characterId, abilityId } = req.body
    if (!characterId || !abilityId) {
      return res.status(400).json({ error: 'characterId e abilityId são obrigatórios' })
    }
    const result = await abilityService.assignAbilityToCharacter(characterId, abilityId)
    res.status(201).json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

