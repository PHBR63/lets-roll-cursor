/**
 * Serviço para gerenciamento de inventário de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'

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
   * Adiciona item ao inventário do personagem
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @param quantity - Quantidade (padrão: 1)
   * @returns Item adicionado ao inventário
   */
  async addItemToCharacter(characterId: string, itemId: string, quantity: number = 1) {
    try {
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
}

