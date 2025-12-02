import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { characterService } from '../services/characterService'

/**
 * Rotas para CRUD de personagens
 */
export const charactersRouter = Router()

charactersRouter.use(authenticateToken)

// Listar personagens
charactersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const characters = await characterService.getCharacters(req.query)
    res.json(characters)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar personagem
charactersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const character = await characterService.createCharacter(userId, req.body)
    res.status(201).json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Rotas aninhadas específicas devem vir ANTES da rota genérica /:id
// Obter inventário do personagem
charactersRouter.get('/:id/inventory', async (req: Request, res: Response) => {
  try {
    const inventory = await characterService.getCharacterInventory(req.params.id)
    res.json(inventory)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Adicionar item ao inventário
charactersRouter.post('/:id/inventory', async (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body
    if (!itemId) {
      return res.status(400).json({ error: 'itemId é obrigatório' })
    }
    const item = await characterService.addItemToCharacter(
      req.params.id,
      itemId,
      quantity || 1
    )
    res.status(201).json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Remover item do inventário
charactersRouter.delete('/:id/inventory/:itemId', async (req: Request, res: Response) => {
  try {
    await characterService.removeItemFromCharacter(req.params.id, req.params.itemId)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Equipar/Desequipar item
charactersRouter.patch('/:id/inventory/:itemId/equip', async (req: Request, res: Response) => {
  try {
    const { equipped } = req.body
    const item = await characterService.equipItem(
      req.params.id,
      req.params.itemId,
      equipped !== undefined ? equipped : true
    )
    res.json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter habilidades do personagem
charactersRouter.get('/:id/abilities', async (req: Request, res: Response) => {
  try {
    const abilities = await characterService.getCharacterAbilities(req.params.id)
    res.json(abilities)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Adicionar habilidade ao personagem
charactersRouter.post('/:id/abilities', async (req: Request, res: Response) => {
  try {
    const { abilityId } = req.body
    if (!abilityId) {
      return res.status(400).json({ error: 'abilityId é obrigatório' })
    }
    const ability = await characterService.addAbilityToCharacter(req.params.id, abilityId)
    res.status(201).json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Remover habilidade do personagem
charactersRouter.delete('/:id/abilities/:abilityId', async (req: Request, res: Response) => {
  try {
    await characterService.removeAbilityFromCharacter(req.params.id, req.params.abilityId)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Rotas genéricas devem vir DEPOIS das rotas aninhadas específicas
// Obter personagem por ID
charactersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const character = await characterService.getCharacterById(req.params.id)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar personagem
charactersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const character = await characterService.updateCharacter(req.params.id, req.body)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Deletar personagem
charactersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await characterService.deleteCharacter(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

