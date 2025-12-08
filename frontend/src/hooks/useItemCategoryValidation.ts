/**
 * Hook para validar categoria de itens por patente
 */
import { useMemo } from 'react'
import { Rank, ItemCategory, RANK_CATEGORY_PERMISSIONS } from '@/types/ordemParanormal'

/**
 * Valida se o personagem pode equipar item da categoria baseado na patente
 * @param rank - Patente do personagem
 * @param category - Categoria do item (0-4)
 * @param currentCount - Quantidade atual de itens dessa categoria equipados
 * @returns true se pode equipar, false caso contrário
 */
export function validateItemCategory(rank: Rank, category: ItemCategory, currentCount: number = 0): boolean {
  const permissions = RANK_CATEGORY_PERMISSIONS[rank]
  const maxAllowed = permissions[category] || 0
  return currentCount < maxAllowed
}

/**
 * Obtém o limite de itens de uma categoria para uma patente
 * @param rank - Patente do personagem
 * @param category - Categoria do item
 * @returns Limite máximo permitido
 */
export function getCategoryLimit(rank: Rank, category: ItemCategory): number {
  const permissions = RANK_CATEGORY_PERMISSIONS[rank]
  return permissions[category] || 0
}

/**
 * Hook para usar validação de categoria de itens
 * @param rank - Patente do personagem
 * @param equippedItemsByCategory - Contagem de itens equipados por categoria
 * @returns Funções de validação e informações
 */
export function useItemCategoryValidation(
  rank: Rank | undefined,
  equippedItemsByCategory: Record<ItemCategory, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
) {
  const canEquip = useMemo(
    () => (category: ItemCategory) => {
      if (!rank) return false
      const currentCount = equippedItemsByCategory[category] || 0
      return validateItemCategory(rank, category, currentCount)
    },
    [rank, equippedItemsByCategory]
  )

  const getLimit = useMemo(
    () => (category: ItemCategory) => {
      if (!rank) return 0
      return getCategoryLimit(rank, category)
    },
    [rank]
  )

  const getRemaining = useMemo(
    () => (category: ItemCategory) => {
      if (!rank) return 0
      const limit = getCategoryLimit(rank, category)
      const current = equippedItemsByCategory[category] || 0
      return Math.max(0, limit - current)
    },
    [rank, equippedItemsByCategory]
  )

  return {
    canEquip,
    getLimit,
    getRemaining,
  }
}

