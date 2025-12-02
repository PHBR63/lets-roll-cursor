import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

/**
 * Rotas para CRUD de itens
 */
export const itemsRouter = Router()

itemsRouter.use(authenticateToken)

itemsRouter.get('/', async (req: Request, res: Response) => {
  res.json({ message: 'Items endpoint - implementar' })
})

itemsRouter.post('/', async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Create item - implementar' })
})

itemsRouter.get('/:id', async (req: Request, res: Response) => {
  res.json({ message: 'Get item - implementar' })
})

itemsRouter.put('/:id', async (req: Request, res: Response) => {
  res.json({ message: 'Update item - implementar' })
})

itemsRouter.delete('/:id', async (req: Request, res: Response) => {
  res.status(204).send()
})

