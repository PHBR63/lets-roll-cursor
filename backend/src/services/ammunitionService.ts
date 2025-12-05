/**
 * Serviço para gerenciamento de munição abstrata por cena
 * Sistema Ordem Paranormal: munição não é rastreada individualmente,
 * mas sim de forma abstrata por cena/sessão
 */
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'

export interface AmmunitionState {
  characterId: string
  sessionId: string
  ammunition: number // Munição abstrata restante (0-100, onde 100 = totalmente abastecido)
  lastUpdated: string
}

export const ammunitionService = {
  /**
   * Obtém estado de munição do personagem na sessão
   * @param characterId - ID do personagem
   * @param sessionId - ID da sessão
   * @returns Estado de munição (0-100)
   */
  async getAmmunitionState(characterId: string, sessionId: string): Promise<AmmunitionState> {
    try {
      const { data, error } = await supabase
        .from('session_ammunition')
        .select('*')
        .eq('character_id', characterId)
        .eq('session_id', sessionId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = não encontrado, é OK
        throw error
      }

      // Se não existe, criar estado inicial (100 = totalmente abastecido)
      if (!data) {
        return await this.initializeAmmunition(characterId, sessionId)
      }

      return {
        characterId: data.character_id,
        sessionId: data.session_id,
        ammunition: data.ammunition || 100,
        lastUpdated: data.updated_at,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId }, 'Error getting ammunition state')
      throw new Error('Erro ao obter estado de munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Inicializa estado de munição para personagem na sessão
   * @param characterId - ID do personagem
   * @param sessionId - ID da sessão
   * @param initialAmmo - Munição inicial (padrão: 100 = totalmente abastecido)
   * @returns Estado de munição criado
   */
  async initializeAmmunition(
    characterId: string,
    sessionId: string,
    initialAmmo: number = 100
  ): Promise<AmmunitionState> {
    try {
      const { data, error } = await supabase
        .from('session_ammunition')
        .insert({
          character_id: characterId,
          session_id: sessionId,
          ammunition: Math.max(0, Math.min(100, initialAmmo)), // Clamp entre 0 e 100
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return {
        characterId: data.character_id,
        sessionId: data.session_id,
        ammunition: data.ammunition,
        lastUpdated: data.updated_at,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, initialAmmo }, 'Error initializing ammunition')
      throw new Error('Erro ao inicializar munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Gasta munição abstrata (ao usar arma de fogo)
   * @param characterId - ID do personagem
   * @param sessionId - ID da sessão
   * @param amount - Quantidade a gastar (padrão: 1)
   * @returns Novo estado de munição
   */
  async spendAmmunition(
    characterId: string,
    sessionId: string,
    amount: number = 1
  ): Promise<AmmunitionState> {
    try {
      const currentState = await this.getAmmunitionState(characterId, sessionId)
      const newAmmunition = Math.max(0, currentState.ammunition - amount)

      const { data, error } = await supabase
        .from('session_ammunition')
        .update({
          ammunition: newAmmunition,
          updated_at: new Date().toISOString(),
        })
        .eq('character_id', characterId)
        .eq('session_id', sessionId)
        .select()
        .single()

      if (error) throw error

      logger.info(
        { characterId, sessionId, oldAmmo: currentState.ammunition, newAmmo: newAmmunition },
        'Ammunition spent'
      )

      return {
        characterId: data.character_id,
        sessionId: data.session_id,
        ammunition: data.ammunition,
        lastUpdated: data.updated_at,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, amount }, 'Error spending ammunition')
      throw new Error('Erro ao gastar munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Recarrega munição (ação de recarregar)
   * @param characterId - ID do personagem
   * @param sessionId - ID da sessão
   * @param amount - Quantidade a recarregar (padrão: 50, pode ser ajustado)
   * @returns Novo estado de munição
   */
  async reloadAmmunition(
    characterId: string,
    sessionId: string,
    amount: number = 50
  ): Promise<AmmunitionState> {
    try {
      const currentState = await this.getAmmunitionState(characterId, sessionId)
      const newAmmunition = Math.min(100, currentState.ammunition + amount)

      const { data, error } = await supabase
        .from('session_ammunition')
        .update({
          ammunition: newAmmunition,
          updated_at: new Date().toISOString(),
        })
        .eq('character_id', characterId)
        .eq('session_id', sessionId)
        .select()
        .single()

      if (error) throw error

      logger.info(
        { characterId, sessionId, oldAmmo: currentState.ammunition, newAmmo: newAmmunition },
        'Ammunition reloaded'
      )

      return {
        characterId: data.character_id,
        sessionId: data.session_id,
        ammunition: data.ammunition,
        lastUpdated: data.updated_at,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, amount }, 'Error reloading ammunition')
      throw new Error('Erro ao recarregar munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Define munição manualmente (para ajustes do mestre)
   * @param characterId - ID do personagem
   * @param sessionId - ID da sessão
   * @param amount - Nova quantidade de munição (0-100)
   * @returns Novo estado de munição
   */
  async setAmmunition(
    characterId: string,
    sessionId: string,
    amount: number
  ): Promise<AmmunitionState> {
    try {
      const clampedAmount = Math.max(0, Math.min(100, amount))

      const { data, error } = await supabase
        .from('session_ammunition')
        .upsert(
          {
            character_id: characterId,
            session_id: sessionId,
            ammunition: clampedAmount,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'character_id,session_id',
          }
        )
        .select()
        .single()

      if (error) throw error

      return {
        characterId: data.character_id,
        sessionId: data.session_id,
        ammunition: data.ammunition,
        lastUpdated: data.updated_at,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, amount }, 'Error setting ammunition')
      throw new Error('Erro ao definir munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Reseta munição para todos os personagens na sessão (nova cena)
   * @param sessionId - ID da sessão
   * @param resetTo - Valor para resetar (padrão: 100)
   */
  async resetSessionAmmunition(sessionId: string, resetTo: number = 100): Promise<void> {
    try {
      const { error } = await supabase
        .from('session_ammunition')
        .update({
          ammunition: Math.max(0, Math.min(100, resetTo)),
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)

      if (error) throw error

      logger.info({ sessionId, resetTo }, 'Session ammunition reset')
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, sessionId, resetTo }, 'Error resetting session ammunition')
      throw new Error('Erro ao resetar munição da sessão: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

