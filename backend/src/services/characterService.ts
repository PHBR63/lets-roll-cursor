import { supabase } from '../config/supabase'

/**
 * Serviço para lógica de negócio de personagens
 */
export const characterService = {
  /**
   * Obtém personagens baseado em filtros
   */
  async getCharacters(filters: any) {
    // TODO: Implementar busca no Supabase
    return []
  },

  /**
   * Cria um novo personagem
   */
  async createCharacter(userId: string, data: any) {
    // TODO: Implementar criação no Supabase
    return { id: '1', ...data, userId }
  },

  /**
   * Obtém personagem por ID
   */
  async getCharacterById(id: string) {
    // TODO: Implementar busca no Supabase
    return { id, name: 'Test Character' }
  },

  /**
   * Atualiza um personagem
   */
  async updateCharacter(id: string, data: any) {
    // TODO: Implementar atualização no Supabase
    return { id, ...data }
  },

  /**
   * Deleta um personagem
   */
  async deleteCharacter(id: string) {
    // TODO: Implementar deleção no Supabase
  },
}

