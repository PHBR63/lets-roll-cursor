import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validation'
import { ritualService } from '../services/ritualService'
import { AppError } from '../types/common'
import { RitualCircle, RitualElement } from '../types/ordemParanormal'

export const ritualsRouter = Router()

ritualsRouter.use(authenticateToken)

/**
 * Listar todos os rituais
 * Query params: circle, element
 */
ritualsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const filters = {
            circle: req.query.circle as RitualCircle | undefined,
            element: req.query.element as RitualElement | undefined
        }
        const rituals = await ritualService.getRituals(filters)
        res.json(rituals)
    } catch (error: unknown) {
        const err = error as AppError
        res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})

/**
 * Obter ritual por ID
 */
ritualsRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const ritual = await ritualService.getRitualById(req.params.id)
        if (!ritual) {
            return res.status(404).json({ error: 'Ritual não encontrado' })
        }
        res.json(ritual)
    } catch (error: unknown) {
        const err = error as AppError
        res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})
