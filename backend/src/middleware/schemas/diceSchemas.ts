import { z } from 'zod'

/**
 * Schema para rolagem de dados
 */
export const DiceRollSchema = z.object({
  formula: z.string().min(1).max(50).regex(/^(\d+)d(\d+)([+-]\d+)?$/i, {
    message: 'Fórmula inválida. Use formato: XdY, XdY+Z ou XdY-Z',
  }),
  sessionId: z.string().uuid().optional().nullable(),
  campaignId: z.string().uuid(),
  characterId: z.string().uuid().optional().nullable(),
  isPrivate: z.boolean().default(false),
})

/**
 * Schema para teste de perícia
 */
export const SkillTestSchema = z.object({
  skillName: z.string().min(1),
  characterId: z.string().uuid(),
  sessionId: z.string().uuid().optional().nullable(),
  campaignId: z.string().uuid(),
  advantage: z.boolean().default(false),
  disadvantage: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
})

/**
 * Schema para rolagem de ataque
 */
export const AttackRollSchema = z.object({
  characterId: z.string().uuid(),
  targetDefense: z.number().int().min(0).max(50),
  damageFormula: z.string().min(1).max(50).regex(/^(\d+)d(\d+)([+-]\d+)?$/i),
  isRanged: z.boolean().default(false),
  sessionId: z.string().uuid().optional().nullable(),
  campaignId: z.string().uuid(),
  isPrivate: z.boolean().default(false),
})

/**
 * Schema para rolagem de atributo (Ordem Paranormal)
 */
export const RollAttributeSchema = z.object({
  attributeName: z.string().min(1),
  attributeValue: z.number().int().min(-10).max(20),
  skillBonus: z.number().int().default(0),
  advantageDice: z.number().int().default(0),
  userId: z.string().uuid().optional(), // Injetado pelo auth middleware
  campaignId: z.string().uuid(),
  sessionId: z.string().uuid().optional().nullable(),
  characterId: z.string().uuid().optional().nullable(),
  isPrivate: z.boolean().default(false),
})

/**
 * Schema para rolagem de perícia (Ordem Paranormal)
 */
export const RollSkillSchema = z.object({
  skillName: z.string().min(1),
  attributeValue: z.number().int().min(-10).max(20),
  training: z.enum(['UNTRAINED', 'TRAINED', 'COMPETENT', 'EXPERT']),
  flatBonus: z.number().int().default(0),
  diceMod: z.number().int().default(0),
  campaignId: z.string().uuid(),
  sessionId: z.string().uuid().optional().nullable(),
  characterId: z.string().uuid().optional().nullable(),
  isPrivate: z.boolean().default(false),
})
