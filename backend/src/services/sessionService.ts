import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { CreateSessionData, UpdateSessionData } from '../types/session'
import { AppError } from '../types/common'

/**
 * Serviço para lógica de negócio de sessões de jogo
 */
export const sessionService = {
  /**
   * Cria uma nova sessão
   */
  async createSession(campaignId: string, data: CreateSessionData) {
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error creating session')
      throw new Error('Erro ao criar sessão: ' + (err.message || 'Erro desconhecido'))
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching active session')
      throw new Error('Erro ao buscar sessão: ' + (err.message || 'Erro desconhecido'))
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching sessions')
      throw new Error('Erro ao buscar sessões: ' + (err.message || 'Erro desconhecido'))
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching session')
      throw new Error('Erro ao buscar sessão: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza uma sessão
   */
  async updateSession(id: string, data: UpdateSessionData) {
    try {
      const updateData: Record<string, unknown> = {
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating session')
      throw new Error('Erro ao atualizar sessão: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza apenas o board_state da sessão
   */
  async updateBoardState(id: string, boardState: Record<string, unknown>) {
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating board state')
      throw new Error('Erro ao atualizar estado do board: ' + (err.message || 'Erro desconhecido'))
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
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error ending session')
      throw new Error('Erro ao finalizar sessão: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

