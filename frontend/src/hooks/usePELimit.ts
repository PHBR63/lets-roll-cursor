import { useMemo } from 'react'

/**
 * Hook para calcular e validar limite de PE por turno baseado em NEX
 * @param nex - Nível de Exposição (0-99)
 * @returns Limite de PE por turno
 */
export function usePELimit(nex: number | undefined): {
  limit: number
  canSpend: (cost: number, spentThisTurn: number) => boolean
  getRemaining: (spentThisTurn: number) => number
} {
  const limit = useMemo(() => {
    if (nex === undefined || nex < 0) return 1

    // Tabela de limites conforme regras oficiais
    if (nex < 5) {
      return 1 // NEX 0-4: Limite 1 PE
    }

    if (nex < 10) {
      return 1 // NEX 5-9: Limite 1 PE
    }

    if (nex < 20) {
      return 2 // NEX 10-19: Limite 2 PE
    }

    if (nex < 30) {
      return 3 // NEX 20-29: Limite 3 PE
    }

    if (nex < 40) {
      return 4 // NEX 30-39: Limite 4 PE
    }

    if (nex < 50) {
      return 5 // NEX 40-49: Limite 5 PE
    }

    if (nex < 60) {
      return 6 // NEX 50-59: Limite 6 PE
    }

    if (nex < 70) {
      return 7 // NEX 60-69: Limite 7 PE
    }

    if (nex < 80) {
      return 8 // NEX 70-79: Limite 8 PE
    }

    if (nex < 90) {
      return 9 // NEX 80-89: Limite 9 PE
    }

    // NEX 90-99: Progressão linear
    const baseLimit = Math.floor((nex - 5) / 5) + 1
    return Math.min(Math.max(baseLimit, 1), 20) // Clamp entre 1 e 20
  }, [nex])

  /**
   * Verifica se pode gastar determinado custo de PE
   */
  const canSpend = (cost: number, spentThisTurn: number = 0): boolean => {
    return spentThisTurn + cost <= limit
  }

  /**
   * Calcula PE restantes no turno
   */
  const getRemaining = (spentThisTurn: number = 0): number => {
    return Math.max(0, limit - spentThisTurn)
  }

  return {
    limit,
    canSpend,
    getRemaining,
  }
}

