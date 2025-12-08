import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

/**
 * Tipo para mensagens de chat
 */
export interface ChatMessage {
  id: string
  content: string
  user_id: string
  user?: {
    id: string
    username?: string
    avatar_url?: string
  }
  character_id?: string
  character?: {
    id: string
    name?: string
  }
  type: 'message' | 'narration' | 'ooc'
  created_at: string
  session_id?: string
  campaign_id?: string
}

/**
 * Hook para sincronizar chat em tempo real
 */
export function useRealtimeChat(sessionId?: string, campaignId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return

    // Carregar mensagens iniciais
    loadMessages()

    // Subscribe para novas mensagens
    const channel = supabase
      .channel(`chat:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: campaignId
            ? `campaign_id=eq.${campaignId}`
            : undefined,
        },
        (payload) => {
          // Buscar dados do usuário e personagem
          loadMessageDetails(payload.new.id).then((messageWithDetails) => {
            if (messageWithDetails) {
              setMessages((prev) => [...prev, messageWithDetails])
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, campaignId])

  /**
   * Carrega mensagens iniciais
   */
  const loadMessages = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const url = new URL(`${apiUrl}/api/chat`)
      if (sessionId) url.searchParams.set('sessionId', sessionId)
      url.searchParams.set('campaignId', campaignId)

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
      }
    } catch (error) {
      logger.error('Erro ao carregar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega detalhes de uma mensagem (usuário e personagem)
   */
  const loadMessageDetails = async (messageId: string) => {
    try {
      const { data, error } = await supabase
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
            name
          )
        `
        )
        .eq('id', messageId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Erro ao carregar detalhes da mensagem:', error)
      return null
    }
  }

  return { messages, loading, refresh: loadMessages }
}

