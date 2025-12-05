/**
 * Tabela de permissões de equipamento por patente
 * Conforme regras oficiais do sistema Ordem Paranormal
 */

export type Rank = 'RECRUTA' | 'OPERADOR' | 'AGENTE_ESPECIAL' | 'OFICIAL_OPERACOES' | 'ELITE'

export interface RankPermissions {
  I: number // Categoria I
  II: number // Categoria II
  III: number // Categoria III
  IV: number // Categoria IV
}

/**
 * Tabela de permissões por patente
 * Cada patente pode ter um número limitado de itens por categoria
 */
export const RANK_PERMISSIONS: Record<Rank, RankPermissions> = {
  RECRUTA: {
    I: 2, // 2 itens de Categoria I
    II: 0,
    III: 0,
    IV: 0,
  },
  OPERADOR: {
    I: 3, // 3 itens de Categoria I
    II: 1, // 1 item de Categoria II
    III: 0,
    IV: 0,
  },
  AGENTE_ESPECIAL: {
    I: 3,
    II: 2,
    III: 1,
    IV: 0,
  },
  OFICIAL_OPERACOES: {
    I: 3,
    II: 3,
    III: 2,
    IV: 1,
  },
  ELITE: {
    I: 3,
    II: 3,
    III: 3,
    IV: 2,
  },
}

/**
 * Obtém permissões de uma patente
 */
export function getRankPermissions(rank: Rank): RankPermissions {
  return RANK_PERMISSIONS[rank] || RANK_PERMISSIONS.RECRUTA
}

/**
 * Verifica se uma patente pode equipar um item de determinada categoria
 * @param rank - Patente do personagem
 * @param category - Categoria do item (I, II, III, IV)
 * @param currentEquipped - Quantidade atual de itens equipados dessa categoria
 * @returns Se pode equipar
 */
export function canEquipCategory(
  rank: Rank,
  category: 'I' | 'II' | 'III' | 'IV',
  currentEquipped: number
): boolean {
  const permissions = getRankPermissions(rank)
  const maxAllowed = permissions[category] || 0
  return currentEquipped < maxAllowed
}

