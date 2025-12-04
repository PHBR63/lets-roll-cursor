import { z } from 'zod'

/**
 * Schema para criação de item
 */
export const CreateItemSchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(100),
  type: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  attributes: z.record(z.any()).optional(),
  rarity: z.string().max(50).optional(),
  isGlobal: z.boolean().default(false),
})

/**
 * Schema para atualização de item
 */
export const UpdateItemSchema = CreateItemSchema.partial()

/**
 * Schema para filtros de item
 */
export const ItemFilterSchema = z.object({
  campaignId: z.string().uuid().optional(),
  isGlobal: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

