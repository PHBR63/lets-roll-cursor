/**
 * Serviço para gerenciamento de inventário de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { Rank, ItemCategory, RANK_CATEGORY_PERMISSIONS } from '../../types/ordemParanormal'
import { ordemParanormalService } from '../ordemParanormalService'

export const characterInventoryService = {
  /**
   * Obtém inventário do personagem
   * @param characterId - ID do personagem
   * @returns Lista de itens do inventário
   */
  async getCharacterInventory(characterId: string) {
    try {
      const { data, error } = await supabase
        .from('character_items')
        .select(
          `
          *,
          item:items (
            id,
            name,
            type,
            description,
            attributes,
            rarity
          )
        `
        )
        .eq('character_id', characterId)

      if (error) throw error

      return data || []
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching inventory')
      throw new Error('Erro ao buscar inventário: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Valida se o personagem pode equipar item da categoria baseado na patente
   * @param rank - Patente do personagem
   * @param category - Categoria do item (0-4)
   * @param currentCount - Quantidade atual de itens dessa categoria equipados
   * @returns true se pode equipar, false caso contrário
   */
  validateItemCategory(rank: Rank, category: ItemCategory, currentCount: number = 0): boolean {
    const permissions = RANK_CATEGORY_PERMISSIONS[rank]
    const maxAllowed = permissions[category] || 0
    return currentCount < maxAllowed
  },

  /**
   * Adiciona item ao inventário do personagem
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @param quantity - Quantidade (padrão: 1)
   * @param validateCategory - Se deve validar categoria por patente (padrão: true)
   * @returns Item adicionado ao inventário
   */
  async addItemToCharacter(
    characterId: string,
    itemId: string,
    quantity: number = 1,
    validateCategory: boolean = true
  ) {
    try {
      // Buscar personagem para validar patente
      const { data: character, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single()

      if (charError) throw charError

      // Buscar item para obter categoria
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      // Validar categoria por patente se necessário
      if (validateCategory && item.category !== null && item.category !== undefined) {
        const rank = (character.rank as Rank) || 'RECRUTA'
        const category = item.category as ItemCategory

        // Contar itens da mesma categoria já equipados
        const { data: equippedItems } = await supabase
          .from('character_items')
          .select(
            `
            *,
            item:items (category)
          `
          )
          .eq('character_id', characterId)
          .eq('equipped', true)

        const categoryCount =
          equippedItems?.filter((ci: any) => ci.item?.category === category).length || 0

        const canEquip = this.validateItemCategory(rank, category, categoryCount)
        if (!canEquip) {
          const permissions = RANK_CATEGORY_PERMISSIONS[rank]
          const maxAllowed = permissions[category] || 0
          throw new Error(
            `Patente ${rank} não permite equipar mais itens da Categoria ${category}. Limite: ${maxAllowed}`
          )
        }
      }

      // Verificar se item já existe no inventário
      const { data: existing, error: queryError } = await supabase
        .from('character_items')
        .select('*')
        .eq('character_id', characterId)
        .eq('item_id', itemId)
        .single()

      // Verificar se houve erro na query
      if (queryError) {
        // PGRST116 é o código de erro quando .single() não encontra registro (caso normal)
        if (queryError.code === 'PGRST116') {
          // Item não existe no inventário, criar novo registro
          const { data, error: insertError } = await supabase
            .from('character_items')
            .insert({
              character_id: characterId,
              item_id: itemId,
              quantity,
              equipped: false,
            })
            .select()
            .single()

          if (insertError) throw insertError
          return data
        } else {
          // Erro real de banco de dados - propagar erro
          throw queryError
        }
      }

      // Se não houve erro, o item existe no inventário - atualizar quantidade
      if (existing) {
        const { data, error: updateError } = await supabase
          .from('character_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw updateError
        return data
      }

      // Caso inesperado: criar novo registro como fallback
      const { data, error: insertError } = await supabase
        .from('character_items')
        .insert({
          character_id: characterId,
          item_id: itemId,
          quantity,
          equipped: false,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error adding item to character')
      throw new Error('Erro ao adicionar item: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Remove item do inventário do personagem
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   */
  async removeItemFromCharacter(characterId: string, itemId: string) {
    try {
      const { error } = await supabase
        .from('character_items')
        .delete()
        .eq('character_id', characterId)
        .eq('item_id', itemId)

      if (error) throw error
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error removing item from character')
      throw new Error('Erro ao remover item: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Equipa ou desequipa um item
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @param equipped - Se o item está equipado
   * @returns Item atualizado
   */
  async equipItem(characterId: string, itemId: string, equipped: boolean = true) {
    try {
      const { data, error } = await supabase
        .from('character_items')
        .update({ equipped })
        .eq('character_id', characterId)
        .eq('item_id', itemId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error equipping item')
      throw new Error('Erro ao equipar item: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Calcula o peso total do inventário do personagem
   * @param characterId - ID do personagem
   * @returns Peso total em kg
   */
  async calculateTotalWeight(characterId: string): Promise<number> {
    try {
      const { data: inventory, error } = await supabase
        .from('character_items')
        .select(
          `
          quantity,
          item:items (weight)
        `
        )
        .eq('character_id', characterId)

      if (error) throw error

      let totalWeight = 0
      for (const item of inventory || []) {
        const weight = (item.item as any)?.weight || 0
        const quantity = item.quantity || 1
        totalWeight += weight * quantity
      }

      return totalWeight
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error calculating total weight')
      throw new Error('Erro ao calcular peso: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Verifica se o personagem está sobrecarregado e aplica condição se necessário
   * @param characterId - ID do personagem
   * @returns Informações sobre carga e sobrecarga
   */
  async checkOverload(characterId: string): Promise<{
    currentWeight: number
    maxCapacity: number
    isOverloaded: boolean
  }> {
    try {
      // Buscar personagem
      const { data: character, error: charError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single()

      if (charError) throw charError

      const attributes = character.attributes || {}
      const forca = attributes.for || 0

      // Calcular capacidade máxima
      const maxCapacity = ordemParanormalService.calculateMaxCarryCapacity(forca)

      // Calcular peso atual
      const currentWeight = await this.calculateTotalWeight(characterId)

      // Verificar sobrecarga
      const isOverloaded = ordemParanormalService.isOverloaded(currentWeight, maxCapacity)

      // Se sobrecarregado, aplicar condição automaticamente
      if (isOverloaded) {
        const conditions: string[] = character.conditions || []
        if (!conditions.includes('SOBRECARREGADO')) {
          const { characterConditionsService } = await import('./characterConditionsService')
          await characterConditionsService.applyCondition(characterId, 'SOBRECARREGADO')
        }
      } else {
        // Se não está sobrecarregado, remover condição se existir
        const conditions: string[] = character.conditions || []
        if (conditions.includes('SOBRECARREGADO')) {
          const { characterConditionsService } = await import('./characterConditionsService')
          await characterConditionsService.removeCondition(characterId, 'SOBRECARREGADO')
        }
      }

      return {
        currentWeight,
        maxCapacity,
        isOverloaded,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error checking overload')
      throw new Error('Erro ao verificar sobrecarga: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

