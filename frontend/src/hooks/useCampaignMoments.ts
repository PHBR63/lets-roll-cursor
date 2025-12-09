// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { CampaignMoment, CreateMomentData } from '@/types/moment'
import { AppError } from '@/types/common'
import { getApiBaseUrl } from '@/utils/apiUrl'

/**
 * Hook para gerenciar momentos da campanha
 */
export function useCampaignMoments(campaignId: string, sessionId?: string) {
  const [moments, setMoments] = useState<CampaignMoment[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Carrega momentos da campanha
   */
  const loadMoments = useCallback(async () => {
    if (!campaignId) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const url = sessionId
        ? `${apiUrl}/api/moments/session/${sessionId}`
        : `${apiUrl}/api/moments/campaign/${campaignId}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar momentos')
      }

      const data = await response.json()
      setMoments(data || [])
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, campaignId, sessionId }, 'Erro ao carregar momentos')
      throw err
    } finally {
      setLoading(false)
    }
  }, [campaignId, sessionId])

  /**
   * Carrega momentos iniciais
   */
  useEffect(() => {
    loadMoments()
  }, [loadMoments])

  /**
   * Cria um novo momento
   */
  const createMoment = useCallback(
    async (data: CreateMomentData) => {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) throw new Error('Sessão não encontrada')

        const apiUrl = getApiBaseUrl()
        const response = await fetch(`${apiUrl}/api/moments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            campaignId: data.campaignId,
            sessionId: data.sessionId || null,
            title: data.title,
            description: data.description || null,
            imageUrl: data.imageUrl || null,
            diceRollId: data.diceRollId || null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao criar momento')
        }

        const newMoment = await response.json()
        setMoments((prev) => [newMoment, ...prev])
        return newMoment
      } catch (error: unknown) {
        const err = error as AppError
        logger.error({ error, data }, 'Erro ao criar momento')
        throw err
      }
    },
    []
  )

  /**
   * Deleta um momento
   */
  const deleteMoment = useCallback(async (momentId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Sessão não encontrada')

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/moments/${momentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar momento')
      }

      setMoments((prev) => prev.filter((m) => m.id !== momentId))
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, momentId }, 'Erro ao deletar momento')
      throw err
    }
  }, [])

  /**
   * Atualiza a lista de momentos
   */
  const refreshMoments = useCallback(() => {
    loadMoments()
  }, [loadMoments])

  return {
    moments,
    loading,
    createMoment,
    deleteMoment,
    refreshMoments,
  }
}

