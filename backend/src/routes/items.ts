import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { itemService } from '../services/itemService'
import { validate } from '../middleware/validation'
import { ItemFilterSchema, CreateItemSchema, UpdateItemSchema } from '../middleware/schemas/itemSchemas'
import { AppError } from '../types/common'

/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Operações relacionadas a itens de RPG
 */

/**
 * Rotas para CRUD de itens
 */
export const itemsRouter = Router()

itemsRouter.use(authenticateToken)

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Lista itens com filtros opcionais
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID da campanha
 *       - in: query
 *         name: isGlobal
 *         schema:
 *           type: boolean
 *         description: Filtrar itens globais
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset para paginação
 *     responses:
 *       200:
 *         description: Lista de itens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 total:
 *                   type: integer
 */
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

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Cria um novo item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               weight:
 *                 type: number
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [I, II, III, IV]
 *               modificationLevel:
 *                 type: number
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *               isGlobal:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Item criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
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

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Obtém um item por ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item não encontrado
 */
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

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Atualiza um item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               weight:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 */
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

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Deleta um item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Item deletado
 *       404:
 *         description: Item não encontrado
 */
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

