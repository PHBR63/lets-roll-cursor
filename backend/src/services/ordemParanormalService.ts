import {
  Attributes,
  CharacterClass,
  CharacterStats,
  ClassConfig,
  CLASS_CONFIGS,
  Condition,
  SkillTraining,
  TRAINING_BONUS,
} from '../types/ordemParanormal'
import {
  getUnlockedAbilities as getUnlockedClassAbilities,
  getNewlyUnlockedAbilities as getNewlyUnlockedClassAbilities,
  ClassAbility,
} from '../types/classAbilities'
import { Ritual, RitualCostConfig, RitualCircle, CharacterRitual, ParanormalElement } from '../types/ordemParanormal'

/**
 * Serviço para cálculos e mecânicas do sistema Ordem Paranormal RPG
 */
export const ordemParanormalService = {
  /**
   * Calcula Pontos de Vida máximos baseado em classe, Vigor e NEX
   * @param characterClass - Classe do personagem
   * @param vig - Valor de Vigor
   * @param nex - Nível de Exposição (0-99)
   * @returns PV máximo
   */
  calculateMaxPV(characterClass: CharacterClass, vig: number, nex: number): number {
    const config = CLASS_CONFIGS[characterClass]
    const nexLevels = Math.floor(nex / 5) // Cada 5% de NEX = 1 nível
    return config.pvInitial + vig + (config.pvPerNex + vig) * nexLevels
  },

  /**
   * Calcula Sanidade máxima baseado em classe e NEX
   * @param characterClass - Classe do personagem
   * @param nex - Nível de Exposição (0-99)
   * @returns SAN máxima
   */
  calculateMaxSAN(characterClass: CharacterClass, nex: number): number {
    const config = CLASS_CONFIGS[characterClass]
    const nexLevels = Math.floor(nex / 5)
    return config.sanInitial + config.sanPerNex * nexLevels
  },

  /**
   * Calcula Pontos de Esforço máximos baseado em classe, Presença e NEX
   * @param characterClass - Classe do personagem
   * @param pre - Valor de Presença
   * @param nex - Nível de Exposição (0-99)
   * @returns PE máximo
   */
  calculateMaxPE(characterClass: CharacterClass, pre: number, nex: number): number {
    const config = CLASS_CONFIGS[characterClass]
    const nexLevels = Math.floor(nex / 5)
    return config.peInitial + pre + (config.pePerNex + pre) * nexLevels
  },

  /**
   * Calcula Defesa base do personagem
   * @param agi - Valor de Agilidade
   * @param equipmentBonus - Bônus de equipamentos (opcional)
   * @returns Defesa total
   */
  calculateDefense(agi: number, equipmentBonus: number = 0): number {
    return 10 + agi + equipmentBonus
  },

  /**
   * Calcula bônus de perícia baseado no nível de treinamento
   * @param training - Nível de treinamento
   * @returns Bônus numérico
   */
  calculateSkillBonus(training: SkillTraining): number {
    return TRAINING_BONUS[training]
  },

  /**
   * Valida atributos na criação de personagem conforme regras do Ordem Paranormal
   * Regras:
   * - Soma total deve ser 9 (5 base + 4 pontos distribuídos)
   * - Nenhum atributo pode exceder 3
   * - Máximo 1 atributo pode ser 0 (reduzir um atributo para 0 dá +1 ponto extra)
   * @param attributes - Atributos do personagem
   * @throws Error se validação falhar
   */
  validateCreationAttributes(attributes: Attributes): void {
    const { agi, for: forAttr, int, pre, vig } = attributes

    // Validar soma total (deve ser 9: 5 base + 4 distribuídos)
    const totalAttributes = agi + forAttr + int + pre + vig
    if (totalAttributes !== 9) {
      throw new Error(
        `Soma de atributos inválida: ${totalAttributes}. A soma deve ser exatamente 9 (5 base + 4 pontos distribuídos).`
      )
    }

    // Validar máximo inicial de 3 por atributo
    const attributeValues = [agi, forAttr, int, pre, vig]
    const exceedsMax = attributeValues.some(attr => attr > 3)
    if (exceedsMax) {
      throw new Error('Nenhum atributo pode exceder 3 na criação de personagem.')
    }

    // Validar que apenas um atributo pode ser 0 (se houver)
    const zeroCount = attributeValues.filter(attr => attr === 0).length
    if (zeroCount > 1) {
      throw new Error('Apenas um atributo pode ser reduzido para 0 na criação.')
    }
  },

  /**
   * Verifica se um nível de treinamento de perícia é permitido para o NEX do personagem
   * Regras do Ordem Paranormal:
   * - UNTRAINED e TRAINED: sempre permitidos
   * - COMPETENT (Veterano): requer NEX >= 35%
   * - EXPERT: requer NEX >= 70%
   * @param training - Nível de treinamento
   * @param nex - Nível de Exposição (0-99)
   * @returns true se o treinamento é permitido para o NEX
   */
  canUseSkillTraining(training: SkillTraining, nex: number): boolean {
    if (training === 'UNTRAINED' || training === 'TRAINED') {
      return true
    }
    if (training === 'COMPETENT') {
      return nex >= 35
    }
    if (training === 'EXPERT') {
      return nex >= 70
    }
    return false
  },

  /**
   * Tabela de limites de PE por turno baseado em NEX
   * Conforme regras do Ordem Paranormal RPG
   */
  PE_TURN_LIMITS: [
    { nex: 5, maxPE: 1 },
    { nex: 10, maxPE: 2 },
    { nex: 15, maxPE: 2 },
    { nex: 20, maxPE: 3 },
    { nex: 25, maxPE: 3 },
    { nex: 30, maxPE: 4 },
    { nex: 35, maxPE: 4 },
    { nex: 40, maxPE: 5 },
    { nex: 45, maxPE: 5 },
    { nex: 50, maxPE: 6 },
    { nex: 55, maxPE: 6 },
    { nex: 60, maxPE: 7 },
    { nex: 65, maxPE: 7 },
    { nex: 70, maxPE: 8 },
    { nex: 75, maxPE: 8 },
    { nex: 80, maxPE: 9 },
    { nex: 85, maxPE: 9 },
    { nex: 90, maxPE: 10 },
    { nex: 95, maxPE: 10 },
    { nex: 99, maxPE: 10 },
  ],

  /**
   * Retorna o limite máximo de PE que pode ser gasto por turno baseado no NEX
   * @param nex - Nível de Exposição (0-99)
   * @returns Limite máximo de PE por turno
   */
  getMaxPETurn(nex: number): number {
    // Encontrar a entrada mais próxima (maior ou igual) na tabela
    const limits = ordemParanormalService.PE_TURN_LIMITS

    // Se NEX for menor que o mínimo, retornar limite mínimo
    if (nex < limits[0].nex) {
      return limits[0].maxPE
    }

    // Buscar o limite correspondente (maior NEX que seja <= ao NEX fornecido)
    for (let i = limits.length - 1; i >= 0; i--) {
      if (nex >= limits[i].nex) {
        return limits[i].maxPE
      }
    }

    // Fallback: retornar limite máximo
    return limits[limits.length - 1].maxPE
  },

  /**
   * Rola teste de atributo conforme regras do sistema Ordem Paranormal
   * Regra de Ouro: Rola uma quantidade de d20 igual ao valor do atributo base
   * Escolhe o maior valor (exceto quando atributo = 0, que escolhe o menor)
   * 
   * @param attributeValue - Valor do atributo base
   * @param skillBonus - Bônus de perícia (Destreinado +0, Treinado +5, Veterano +10, Expert +15)
   * @param advantageDice - Bônus/penalidade de dados (+1d20 ou -1d20)
   * @returns Resultado da rolagem
   */
  rollAttributeTest(
    attributeValue: number,
    skillBonus: number = 0,
    advantageDice: number = 0
  ): {
    dice: number[]
    result: number
    bonus: number
    total: number
    advantage: boolean
    disadvantage: boolean
    selectedDice: number // Dado escolhido (maior ou menor)
  } {
    let diceCount: number
    let advantage = false
    let disadvantage = false

    if (attributeValue > 0) {
      // Atributo positivo: rola N dados (N = atributo), escolhe o MAIOR
      diceCount = attributeValue
      advantage = true
    } else if (attributeValue === 0) {
      // Atributo zero: rola 2d20, escolhe o MENOR (regra especial)
      diceCount = 2
      disadvantage = true
    } else {
      // Atributo negativo: rola |N| dados, escolhe o MENOR
      diceCount = Math.abs(attributeValue)
      disadvantage = true
    }

    // Aplicar vantagem/desvantagem de dados
    diceCount = Math.max(0, diceCount + advantageDice)

    // Se penalidade reduzir dados a zero ou menos, aplicar regra do atributo 0
    if (diceCount <= 0) {
      diceCount = 2
      disadvantage = true
      advantage = false
    }

    // Rolar os dados (sempre d20)
    const dice: number[] = []
    for (let i = 0; i < diceCount; i++) {
      dice.push(Math.floor(Math.random() * 20) + 1)
    }

    // Determinar resultado conforme regras
    let selectedDice: number
    if (advantage && !disadvantage) {
      // Atributo > 0: escolhe o MAIOR
      selectedDice = Math.max(...dice)
    } else {
      // Atributo = 0 ou < 0: escolhe o MENOR
      selectedDice = Math.min(...dice)
    }

    // Resultado final = maior/menor dado + bônus de perícia
    const total = selectedDice + skillBonus

    return {
      dice,
      result: selectedDice, // Valor do dado escolhido (sem bônus)
      bonus: skillBonus,
      total, // Resultado final (dado + bônus)
      advantage,
      disadvantage,
      selectedDice, // Dado escolhido para referência
    }
  },

  /**
   * Rola teste de ataque conforme regras do sistema Ordem Paranormal
   * Acerto Crítico: Quando o resultado do dado (sem somar bônus) >= Margem de Ameaça
   * 
   * @param attributeValue - Valor do atributo base (FOR para Luta, AGI para Pontaria)
   * @param skillBonus - Bônus de perícia de ataque
   * @param targetDefense - Defesa do alvo (DT do ataque)
   * @param threatRange - Margem de Ameaça (padrão: 20, mas pode ser 18, 19, etc.)
   * @param advantageDice - Bônus/penalidade de dados (+1d20 ou -1d20)
   * @returns Resultado do ataque
   */
  rollAttack(
    attributeValue: number,
    skillBonus: number,
    targetDefense: number,
    threatRange: number = 20,
    advantageDice: number = 0
  ): {
    dice: number[]
    result: number
    bonus: number
    total: number
    hit: boolean
    critical: boolean
    targetDefense: number
    threatRange: number
    selectedDice: number
  } {
    const rollResult = this.rollAttributeTest(attributeValue, skillBonus, advantageDice)

    // Acerto Crítico: quando o dado escolhido (sem bônus) >= Margem de Ameaça
    const critical = rollResult.selectedDice >= threatRange

    // Ataque acerta se: resultado total >= defesa OU foi crítico
    const hit = rollResult.total >= targetDefense || critical

    return {
      ...rollResult,
      hit,
      critical,
      targetDefense,
      threatRange,
    }
  },

  /**
   * Calcula dano de uma arma conforme regras do sistema Ordem Paranormal
   * Em acerto crítico: multiplica os DADOS de dano (não os bônus numéricos)
   * 
   * @param weaponDice - Fórmula de dados da arma (ex: "1d8", "2d6")
   * @param attributeValue - Valor do atributo (FOR para corpo-a-corpo)
   * @param isMelee - Se é ataque corpo-a-corpo
   * @param isCritical - Se foi acerto crítico
   * @param multiplier - Multiplicador de crítico (ex: 2, 3)
   * @param skillBonus - Bônus de perícia (ex: +5 por Tiro Certeiro) - NÃO é multiplicado no crítico
   * @returns Resultado do dano
   */
  calculateDamage(
    weaponDice: string,
    attributeValue: number,
    isMelee: boolean,
    isCritical: boolean,
    multiplier: number = 2,
    skillBonus: number = 0
  ): {
    dice: number[]
    attributeBonus: number
    skillBonus: number
    total: number
    isCritical: boolean
    multiplier: number
  } {
    // Parse da fórmula de dados (ex: "1d8" -> count=1, sides=8)
    const match = weaponDice.match(/^(\d+)d(\d+)$/)
    if (!match) {
      throw new Error('Fórmula de dados inválida: ' + weaponDice)
    }

    const count = parseInt(match[1], 10)
    const sides = parseInt(match[2], 10)

    // Se crítico, multiplica a quantidade de DADOS (não os bônus)
    const finalCount = isCritical ? count * multiplier : count

    // Rolar os dados
    const dice: number[] = []
    for (let i = 0; i < finalCount; i++) {
      dice.push(Math.floor(Math.random() * sides) + 1)
    }

    // Calcular total dos dados
    const diceTotal = dice.reduce((sum, d) => sum + d, 0)

    // Adicionar atributo apenas em corpo-a-corpo (não multiplicado no crítico)
    const attributeBonus = isMelee ? attributeValue : 0

    // Bônus de perícia (ex: Tiro Certeiro +5) - NÃO é multiplicado no crítico
    // Total = (dados rolados) + (bônus numéricos)
    const total = diceTotal + attributeBonus + skillBonus

    return {
      dice,
      attributeBonus,
      skillBonus,
      total,
      isCritical,
      multiplier,
    }
  },

  /**
   * Rola teste de resistência conforme regras do sistema Ordem Paranormal
   * Fortitude (VIG): Resistir a dor física, doenças, venenos
   * Reflexos (AGI): Esquivar de explosões, armadilhas, projéteis
   * Vontade (PRE): Resistir a medo, manipulação mental, insanidade
   * 
   * @param attributeValue - Valor do atributo base (VIG, AGI ou PRE)
   * @param difficulty - Dificuldade do teste (DT)
   * @param advantageDice - Bônus/penalidade de dados (+1d20 ou -1d20)
   * @returns Resultado do teste de resistência
   */
  rollResistance(
    attributeValue: number,
    difficulty: number,
    advantageDice: number = 0
  ): {
    dice: number[]
    result: number
    total: number
    success: boolean
    difficulty: number
    selectedDice: number
  } {
    // Teste de resistência usa apenas o atributo (sem bônus de perícia)
    const rollResult = this.rollAttributeTest(attributeValue, 0, advantageDice)

    // Sucesso se resultado >= dificuldade
    const success = rollResult.total >= difficulty

    return {
      dice: rollResult.dice,
      result: rollResult.selectedDice,
      total: rollResult.total,
      success,
      difficulty,
      selectedDice: rollResult.selectedDice,
    }
  },

  /**
   * Converte NEX (Nível de Exposição) em nível numérico
   * @param nex - NEX em percentual (0-99)
   * @returns Nível (0-19, onde cada 5% = 1 nível)
   */
  calculateNEXLevel(nex: number): number {
    return Math.floor(nex / 5)
  },

  /**
   * Calcula recuperação de PE por descanso
   * @param nex - Nível de Exposição
   * @returns PE recuperados (1 PE por nível de NEX)
   */
  calculatePERecovery(nex: number): number {
    const level = this.calculateNEXLevel(nex)
    return level + 1 // Mínimo 1 PE, +1 por nível
  },

  /**
   * Verifica se personagem está em estado crítico
   * @param currentPV - PV atual
   * @param maxPV - PV máximo
   * @returns Se está machucado (≤ 50% PV)
   */
  isInjured(currentPV: number, maxPV: number): boolean {
    return currentPV <= maxPV / 2
  },

  /**
   * Verifica se personagem está morrendo
   * @param currentPV - PV atual
   * @returns Se está morrendo (0 PV)
   */
  isDying(currentPV: number): boolean {
    return currentPV <= 0
  },

  /**
   * Verifica se personagem está insano
   * @param currentSAN - SAN atual
   * @returns Se está insano (0 SAN)
   */
  isInsane(currentSAN: number): boolean {
    return currentSAN <= 0
  },

  /**
   * Calcula penalidades aplicadas por condições
   * @param conditions - Array de condições ativas
   * @returns Objeto com todas as penalidades aplicadas
   */
  calculateConditionPenalties(conditions: Condition[]): {
    defense: number // Penalidade na defesa
    defenseBase: boolean // Se deve usar apenas base 10 (sem AGI)
    dicePenalty: number // Penalidade em dados (ex: -1D, -2D)
    cannotAct: boolean // Não pode realizar ações
    cannotReact: boolean // Não pode reagir
    cannotMove: boolean // Não pode se mover
    speedReduction: number // Redução de velocidade (0.5 = metade)
    rangedAttackPenalty: number // Penalidade em ataques à distância (para CAIDO)
    ritualDTBonus: number // Bônus na DT de rituais (para SURDO)
    onlyOneAction: boolean // Apenas 1 ação por turno (padrão OU movimento)
    cannotApproach: boolean // Não pode se aproximar (APAVORADO)
    mustFlee: boolean // Deve fugir se possível (APAVORADO)
    attributePenalties: {
      agi: number
      for: number
      int: number
      pre: number
      vig: number
    }
    skillPenalties: {
      [skillName: string]: number
    }
  } {
    const penalties = {
      defense: 0,
      defenseBase: false,
      dicePenalty: 0,
      cannotAct: false,
      cannotReact: false,
      cannotMove: false,
      speedReduction: 1,
      rangedAttackPenalty: 0, // Penalidade em ataques à distância
      ritualDTBonus: 0, // Bônus na DT de rituais
      onlyOneAction: false, // Apenas 1 ação por turno
      cannotApproach: false, // Não pode se aproximar
      mustFlee: false, // Deve fugir se possível
      attributePenalties: {
        agi: 0,
        for: 0,
        int: 0,
        pre: 0,
        vig: 0,
      },
      skillPenalties: {} as { [skillName: string]: number },
    }

    for (const condition of conditions) {
      switch (condition) {
        case 'CAIDO':
          penalties.defense -= 5 // -5 Defesa em corpo-a-corpo
          penalties.rangedAttackPenalty = -5 // -5 em ataques à distância (no atirador)
          break

        case 'DESPREVENIDO':
          penalties.defense -= 5
          penalties.defenseBase = true // Defesa base 10 apenas
          penalties.cannotReact = true
          penalties.dicePenalty -= 2 // -2D em Reflexos
          break

        case 'ATORDADO':
          penalties.cannotAct = true
          penalties.cannotReact = true
          penalties.defenseBase = true // Considerado Desprevenido
          penalties.defense -= 5
          break

        case 'INCONSCIENTE':
        case 'MORRENDO':
          penalties.cannotAct = true
          penalties.cannotReact = true
          penalties.defenseBase = true // Indefeso
          break

        case 'ABALADO':
          penalties.dicePenalty -= 1 // -1D em todos os testes
          break

        case 'APAVORADO':
          penalties.dicePenalty -= 2 // -2D em todos os testes
          penalties.cannotApproach = true // Não pode se aproximar da fonte do medo
          penalties.mustFlee = true // Deve fugir se possível
          break

        case 'PERTURBADO':
        case 'ENLOUQUECENDO':
          penalties.attributePenalties.int -= 2 // -2D em INT
          penalties.attributePenalties.pre -= 2 // -2D em PRE
          break

        case 'LENTO':
          penalties.speedReduction = 0.5 // Metade da velocidade
          break

        case 'IMOVEL':
        case 'PARALISADO':
          penalties.cannotMove = true
          if (condition === 'PARALISADO') {
            penalties.defenseBase = true // Indefeso
          }
          break

        case 'AGARRADO':
        case 'ENREDADO':
          penalties.cannotMove = true
          penalties.dicePenalty -= 1 // -1D em ataques
          break

        case 'CEGO':
          penalties.attributePenalties.agi -= 2 // -2D em AGI
          penalties.attributePenalties.for -= 2 // -2D em FOR
          penalties.skillPenalties['Percepção'] = -2 // -2D em Percepção
          break

        case 'SURDO':
          penalties.skillPenalties['Percepção'] = -2 // Penaliza Percepção para ouvir
          penalties.skillPenalties['Iniciativa'] = -2 // -2D em Iniciativa
          penalties.ritualDTBonus = 5 // +5 DT para conjurar rituais
          break

        case 'ENJOADO':
        case 'NAUSEA':
          penalties.onlyOneAction = true // Apenas 1 ação por turno (padrão OU movimento)
          penalties.dicePenalty -= 1 // -1D em alguns testes
          break

        case 'FRACO':
          penalties.attributePenalties.agi -= 1 // -1D em AGI
          penalties.attributePenalties.for -= 1 // -1D em FOR
          penalties.attributePenalties.vig -= 1 // -1D em VIG
          break

        case 'DEBILITADO':
          penalties.attributePenalties.agi -= 2 // -2D em AGI
          penalties.attributePenalties.for -= 2 // -2D em FOR
          penalties.attributePenalties.vig -= 2 // -2D em VIG
          break

        case 'FRUSTRADO':
          penalties.attributePenalties.int -= 1 // -1D em INT
          penalties.attributePenalties.pre -= 1 // -1D em PRE
          break

        case 'ESMORECIDO':
          penalties.attributePenalties.int -= 2 // -2D em INT
          penalties.attributePenalties.pre -= 2 // -2D em PRE
          break

        case 'EXAUSTO':
          penalties.attributePenalties.agi -= 2 // -2D em AGI
          penalties.attributePenalties.for -= 2 // -2D em FOR
          penalties.attributePenalties.vig -= 2 // -2D em VIG
          penalties.speedReduction = 0.5 // Lento
          break

        case 'FADIGADO':
          penalties.attributePenalties.agi -= 1 // Fraco
          penalties.attributePenalties.for -= 1
          penalties.attributePenalties.vig -= 1
          penalties.speedReduction = 0.5 // Não pode correr
          break

        case 'FASCINADO':
          penalties.cannotAct = true // Não pode realizar ações além de observar
          penalties.skillPenalties['Percepção'] = -2 // -2D em Percepção contra outras coisas
          break

        case 'INDEFESO':
          penalties.defenseBase = true // Falha automaticamente em Reflexos
          penalties.cannotReact = true
          break

        case 'SOBRECARREGADO':
          // Penalidade de -5 em todos os testes de perícias baseadas em FOR, AGI e VIG
          penalties.attributePenalties.for -= 5 // -5 em testes de FOR
          penalties.attributePenalties.agi -= 5 // -5 em testes de AGI
          penalties.attributePenalties.vig -= 5 // -5 em testes de VIG
          // Redução de -3m no deslocamento (será aplicado no frontend)
          penalties.speedReduction = Math.max(0.5, penalties.speedReduction - 0.3) // Redução adicional de velocidade
          break
      }
    }

    return penalties
  },

  /**
   * Aplica uma condição e retorna os efeitos
   * @param condition - Condição a ser aplicada
   * @param currentConditions - Condições já ativas
   * @returns Novas condições (pode incluir condições derivadas) e efeitos
   */
  applyCondition(
    condition: Condition,
    currentConditions: Condition[] = []
  ): {
    newConditions: Condition[]
    effects: {
      message: string
      autoConditions?: Condition[] // Condições que devem ser aplicadas automaticamente
      removeConditions?: Condition[] // Condições que devem ser removidas
    }
  } {
    let newConditions = [...currentConditions]
    const effects = {
      message: '',
      autoConditions: [] as Condition[],
      removeConditions: [] as Condition[],
    }

    // Verificar condições derivadas e interações ANTES de aplicar
    // (algumas condições podem ser transformadas em outras)
    switch (condition) {
      case 'ABALADO':
        // Se já está Abalado, vira Apavorado (não duplica)
        if (currentConditions.includes('ABALADO')) {
          const filtered = newConditions.filter((c) => c !== 'ABALADO')
          filtered.push('APAVORADO')
          newConditions = filtered
          effects.removeConditions.push('ABALADO')
          effects.autoConditions.push('APAVORADO')
          effects.message = 'Personagem já estava Abalado. Agora está Apavorado!'
          return { newConditions, effects }
        }
        // Se não estava Abalado, aplicar normalmente
        newConditions.push(condition)
        effects.message = 'Personagem está Abalado (-1D em todos os testes)'
        break

      case 'DEBILITADO':
        // Se já está Debilitado, vira Inconsciente (não duplica)
        if (currentConditions.includes('DEBILITADO')) {
          const filtered = newConditions.filter((c) => c !== 'DEBILITADO')
          filtered.push('INCONSCIENTE')
          newConditions = filtered
          effects.removeConditions.push('DEBILITADO')
          effects.autoConditions.push('INCONSCIENTE')
          effects.message = 'Personagem já estava Debilitado. Agora está Inconsciente!'
          return { newConditions, effects }
        }
        // Se não estava Debilitado, aplicar normalmente
        newConditions.push(condition)
        effects.message = 'Personagem está Debilitado (-2D em testes físicos)'
        break

      default:
        // Verificar se condição já está ativa (para outras condições)
        if (newConditions.includes(condition)) {
          effects.message = `Condição ${condition} já está ativa`
          return { newConditions, effects }
        }
        // Aplicar condição
        newConditions.push(condition)
    }

    // Verificar condições derivadas e interações
    switch (condition) {
      case 'MORRENDO':
        // Morrendo automaticamente inclui Inconsciente e Sangrando
        if (!newConditions.includes('INCONSCIENTE')) {
          newConditions.push('INCONSCIENTE')
          effects.autoConditions.push('INCONSCIENTE')
        }
        if (!newConditions.includes('SANGRANDO')) {
          newConditions.push('SANGRANDO')
          effects.autoConditions.push('SANGRANDO')
        }
        if (!effects.message) {
          effects.message = 'Personagem está morrendo! Inconsciente e sangrando automaticamente.'
        }
        break

      case 'DEBILITADO':
        // Se já está Debilitado, vira Inconsciente
        if (currentConditions.includes('DEBILITADO')) {
          const filtered = newConditions.filter((c) => c !== 'DEBILITADO')
          filtered.push('INCONSCIENTE')
          newConditions = filtered
          effects.removeConditions.push('DEBILITADO')
          effects.autoConditions.push('INCONSCIENTE')
          effects.message = 'Personagem já estava Debilitado. Agora está Inconsciente!'
        } else {
          effects.message = 'Personagem está Debilitado (-2D em testes físicos)'
        }
        break

      case 'ATORDADO':
        // Atordado é considerado Desprevenido
        if (!newConditions.includes('DESPREVENIDO')) {
          newConditions.push('DESPREVENIDO')
          effects.autoConditions.push('DESPREVENIDO')
        }
        effects.message = 'Personagem está Atordado (não pode agir ou reagir)'
        break

      case 'PARALISADO':
        // Paralisado inclui Imóvel e Indefeso
        if (!newConditions.includes('IMOVEL')) {
          newConditions.push('IMOVEL')
          effects.autoConditions.push('IMOVEL')
        }
        if (!newConditions.includes('INDEFESO')) {
          newConditions.push('INDEFESO')
          effects.autoConditions.push('INDEFESO')
        }
        effects.message = 'Personagem está Paralisado (imóvel e indefeso)'
        break

      case 'EXAUSTO':
        // Exausto inclui Debilitado e Lento
        if (!newConditions.includes('DEBILITADO')) {
          newConditions.push('DEBILITADO')
          effects.autoConditions.push('DEBILITADO')
        }
        if (!newConditions.includes('LENTO')) {
          newConditions.push('LENTO')
          effects.autoConditions.push('LENTO')
        }
        effects.message = 'Personagem está Exausto (Debilitado + Lento)'
        break

      default:
        effects.message = `Condição ${condition} aplicada`
    }

    return { newConditions, effects }
  },

  /**
   * Calcula o limite de PE por turno baseado no NEX
   * @param nex - Nível de Exposição (0-99)
   * @returns Limite de PE que pode ser gasto por turno
   */
  calculatePETurnLimit(nex: number): number {
    // Tabela de limite de PE por turno conforme SISTEMA ORDO.md
    if (nex < 5) return 1
    if (nex < 10) return 1
    if (nex < 15) return 2
    if (nex < 20) return 2
    if (nex < 25) return 3
    if (nex < 30) return 3
    if (nex < 35) return 4
    if (nex < 40) return 4
    if (nex < 45) return 5
    if (nex < 50) return 5
    if (nex < 55) return 6
    if (nex < 60) return 6
    if (nex < 65) return 7
    if (nex < 70) return 7
    if (nex < 75) return 8
    if (nex < 80) return 8
    if (nex < 85) return 9
    if (nex < 90) return 9
    if (nex < 95) return 10
    // NEX 95-99: Limite de 20 PE (progressão linear até 99%)
    return Math.min(20, 10 + Math.floor((nex - 95) / 5) * 2)
  },

  /**
   * Valida se o custo de PE excede o limite por turno
   * @param nex - Nível de Exposição
   * @param peCost - Custo de PE da ação
   * @returns true se o custo é válido, false caso contrário
   */
  validatePETurnLimit(nex: number, peCost: number): boolean {
    const limit = this.calculatePETurnLimit(nex)
    return peCost <= limit
  },

  /**
   * Calcula capacidade de carga máxima baseado em Força
   * @param forca - Valor de Força
   * @returns Capacidade máxima de carga (mínimo 2)
   */
  calculateMaxCarryCapacity(forca: number): number {
    return Math.max(2, 5 * forca)
  },

  /**
   * Verifica se o personagem está sobrecarregado
   * @param currentWeight - Peso atual do inventário
   * @param maxCapacity - Capacidade máxima de carga
   * @returns true se sobrecarregado, false caso contrário
   */
  isOverloaded(currentWeight: number, maxCapacity: number): boolean {
    return currentWeight > maxCapacity
  },

  /**
   * Rola teste de custo de ritual (secreto)
   * @param characterData - Dados do personagem (atributos e perícias)
   * @param ritualCost - Custo do ritual em PE
   * @returns Resultado do teste de custo
   */
  /**
   * Rola teste de custo de ritual (secreto)
   * DT = 20 + custo do ritual (Regra Padrão)
   * @param characterData - Dados do personagem
   * @param ritualCost - Custo do ritual em PE
   * @returns Resultado do teste de custo e consequências
   */
  rollRitualCostTest(
    characterData: any,
    ritualCost: number
  ): {
    success: boolean
    criticalFailure: boolean
    rollResult: number
    dt: number
    dice: number[]
    attributeValue: number
    skillBonus: number
  } {
    // DT do Custo do Paranormal: 20 + custo em PE
    const dt = 20 + ritualCost

    // Dados para o teste (Ocultismo usa INT)
    // Suportar tanto o formato simplificado quanto o objeto completo de personagem
    let intValue = 1
    let ocultismoBonus = 0

    if (characterData.attributes?.int) {
      intValue = characterData.attributes.int
    }

    if (characterData.skills?.Ocultismo) {
      const skill = characterData.skills.Ocultismo
      if (typeof skill.bonus === 'number') {
        ocultismoBonus = skill.bonus
      } else if (skill.training) {
        ocultismoBonus = this.calculateSkillBonus(skill.training)
      }
    } else if (characterData.skills?.ocultismo) {
      // Fallback para minúsculo
      const skill = characterData.skills.ocultismo
      if (typeof skill.bonus === 'number') {
        ocultismoBonus = skill.bonus
      }
    }

    // Rolar teste
    const roll = this.rollAttributeTest(intValue, ocultismoBonus)

    // Sucesso: total >= DT
    // Falha Crítica: dado escolhido (natural) é 1 e falhou no teste
    const success = roll.total >= dt
    const isCriticalFailure = roll.selectedDice === 1 && !success

    return {
      success,
      criticalFailure: isCriticalFailure,
      rollResult: roll.total,
      dt,
      dice: roll.dice,
      attributeValue: intValue,
      skillBonus: ocultismoBonus
    }
  },

  /**
   * Calcula o custo de PE para conjurar um ritual
   * @param ritual - O ritual a ser conjurado
   * @param mode - O modo de conjuração (NORMAL, DISCIPLE, TRUE)
   * @returns Custo em PE
   */
  calculateRitualCost(ritual: Ritual, mode: 'NORMAL' | 'DISCIPLE' | 'TRUE' = 'NORMAL'): number {
    let cost = ritual.cost.basePe

    if (mode === 'DISCIPLE') {
      cost += ritual.cost.discipleExtraPe || 0
    } else if (mode === 'TRUE') {
      cost += ritual.cost.trueExtraPe || 0
    }

    return cost
  },

  /**
   * Valida se o personagem pode conjurar o ritual no modo desejado
   * @param character - Dados do personagem
   * @param ritual - Dados do ritual
   * @param mode - Modo de conjuração
   * @returns Object com success boolean e mensagem de erro se houver
   */
  validateRitualCasting(
    character: any,
    ritual: Ritual,
    mode: 'NORMAL' | 'DISCIPLE' | 'TRUE'
  ): { success: boolean; error?: string } {
    // 2. Validar Círculo vs NEX
    // Círculo 1: NEX 1% (todos)
    // Círculo 2: NEX 25% (operador)
    // Círculo 3: NEX 55% (agente especial)
    // Círculo 4: NEX 85% (oficial de operações)
    const nex = character.stats?.nex || character.nex || 5
    const requiredNex = [0, 0, 25, 55, 85] // Circle 0 doesn't exist, Circle 1 requires 0 NEX (technically 5% for Ocultista to learn)

    if (nex < requiredNex[ritual.circle]) {
      return { success: false, error: `NEX insuficiente (${nex}%) para conjurar rituais de ${ritual.circle}º Círculo (Requer ${requiredNex[ritual.circle]}%).` }
    }

    // 3. Validar Afinidade para modo Verdadeiro
    if (mode === 'TRUE') {
      const affinity = character.affinity as ParanormalElement | null
      const required = ritual.requiredAffinityForTrue || ritual.element

      const hasAffinity = Array.isArray(required)
        ? required.includes(affinity as any)
        : affinity === required

      if (!hasAffinity) {
        return { success: false, error: `Modo Verdadeiro exige afinidade com ${Array.isArray(required) ? required.join(' ou ') : required}.` }
      }
    }

    return { success: true }
  }
}
