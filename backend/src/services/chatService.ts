import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de chat
 */
export const chatService = {
  /**
   * Busca mensagens de chat
   */
  async getMessages(campaignId: string, sessionId?: string, limit: number = 100) {
    try {
      let query = supabase
        .from('chat_messages')
        .select(
          `
          *,
          user:users (
            id,
            username,
            avatar_url
          ),
          character:characters (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      throw new Error('Erro ao buscar mensagens: ' + error.message)
    }
  },

  /**
   * Cria uma nova mensagem
   */
  async createMessage(data: {
    campaignId: string
    sessionId?: string
    userId: string
    characterId?: string
    content: string
    type?: 'message' | 'narration' | 'ooc'
    channel?: string
  }) {
    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          campaign_id: data.campaignId,
          session_id: data.sessionId || null,
          user_id: data.userId,
          character_id: data.characterId || null,
          content: data.content,
          type: data.type || 'message',
          channel: data.channel || 'general',
        })
        .select(
          `
          *,
          user:users (
            id,
            username,
            avatar_url
          ),
          character:characters (
            id,
            name,
            avatar_url
          )
        `
        )
        .single()

      if (error) throw error

      return message
    } catch (error: any) {
      console.error('Error creating message:', error)
      throw new Error('Erro ao enviar mensagem: ' + error.message)
    }
  },
}

