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
   * Resolve e processa uma rolagem de perícia completa com autoridade do backend
   */
  async resolveSkillRoll(data: {
    characterId: string
    skillName: string
    userId: string
    campaignId: string
    sessionId?: string
    isPrivate?: boolean
    context?: string // Contexto opcional (ex: "Investigar cena")
  }) {
    try {
      // 1. Buscar dados completos do personagem (incluindo inventário e condições)
      // Import dinâmico para evitar dependência circular se houver
      const { characterService } = await import('./characterService')
      const character = await characterService.getCharacterById(data.characterId)

      const { getSkillDefinition } = await import('../data/skillsCatalog')
      const { ordemParanormalService } = await import('./ordemParanormalService')

      // 2. Buscar definição da perícia
      const skillDef = getSkillDefinition(data.skillName)
      if (!skillDef) {
        throw new Error(`Perícia '${data.skillName}' não encontrada no sistema.`)
      }

      // 3. Resolver Atributo Base
      // Por padrão usa o do catálogo, mas condições podem afetar
      // TODO: Permitir override se contexto exigir (ex: Luta com AGI) - por enquanto fixo
      const attributeName = skillDef.attribute
      const attributes = character.attributes as any
      let attributeValue = attributes[attributeName.toLowerCase()] || 0

      // 4. Resolver Nível de Treinamento
      const skills = character.skills as any
      const charSkill = skills[data.skillName]
      const training = charSkill ? charSkill.training : 'UNTRAINED'

      // 5. Validar restrição "Treinada Apenas"
      if (skillDef.trainedOnly && training === 'UNTRAINED') {
        throw new Error(`A perícia ${data.skillName} exige treinamento (Veterano/Expert/Treinado) para ser utilizada.`)
      }

      // 6. Calcular Modificadores (Dados e Bônus Fixo)
      const conditions = character.conditions || []
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)

      // Penalidades de Condições nos Dados
      // Abalado (-1D), Apavorado (-2D), etc.
      let diceMod = penalties.dicePenalty

      // Penalidades específicas de atributo
      // Ex: Fraco (-1 FOR, AGI, VIG) -> reduz o valor do atributo diretamente
      const attrKey = attributeName.toLowerCase() as keyof typeof penalties.attributePenalties
      const attrPenalty = penalties.attributePenalties[attrKey] || 0
      attributeValue += attrPenalty

      // Penalidades específicas de perícia (ex: Cego -2D Percepção)
      if (penalties.skillPenalties[data.skillName]) {
        diceMod += penalties.skillPenalties[data.skillName]
      }

      // Penalidade de Armadura (se aplicável)
      // TODO: Verificar se está usando armadura e aplicar penalidade se a perícia exige (acrobacia, crime, furtividade...)
      // Por simplificação agora, assumimos 0 ou implementamos checagem de inventário brevemente
      // if (skillDef.penaltyArmor) { ... check inventory for equipped items with penalty ... }

      // 7. Verificar Kits de Perícia
      let flatBonus = 0
      let missingKit = false

      if (skillDef.kitItems && skillDef.kitItems.length > 0) {
        // Verificar se tem algum dos itens necessários no inventário
        const inventory = character.inventory || []
        const hasKit = inventory.some((item: any) =>
          item && item.name && skillDef.kitItems?.some(kitName => item.name.toLowerCase().includes(kitName.toLowerCase()))
        )

        if (!hasKit) {
          flatBonus -= 5 // Penalidade sem kit
          missingKit = true
        }
      }

      // 8. Executar Rolagem (ordemParanormalService)
      const rollResult = ordemParanormalService.rollSkillTest({
        attributeValue, // Atributo já penalizado (Fraco/Debilitado afetam o valor base)
        training,
        flatBonus,
        diceMod, // Modificadores de dados extras (Abalado, Cego, etc.)
        skillName: data.skillName
      })

      // 9. Montar Breakdown Rico
      let richBreakdown = `**${data.skillName}**\n`

      // Linha 1: Atributo
      const attrBase = (attributes[attributeName.toLowerCase()] || 0)
      const attrFinal = attributeValue
      richBreakdown += `Atributo (${attributeName}): ${attrBase}`
      if (attrPenalty !== 0) richBreakdown += ` ${attrPenalty > 0 ? '+' : ''}${attrPenalty} (Condição)`
      richBreakdown += ` = ${attrFinal}d20\n`

      // Linha 2: Treinamento
      const trainingBonus = ordemParanormalService.calculateSkillBonus(training)
      richBreakdown += `Treinamento: ${training} (+${trainingBonus})\n`

      // Linha 3: Outros
      if (missingKit) richBreakdown += `Kit: Ausente (-5)\n`
      if (diceMod !== 0) richBreakdown += `Dados Extras: ${diceMod > 0 ? '+' : ''}${diceMod}d20\n`

      richBreakdown += `\nResultado: [${rollResult.dice.join(', ')}] ${rollResult.dice.length > 1 ? `(Escolhe ${rollResult.result})` : ''}`
      richBreakdown += ` + ${trainingBonus + flatBonus} = **${rollResult.total}**`

      // 10. Salvar no Banco (Dice Rolls)
      const formula = `${attrFinal}d20 + ${trainingBonus + flatBonus}`

      const { data: rollRecord, error } = await supabase
        .from('dice_rolls')
        .insert({
          campaign_id: data.campaignId,
          session_id: data.sessionId || null,
          user_id: data.userId,
          character_id: data.characterId,
          formula: formula,
          result: rollResult.total,
          details: {
            rolls: rollResult.dice,
            result: rollResult.result,
            trainingBonus,
            flatBonus,
            breakdown: richBreakdown, // Breakdown formatado
            type: 'SKILL',
            skill: data.skillName,
            attribute: attributeName,
            training: training,
            missingKit: missingKit
          },
          is_private: data.isPrivate || false
        })
        .select()
        .single()

      if (error) throw error

      return {
        ...rollRecord,
        breakdown: richBreakdown, // Retornar para exibição imediata
        validation: {
          allowed: true,
          trainedOnly: skillDef.trainedOnly,
          missingKit: missingKit
        }
      }

    } catch (error: any) {
      logger.error({ error, ...data }, 'Error calculating skill roll')
      throw new Error(error.message || 'Erro ao processar rolagem de perícia')
    }
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

