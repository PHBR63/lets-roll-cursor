/**
 * Serviço para validação de patentes e categorias de itens
 */
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'
import { Rank, canEquipCategory, getRankPermissions } from '../data/rankPermissions'

export const rankService = {
  /**
   * Obtém patente atual da campanha
   * @param campaignId - ID da campanha
   * @returns Patente atual ou RECRUTA como padrão
   */
  async getCampaignRank(campaignId: string): Promise<Rank> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('current_rank')
        .eq('id', campaignId)
        .single()

      if (error) throw error

      return (campaign?.current_rank as Rank) || 'RECRUTA'
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, campaignId }, 'Error getting campaign rank')
      // Retornar RECRUTA como padrão em caso de erro
      return 'RECRUTA'
    }
  },

  /**
   * Atualiza patente atual da campanha
   * @param campaignId - ID da campanha
   * @param rank - Nova patente
   */
  async updateCampaignRank(campaignId: string, rank: Rank): Promise<void> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ current_rank: rank })
        .eq('id', campaignId)

      if (error) throw error
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, campaignId, rank }, 'Error updating campaign rank')
      throw new Error('Erro ao atualizar patente: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Calcula categoria efetiva do item (incluindo modificações)
   * @param baseCategory - Categoria base do item
   * @param modificationLevel - Nível de modificação (aumenta categoria)
   * @returns Categoria efetiva
   */
  calculateEffectiveCategory(
    baseCategory: 'I' | 'II' | 'III' | 'IV' | null | undefined,
    modificationLevel: number = 0
  ): 'I' | 'II' | 'III' | 'IV' {
    if (!baseCategory) return 'I' // Padrão: Categoria I

    const categoryMap: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4 }
    const baseLevel = categoryMap[baseCategory] || 1
    const effectiveLevel = Math.min(Math.max(baseLevel + modificationLevel, 1), 4)

    const reverseMap: Record<number, 'I' | 'II' | 'III' | 'IV'> = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
    }

    return reverseMap[effectiveLevel] || 'I'
  },

  /**
   * Conta itens equipados por categoria do personagem
   * @param characterId - ID do personagem
   * @returns Contagem de itens equipados por categoria
   */
  async countEquippedByCategory(characterId: string): Promise<{
    I: number
    II: number
    III: number
    IV: number
  }> {
    try {
      const { data: inventory, error } = await supabase
        .from('character_items')
        .select(
          `
          equipped,
          item:items (
            category,
            modification_level
          )
        `
        )
        .eq('character_id', characterId)
        .eq('equipped', true)

      if (error) throw error

      const counts = { I: 0, II: 0, III: 0, IV: 0 }

      for (const item of inventory || []) {
        const itemData = item.item as { category?: string; modification_level?: number } | null
        if (!itemData) continue

        const effectiveCategory = this.calculateEffectiveCategory(
          itemData.category as 'I' | 'II' | 'III' | 'IV' | null,
          itemData.modification_level || 0
        )

        counts[effectiveCategory]++
      }

      return counts
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId }, 'Error counting equipped items by category')
      throw new Error('Erro ao contar itens equipados: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Valida se personagem pode equipar item baseado em patente
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @returns Se pode equipar e motivo (se não puder)
   */
  async validateEquipPermission(
    characterId: string,
    itemId: string
  ): Promise<{ canEquip: boolean; reason?: string }> {
    try {
      // Buscar personagem e campanha
      const { data: character, error: charError } = await supabase
        .from('characters')
        .select('campaign_id')
        .eq('id', characterId)
        .single()

      if (charError) throw charError

      if (!character.campaign_id) {
        return { canEquip: false, reason: 'Personagem não está em uma campanha' }
      }

      // Buscar patente da campanha
      const rank = await this.getCampaignRank(character.campaign_id)

      // Buscar item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('category, modification_level')
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      // Calcular categoria efetiva
      const effectiveCategory = this.calculateEffectiveCategory(
        item.category as 'I' | 'II' | 'III' | 'IV' | null,
        (item.modification_level as number) || 0
      )

      // Contar itens equipados por categoria
      const equippedCounts = await this.countEquippedByCategory(characterId)

      // Verificar se pode equipar
      const canEquip = canEquipCategory(rank, effectiveCategory, equippedCounts[effectiveCategory])

      if (!canEquip) {
        const permissions = getRankPermissions(rank)
        const maxAllowed = permissions[effectiveCategory]
        const currentEquipped = equippedCounts[effectiveCategory]

        return {
          canEquip: false,
          reason: `Limite de Categoria ${effectiveCategory} excedido. Patente ${rank} permite ${maxAllowed} itens, mas você já tem ${currentEquipped} equipados.`,
        }
      }

      return { canEquip: true }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, itemId }, 'Error validating equip permission')
      throw new Error('Erro ao validar permissão: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

