import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { SkillTraining } from '../types/ordemParanormal'

/**
 * Serviço para lógica de negócio de rolagem de dados
 */

/**
 * Parse e executa fórmula de dados
 * Suporta: XdY, XdY+Z, XdY-Z
 */
function parseDiceFormula(formula: string): {
  result: number
  details: number[]
  rolls: number[]
} {
  // Remover espaços
  formula = formula.trim().toLowerCase()

  // Regex para padrões: XdY, XdY+Z, XdY-Z
  const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/)

  if (!match) {
    throw new Error('Fórmula inválida. Use formato: XdY, XdY+Z ou XdY-Z')
  }

  const [, countStr, sidesStr, modifierStr] = match
  const count = parseInt(countStr, 10)
  const sides = parseInt(sidesStr, 10)
  const modifier = modifierStr ? parseInt(modifierStr, 10) : 0

  if (count < 1 || count > 100) {
    throw new Error('Quantidade de dados deve ser entre 1 e 100')
  }

  if (sides < 2 || sides > 1000) {
    throw new Error('Número de lados deve ser entre 2 e 1000')
  }

  // Rolar os dados
  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }

  // Calcular total
  const sum = rolls.reduce((acc, roll) => acc + roll, 0)
  const result = sum + modifier

  // Detalhes formatados
  const details = rolls.map((roll) => roll)
  if (modifier !== 0) {
    details.push(modifier > 0 ? modifier : modifier)
  }

  return {
    result,
    details: rolls,
    rolls,
  }
}

export const diceService = {
  /**
   * Rola dados baseado na fórmula
   */
  async rollDice(data: {
    formula: string
    userId: string
    campaignId: string
    sessionId?: string
    characterId?: string
    isPrivate?: boolean
  }) {
    try {
      // Parse e executa a fórmula
      const { result, rolls } = parseDiceFormula(data.formula)

      // Salvar no banco
      const { data: rollRecord, error } = await supabase
        .from('dice_rolls')
        .insert({
          campaign_id: data.campaignId,
          session_id: data.sessionId || null,
          user_id: data.userId,
          character_id: data.characterId || null,
          formula: data.formula,
          result,
          details: {
            rolls,
            modifier: data.formula.match(/[+-]\d+$/)
              ? parseInt(data.formula.match(/[+-]\d+$/)![0], 10)
              : 0,
          },
          is_private: data.isPrivate || false,
        })
        .select()
        .single()

      if (error) throw error

      return {
        ...rollRecord,
        details: rolls,
      }
    } catch (error: any) {
      logger.error({ error }, 'Error rolling dice')
      throw new Error('Erro ao rolar dados: ' + error.message)
    }
  },

  /**
   * Rola um teste de atributo (Ordem Paranormal)
   */
  async rollAttribute(data: {
    attributeValue: number
    skillBonus?: number
    advantageDice?: number
    userId: string
    campaignId: string
    sessionId?: string
    characterId?: string
    isPrivate?: boolean
    attributeName: string
  }) {
    // 1. Executar lógica do sistema
    const { ordemParanormalService } = await import('./ordemParanormalService')
    const rollResult = ordemParanormalService.rollAttributeTest(
      data.attributeValue,
      data.skillBonus || 0,
      data.advantageDice || 0
    )

    // 2. Salvar no banco
    const formula = `${data.attributeValue}d20` // Representação simplificada

    // Montar breakdown se não vier do service (o service já retorna, mas vamos garantir)
    // O service agora retorna 'breakdown' na string
    const breakdown = (rollResult as any).breakdown || `Rolagem de atributo ${data.attributeName}`

    const { data: rollRecord, error } = await supabase
      .from('dice_rolls')
      .insert({
        campaign_id: data.campaignId,
        session_id: data.sessionId || null,
        user_id: data.userId,
        character_id: data.characterId || null,
        formula: formula,
        result: rollResult.total,
        details: {
          rolls: rollResult.dice,
          selected: rollResult.selectedDice,
          bonus: rollResult.bonus,
          breakdown: breakdown,
          type: 'ATTRIBUTE',
          attribute: data.attributeName,
        },
        is_private: data.isPrivate || false,
      })
      .select()
      .single()

    if (error) throw error
    return rollRecord
  },

  /**
   * Rola um teste de perícia (Ordem Paranormal)
   */
  async rollSkill(data: {
    attributeValue: number
    training: SkillTraining
    flatBonus?: number
    diceMod?: number
    skillName: string
    userId: string
    campaignId: string
    sessionId?: string
    characterId?: string
    isPrivate?: boolean
  }) {
    // 1. Executar lógica do sistema
    const { ordemParanormalService } = await import('./ordemParanormalService')
    const rollResult = ordemParanormalService.rollSkillTest({
      attributeValue: data.attributeValue,
      training: data.training,
      flatBonus: data.flatBonus,
      diceMod: data.diceMod,
      skillName: data.skillName,
    })

    // 2. Salvar no banco
    const formula = `${data.skillName} (${data.training})`

    const { data: rollRecord, error } = await supabase
      .from('dice_rolls')
      .insert({
        campaign_id: data.campaignId,
        session_id: data.sessionId || null,
        user_id: data.userId,
        character_id: data.characterId || null,
        formula: formula,
        result: rollResult.total,
        details: {
          rolls: rollResult.dice,
          result: rollResult.result, // dado escolhido
          trainingBonus: rollResult.trainingBonus,
          flatBonus: rollResult.flatBonus,
          breakdown: rollResult.breakdown,
          type: 'SKILL',
          skill: data.skillName,
        },
        is_private: data.isPrivate || false,
      })
      .select()
      .single()

    if (error) throw error
    return rollRecord
  },

  /**
   * Busca histórico de rolagens
   */
  async getRollHistory(sessionId?: string, campaignId?: string, limit: number = 50) {
    try {
      let query = supabase
        .from('dice_rolls')
        .select(
          `
          *,
          user:users (
            id,
            username
          ),
          character:characters (
            id,
            name
          )
        `
        )
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error: any) {
      logger.error({ error }, 'Error fetching roll history')
      throw new Error('Erro ao buscar histórico: ' + error.message)
    }
  },
}

