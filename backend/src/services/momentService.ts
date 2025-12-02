import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de momentos da campanha
 */
export const momentService = {
  /**
   * Obtém momentos de uma campanha ordenados por data
   * @param campaignId - ID da campanha
   * @returns Lista de momentos
   */
  async getCampaignMoments(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('campaign_moments')
        .select(
          `
          *,
          session:sessions (
            id,
            name
          ),
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching campaign moments:', error)
      throw new Error('Erro ao buscar momentos: ' + error.message)
    }
  },

  /**
   * Cria um novo momento (story)
   * @param userId - ID do usuário criador
   * @param data - Dados do momento
   * @returns Momento criado
   */
  async createMoment(userId: string, data: any) {
    try {
      const { data: moment, error } = await supabase
        .from('campaign_moments')
        .insert({
          campaign_id: data.campaignId,
          session_id: data.sessionId || null,
          created_by: userId,
          title: data.title,
          description: data.description || null,
          image_url: data.imageUrl || null,
          dice_roll_id: data.diceRollId || null,
        })
        .select(
          `
          *,
          session:sessions (
            id,
            name
          ),
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .single()

      if (error) throw error

      return moment
    } catch (error: any) {
      console.error('Error creating moment:', error)
      throw new Error('Erro ao criar momento: ' + error.message)
    }
  },

  /**
   * Obtém momento por ID
   * @param id - ID do momento
   * @returns Momento completo
   */
  async getMomentById(id: string) {
    try {
      const { data: moment, error } = await supabase
        .from('campaign_moments')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          session:sessions (
            id,
            name
          ),
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result,
            details
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return moment
    } catch (error: any) {
      console.error('Error fetching moment:', error)
      throw new Error('Erro ao buscar momento: ' + error.message)
    }
  },

  /**
   * Atualiza um momento
   * @param id - ID do momento
   * @param data - Dados para atualizar
   * @returns Momento atualizado
   */
  async updateMoment(id: string, data: any) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
      if (data.sessionId !== undefined) updateData.session_id = data.sessionId
      if (data.diceRollId !== undefined) updateData.dice_roll_id = data.diceRollId

      const { data: moment, error } = await supabase
        .from('campaign_moments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return moment
    } catch (error: any) {
      console.error('Error updating moment:', error)
      throw new Error('Erro ao atualizar momento: ' + error.message)
    }
  },

  /**
   * Deleta um momento
   * @param id - ID do momento
   */
  async deleteMoment(id: string) {
    try {
      const { error } = await supabase.from('campaign_moments').delete().eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting moment:', error)
      throw new Error('Erro ao deletar momento: ' + error.message)
    }
  },

  /**
   * Obtém momentos de uma sessão específica
   * @param sessionId - ID da sessão
   * @returns Lista de momentos da sessão
   */
  async getSessionMoments(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('campaign_moments')
        .select(
          `
          *,
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching session moments:', error)
      throw new Error('Erro ao buscar momentos da sessão: ' + error.message)
    }
  },
}
