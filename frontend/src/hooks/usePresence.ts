import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'

/**
 * Interface para status de presença
 */
interface PresenceStatus {
  userId: string
  username: string
  avatarUrl?: string
  isOnline: boolean
  lastSeen?: Date
  currentPage?: string
}

/**
 * Hook para gerenciar presença de usuários em tempo real
 * Usa Supabase Realtime Presence para rastrear quem está online
 */
export function usePresence(campaignId?: string, sessionId?: string) {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<PresenceStatus[]>([])
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!campaignId || !user) return

    const channelName = sessionId 
      ? `presence:${campaignId}:${sessionId}`
      : `presence:${campaignId}`

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    // Track presença do usuário atual
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: PresenceStatus[] = []

        Object.keys(state).forEach((userId) => {
          const presences = state[userId] as any[]
          if (presences && presences.length > 0) {
            const presence = presences[0]
            users.push({
              userId,
              username: presence.username || 'Usuário',
              avatarUrl: presence.avatarUrl,
              isOnline: true,
              currentPage: presence.currentPage,
            })
          }
        })

        setOnlineUsers(users)
        setIsOnline(users.some((u) => u.userId === user.id))
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Usuário entrou
        const presence = newPresences[0]
        if (presence) {
          setOnlineUsers((prev) => {
            if (prev.some((u) => u.userId === key)) return prev
            return [
              ...prev,
              {
                userId: key,
                username: presence.username || 'Usuário',
                avatarUrl: presence.avatarUrl,
                isOnline: true,
                currentPage: presence.currentPage,
              },
            ]
          })
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Usuário saiu
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== key))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Enviar presença inicial
          await channel.track({
            username: (user.user_metadata?.username as string) || user.email || 'Usuário',
            avatarUrl: user.user_metadata?.avatar_url as string | undefined,
            currentPage: sessionId ? 'session' : 'campaign',
            joinedAt: new Date().toISOString(),
          })
        }
      })

    // Atualizar presença periodicamente (heartbeat)
    const heartbeatInterval = setInterval(async () => {
      if (channel.state === 'joined') {
        await channel.track({
          username: (user.user_metadata?.username as string) || user.email || 'Usuário',
          avatarUrl: user.user_metadata?.avatar_url as string | undefined,
          currentPage: sessionId ? 'session' : 'campaign',
          lastSeen: new Date().toISOString(),
        })
      }
    }, 30000) // A cada 30 segundos

    return () => {
      clearInterval(heartbeatInterval)
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [campaignId, sessionId, user])

  /**
   * Verifica se um usuário está online
   */
  const checkUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.some((u) => u.userId === userId && u.isOnline)
    },
    [onlineUsers]
  )

  /**
   * Atualiza a página atual do usuário
   */
  const updateCurrentPage = useCallback(
    async (page: string) => {
      if (!campaignId || !user) return

      const channelName = sessionId
        ? `presence:${campaignId}:${sessionId}`
        : `presence:${campaignId}`

      const channel = supabase.channel(channelName)
      await channel.track({
        username: (user.user_metadata?.username as string) || user.email || 'Usuário',
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
        currentPage: page,
        lastSeen: new Date().toISOString(),
      })
    },
    [campaignId, sessionId, user]
  )

  return {
    onlineUsers,
    isOnline,
    checkUserOnline,
    updateCurrentPage,
    onlineCount: onlineUsers.length,
  }
}

