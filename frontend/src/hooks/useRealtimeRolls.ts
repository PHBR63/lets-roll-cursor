import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

/**
 * Hook para sincronizar rolagens de dados em tempo real
 */
export function useRealtimeRolls(sessionId?: string, campaignId?: string) {
  const [rolls, setRolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return

    // Carregar rolagens iniciais
    loadRolls()

    // Subscribe para novas rolagens
    const channel = supabase
      .channel(`dice-rolls:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dice_rolls',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          // Ignorar rolagens privadas
          if (payload.new.is_private) return

          // Buscar dados do usuário e personagem
          loadRollDetails(payload.new.id).then((rollWithDetails) => {
            if (rollWithDetails) {
              setRolls((prev) => [rollWithDetails, ...prev].slice(0, 50))
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
   * Carrega rolagens iniciais
   */
  const loadRolls = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const url = new URL(`${apiUrl}/api/dice/history`)
      if (sessionId) url.searchParams.set('sessionId', sessionId)
      url.searchParams.set('campaignId', campaignId)
      url.searchParams.set('limit', '20')

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRolls(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar rolagens:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega detalhes de uma rolagem (usuário e personagem)
   */
  const loadRollDetails = async (rollId: string) => {
    try {
      const { data, error } = await supabase
        .from('dice_rolls')
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
        .eq('id', rollId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao carregar detalhes da rolagem:', error)
      return null
    }
  }

  return { rolls, loading, refresh: loadRolls }
}

