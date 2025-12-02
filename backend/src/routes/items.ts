import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { itemService } from '../services/itemService'

/**
 * Rotas para CRUD de itens
 */
export const itemsRouter = Router()

itemsRouter.use(authenticateToken)

// Listar itens
itemsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const items = await itemService.getItems(req.query)
    res.json(items)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar item
itemsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const item = await itemService.createItem(userId, req.body)
    res.status(201).json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter item por ID
itemsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await itemService.getItemById(req.params.id)
    res.json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar item
itemsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.body)
    res.json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Deletar item
itemsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await itemService.deleteItem(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter itens de uma campanha
itemsRouter.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const items = await itemService.getCampaignItems(req.params.campaignId)
    res.json(items)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Distribuir item para personagem
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
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

