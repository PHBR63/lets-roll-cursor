import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de itens
 */
export const itemService = {
  /**
   * Obtém itens baseado em filtros
   * @param filters - Filtros de busca (campaignId, isGlobal)
   * @returns Lista de itens
   */
  async getItems(filters: any) {
    try {
      let query = supabase
        .from('items')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          created_by_user:users!items_created_by_fkey (
            id,
            username
          )
        `
        )

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId)
      }

      if (filters.isGlobal !== undefined) {
        query = query.eq('is_global', filters.isGlobal)
      }

      // Se não especificar, buscar itens globais e da campanha
      if (!filters.campaignId && filters.isGlobal === undefined) {
        query = query.or('is_global.eq.true,campaign_id.is.null')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching items:', error)
      throw new Error('Erro ao buscar itens: ' + error.message)
    }
  },

  /**
   * Cria um novo item
   * @param userId - ID do usuário criador
   * @param data - Dados do item
   * @returns Item criado
   */
  async createItem(userId: string, data: any) {
    try {
      const { data: item, error } = await supabase
        .from('items')
        .insert({
          campaign_id: data.campaignId || null,
          created_by: userId,
          name: data.name,
          type: data.type || null,
          description: data.description || null,
          attributes: data.attributes || {},
          rarity: data.rarity || null,
          is_global: data.isGlobal || false,
        })
        .select()
        .single()

      if (error) throw error

      return item
    } catch (error: any) {
      console.error('Error creating item:', error)
      throw new Error('Erro ao criar item: ' + error.message)
    }
  },

  /**
   * Obtém item por ID
   * @param id - ID do item
   * @returns Item completo
   */
  async getItemById(id: string) {
    try {
      const { data: item, error } = await supabase
        .from('items')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          created_by_user:users!items_created_by_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return item
    } catch (error: any) {
      console.error('Error fetching item:', error)
      throw new Error('Erro ao buscar item: ' + error.message)
    }
  },

  /**
   * Atualiza um item
   * @param id - ID do item
   * @param data - Dados para atualizar
   * @returns Item atualizado
   */
  async updateItem(id: string, data: any) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.type !== undefined) updateData.type = data.type
      if (data.description !== undefined) updateData.description = data.description
      if (data.attributes !== undefined) updateData.attributes = data.attributes
      if (data.rarity !== undefined) updateData.rarity = data.rarity
      if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal

      const { data: item, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return item
    } catch (error: any) {
      console.error('Error updating item:', error)
      throw new Error('Erro ao atualizar item: ' + error.message)
    }
  },

  /**
   * Deleta um item
   * @param id - ID do item
   */
  async deleteItem(id: string) {
    try {
      const { error } = await supabase.from('items').delete().eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting item:', error)
      throw new Error('Erro ao deletar item: ' + error.message)
    }
  },

  /**
   * Obtém itens de uma campanha específica
   * @param campaignId - ID da campanha
   * @returns Lista de itens da campanha
   */
  async getCampaignItems(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching campaign items:', error)
      throw new Error('Erro ao buscar itens da campanha: ' + error.message)
    }
  },

  /**
   * Distribui item para um personagem
   * @param campaignId - ID da campanha
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @param quantity - Quantidade (padrão: 1)
   * @returns Item adicionado ao inventário
   */
  async distributeItem(
    campaignId: string,
    characterId: string,
    itemId: string,
    quantity: number = 1
  ) {
    try {
      // Verificar se item pertence à campanha ou é global
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      if (item.campaign_id && item.campaign_id !== campaignId) {
        throw new Error('Item não pertence a esta campanha')
      }

      // Adicionar ao inventário do personagem
      const { characterService } = await import('./characterService')
      return await characterService.addItemToCharacter(characterId, itemId, quantity)
    } catch (error: any) {
      console.error('Error distributing item:', error)
      throw new Error('Erro ao distribuir item: ' + error.message)
    }
  },
}

