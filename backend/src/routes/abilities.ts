import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

/**
 * Rotas para CRUD de habilidades
 */
export const abilitiesRouter = Router()

abilitiesRouter.use(authenticateToken)

abilitiesRouter.get('/', async (req: Request, res: Response) => {
  res.json({ message: 'Abilities endpoint - implementar' })
})

abilitiesRouter.post('/', async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Create ability - implementar' })
})

abilitiesRouter.get('/:id', async (req: Request, res: Response) => {
  res.json({ message: 'Get ability - implementar' })
})

abilitiesRouter.put('/:id', async (req: Request, res: Response) => {
  res.json({ message: 'Update ability - implementar' })
})

abilitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  res.status(204).send()
})

