import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validation'
import { AbilityFilterSchema, CreateAbilitySchema, UpdateAbilitySchema } from '../middleware/schemas/abilitySchemas'
import { abilityService } from '../services/abilityService'
import { AppError } from '../types/common'

/**
 * @swagger
 * tags:
 *   - name: Abilities
 *     description: Operações relacionadas a habilidades de personagens
 */

/**
 * Rotas para CRUD de habilidades
 */
export const abilitiesRouter = Router()

abilitiesRouter.use(authenticateToken)

/**
 * @swagger
 * /api/abilities:
 *   get:
 *     summary: Lista habilidades com filtros opcionais
 *     tags: [Abilities]
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
 *         description: Lista de habilidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 abilities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ability'
 *                 total:
 *                   type: integer
 */
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

/**
 * @swagger
 * /api/abilities:
 *   post:
 *     summary: Cria uma nova habilidade
 *     tags: [Abilities]
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
 *     responses:
 *       201:
 *         description: Habilidade criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ability'
 */
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

/**
 * @swagger
 * /api/abilities/{id}:
 *   get:
 *     summary: Obtém uma habilidade por ID
 *     tags: [Abilities]
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
 *         description: Habilidade encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ability'
 */
abilitiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const ability = await abilityService.getAbilityById(req.params.id)
    res.json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/abilities/{id}:
 *   put:
 *     summary: Atualiza uma habilidade
 *     tags: [Abilities]
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
 *     responses:
 *       200:
 *         description: Habilidade atualizada
 */
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

/**
 * @swagger
 * /api/abilities/{id}:
 *   delete:
 *     summary: Deleta uma habilidade
 *     tags: [Abilities]
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
 *         description: Habilidade deletada
 */
abilitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await abilityService.deleteAbility(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})
