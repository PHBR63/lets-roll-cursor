import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { momentService } from '../services/momentService'
import { AppError } from '../types/common'
import { validate } from '../middleware/validation'
import { CreateMomentSchema, UpdateMomentSchema } from '../middleware/schemas/momentSchemas'

/**
 * @swagger
 * tags:
 *   - name: Moments
 *     description: Operações relacionadas a momentos da campanha (stories)
 */

/**
 * Rotas para CRUD de momentos da campanha (stories)
 */
export const momentsRouter = Router()

momentsRouter.use(authenticateToken)

/**
 * @swagger
 * /api/moments/campaign/{campaignId}:
 *   get:
 *     summary: Lista momentos de uma campanha
 *     tags: [Moments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de momentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Moment'
 */
// Obter momentos de uma campanha
momentsRouter.get('/campaign/:campaignId', async (req: Request, res: Response) => {
  try {
    const moments = await momentService.getCampaignMoments(req.params.campaignId)
    res.json(moments)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Obter momentos de uma sessão (rota específica antes da genérica)
momentsRouter.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const moments = await momentService.getSessionMoments(req.params.sessionId)
    res.json(moments)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Obter momento por ID (rota genérica depois das específicas)
momentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const moment = await momentService.getMomentById(req.params.id)
    if (!moment) {
      return res.status(404).json({ error: 'Momento não encontrado' })
    }
    res.json(moment)
  } catch (error: unknown) {
    const err = error as AppError
    if (err.message?.includes('não encontrado')) {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

/**
 * @swagger
 * /api/moments:
 *   post:
 *     summary: Cria um novo momento
 *     tags: [Moments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignId
 *               - title
 *             properties:
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *               sessionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               diceRollId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Momento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Moment'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Usuário não é participante da campanha
 */
// Criar novo momento
momentsRouter.post(
  '/',
  validate({ body: CreateMomentSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const moment = await momentService.createMoment(userId, {
        campaignId: req.body.campaignId || req.body.campaign_id,
        sessionId: req.body.sessionId || req.body.session_id || null,
        title: req.body.title,
        description: req.body.description || null,
        imageUrl: req.body.imageUrl || req.body.image_url || null,
        diceRollId: req.body.diceRollId || req.body.dice_roll_id || null,
      })
      res.status(201).json(moment)
    } catch (error: unknown) {
      const err = error as AppError
      if (err.message?.includes('obrigatório') || err.message?.includes('UUID')) {
        return res.status(400).json({ error: err.message })
      }
      if (err.message?.includes('participante')) {
        return res.status(403).json({ error: err.message })
      }
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Atualizar momento
momentsRouter.put(
  '/:id',
  validate({ body: UpdateMomentSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const moment = await momentService.updateMoment(req.params.id, userId, {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl || req.body.image_url,
        sessionId: req.body.sessionId || req.body.session_id,
        diceRollId: req.body.diceRollId || req.body.dice_roll_id,
      })
      res.json(moment)
    } catch (error: unknown) {
      const err = error as AppError
      if (err.message?.includes('permissão')) {
        return res.status(403).json({ error: err.message })
      }
      if (err.message?.includes('não encontrado')) {
        return res.status(404).json({ error: err.message })
      }
      if (err.message?.includes('UUID') || err.message?.includes('obrigatório')) {
        return res.status(400).json({ error: err.message })
      }
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Deletar momento
momentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    await momentService.deleteMoment(req.params.id, userId)
    res.status(204).send()
  } catch (error: unknown) {
    const err = error as AppError
    if (err.message?.includes('permissão')) {
      return res.status(403).json({ error: err.message })
    }
    if (err.message?.includes('não encontrado')) {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

