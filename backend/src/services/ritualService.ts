/**
 * Serviço para gerenciamento de rituais paranormais
 */
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'
import { ordemParanormalService } from './ordemParanormalService'
import { characterResourcesService } from './character/characterResourcesService'
import { deleteCache, getCharacterCacheKey } from './cache'
import { Ritual, CharacterRitual, RitualCircle, RitualElement } from '../types/ordemParanormal'

export const ritualService = {
  /**
   * Lista todos os rituais do sistema
   * @param filters - Filtros opcionais (circulo, elemento)
   */
  async getRituals(filters?: { circle?: RitualCircle; element?: RitualElement }) {
    try {
      let query = supabase.from('rituals').select('*')

      if (filters?.circle) {
        query = query.eq('circle', filters.circle)
      }
      if (filters?.element) {
        query = query.eq('element', filters.element)
      }

      const { data, error } = await query.order('circle', { ascending: true }).order('name')

      if (error) throw error

      return (data || []) as Ritual[]
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching rituals')
      throw new Error('Erro ao buscar rituais: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Busca um ritual específico por ID
   */
  async getRitualById(id: string) {
    try {
      const { data, error } = await supabase.from('rituals').select('*').eq('id', id).single()

      if (error) throw error
      return data as Ritual
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, id }, 'Error fetching ritual by id')
      throw new Error('Erro ao buscar ritual: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Retorna os rituais aprendidos por um personagem
   */
  async getCharacterRituals(characterId: string) {
    try {
      const { data, error } = await supabase
        .from('character_rituals')
        .select(`
          *,
          ritual:rituals (*)
        `)
        .eq('character_id', characterId)

      if (error) throw error

      // Transformar para formato mais limpo se necessário, ou retornar direto
      return (data || []) as CharacterRitual[]
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId }, 'Error fetching character rituals')
      throw new Error('Erro ao buscar grimório: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Adiciona um ritual ao grimório do personagem (Aprender Ritual)
   */
  async learnRitual(characterId: string, ritualId: string) {
    try {
      // Verificar se já possui
      const { data: existing } = await supabase
        .from('character_rituals')
        .select('*')
        .eq('character_id', characterId)
        .eq('ritual_id', ritualId)
        .single()

      if (existing) {
        throw new Error('Personagem já conhece este ritual.')
      }

      const { data, error } = await supabase
        .from('character_rituals')
        .insert({
          character_id: characterId,
          ritual_id: ritualId,
          mode_unlocked: 'NORMAL' // Padrão ao aprender
        })
        .select()
        .single()

      if (error) throw error

      await deleteCache(getCharacterCacheKey({ characterId }))

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, ritualId }, 'Error learning ritual')
      throw new Error('Erro ao aprender ritual: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Remove um ritual do grimório (Esquecer Ritual)
   */
  async forgetRitual(characterId: string, ritualId: string) {
    try {
      const { error } = await supabase
        .from('character_rituals')
        .delete()
        .eq('character_id', characterId)
        .eq('ritual_id', ritualId)

      if (error) throw error

      await deleteCache(getCharacterCacheKey({ characterId }))
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, ritualId }, 'Error forgetting ritual')
      throw new Error('Erro ao esquecer ritual: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Conjura um ritual para o personagem
   * Sequência: Validar → Custo PE → Limite Turno → Gastar PE → Teste Custo → Atualizar Status
   */
  async conjureRitual(
    characterId: string,
    ritualId: string,
    mode: 'NORMAL' | 'DISCIPLE' | 'TRUE' = 'NORMAL',
    peSpentThisTurn: number = 0
  ) {
    try {
      // 1. Buscar Personagem e Ritual
      const [charResult, ritualResult] = await Promise.all([
        supabase.from('characters').select('*').eq('id', characterId).single(),
        supabase.from('rituals').select('*').eq('id', ritualId).single()
      ])

      if (charResult.error) throw charResult.error
      if (ritualResult.error) throw ritualResult.error

      const character = charResult.data
      const ritual = ritualResult.data as Ritual

      // 2. Validar Possibilidade de Conjuração (Regras)
      const validation = ordemParanormalService.validateRitualCasting(character, ritual, mode)
      if (!validation.success) {
        throw new Error(validation.error)
      }

      // 3. Calcular Custo
      const cost = ordemParanormalService.calculateRitualCost(ritual, mode)

      // 4. Validar PE Disponível
      const currentPE = character.stats.pe.current
      if (currentPE < cost) {
        throw new Error(`PE Insuficiente. Custo: ${cost}, Disponível: ${currentPE}.`)
      }

      // 5. Validar Limite de PE por Turno
      const nex = character.stats.nex || 5
      const maxPeTurn = ordemParanormalService.getMaxPETurn(nex)
      const totalPeThisTurn = peSpentThisTurn + cost

      if (totalPeThisTurn > maxPeTurn) {
        throw new Error(
          `Limite de PE excedido (${maxPeTurn}). Gasto: ${peSpentThisTurn} + ${cost} = ${totalPeThisTurn}.`
        )
      }

      // 6. Gastar PE
      await characterResourcesService.spendPE(characterId, cost)

      // 7. Rolar Teste de Custo (Ocultismo)
      const testResult = ordemParanormalService.rollRitualCostTest(character, cost)

      // 8. Aplicar Consequências (Perda de Sanidade)
      let sanLoss = 0
      let sanMaxLoss = 0
      let message = ''

      if (testResult.success) {
        message = `Ritual ${ritual.name} conjurado com sucesso!`
      } else {
        // Falha: Perde SAN igual ao custo
        sanLoss = cost

        if (testResult.criticalFailure) {
          sanMaxLoss = 1
          message = `FALHA CRÍTICA! Perdeu ${sanLoss} SAN e 1 SAN Máxima permanente.`
        } else {
          message = `Falha no teste de custo. Perdeu ${sanLoss} SAN.`
        }

        // Aplicar dano mental
        await characterResourcesService.updateSAN(characterId, -sanLoss, true)

        // Se houve perda permanente
        if (sanMaxLoss > 0) {
          const currentSanMax = character.stats.san.max
          const newSanMax = Math.max(0, currentSanMax - sanMaxLoss)

          await supabase.from('characters').update({
            stats: {
              ...character.stats,
              san: { ...character.stats.san, max: newSanMax }
            }
          }).eq('id', characterId)
        }
      }

      // Invalidar cache do personagem
      await deleteCache(getCharacterCacheKey({ characterId }))

      return {
        success: testResult.success,
        ritual,
        cost,
        roll: testResult,
        sanLoss,
        sanMaxLoss,
        message
      }

    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, ritualId }, 'Error conjuring ritual')
      throw new Error('Erro ao conjurar ritual: ' + (err.message || 'Erro desconhecido'))
    }
  },

  // Mantendo compatibilidade com código antigo se necessário, mas redirecionando erro
  async conjureRitualWithCost(characterId: string, cost: number, peSpentThisTurn: number = 0) {
    throw new Error('Deprecated: Use conjureRitual with ritualId instead.')
  }
}

