import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de momentos da campanha
 */
export const momentService = {
  /**
   * Obtém momentos de uma campanha
   */
  async getCampaignMoments(campaignId: string) {
    // TODO: Implementar busca no Supabase
    return []
  },

  /**
   * Cria um novo momento
   */
  async createMoment(data: any) {
    // TODO: Implementar criação no Supabase
    return { id: '1', ...data }
  },

  /**
   * Deleta um momento
   */
  async deleteMoment(id: string) {
    // TODO: Implementar deleção no Supabase
  },
}

