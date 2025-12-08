import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { creatureService } from '../services/creatureService'
import { validate } from '../middleware/validation'
import { CreatureFilterSchema, CreateCreatureSchema, UpdateCreatureSchema } from '../middleware/schemas/creatureSchemas'
import { AppError } from '../types/common'

/**
 * @swagger
 * tags:
 *   - name: Creatures
 *     description: Operações relacionadas a criaturas de RPG
 */

/**
 * Rotas para CRUD de criaturas
 */
export const creaturesRouter = Router()

creaturesRouter.use(authenticateToken)

/**
 * @swagger
 * /api/creatures:
 *   get:
 *     summary: Lista criaturas com filtros opcionais
 *     tags: [Creatures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isGlobal
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de criaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 creatures:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Creature'
 */
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

/**
 * @swagger
 * /api/creatures:
 *   post:
 *     summary: Cria uma nova criatura
 *     tags: [Creatures]
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
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *               isGlobal:
 *                 type: boolean
 *               stats:
 *                 type: object
 *               attributes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Criatura criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creature'
 */
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

/**
 * @swagger
 * /api/creatures/{id}:
 *   get:
 *     summary: Obtém uma criatura por ID
 *     tags: [Creatures]
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
 *         description: Criatura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creature'
 */
creaturesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const creature = await creatureService.getCreatureById(req.params.id)
    res.json(creature)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/creatures/{id}:
 *   put:
 *     summary: Atualiza uma criatura
 *     tags: [Creatures]
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
 *               stats:
 *                 type: object
 *     responses:
 *       200:
 *         description: Criatura atualizada
 */
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

/**
 * @swagger
 * /api/creatures/{id}:
 *   delete:
 *     summary: Deleta uma criatura
 *     tags: [Creatures]
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
 *         description: Criatura deletada
 */
creaturesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await creatureService.deleteCreature(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

