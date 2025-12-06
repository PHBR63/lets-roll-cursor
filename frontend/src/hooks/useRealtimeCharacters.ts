import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Character } from '@/types/character'

/**
 * Hook para sincronizar personagens em tempo real
 */
export function useRealtimeCharacters(campaignId?: string) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) return

    // Carregar personagens iniciais
    loadCharacters()

    // Subscribe para atualizações
    const channel = supabase
      .channel(`characters:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedChar = payload.new as Character
            if (updatedChar.id) {
              setCharacters((prev) =>
                prev.map((char) =>
                  char.id === updatedChar.id ? updatedChar : char
                )
              )
            }
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const newChar = payload.new as Character
            if (newChar.id) {
              setCharacters((prev) => [...prev, newChar])
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedChar = payload.old as { id: string }
            if (deletedChar.id) {
              setCharacters((prev) =>
                prev.filter((char) => char.id !== deletedChar.id)
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
   * Carrega personagens iniciais
   */
  const loadCharacters = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters?campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCharacters(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar personagens:', error)
    } finally {
      setLoading(false)
    }
  }

  return { characters, loading, refresh: loadCharacters }
}

