import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de criaturas
 */
export const creatureService = {
  /**
   * Obtém criaturas baseado em filtros
   * @param filters - Filtros de busca (campaignId, isGlobal)
   * @returns Lista de criaturas
   */
  async getCreatures(filters: any) {
    try {
      let query = supabase
        .from('creatures')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          created_by_user:users!creatures_created_by_fkey (
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

      // Se não especificar, buscar criaturas globais e da campanha
      if (!filters.campaignId && filters.isGlobal === undefined) {
        query = query.or('is_global.eq.true,campaign_id.is.null')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching creatures:', error)
      throw new Error('Erro ao buscar criaturas: ' + error.message)
    }
  },

  /**
   * Cria uma nova criatura/NPC
   * @param userId - ID do usuário criador
   * @param data - Dados da criatura
   * @returns Criatura criada
   */
  async createCreature(userId: string, data: any) {
    try {
      const { data: creature, error } = await supabase
        .from('creatures')
        .insert({
          campaign_id: data.campaignId || null,
          created_by: userId,
          name: data.name,
          type: data.type || null,
          description: data.description || null,
          attributes: data.attributes || {},
          stats: data.stats || {
            vida: { current: 10, max: 10 },
            energia: { current: 10, max: 10 },
            saude: { current: 10, max: 10 },
          },
          is_global: data.isGlobal || false,
        })
        .select()
        .single()

      if (error) throw error

      return creature
    } catch (error: any) {
      console.error('Error creating creature:', error)
      throw new Error('Erro ao criar criatura: ' + error.message)
    }
  },

  /**
   * Obtém criatura por ID
   * @param id - ID da criatura
   * @returns Criatura completa
   */
  async getCreatureById(id: string) {
    try {
      const { data: creature, error } = await supabase
        .from('creatures')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          created_by_user:users!creatures_created_by_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return creature
    } catch (error: any) {
      console.error('Error fetching creature:', error)
      throw new Error('Erro ao buscar criatura: ' + error.message)
    }
  },

  /**
   * Atualiza uma criatura
   * @param id - ID da criatura
   * @param data - Dados para atualizar
   * @returns Criatura atualizada
   */
  async updateCreature(id: string, data: any) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.type !== undefined) updateData.type = data.type
      if (data.description !== undefined) updateData.description = data.description
      if (data.attributes !== undefined) updateData.attributes = data.attributes
      if (data.stats !== undefined) updateData.stats = data.stats
      if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal

      const { data: creature, error } = await supabase
        .from('creatures')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return creature
    } catch (error: any) {
      console.error('Error updating creature:', error)
      throw new Error('Erro ao atualizar criatura: ' + error.message)
    }
  },

  /**
   * Deleta uma criatura
   * @param id - ID da criatura
   */
  async deleteCreature(id: string) {
    try {
      const { error } = await supabase.from('creatures').delete().eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting creature:', error)
      throw new Error('Erro ao deletar criatura: ' + error.message)
    }
  },

  /**
   * Obtém criaturas de uma campanha específica
   * @param campaignId - ID da campanha
   * @returns Lista de criaturas da campanha
   */
  async getCampaignCreatures(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('creatures')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching campaign creatures:', error)
      throw new Error('Erro ao buscar criaturas da campanha: ' + error.message)
    }
  },
}

