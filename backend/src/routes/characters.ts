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

