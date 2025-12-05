import { z } from 'zod'

/**
 * Schema de validação para criação de momento
 */
export const CreateMomentSchema = z.object({
  campaignId: z.string().uuid('ID da campanha deve ser um UUID válido'),
  sessionId: z.string().uuid('ID da sessão deve ser um UUID válido').nullable().optional(),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().max(5000, 'Descrição muito longa').optional().nullable(),
  imageUrl: z.string().url('URL da imagem inválida').optional().nullable(),
  diceRollId: z.string().uuid('ID da rolagem deve ser um UUID válido').nullable().optional(),
})

/**
 * Schema de validação para atualização de momento
 */
export const UpdateMomentSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
  description: z.string().max(5000, 'Descrição muito longa').optional().nullable(),
  imageUrl: z.string().url('URL da imagem inválida').optional().nullable(),
  sessionId: z.string().uuid('ID da sessão deve ser um UUID válido').nullable().optional(),
  diceRollId: z.string().uuid('ID da rolagem deve ser um UUID válido').nullable().optional(),
})

