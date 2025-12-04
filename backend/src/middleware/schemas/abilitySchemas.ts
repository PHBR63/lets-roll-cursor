import { z } from 'zod'

/**
 * Schema para criação de habilidade
 */
export const CreateAbilitySchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: z.string().max(50).optional(),
  cost: z.record(z.any()).optional(),
  attributes: z.record(z.any()).optional(),
  isGlobal: z.boolean().default(false),
})

/**
 * Schema para atualização de habilidade
 */
export const UpdateAbilitySchema = CreateAbilitySchema.partial()

/**
 * Schema para filtros de habilidade
 */
export const AbilityFilterSchema = z.object({
  campaignId: z.string().uuid().optional(),
  isGlobal: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

