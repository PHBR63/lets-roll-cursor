import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { itemService } from '../services/itemService'
import { validate } from '../middleware/validation'
import { ItemFilterSchema, CreateItemSchema, UpdateItemSchema } from '../middleware/schemas/itemSchemas'
import { AppError } from '../types/common'

/**
 * Rotas para CRUD de itens
 */
export const itemsRouter = Router()

itemsRouter.use(authenticateToken)

// Listar itens
itemsRouter.get(
  '/',
  validate({ query: ItemFilterSchema }),
  async (req: Request, res: Response) => {
    try {
      const result = await itemService.getItems(req.query as { campaignId?: string; isGlobal?: boolean; limit?: number; offset?: number })
      res.json(result)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Criar item
itemsRouter.post(
  '/',
  validate({ body: CreateItemSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const item = await itemService.createItem(userId, req.body)
      res.status(201).json(item)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Obter itens de uma campanha (rota específica antes da genérica)
itemsRouter.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const items = await itemService.getCampaignItems(req.params.campaignId)
    res.json(items)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Distribuir item para personagem (rota específica antes da genérica)
itemsRouter.post('/distribute', async (req: Request, res: Response) => {
  try {
    const { campaignId, characterId, itemId, quantity } = req.body
    if (!campaignId || !characterId || !itemId) {
      return res.status(400).json({ error: 'campaignId, characterId e itemId são obrigatórios' })
    }
    const result = await itemService.distributeItem(
      campaignId,
      characterId,
      itemId,
      quantity || 1
    )
    res.status(201).json(result)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Obter item por ID (rota genérica depois das específicas)
itemsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await itemService.getItemById(req.params.id)
    res.json(item)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Atualizar item
itemsRouter.put(
  '/:id',
  validate({ body: UpdateItemSchema }),
  async (req: Request, res: Response) => {
    try {
      const item = await itemService.updateItem(req.params.id, req.body)
      res.json(item)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Deletar item
itemsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await itemService.deleteItem(req.params.id)
    res.status(204).send()
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

