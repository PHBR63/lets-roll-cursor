/**
 * Hook para calcular e validar limite de PE por turno
 */
import { useMemo } from 'react'

/**
 * Calcula o limite de PE por turno baseado no NEX
 * @param nex - Nível de Exposição (0-99)
 * @returns Limite de PE que pode ser gasto por turno
 */
export function calculatePETurnLimit(nex: number): number {
  // Tabela de limite de PE por turno conforme SISTEMA ORDO.md
  if (nex < 5) return 1
  if (nex < 10) return 1
  if (nex < 15) return 2
  if (nex < 20) return 2
  if (nex < 25) return 3
  if (nex < 30) return 3
  if (nex < 35) return 4
  if (nex < 40) return 4
  if (nex < 45) return 5
  if (nex < 50) return 5
  if (nex < 55) return 6
  if (nex < 60) return 6
  if (nex < 65) return 7
  if (nex < 70) return 7
  if (nex < 75) return 8
  if (nex < 80) return 8
  if (nex < 85) return 9
  if (nex < 90) return 9
  if (nex < 95) return 10
  // NEX 95-99: Limite de 20 PE (progressão linear até 99%)
  return Math.min(20, 10 + Math.floor((nex - 95) / 5) * 2)
}

/**
 * Valida se o custo de PE excede o limite por turno
 * @param nex - Nível de Exposição
 * @param peCost - Custo de PE da ação
 * @returns true se o custo é válido, false caso contrário
 */
export function validatePETurnLimit(nex: number, peCost: number): boolean {
  const limit = calculatePETurnLimit(nex)
  return peCost <= limit
}

/**
 * Hook para usar limite de PE por turno
 * @param nex - Nível de Exposição do personagem
 * @returns Limite de PE e função de validação
 */
export function usePETurnLimit(nex: number | undefined) {
  const limit = useMemo(() => {
    if (nex === undefined) return 1
    return calculatePETurnLimit(nex)
  }, [nex])

  const validate = useMemo(
    () => (peCost: number) => {
      if (nex === undefined) return false
      return validatePETurnLimit(nex, peCost)
    },
    [nex]
  )

  return {
    limit,
    validate,
    canSpend: (peCost: number) => validate(peCost),
  }
}

