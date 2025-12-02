import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de campanhas
 */
export const campaignService = {
  /**
   * Obtém todas as campanhas do usuário (como mestre ou jogador)
   */
  async getUserCampaigns(userId: string) {
    try {
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

      return data?.map((p: any) => ({
        ...p.campaign,
        role: p.role,
      })) || []
    } catch (error: any) {
      console.error('Error fetching user campaigns:', error)
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
          console.warn('Bucket não encontrado. Configure o bucket "campaign-images" no Supabase.')
          throw new Error('Bucket de imagens não configurado')
        }
        throw error
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('campaign-images').getPublicUrl(data.path)

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw new Error('Erro ao fazer upload da imagem: ' + error.message)
    }
  },

  /**
   * Cria uma nova campanha
   */
  async createCampaign(userId: string, data: any) {
    try {
      let imageUrl: string | null = null

      // Upload de imagem se houver
      if (data.image) {
        imageUrl = await this.uploadImage(
          data.image.buffer,
          data.image.originalname,
          userId
        )
      }

      // Criar campanha
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: data.title,
          description: data.description,
          image_url: imageUrl,
          system_rpg: data.systemRpg || null,
          tags: data.tags || [],
          status: 'active',
          created_by: userId,
        })
        .select()
        .single()

      if (campaignError) throw campaignError

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
      
      return campaign
    } catch (error: any) {
      console.error('Error creating campaign:', error)
      throw new Error('Erro ao criar campanha: ' + error.message)
    }
  },

  /**
   * Obtém campanha por ID com participantes
   */
  async getCampaignById(id: string) {
    try {
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

      return {
        ...campaign,
        participants: participants || [],
      }
    } catch (error: any) {
      console.error('Error fetching campaign:', error)
      throw new Error('Erro ao buscar campanha')
    }
  },

  /**
   * Atualiza uma campanha (apenas mestre pode)
   */
  async updateCampaign(id: string, userId: string, data: any) {
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

      let imageUrl: string | null = undefined

      // Upload de nova imagem se houver
      if (data.image) {
        imageUrl = await this.uploadImage(
          data.image.buffer,
          data.image.originalname,
          userId
        )
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.title) updateData.name = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.systemRpg !== undefined) updateData.system_rpg = data.systemRpg
      if (data.tags) updateData.tags = data.tags
      if (imageUrl) updateData.image_url = imageUrl

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return campaign
    } catch (error: any) {
      console.error('Error updating campaign:', error)
      throw new Error('Erro ao atualizar campanha: ' + error.message)
    }
  },

  /**
   * Deleta uma campanha (apenas mestre pode)
   */
  async deleteCampaign(id: string, userId: string) {
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
        throw new Error('Apenas o mestre pode deletar a campanha')
      }

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting campaign:', error)
      throw new Error('Erro ao deletar campanha: ' + error.message)
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

      const invitedUser = users.users.find((u: any) => u.email === email)

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
    } catch (error: any) {
      console.error('Error inviting player:', error)
      throw new Error('Erro ao convidar jogador: ' + error.message)
    }
  },
}
