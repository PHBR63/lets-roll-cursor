import { z } from 'zod'

/**
 * Schema para filtros de personagens
 */
export const CharacterFilterSchema = z.object({
  campaignId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

/**
 * Schema para criação de personagem
 * campaignId agora é opcional - permite criar personagens para testes ou uso futuro
 */
export const CreateCharacterSchema = z.object({
  campaignId: z.string().uuid().nullish(), // Aceita string UUID, null, undefined ou não presente
  name: z.string().min(1).max(100),
  class: z.enum(['COMBATENTE', 'ESPECIALISTA', 'OCULTISTA']),
  path: z.string().max(100).optional().nullable(),
  attributes: z.object({
    agi: z.number().int().min(-5).max(20),
    for: z.number().int().min(-5).max(20),
    int: z.number().int().min(-5).max(20),
    pre: z.number().int().min(-5).max(20),
    vig: z.number().int().min(-5).max(20),
  }),
  stats: z.object({
    pv: z.object({
      current: z.number().int().min(0),
      max: z.number().int().min(1),
    }),
    san: z.object({
      current: z.number().int().min(0),
      max: z.number().int().min(1),
    }),
    pe: z.object({
      current: z.number().int().min(0),
      max: z.number().int().min(1),
    }),
    nex: z.number().int().min(0).max(99),
  }),
  skills: z.record(z.any()).optional(),
  conditions: z.array(z.string()).optional(),
  affinity: z.enum(['SANGUE', 'MORTE', 'ENERGIA', 'CONHECIMENTO', 'MEDO']).optional().nullable(),
})

/**
 * Schema para atualização de personagem
 */
export const UpdateCharacterSchema = CreateCharacterSchema.partial()

