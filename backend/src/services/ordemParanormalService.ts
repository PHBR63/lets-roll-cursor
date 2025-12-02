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
   * Rola teste de atributo conforme regras do sistema
   * @param attributeValue - Valor do atributo base
   * @param skillBonus - Bônus de perícia
   * @returns Resultado da rolagem
   */
  rollAttributeTest(attributeValue: number, skillBonus: number = 0): {
    dice: number[]
    result: number
    bonus: number
    total: number
    advantage: boolean
    disadvantage: boolean
  } {
    let diceCount: number
    let advantage = false
    let disadvantage = false

    if (attributeValue > 0) {
      // Atributo positivo: vantagem
      diceCount = 1 + attributeValue
      advantage = true
    } else if (attributeValue === 0) {
      // Atributo zero: desvantagem mínima (2d20, usa menor)
      diceCount = 2
      disadvantage = true
    } else {
      // Atributo negativo: desvantagem
      diceCount = 1 + Math.abs(attributeValue)
      disadvantage = true
    }

    // Rolar os dados
    const dice: number[] = []
    for (let i = 0; i < diceCount; i++) {
      dice.push(Math.floor(Math.random() * 20) + 1)
    }

    // Determinar resultado
    let result: number
    if (advantage) {
      result = Math.max(...dice)
    } else {
      result = Math.min(...dice)
    }

    const total = result + skillBonus

    return {
      dice,
      result,
      bonus: skillBonus,
      total,
      advantage,
      disadvantage,
    }
  },

  /**
   * Rola teste de ataque
   * @param attributeValue - Valor do atributo base (FOR para Luta, AGI para Pontaria)
   * @param skillBonus - Bônus de perícia de ataque
   * @param targetDefense - Defesa do alvo
   * @returns Resultado do ataque
   */
  rollAttack(
    attributeValue: number,
    skillBonus: number,
    targetDefense: number
  ): {
    dice: number[]
    result: number
    bonus: number
    total: number
    hit: boolean
    critical: boolean
    targetDefense: number
  } {
    const rollResult = this.rollAttributeTest(attributeValue, skillBonus)
    const critical = rollResult.dice.some((d) => d === 20)
    const hit = rollResult.total >= targetDefense || critical

    return {
      ...rollResult,
      hit,
      critical,
      targetDefense,
    }
  },

  /**
   * Calcula dano de uma arma
   * @param weaponDice - Fórmula de dados da arma (ex: "1d8", "2d6")
   * @param attributeValue - Valor do atributo (FOR para corpo-a-corpo)
   * @param isMelee - Se é ataque corpo-a-corpo
   * @param isCritical - Se foi acerto crítico
   * @param multiplier - Multiplicador de crítico (ex: 2, 3)
   * @returns Resultado do dano
   */
  calculateDamage(
    weaponDice: string,
    attributeValue: number,
    isMelee: boolean,
    isCritical: boolean,
    multiplier: number = 2
  ): {
    dice: number[]
    attributeBonus: number
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

    // Se crítico, multiplica a quantidade de dados
    const finalCount = isCritical ? count * multiplier : count

    // Rolar os dados
    const dice: number[] = []
    for (let i = 0; i < finalCount; i++) {
      dice.push(Math.floor(Math.random() * sides) + 1)
    }

    // Calcular total
    const diceTotal = dice.reduce((sum, d) => sum + d, 0)
    
    // Adicionar atributo apenas em corpo-a-corpo
    const attributeBonus = isMelee ? attributeValue : 0
    const total = diceTotal + attributeBonus

    return {
      dice,
      attributeBonus,
      total,
      isCritical,
      multiplier,
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
          break

        case 'ENJOADO':
        case 'NAUSEA':
          // Apenas 1 ação por turno (lógica separada)
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
          penalties.skillPenalties['Percepção'] = -2 // -2D em Percepção contra outras coisas
          // Não pode realizar ações além de observar (lógica separada)
          break

        case 'INDEFESO':
          penalties.defenseBase = true // Falha automaticamente em Reflexos
          penalties.cannotReact = true
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
        // Morrendo automaticamente inclui Inconsciente
        if (!newConditions.includes('INCONSCIENTE')) {
          newConditions.push('INCONSCIENTE')
          effects.autoConditions.push('INCONSCIENTE')
        }
        if (!effects.message) {
          effects.message = 'Personagem está morrendo! Inconsciente automaticamente.'
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
}

