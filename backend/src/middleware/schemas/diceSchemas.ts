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

