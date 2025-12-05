/**
 * Serviço para gerenciamento de inventário de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { ordemParanormalService } from '../ordemParanormalService'
import { characterConditionsService } from './characterConditionsService'
import { rankService } from '../rankService'
import { deleteCache, getCharacterCacheKey } from '../cache'

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
            rarity,
            weight
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
          
          // Verificar carga após adicionar item
          await this.checkAndApplyOverload(characterId)
          
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
        
        // Verificar carga após atualizar quantidade
        await this.checkAndApplyOverload(characterId)
        
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
      
      // Verificar carga após adicionar item
      await this.checkAndApplyOverload(characterId)
      
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

      // Verificar carga após remover item
      await this.checkAndApplyOverload(characterId)
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
      // Se está tentando equipar, validar permissão de patente
      if (equipped) {
        const validation = await rankService.validateEquipPermission(characterId, itemId)
        if (!validation.canEquip) {
          throw new Error(validation.reason || 'Não é possível equipar este item')
        }
      }

      const { data, error } = await supabase
        .from('character_items')
        .update({ equipped })
        .eq('character_id', characterId)
        .eq('item_id', itemId)
        .select()
        .single()

      if (error) throw error

      // Verificar carga após equipar/desequipar
      await this.checkAndApplyOverload(characterId)

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error equipping item')
      throw new Error('Erro ao equipar item: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Calcula carga total do inventário do personagem
   * @param characterId - ID do personagem
   * @returns Carga total (soma dos pesos de todos os itens)
   */
  async calculateLoad(characterId: string): Promise<number> {
    try {
      const inventory = await this.getCharacterInventory(characterId)
      let totalLoad = 0

      for (const inventoryItem of inventory) {
        const item = inventoryItem.item as { weight?: number } | null
        const quantity = inventoryItem.quantity || 1
        const weight = (item?.weight || 0) * quantity
        totalLoad += weight
      }

      return totalLoad
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error calculating load')
      throw new Error('Erro ao calcular carga: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém capacidade máxima de carga do personagem
   * @param characterId - ID do personagem
   * @returns Capacidade máxima (5 * FOR, mínimo 2)
   */
  async getMaxLoad(characterId: string): Promise<number> {
    try {
      const { data: character, error } = await supabase
        .from('characters')
        .select('attributes')
        .eq('id', characterId)
        .single()

      if (error) throw error

      const attributes = (character.attributes as { for?: number }) || {}
      const forAttr = attributes.for || 0

      return ordemParanormalService.calculateMaxLoad(forAttr)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error getting max load')
      throw new Error('Erro ao obter capacidade máxima: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Verifica se personagem está sobrecarregado e aplica condição automaticamente
   * @param characterId - ID do personagem
   * @returns Se está sobrecarregado
   */
  async checkAndApplyOverload(characterId: string): Promise<boolean> {
    try {
      const currentLoad = await this.calculateLoad(characterId)
      const maxLoad = await this.getMaxLoad(characterId)
      const isOverloaded = ordemParanormalService.isOverloaded(currentLoad, maxLoad)

      // Buscar personagem para verificar condições atuais
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('conditions')
        .eq('id', characterId)
        .single()

      if (fetchError) throw fetchError

      const currentConditions = (character.conditions as string[]) || []
      const hasOverloaded = currentConditions.includes('SOBRECARREGADO')

      // Aplicar ou remover condição Sobrecarregado
      if (isOverloaded && !hasOverloaded) {
        await characterConditionsService.applyCondition(characterId, 'SOBRECARREGADO' as any)
        logger.info({ characterId, currentLoad, maxLoad }, 'Condição Sobrecarregado aplicada')
      } else if (!isOverloaded && hasOverloaded) {
        await characterConditionsService.removeCondition(characterId, 'SOBRECARREGADO' as any)
        logger.info({ characterId, currentLoad, maxLoad }, 'Condição Sobrecarregado removida')
      }

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId }))

      return isOverloaded
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error checking overload')
      throw new Error('Erro ao verificar sobrecarga: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

