import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { chatService } from '../services/chatService'
import { validate } from '../middleware/validation'
import { CreateChatMessageSchema, ChatMessageFilterSchema } from '../middleware/schemas/chatSchemas'
import { AppError } from '../types/common'

/**
 * Rotas para chat em tempo real
 */
export const chatRouter = Router()

chatRouter.use(authenticateToken)

// Buscar mensagens
chatRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { campaignId, sessionId, limit } = req.query

    if (!campaignId) {
      return res.status(400).json({ error: 'campaignId é obrigatório' })
    }

    const messages = await chatService.getMessages(
      campaignId as string,
      sessionId as string,
      limit ? parseInt(limit as string, 10) : 100
    )

    res.json(messages)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Enviar mensagem
chatRouter.post(
  '/',
  validate({ body: CreateChatMessageSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const { campaignId, sessionId, characterId, content, type, channel } = req.body

      const message = await chatService.createMessage({
        campaignId,
        sessionId: sessionId || null,
        userId,
        characterId: characterId || null,
        content,
        type: type || 'message',
        channel: channel || 'general',
      })

      res.status(201).json(message)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

