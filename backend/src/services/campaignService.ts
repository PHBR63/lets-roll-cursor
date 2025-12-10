import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { CreateCampaignData, UpdateCampaignData } from '../types/campaign'
import { AppError } from '../types/common'
import { getCache, setCache, deleteCache, deleteCachePattern, getCampaignCacheKey } from './cache'

/**
 * Serviço para lógica de negócio de campanhas
 */
export const campaignService = {
  /**
   * Obtém todas as campanhas do usuário (como mestre ou jogador)
   */
  async getUserCampaigns(userId: string) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getCampaignCacheKey({ userId })
      const cached = await getCache<unknown[]>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para campanhas do usuário')
        return cached as Array<Record<string, unknown> & { role: string }>
      }

      const { data, error } = await supabase
        .from('campaign_participants')
        .select(
          `
          role,
          campaign:campaigns (
            id,
            name,
            description,
            image_url,
            system_rpg,
            tags,
            status,
            created_at,
            created_by
          )
        `
        )
        .eq('user_id', userId)

      if (error) throw error

      const result =
        data?.map((p: { role: string; campaign: Record<string, unknown> | Record<string, unknown>[] }) => {
          // O Supabase pode retornar campaign como array ou objeto único
          const campaign = Array.isArray(p.campaign) ? p.campaign[0] : p.campaign
          return {
            ...campaign,
            role: p.role,
          }
        }) || []

      // Armazenar no cache (TTL: 10 minutos)
      await setCache(cacheKey, result, 600)

      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching user campaigns')
      throw new Error('Erro ao buscar campanhas')
    }
  },

  /**
   * Upload de imagem para Supabase Storage
   */
  async uploadImage(file: Buffer, filename: string, userId: string) {
    try {
      const fileExt = filename.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`

      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, file, {
          contentType,
          upsert: false,
        })

      if (error) {
        // Se o bucket não existe, criar
        if (error.message.includes('not found')) {
          // Tentar criar bucket (requer permissões admin)
          logger.warn('Bucket não encontrado. Configure o bucket "campaign-images" no Supabase.')
          throw new Error('Bucket de imagens não configurado')
        }
        throw error
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('campaign-images').getPublicUrl(data.path)

      return publicUrl
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error uploading image')
      throw new Error('Erro ao fazer upload da imagem: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Garante que o usuário existe na tabela public.users
   * Se não existir, cria o registro com dados mínimos
   */
  async ensureUserExists(userId: string, email?: string, username?: string) {
    try {
      // Verificar se o usuário já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingUser) {
        // Usuário já existe
        return
      }

      // Se não encontrou (erro PGRST116 = no rows), criar registro
      if (checkError && checkError.code === 'PGRST116') {
        // Gerar username se não fornecido
        let generatedUsername = username
        if (!generatedUsername) {
          if (email) {
            // Usar parte do email antes do @
            generatedUsername = email.split('@')[0]
          } else {
            // Fallback: usar parte do ID
            generatedUsername = `user_${userId.substring(0, 8)}`
          }
        }

        // Criar registro na tabela public.users
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: generatedUsername,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (insertError) {
          // Se já existe (concorrência), tudo bem - outro processo criou
          if (insertError.code !== '23505') { // 23505 = unique violation
            logger.error({ userId, insertError }, 'Erro ao criar usuário na tabela public.users')
            throw insertError
          }
        } else {
          logger.info({ userId, username: generatedUsername }, 'Usuário criado na tabela public.users')
        }
      } else if (checkError) {
        // Outro erro ao verificar
        logger.error({ userId, checkError }, 'Erro ao verificar existência do usuário')
        throw checkError
      }
    } catch (error) {
      logger.error({ userId, error }, 'Erro ao garantir existência do usuário')
      // Não bloquear se houver erro, apenas logar
      // O erro será capturado quando tentar criar a campanha
    }
  },

  /**
   * Cria uma nova campanha
   */
  async createCampaign(userId: string, data: CreateCampaignData, email?: string, username?: string) {
    try {
      // Garantir que o usuário existe na tabela public.users
      await this.ensureUserExists(userId, email, username)

      // Validação básica
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Nome da campanha é obrigatório')
      }

      let imageUrl: string | null = null

      // Upload de imagem se houver
      if (data.image) {
        try {
          imageUrl = await this.uploadImage(
            data.image.buffer,
            data.image.originalname,
            userId
          )
        } catch (imageError) {
          // Se o bucket não estiver configurado, continuar sem imagem
          if (imageError instanceof Error && imageError.message.includes('Bucket de imagens não configurado')) {
            logger.warn('Bucket não configurado, criando campanha sem imagem')
            imageUrl = null
          } else {
            throw imageError
          }
        }
      }

      // Criar campanha
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: data.name.trim(),
          description: data.description || null,
          image_url: imageUrl,
          system_rpg: data.systemRpg || null,
          tags: data.tags || [],
          status: 'active',
          created_by: userId,
          // Nota: current_rank não existe na tabela campaigns, foi removido
        })
        .select()
        .single()

      if (campaignError) {
        logger.error({ campaignError, data }, 'Erro ao inserir campanha no Supabase')
        // Melhorar mensagem de erro do Supabase
        if (campaignError.code === '23505') {
          throw new Error('Já existe uma campanha com este nome')
        }
        if (campaignError.code === '23503') {
          throw new Error('Usuário não encontrado')
        }
        throw new Error('Erro ao criar campanha: ' + (campaignError.message || 'Erro desconhecido'))
      }

      // Criar participante como mestre
      const { error: participantError } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaign.id,
          user_id: userId,
          role: 'master',
        })

      if (participantError) throw participantError

      // Salvar configurações customizadas (adquiríveis e personalidades)
      // Isso pode ser feito em uma tabela separada ou como JSONB
      // Por enquanto, vamos salvar como metadados (futuro: tabela dedicada)
      
      // Invalidar cache relacionado
      await deleteCachePattern('campaigns:*')
      await deleteCache(getCampaignCacheKey({ userId }))
      
      return campaign
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error creating campaign')
      throw new Error('Erro ao criar campanha: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém campanha por ID com participantes
   */
  async getCampaignById(id: string) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getCampaignCacheKey({ campaignId: id })
      const cached = await getCache<unknown>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para campanha')
        const cachedCampaign = cached as Record<string, unknown> & { participants?: unknown[] }
        // Garantir que participants seja sempre um array
        return {
          ...cachedCampaign,
          participants: Array.isArray(cachedCampaign.participants) 
            ? cachedCampaign.participants 
            : [],
        }
      }

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (campaignError) throw campaignError

      // Buscar participantes
      const { data: participants, error: participantsError } = await supabase
        .from('campaign_participants')
        .select(
          `
          role,
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('campaign_id', id)

      if (participantsError) throw participantsError

      const result = {
        ...campaign,
        participants: participants || [],
      }

      // Armazenar no cache (TTL: 10 minutos)
      await setCache(cacheKey, result, 600)

      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching campaign')
      throw new Error('Erro ao buscar campanha')
    }
  },

  /**
   * Atualiza uma campanha (apenas mestre pode)
   */
  async updateCampaign(id: string, userId: string, data: UpdateCampaignData) {
    try {
      // Verificar se usuário é mestre
      const { data: participant, error: checkError } = await supabase
        .from('campaign_participants')
        .select('role')
        .eq('campaign_id', id)
        .eq('user_id', userId)
        .eq('role', 'master')
        .single()

      if (checkError || !participant) {
        throw new Error('Apenas o mestre pode atualizar a campanha')
      }

      let imageUrl: string | null = null

      // Upload de nova imagem se houver
      if (data.image) {
        imageUrl = await this.uploadImage(
          data.image.buffer,
          data.image.originalname,
          userId
        )
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (data.name) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.systemRpg !== undefined) updateData.system_rpg = data.systemRpg
      if (data.tags) updateData.tags = data.tags
      // Nota: current_rank não existe na tabela campaigns, foi removido
      if (imageUrl) updateData.image_url = imageUrl

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache relacionado
      await deleteCache(getCampaignCacheKey({ campaignId: id }))
      await deleteCachePattern('campaigns:*')
      if (campaign.created_by) {
        await deleteCache(getCampaignCacheKey({ userId: campaign.created_by }))
      }

      return campaign
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating campaign')
      throw new Error('Erro ao atualizar campanha: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Deleta uma campanha (apenas mestre pode)
   */
  async deleteCampaign(id: string, userId: string) {
    try {
      // Verificar se campanha existe
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, created_by')
        .eq('id', id)
        .single()

      if (campaignError) {
        if (campaignError.code === 'PGRST116') {
          throw new Error('Campanha não encontrada')
        }
        throw campaignError
      }

      if (!campaign) {
        throw new Error('Campanha não encontrada')
      }

      // Verificar se usuário é mestre
      const { data: participant, error: checkError } = await supabase
        .from('campaign_participants')
        .select('role')
        .eq('campaign_id', id)
        .eq('user_id', userId)
        .eq('role', 'master')
        .single()

      if (checkError) {
        logger.error({ checkError, campaignId: id, userId }, 'Erro ao verificar permissão de mestre')
        if (checkError.code === 'PGRST116') {
          throw new Error('Apenas o mestre pode deletar a campanha')
        }
        throw checkError
      }

      if (!participant) {
        throw new Error('Apenas o mestre pode deletar a campanha')
      }

      // Deletar campanha (cascata vai deletar participantes, personagens, etc)
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (deleteError) {
        logger.error({ deleteError, campaignId: id }, 'Erro ao deletar campanha do banco')
        throw deleteError
      }

      // Invalidar cache relacionado
      await deleteCache(getCampaignCacheKey({ campaignId: id }))
      await deleteCachePattern('campaigns:*')
      if (campaign.created_by) {
        await deleteCache(getCampaignCacheKey({ userId: campaign.created_by }))
      }

      logger.info({ campaignId: id, userId }, 'Campanha deletada com sucesso')
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, campaignId: id, userId, errorCode: err.code, errorMessage: err.message }, 'Error deleting campaign')
      
      // Retornar mensagem mais específica
      if (err.message?.includes('não encontrada') || err.message?.includes('não pode')) {
        throw err
      }
      
      throw new Error('Erro ao deletar campanha: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Convida um jogador para a campanha
   */
  async invitePlayer(campaignId: string, masterId: string, email: string) {
    try {
      // Verificar se usuário é mestre
      const { data: participant, error: checkError } = await supabase
        .from('campaign_participants')
        .select('role')
        .eq('campaign_id', campaignId)
        .eq('user_id', masterId)
        .eq('role', 'master')
        .single()

      if (checkError || !participant) {
        throw new Error('Apenas o mestre pode convidar jogadores')
      }

      // Buscar usuário por email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) throw userError

      const invitedUser = users.users.find((u: { email?: string }) => u.email === email)

      if (!invitedUser) {
        throw new Error('Usuário não encontrado')
      }

      // Criar participante
      const { error: inviteError } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: invitedUser.id,
          role: 'player',
        })

      if (inviteError) throw inviteError

      return { success: true }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error inviting player')
      throw new Error('Erro ao convidar jogador: ' + (err.message || 'Erro desconhecido'))
    }
  },
}
