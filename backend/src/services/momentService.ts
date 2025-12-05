import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'
import { getCache, setCache, deleteCache, deleteCachePattern, getMomentCacheKey } from './cache'

/**
 * Interface para dados de criação de momento
 */
export interface CreateMomentData {
  campaignId: string
  sessionId?: string | null
  title: string
  description?: string
  imageUrl?: string
  diceRollId?: string | null
}

/**
 * Interface para dados de atualização de momento
 */
export interface UpdateMomentData {
  title?: string
  description?: string
  imageUrl?: string
  sessionId?: string | null
  diceRollId?: string | null
}

/**
 * Serviço para lógica de negócio de momentos da campanha
 */
export const momentService = {
  /**
   * Obtém momentos de uma campanha
   */
  async getCampaignMoments(campaignId: string) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getMomentCacheKey({ campaignId })
      const cached = await getCache<unknown[]>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para momentos da campanha')
        return cached
      }

      const { data, error } = await supabase
        .from('campaign_moments')
        .select(
          `
          *,
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          session:sessions (
            id,
            name
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const result = data || []

      // Armazenar no cache (TTL: 5 minutos)
      await setCache(cacheKey, result, 300)

      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, campaignId }, 'Erro ao buscar momentos da campanha')
      throw new Error('Erro ao buscar momentos: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém momentos de uma sessão específica
   */
  async getSessionMoments(sessionId: string) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getMomentCacheKey({ sessionId })
      const cached = await getCache<unknown[]>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para momentos da sessão')
        return cached
      }

      const { data, error } = await supabase
        .from('campaign_moments')
        .select(
          `
          *,
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          session:sessions (
            id,
            name
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const result = data || []

      // Armazenar no cache (TTL: 5 minutos)
      await setCache(cacheKey, result, 300)

      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, sessionId }, 'Erro ao buscar momentos da sessão')
      throw new Error('Erro ao buscar momentos da sessão: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém um momento por ID
   */
  async getMomentById(id: string) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getMomentCacheKey({ momentId: id })
      const cached = await getCache<unknown>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para momento por ID')
        return cached
      }

      const { data, error } = await supabase
        .from('campaign_moments')
        .select(
          `
          *,
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          session:sessions (
            id,
            name
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      // Armazenar no cache (TTL: 5 minutos)
      await setCache(cacheKey, data, 300)

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, id }, 'Erro ao buscar momento por ID')
      throw new Error('Erro ao buscar momento: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Cria um novo momento
   */
  async createMoment(userId: string, data: CreateMomentData) {
    try {
      // Validação básica
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Título do momento é obrigatório')
      }

      if (!data.campaignId) {
        throw new Error('ID da campanha é obrigatório')
      }

      // Verificar se o usuário é participante da campanha
      const { data: participant, error: participantError } = await supabase
        .from('campaign_participants')
        .select('id')
        .eq('campaign_id', data.campaignId)
        .eq('user_id', userId)
        .single()

      if (participantError || !participant) {
        throw new Error('Você não é participante desta campanha')
      }

      // Se sessionId foi fornecido, verificar se a sessão pertence à campanha
      if (data.sessionId) {
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('campaign_id')
          .eq('id', data.sessionId)
          .single()

        if (sessionError || !session) {
          throw new Error('Sessão não encontrada')
        }

        if (session.campaign_id !== data.campaignId) {
          throw new Error('A sessão não pertence a esta campanha')
        }
      }

      const { data: moment, error } = await supabase
        .from('campaign_moments')
        .insert({
          campaign_id: data.campaignId,
          session_id: data.sessionId || null,
          created_by: userId,
          title: data.title.trim(),
          description: data.description || null,
          image_url: data.imageUrl || null,
          dice_roll_id: data.diceRollId || null,
        })
        .select(
          `
          *,
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          session:sessions (
            id,
            name
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .single()

      if (error) throw error

      // Invalidar cache relacionado
      await deleteCache(getMomentCacheKey({ campaignId: data.campaignId }))
      if (data.sessionId) {
        await deleteCache(getMomentCacheKey({ sessionId: data.sessionId }))
      }
      await deleteCachePattern('moments:*')

      logger.info({ momentId: moment.id, campaignId: data.campaignId }, 'Momento criado com sucesso')
      return moment
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, data, userId }, 'Erro ao criar momento')
      throw new Error('Erro ao criar momento: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza um momento existente
   */
  async updateMoment(momentId: string, userId: string, data: UpdateMomentData) {
    try {
      // Verificar se o momento existe e se o usuário é o criador
      // Buscar também campaign_id e session_id para invalidar cache
      const { data: existingMoment, error: fetchError } = await supabase
        .from('campaign_moments')
        .select('created_by, campaign_id, session_id')
        .eq('id', momentId)
        .single()

      if (fetchError) throw fetchError

      if (!existingMoment) {
        throw new Error('Momento não encontrado')
      }

      if (existingMoment.created_by !== userId) {
        throw new Error('Você não tem permissão para atualizar este momento')
      }

      // Preparar dados para atualização
      const updateData: Record<string, unknown> = {}

      if (data.title !== undefined) {
        updateData.title = data.title.trim()
      }
      if (data.description !== undefined) {
        updateData.description = data.description || null
      }
      if (data.imageUrl !== undefined) {
        updateData.image_url = data.imageUrl || null
      }
      if (data.sessionId !== undefined) {
        updateData.session_id = data.sessionId || null
      }
      if (data.diceRollId !== undefined) {
        updateData.dice_roll_id = data.diceRollId || null
      }

      // Se sessionId foi alterado, validar que pertence à campanha
      if (data.sessionId && data.sessionId !== existingMoment.session_id) {
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('campaign_id')
          .eq('id', data.sessionId)
          .single()

        if (sessionError || !session) {
          throw new Error('Sessão não encontrada')
        }

        if (session.campaign_id !== existingMoment.campaign_id) {
          throw new Error('A sessão não pertence à campanha deste momento')
        }
      }

      const { data: updatedMoment, error: updateError } = await supabase
        .from('campaign_moments')
        .update(updateData)
        .eq('id', momentId)
        .select(
          `
          *,
          created_by_user:users!campaign_moments_created_by_fkey (
            id,
            username,
            avatar_url
          ),
          session:sessions (
            id,
            name
          ),
          dice_roll:dice_rolls (
            id,
            formula,
            result
          )
        `
        )
        .single()

      if (updateError) throw updateError

      // Invalidar cache relacionado
      await deleteCache(getMomentCacheKey({ momentId }))
      await deleteCachePattern('moments:*')
      
      // Invalidar caches específicos usando dados do momento existente
      if (existingMoment.campaign_id) {
        await deleteCache(getMomentCacheKey({ campaignId: existingMoment.campaign_id }))
      }
      if (existingMoment.session_id) {
        await deleteCache(getMomentCacheKey({ sessionId: existingMoment.session_id }))
      }
      
      // Se session_id foi alterado, invalidar cache da nova sessão também
      if (data.sessionId && data.sessionId !== existingMoment.session_id) {
        await deleteCache(getMomentCacheKey({ sessionId: data.sessionId }))
      }

      logger.info({ momentId, userId }, 'Momento atualizado com sucesso')
      return updatedMoment
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, momentId, userId, data }, 'Erro ao atualizar momento')
      throw new Error('Erro ao atualizar momento: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Deleta um momento
   */
  async deleteMoment(momentId: string, userId: string) {
    try {
      // Verificar se o momento existe e se o usuário é o criador
      const { data: existingMoment, error: fetchError } = await supabase
        .from('campaign_moments')
        .select('created_by')
        .eq('id', momentId)
        .single()

      if (fetchError) throw fetchError

      if (!existingMoment) {
        throw new Error('Momento não encontrado')
      }

      if (existingMoment.created_by !== userId) {
        throw new Error('Você não tem permissão para deletar este momento')
      }

      // Buscar campaign_id e session_id antes de deletar para invalidar cache
      const { data: momentData } = await supabase
        .from('campaign_moments')
        .select('campaign_id, session_id')
        .eq('id', momentId)
        .single()

      const { error: deleteError } = await supabase
        .from('campaign_moments')
        .delete()
        .eq('id', momentId)

      if (deleteError) throw deleteError

      // Invalidar cache relacionado
      await deleteCache(getMomentCacheKey({ momentId }))
      await deleteCachePattern('moments:*')
      if (momentData) {
        if (momentData.campaign_id) {
          await deleteCache(getMomentCacheKey({ campaignId: momentData.campaign_id }))
        }
        if (momentData.session_id) {
          await deleteCache(getMomentCacheKey({ sessionId: momentData.session_id }))
        }
      }

      logger.info({ momentId, userId }, 'Momento deletado com sucesso')
      return { message: 'Momento deletado com sucesso' }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, momentId, userId }, 'Erro ao deletar momento')
      throw new Error('Erro ao deletar momento: ' + (err.message || 'Erro desconhecido'))
    }
  },
}
