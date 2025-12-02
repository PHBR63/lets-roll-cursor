import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de personagens
 */
export const characterService = {
  /**
   * Obtém personagens baseado em filtros
   * @param filters - Filtros de busca (campaignId, userId)
   * @returns Lista de personagens
   */
  async getCharacters(filters: any) {
    try {
      let query = supabase
        .from('characters')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching characters:', error)
      throw new Error('Erro ao buscar personagens: ' + error.message)
    }
  },

  /**
   * Cria um novo personagem
   * @param userId - ID do usuário criador
   * @param data - Dados do personagem
   * @returns Personagem criado
   */
  async createCharacter(userId: string, data: any) {
    try {
      const { data: character, error } = await supabase
        .from('characters')
        .insert({
          campaign_id: data.campaignId,
          user_id: userId,
          name: data.name,
          avatar_url: data.avatarUrl || null,
          level: data.level || 1,
          xp: data.xp || 0,
          attributes: data.attributes || {},
          stats: data.stats || {
            vida: { current: 20, max: 20 },
            energia: { current: 20, max: 20 },
            saude: { current: 20, max: 20 },
          },
        })
        .select()
        .single()

      if (error) throw error

      return character
    } catch (error: any) {
      console.error('Error creating character:', error)
      throw new Error('Erro ao criar personagem: ' + error.message)
    }
  },

  /**
   * Obtém personagem por ID com todos os relacionamentos
   * @param id - ID do personagem
   * @returns Personagem completo com inventário e habilidades
   */
  async getCharacterById(id: string) {
    try {
      // Buscar personagem
      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (characterError) throw characterError

      // Buscar inventário
      const { data: inventory, error: inventoryError } = await supabase
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
        .eq('character_id', id)

      if (inventoryError) throw inventoryError

      // Buscar habilidades
      const { data: abilities, error: abilitiesError } = await supabase
        .from('character_abilities')
        .select(
          `
          *,
          ability:abilities (
            id,
            name,
            description,
            type,
            cost,
            attributes
          )
        `
        )
        .eq('character_id', id)

      if (abilitiesError) throw abilitiesError

      return {
        ...character,
        inventory: inventory || [],
        abilities: abilities || [],
      }
    } catch (error: any) {
      console.error('Error fetching character:', error)
      throw new Error('Erro ao buscar personagem: ' + error.message)
    }
  },

  /**
   * Atualiza um personagem
   * @param id - ID do personagem
   * @param data - Dados para atualizar
   * @returns Personagem atualizado
   */
  async updateCharacter(id: string, data: any) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
      if (data.level !== undefined) updateData.level = data.level
      if (data.xp !== undefined) updateData.xp = data.xp
      if (data.attributes !== undefined) updateData.attributes = data.attributes
      if (data.stats !== undefined) updateData.stats = data.stats

      const { data: character, error } = await supabase
        .from('characters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return character
    } catch (error: any) {
      console.error('Error updating character:', error)
      throw new Error('Erro ao atualizar personagem: ' + error.message)
    }
  },

  /**
   * Deleta um personagem
   * @param id - ID do personagem
   */
  async deleteCharacter(id: string) {
    try {
      const { error } = await supabase.from('characters').delete().eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting character:', error)
      throw new Error('Erro ao deletar personagem: ' + error.message)
    }
  },

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
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      throw new Error('Erro ao buscar inventário: ' + error.message)
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
      const { data: existing } = await supabase
        .from('character_items')
        .select('*')
        .eq('character_id', characterId)
        .eq('item_id', itemId)
        .single()

      if (existing) {
        // Atualizar quantidade
        const { data, error } = await supabase
          .from('character_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('character_items')
          .insert({
            character_id: characterId,
            item_id: itemId,
            quantity,
            equipped: false,
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error: any) {
      console.error('Error adding item to character:', error)
      throw new Error('Erro ao adicionar item: ' + error.message)
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
    } catch (error: any) {
      console.error('Error removing item from character:', error)
      throw new Error('Erro ao remover item: ' + error.message)
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
    } catch (error: any) {
      console.error('Error equipping item:', error)
      throw new Error('Erro ao equipar item: ' + error.message)
    }
  },

  /**
   * Obtém habilidades do personagem
   * @param characterId - ID do personagem
   * @returns Lista de habilidades
   */
  async getCharacterAbilities(characterId: string) {
    try {
      const { data, error } = await supabase
        .from('character_abilities')
        .select(
          `
          *,
          ability:abilities (
            id,
            name,
            description,
            type,
            cost,
            attributes
          )
        `
        )
        .eq('character_id', characterId)

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching character abilities:', error)
      throw new Error('Erro ao buscar habilidades: ' + error.message)
    }
  },

  /**
   * Adiciona habilidade ao personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   * @returns Habilidade adicionada
   */
  async addAbilityToCharacter(characterId: string, abilityId: string) {
    try {
      const { data, error } = await supabase
        .from('character_abilities')
        .insert({
          character_id: characterId,
          ability_id: abilityId,
        })
        .select()
        .single()

      if (error) {
        // Se já existe (erro de chave duplicada 23505), buscar o existente
        if (error.code === '23505') {
          const { data: existing, error: existingError } = await supabase
            .from('character_abilities')
            .select('*')
            .eq('character_id', characterId)
            .eq('ability_id', abilityId)
            .single()

          // Verificar se a busca do existente também falhou
          if (existingError) {
            throw new Error('Erro ao buscar habilidade existente: ' + existingError.message)
          }

          // Verificar se existing é undefined
          if (!existing) {
            throw new Error('Habilidade não encontrada após erro de duplicação')
          }

          return existing
        }
        throw error
      }

      return data
    } catch (error: any) {
      console.error('Error adding ability to character:', error)
      throw new Error('Erro ao adicionar habilidade: ' + error.message)
    }
  },

  /**
   * Remove habilidade do personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   */
  async removeAbilityFromCharacter(characterId: string, abilityId: string) {
    try {
      const { error } = await supabase
        .from('character_abilities')
        .delete()
        .eq('character_id', characterId)
        .eq('ability_id', abilityId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error removing ability from character:', error)
      throw new Error('Erro ao remover habilidade: ' + error.message)
    }
  },
}
