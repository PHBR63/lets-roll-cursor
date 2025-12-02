import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

/**
 * Rotas para gerenciamento de sessões de jogo
 */
export const sessionsRouter = Router()

sessionsRouter.use(authenticateToken)

sessionsRouter.get('/', async (req: Request, res: Response) => {
  res.json({ message: 'Sessions endpoint - implementar' })
})

sessionsRouter.post('/', async (req: Request, res: Response) => {
  res.status(201).json({ message: 'Create session - implementar' })
})

sessionsRouter.get('/:id', async (req: Request, res: Response) => {
  res.json({ message: 'Get session - implementar' })
})

sessionsRouter.put('/:id', async (req: Request, res: Response) => {
  res.json({ message: 'Update session - implementar' })
})

