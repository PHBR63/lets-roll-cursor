import { z } from 'zod'

/**
 * Schema para criação de sessão
 */
export const CreateSessionSchema = z.object({
  campaignId: z.string().uuid(),
  name: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
})

/**
 * Schema para atualização de sessão
 */
export const UpdateSessionSchema = CreateSessionSchema.partial().extend({
  startedAt: z.string().datetime().optional().nullable(),
  endedAt: z.string().datetime().optional().nullable(),
})

/**
 * Schema para filtros de sessão
 */
export const SessionFilterSchema = z.object({
  campaignId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

