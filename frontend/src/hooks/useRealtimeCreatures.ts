import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Creature } from '@/types/creature'
import { logger } from '@/utils/logger'

/**
 * Hook para sincronizar criaturas em tempo real
 */
export function useRealtimeCreatures(campaignId?: string) {
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return

    // Carregar criaturas iniciais
    loadCreatures()

    // Subscribe para atualizações
    const channel = supabase
      .channel(`creatures:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'creatures',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedCreature = payload.new as Creature
            if (updatedCreature.id) {
              setCreatures((prev) =>
                prev.map((creature) =>
                  creature.id === updatedCreature.id ? updatedCreature : creature
                )
              )
            }
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newCreature = payload.new as Creature
            if (newCreature.id) {
              setCreatures((prev) => [...prev, newCreature])
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedCreature = payload.old as { id: string }
            if (deletedCreature.id) {
              setCreatures((prev) =>
                prev.filter((creature) => creature.id !== deletedCreature.id)
              )
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId])

  /**
   * Carrega criaturas iniciais
   */
  const loadCreatures = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/creatures?campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCreatures(data || [])
      }
    } catch (error) {
      logger.error('Erro ao carregar criaturas:', error)
    } finally {
      setLoading(false)
    }
  }

  return { creatures, loading, refresh: loadCreatures }
}

