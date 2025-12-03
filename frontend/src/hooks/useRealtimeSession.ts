import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

/**
 * Hook para sincronizar atualizações de sessão em tempo real
 */
export function useRealtimeSession(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    // Carregar sessão inicial
    loadSession()

    // Subscribe para atualizações
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  /**
   * Carrega sessão inicial
   */
  const loadSession = async () => {
    try {
      if (!sessionId) return

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
    } finally {
      setLoading(false)
    }
  }

  return { session, loading, refresh: loadSession }
}

