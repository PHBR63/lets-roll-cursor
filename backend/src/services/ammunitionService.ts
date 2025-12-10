/**
 * Serviço para gerenciamento de munição abstrata por cena
 * Sistema Ordem Paranormal: munição não é rastreada individualmente,
 * mas sim de forma abstrata por cena/sessão
 */
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'

type AmmoState = 'CHEIO' | 'ESTAVEL' | 'BAIXO' | 'ESGOTADO'
type AmmoMode = 'A' | 'B'

const STATE_ORDER: AmmoState[] = ['CHEIO', 'ESTAVEL', 'BAIXO', 'ESGOTADO']
const DEFAULT_ATTACKS_PER_SPEND: Record<string, number> = {
  pistol: 3,
  revolver: 2,
  rifle: 2,
  shotgun: 1,
  smg: 2,
}

export interface AmmunitionState {
  id?: string
  characterId: string
  sessionId: string
  weaponId?: string | null
  state: AmmoState
  mode: AmmoMode
  attacksPerSpend?: number | null
  progress: number
  reloadToFull: boolean
  lastUpdated: string
}

interface SpendOptions {
  mode?: AmmoMode
  attacksPerSpend?: number | null
  attacksUsed?: number // apenas modo B: quantos ataques neste gasto
}

export const ammunitionService = {
  /**
   * Normaliza registro do banco para o formato esperado
   */
  normalizeRecord(record: any): AmmunitionState {
    return {
      id: record?.id,
      characterId: record?.character_id,
      sessionId: record?.session_id,
      weaponId: record?.weapon_id ?? null,
      state: (record?.state as AmmoState) || 'CHEIO',
      mode: (record?.mode as AmmoMode) || 'A',
      attacksPerSpend: record?.attacks_per_spend ?? null,
      progress: record?.progress ?? 0,
      reloadToFull: record?.reload_to_full ?? true,
      lastUpdated: record?.updated_at,
    }
  },

  /**
   * Obtém estado de munição (cria se não existir)
   */
  async getAmmunitionState(
    characterId: string,
    sessionId: string,
    weaponId?: string | null
  ): Promise<AmmunitionState> {
    try {
      const { data, error } = await supabase
        .from('session_ammunition')
        .select('*')
        .eq('character_id', characterId)
        .eq('session_id', sessionId)
        .eq('weapon_id', weaponId ?? null)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) {
        return await this.initializeAmmunition(characterId, sessionId, weaponId ?? null)
      }

      return this.normalizeRecord(data)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, weaponId }, 'Error getting ammunition state')
      throw new Error('Erro ao obter estado de munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Inicializa estado de munição para personagem na sessão/arma
   */
  async initializeAmmunition(
    characterId: string,
    sessionId: string,
    weaponId: string | null = null,
    initialState: AmmoState = 'CHEIO',
    mode: AmmoMode = 'A',
    attacksPerSpend?: number | null,
    reloadToFull: boolean = true
  ): Promise<AmmunitionState> {
    try {
      const { data, error } = await supabase
        .from('session_ammunition')
        .insert({
          character_id: characterId,
          session_id: sessionId,
          weapon_id: weaponId,
          state: initialState,
          mode,
          attacks_per_spend: attacksPerSpend ?? null,
          progress: 0,
          reload_to_full: reloadToFull,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return this.normalizeRecord(data)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, weaponId, initialState }, 'Error initializing ammunition')
      throw new Error('Erro ao inicializar munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Gasta munição (degrada um nível de estado).
   * - Modo A: 1 gasto por cena (call direto).
   * - Modo B: usar attacksUsed; acumula progress e degrada quando atingir attacksPerSpend.
   */
  async spendAmmunition(
    characterId: string,
    sessionId: string,
    weaponId: string | null = null,
    options?: SpendOptions
  ): Promise<AmmunitionState> {
    try {
      const current = await this.getAmmunitionState(characterId, sessionId, weaponId)

      // Aplicar override de modo/config se enviados
      const mode: AmmoMode = options?.mode || current.mode || 'A'
      const attacksPerSpend =
        options?.attacksPerSpend ??
        current.attacksPerSpend ??
        null

      let progress = current.progress || 0
      let stateIndex = STATE_ORDER.indexOf(current.state || 'CHEIO')

      if (stateIndex < 0) stateIndex = 0
      if (stateIndex >= STATE_ORDER.length - 1 && mode === 'A') {
        return current // já esgotado
      }

      if (mode === 'A') {
        // Gasta um nível
        stateIndex = Math.min(stateIndex + 1, STATE_ORDER.length - 1)
      } else {
        // Modo B: acumula ataques e gasta quando chegar no limite
        const attacksUsed = options?.attacksUsed ?? 1
        const required = attacksPerSpend || DEFAULT_ATTACKS_PER_SPEND['pistol'] // fallback seguro
        progress += attacksUsed
        while (progress >= required && stateIndex < STATE_ORDER.length - 1) {
          progress -= required
          stateIndex++
        }
      }

      const newState = STATE_ORDER[stateIndex] as AmmoState

      const { data, error } = await supabase
        .from('session_ammunition')
        .update({
          state: newState,
          mode,
          attacks_per_spend: attacksPerSpend,
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq('character_id', characterId)
        .eq('session_id', sessionId)
        .eq('weapon_id', weaponId ?? null)
        .select()
        .single()

      if (error) throw error

      logger.info(
        { characterId, sessionId, weaponId, oldState: current.state, newState, mode, progress },
        'Ammunition spent'
      )

      return this.normalizeRecord(data)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, weaponId, options }, 'Error spending ammunition')
      throw new Error('Erro ao gastar munição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Recarrega munição (reseta estado)
   */
  async reloadAmmunition(
    characterId: string,
    sessionId: string,
    weaponId: string | null = null,
    reloadToFull?: boolean
  ): Promise<AmmunitionState> {
    try {
      const current = await this.getAmmunitionState(characterId, sessionId, weaponId)
      const toFull = reloadToFull ?? current.reloadToFull ?? true
      const newState: AmmoState = toFull ? 'CHEIO' : 'ESTAVEL'

      const { data, error } = await supabase
        .from('session_ammunition')
        .update({
          state: newState,
          progress: 0,
          reload_to_full: toFull,
          updated_at: new Date().toISOString(),
        })
        .eq('character_id', characterId)
        .eq('session_id', sessionId)
        .eq('weapon_id', weaponId ?? null)
        .select()
        .single()

      if (error) throw error

      logger.info(
        { characterId, sessionId, weaponId, oldState: current.state, newState },
        'Ammunition reloaded'
      )

      return this.normalizeRecord(data)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, sessionId, weaponId }, 'Error reloading ammunition')
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

