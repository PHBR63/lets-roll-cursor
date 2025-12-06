import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { CampaignParticipant } from '@/types/campaign'
import { logger } from '@/utils/logger'

/**
 * Hook para sincronizar status de jogadores em tempo real
 * Atualiza participantes da campanha quando há mudanças
 */
export function useRealtimePlayers(campaignId?: string) {
  const [participants, setParticipants] = useState<CampaignParticipant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return

    // Carregar participantes iniciais
    loadParticipants()

    // Subscribe para atualizações em campaign_participants
    const channel = supabase
      .channel(`players:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_participants',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Carregar dados do novo participante
            loadParticipantDetails(payload.new.user_id).then((participant) => {
              if (participant) {
                setParticipants((prev) => [...prev, participant])
              }
            })
          } else if (payload.eventType === 'DELETE') {
            setParticipants((prev) =>
              prev.filter((p) => p.user_id !== payload.old.user_id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setParticipants((prev) =>
              prev.map((p) =>
                p.user_id === payload.new.user_id
                  ? { ...p, role: payload.new.role }
                  : p
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId])

  /**
   * Carrega participantes iniciais
   */
  const loadParticipants = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const campaign = await response.json()
        setParticipants(campaign.participants || [])
      }
    } catch (error) {
      logger.error('Erro ao carregar participantes:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega detalhes de um participante
   */
  const loadParticipantDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaign_participants')
        .select(
          `
          *,
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Erro ao carregar detalhes do participante:', error)
      return null
    }
  }

  return { participants, loading, refresh: loadParticipants }
}

