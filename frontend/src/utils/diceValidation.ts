import * as z from 'zod'

/**
 * Schema de validação para fórmulas de dados
 * Suporta: 1d20, 2d6+3, 1d20-2, etc.
 */
export const diceFormulaSchema = z
  .string()
  .min(1, 'Fórmula não pode estar vazia')
  .regex(
    /^(\d+d\d+([+-]\d+)?|\d+)(\s*[+-]\s*(\d+d\d+([+-]\d+)?|\d+))*$/i,
    'Fórmula inválida. Use formato: 1d20, 2d6+3, 1d20-2, etc.'
  )

/**
 * Valida uma fórmula de dados
 */
export function validateDiceFormula(formula: string): { valid: boolean; error?: string } {
  try {
    diceFormulaSchema.parse(formula.trim())
    return { valid: true }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message || 'Fórmula inválida' }
    }
    return { valid: false, error: 'Erro ao validar fórmula' }
  }
}

/**
 * Exemplos de fórmulas válidas:
 * - 1d20
 * - 2d6+3
 * - 1d20-2
 * - 3d8+1d4
 * - 10
 */

