import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de habilidades
 */
export const abilityService = {
  /**
   * Obtém habilidades baseado em filtros
   * @param filters - Filtros de busca (campaignId, isGlobal)
   * @returns Lista de habilidades
   */
  async getAbilities(filters: any) {
    try {
      let query = supabase
        .from('abilities')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          created_by_user:users!abilities_created_by_fkey (
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

      // Se não especificar, buscar habilidades globais e da campanha
      if (!filters.campaignId && filters.isGlobal === undefined) {
        query = query.or('is_global.eq.true,campaign_id.is.null')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching abilities:', error)
      throw new Error('Erro ao buscar habilidades: ' + error.message)
    }
  },

  /**
   * Cria uma nova habilidade
   * @param userId - ID do usuário criador
   * @param data - Dados da habilidade
   * @returns Habilidade criada
   */
  async createAbility(userId: string, data: any) {
    try {
      const { data: ability, error } = await supabase
        .from('abilities')
        .insert({
          campaign_id: data.campaignId || null,
          created_by: userId,
          name: data.name,
          description: data.description || null,
          type: data.type || null,
          cost: data.cost || {},
          attributes: data.attributes || {},
          is_global: data.isGlobal || false,
        })
        .select()
        .single()

      if (error) throw error

      return ability
    } catch (error: any) {
      console.error('Error creating ability:', error)
      throw new Error('Erro ao criar habilidade: ' + error.message)
    }
  },

  /**
   * Obtém habilidade por ID
   * @param id - ID da habilidade
   * @returns Habilidade completa
   */
  async getAbilityById(id: string) {
    try {
      const { data: ability, error } = await supabase
        .from('abilities')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          created_by_user:users!abilities_created_by_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return ability
    } catch (error: any) {
      console.error('Error fetching ability:', error)
      throw new Error('Erro ao buscar habilidade: ' + error.message)
    }
  },

  /**
   * Atualiza uma habilidade
   * @param id - ID da habilidade
   * @param data - Dados para atualizar
   * @returns Habilidade atualizada
   */
  async updateAbility(id: string, data: any) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.type !== undefined) updateData.type = data.type
      if (data.cost !== undefined) updateData.cost = data.cost
      if (data.attributes !== undefined) updateData.attributes = data.attributes
      if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal

      const { data: ability, error } = await supabase
        .from('abilities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return ability
    } catch (error: any) {
      console.error('Error updating ability:', error)
      throw new Error('Erro ao atualizar habilidade: ' + error.message)
    }
  },

  /**
   * Deleta uma habilidade
   * @param id - ID da habilidade
   */
  async deleteAbility(id: string) {
    try {
      const { error } = await supabase.from('abilities').delete().eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting ability:', error)
      throw new Error('Erro ao deletar habilidade: ' + error.message)
    }
  },

  /**
   * Obtém habilidades de uma campanha específica
   * @param campaignId - ID da campanha
   * @returns Lista de habilidades da campanha
   */
  async getCampaignAbilities(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('abilities')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching campaign abilities:', error)
      throw new Error('Erro ao buscar habilidades da campanha: ' + error.message)
    }
  },

  /**
   * Atribui habilidade a um personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   * @returns Habilidade atribuída
   */
  async assignAbilityToCharacter(characterId: string, abilityId: string) {
    try {
      // Verificar se habilidade existe
      const { data: ability, error: abilityError } = await supabase
        .from('abilities')
        .select('*')
        .eq('id', abilityId)
        .single()

      if (abilityError) throw abilityError

      // Adicionar habilidade ao personagem
      const { characterService } = await import('./characterService')
      return await characterService.addAbilityToCharacter(characterId, abilityId)
    } catch (error: any) {
      console.error('Error assigning ability to character:', error)
      throw new Error('Erro ao atribuir habilidade: ' + error.message)
    }
  },
}

