import { z } from 'zod'

/**
 * Schema para criação de mensagem de chat
 */
export const CreateChatMessageSchema = z.object({
  sessionId: z.string().uuid().optional().nullable(),
  campaignId: z.string().uuid(),
  characterId: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(2000),
  type: z.enum(['message', 'narration', 'ooc']).default('message'),
  channel: z.string().max(50).default('general'),
})

/**
 * Schema para filtros de mensagens
 */
export const ChatMessageFilterSchema = z.object({
  sessionId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  channel: z.string().max(50).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

