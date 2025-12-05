import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { originService } from '../services/originService'
import { AppError } from '../types/common'

/**
 * @swagger
 * tags:
 *   - name: Origins
 *     description: Operações relacionadas a origens de personagens
 */

/**
 * Rotas para gerenciamento de Origens
 */
export const originsRouter = Router()

originsRouter.use(authenticateToken)

/**
 * @swagger
 * /api/origins:
 *   get:
 *     summary: Lista todas as origens disponíveis
 *     tags: [Origins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de origens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Origin'
 */
// Listar todas as origens disponíveis
originsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const origins = originService.getAllOrigins()
    res.json(origins)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Obter origem específica
originsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const origin = originService.getOriginConfig(req.params.id as any)
    res.json(origin)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(404).json({ error: err.message || 'Origem não encontrada' })
  }
})

// Obter poder de uma origem
originsRouter.get('/:id/power', async (req: Request, res: Response) => {
  try {
    const power = originService.getOriginPower(req.params.id as any)
    res.json(power)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(404).json({ error: err.message || 'Origem não encontrada' })
  }
})

