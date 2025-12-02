import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

/**
 * Rotas para gerenciamento de inventário
 */
export const inventoryRouter = Router()

inventoryRouter.use(authenticateToken)

inventoryRouter.get('/character/:characterId', async (req: Request, res: Response) => {
  res.json({ message: 'Get character inventory - implementar' })
})

inventoryRouter.post('/add', async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Add item to inventory - implementar' })
})

inventoryRouter.delete('/remove/:itemId', async (req: Request, res: Response) => {
  res.status(204).send()
})

