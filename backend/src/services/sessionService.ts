import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de sessões de jogo
 */
export const sessionService = {
  /**
   * Cria uma nova sessão
   */
  async createSession(campaignId: string, data: any) {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          campaign_id: campaignId,
          name: data.name || `Sessão ${new Date().toLocaleDateString()}`,
          started_at: new Date().toISOString(),
          notes: data.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      return session
    } catch (error: any) {
      console.error('Error creating session:', error)
      throw new Error('Erro ao criar sessão: ' + error.message)
    }
  },

  /**
   * Busca sessão ativa de uma campanha
   */
  async getActiveSession(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('campaign_id', campaignId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error fetching active session:', error)
      throw new Error('Erro ao buscar sessão: ' + error.message)
    }
  },

  /**
   * Busca sessões de uma campanha
   */
  async getCampaignSessions(campaignId: string, activeOnly: boolean = false) {
    try {
      let query = supabase
        .from('sessions')
        .select('*')
        .eq('campaign_id', campaignId)

      if (activeOnly) {
        query = query.is('ended_at', null)
      }

      query = query.order('started_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
      throw new Error('Erro ao buscar sessões: ' + error.message)
    }
  },

  /**
   * Busca sessão por ID
   */
  async getSessionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error fetching session:', error)
      throw new Error('Erro ao buscar sessão: ' + error.message)
    }
  },

  /**
   * Atualiza uma sessão
   */
  async updateSession(id: string, data: any) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.name) updateData.name = data.name
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.board_state !== undefined) updateData.board_state = data.board_state

      const { data: session, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return session
    } catch (error: any) {
      console.error('Error updating session:', error)
      throw new Error('Erro ao atualizar sessão: ' + error.message)
    }
  },

  /**
   * Atualiza apenas o board_state da sessão
   */
  async updateBoardState(id: string, boardState: any) {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          board_state: boardState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return session
    } catch (error: any) {
      console.error('Error updating board state:', error)
      throw new Error('Erro ao atualizar estado do board: ' + error.message)
    }
  },

  /**
   * Finaliza uma sessão
   */
  async endSession(id: string) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error ending session:', error)
      throw new Error('Erro ao finalizar sessão: ' + error.message)
    }
  },
}

