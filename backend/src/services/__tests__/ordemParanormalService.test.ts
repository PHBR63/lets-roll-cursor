import { ordemParanormalService } from '../ordemParanormalService'
import { CharacterClass, Condition } from '../../types/ordemParanormal'

describe('ordemParanormalService', () => {
  describe('calculateMaxPV', () => {
    it('deve calcular PV correto para Combatente NEX 5', () => {
      const result = ordemParanormalService.calculateMaxPV('COMBATENTE', 2, 5)
      // PV inicial: 20, VIG: 2, NEX 5 = nível 1, então: 20 + 2 + (4 + 2) * 1 = 28
      expect(result).toBe(28)
    })

    it('deve calcular PV correto para Especialista NEX 10', () => {
      const result = ordemParanormalService.calculateMaxPV('ESPECIALISTA', 1, 10)
      // PV inicial: 16, VIG: 1, NEX 10 = nível 2, então: 16 + 1 + (3 + 1) * 2 = 25
      expect(result).toBe(25)
    })

    it('deve calcular PV correto para Ocultista NEX 0', () => {
      const result = ordemParanormalService.calculateMaxPV('OCULTISTA', 0, 0)
      // PV inicial: 12, VIG: 0, NEX 0 = nível 0, então: 12 + 0 = 12
      expect(result).toBe(12)
    })
  })

  describe('calculateMaxSAN', () => {
    it('deve calcular SAN correta para Combatente NEX 5', () => {
      const result = ordemParanormalService.calculateMaxSAN('COMBATENTE', 5)
      // SAN inicial: 12, NEX 5 = nível 1, então: 12 + 3 * 1 = 15
      expect(result).toBe(15)
    })

    it('deve calcular SAN correta para Ocultista NEX 20', () => {
      const result = ordemParanormalService.calculateMaxSAN('OCULTISTA', 20)
      // SAN inicial: 20, NEX 20 = nível 4, então: 20 + 5 * 4 = 40
      expect(result).toBe(40)
    })
  })

  describe('calculateMaxPE', () => {
    it('deve calcular PE correto para Combatente NEX 5', () => {
      const result = ordemParanormalService.calculateMaxPE('COMBATENTE', 1, 5)
      // PE inicial: 2, PRE: 1, NEX 5 = nível 1, então: 2 + 1 + (2 + 1) * 1 = 6
      expect(result).toBe(6)
    })

    it('deve calcular PE correto para Ocultista NEX 10', () => {
      const result = ordemParanormalService.calculateMaxPE('OCULTISTA', 2, 10)
      // PE inicial: 4, PRE: 2, NEX 10 = nível 2, então: 4 + 2 + (4 + 2) * 2 = 18
      expect(result).toBe(18)
    })
  })

  describe('calculateDefense', () => {
    it('deve calcular defesa base correta', () => {
      const result = ordemParanormalService.calculateDefense(2)
      expect(result).toBe(12) // 10 + 2
    })

    it('deve calcular defesa com bônus de equipamento', () => {
      const result = ordemParanormalService.calculateDefense(3, 2)
      expect(result).toBe(15) // 10 + 3 + 2
    })

    it('deve calcular defesa com AGI negativa', () => {
      const result = ordemParanormalService.calculateDefense(-1)
      expect(result).toBe(9) // 10 + (-1)
    })
  })

  describe('calculateSkillBonus', () => {
    it('deve retornar 0 para destreinado', () => {
      const result = ordemParanormalService.calculateSkillBonus('UNTRAINED')
      expect(result).toBe(0)
    })

    it('deve retornar 5 para treinado', () => {
      const result = ordemParanormalService.calculateSkillBonus('TRAINED')
      expect(result).toBe(5)
    })

    it('deve retornar 10 para competente', () => {
      const result = ordemParanormalService.calculateSkillBonus('COMPETENT')
      expect(result).toBe(10)
    })

    it('deve retornar 15 para expert', () => {
      const result = ordemParanormalService.calculateSkillBonus('EXPERT')
      expect(result).toBe(15)
    })
  })

  describe('calculateNEXLevel', () => {
    it('deve converter NEX 5 em nível 1', () => {
      const result = ordemParanormalService.calculateNEXLevel(5)
      expect(result).toBe(1)
    })

    it('deve converter NEX 10 em nível 2', () => {
      const result = ordemParanormalService.calculateNEXLevel(10)
      expect(result).toBe(2)
    })

    it('deve converter NEX 0 em nível 0', () => {
      const result = ordemParanormalService.calculateNEXLevel(0)
      expect(result).toBe(0)
    })

    it('deve converter NEX 99 em nível 19', () => {
      const result = ordemParanormalService.calculateNEXLevel(99)
      expect(result).toBe(19)
    })
  })

  describe('calculatePERecovery', () => {
    it('deve calcular recuperação correta para NEX 5', () => {
      const result = ordemParanormalService.calculatePERecovery(5)
      expect(result).toBe(2) // nível 1 + 1
    })

    it('deve calcular recuperação correta para NEX 10', () => {
      const result = ordemParanormalService.calculatePERecovery(10)
      expect(result).toBe(3) // nível 2 + 1
    })
  })

  describe('rollAttributeTest', () => {
    it('deve rolar com vantagem para atributo positivo', () => {
      const result = ordemParanormalService.rollAttributeTest(2, 5)
      expect(result.dice.length).toBe(3) // 1 + 2
      expect(result.advantage).toBe(true)
      expect(result.disadvantage).toBe(false)
      expect(result.result).toBe(Math.max(...result.dice))
      expect(result.total).toBe(result.result + 5)
    })

    it('deve rolar com desvantagem para atributo zero', () => {
      const result = ordemParanormalService.rollAttributeTest(0, 0)
      expect(result.dice.length).toBe(2)
      expect(result.advantage).toBe(false)
      expect(result.disadvantage).toBe(true)
      expect(result.result).toBe(Math.min(...result.dice))
    })

    it('deve rolar com desvantagem para atributo negativo', () => {
      const result = ordemParanormalService.rollAttributeTest(-1, 0)
      expect(result.dice.length).toBe(2) // 1 + 1
      expect(result.advantage).toBe(false)
      expect(result.disadvantage).toBe(true)
      expect(result.result).toBe(Math.min(...result.dice))
    })

    it('deve aplicar bônus de perícia corretamente', () => {
      const result = ordemParanormalService.rollAttributeTest(1, 5)
      expect(result.bonus).toBe(5)
      expect(result.total).toBe(result.result + 5)
    })
  })

  describe('rollAttack', () => {
    it('deve detectar acerto crítico (20 natural)', () => {
      // Mock Math.random para garantir um 20
      const originalRandom = Math.random
      let callCount = 0
      Math.random = jest.fn(() => {
        callCount++
        if (callCount === 1) return 0.99 // 20
        return 0.1 // outros dados
      })

      const result = ordemParanormalService.rollAttack(2, 5, 15)
      expect(result.critical).toBe(true)
      expect(result.hit).toBe(true) // Crítico sempre acerta

      Math.random = originalRandom
    })

    it('deve acertar se total >= defesa', () => {
      // Mock para garantir resultado alto
      const originalRandom = Math.random
      Math.random = jest.fn(() => 0.9) // ~18

      const result = ordemParanormalService.rollAttack(2, 5, 10)
      expect(result.hit).toBe(true)

      Math.random = originalRandom
    })

    it('deve errar se total < defesa', () => {
      // Mock para garantir resultado baixo
      const originalRandom = Math.random
      Math.random = jest.fn(() => 0.1) // ~2

      const result = ordemParanormalService.rollAttack(0, 0, 20)
      expect(result.hit).toBe(false)

      Math.random = originalRandom
    })
  })

  describe('calculateDamage', () => {
    it('deve calcular dano básico de arma', () => {
      const result = ordemParanormalService.calculateDamage('1d8', 2, true, false)
      expect(result.dice.length).toBe(1)
      expect(result.dice[0]).toBeGreaterThanOrEqual(1)
      expect(result.dice[0]).toBeLessThanOrEqual(8)
      expect(result.attributeBonus).toBe(2)
      expect(result.total).toBe(result.dice[0] + 2)
    })

    it('deve multiplicar dados em crítico', () => {
      const result = ordemParanormalService.calculateDamage('1d6', 1, true, true, 2)
      expect(result.dice.length).toBe(2) // 1 * 2
      expect(result.isCritical).toBe(true)
      expect(result.multiplier).toBe(2)
    })

    it('deve não adicionar atributo em ataque à distância', () => {
      const result = ordemParanormalService.calculateDamage('1d10', 3, false, false)
      expect(result.attributeBonus).toBe(0)
      expect(result.total).toBe(result.dice[0])
    })

    it('deve lançar erro para fórmula inválida', () => {
      expect(() => {
        ordemParanormalService.calculateDamage('invalid', 0, true, false)
      }).toThrow('Fórmula de dados inválida')
    })
  })

  describe('isInjured', () => {
    it('deve retornar true se PV <= 50%', () => {
      expect(ordemParanormalService.isInjured(10, 20)).toBe(true)
      expect(ordemParanormalService.isInjured(9, 20)).toBe(true)
    })

    it('deve retornar false se PV > 50%', () => {
      expect(ordemParanormalService.isInjured(11, 20)).toBe(false)
      expect(ordemParanormalService.isInjured(20, 20)).toBe(false)
    })
  })

  describe('isDying', () => {
    it('deve retornar true se PV <= 0', () => {
      expect(ordemParanormalService.isDying(0)).toBe(true)
      expect(ordemParanormalService.isDying(-1)).toBe(true)
    })

    it('deve retornar false se PV > 0', () => {
      expect(ordemParanormalService.isDying(1)).toBe(false)
      expect(ordemParanormalService.isDying(10)).toBe(false)
    })
  })

  describe('isInsane', () => {
    it('deve retornar true se SAN <= 0', () => {
      expect(ordemParanormalService.isInsane(0)).toBe(true)
      expect(ordemParanormalService.isInsane(-1)).toBe(true)
    })

    it('deve retornar false se SAN > 0', () => {
      expect(ordemParanormalService.isInsane(1)).toBe(false)
      expect(ordemParanormalService.isInsane(10)).toBe(false)
    })
  })

  describe('calculateConditionPenalties', () => {
    it('deve calcular penalidades de condição Caído', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['CAIDO'])
      expect(result.defense).toBe(-5)
      expect(result.rangedAttackPenalty).toBe(-5) // -5 em ataques à distância
    })

    it('deve calcular penalidades de condição Desprevenido', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['DESPREVENIDO'])
      expect(result.defense).toBe(-5)
      expect(result.defenseBase).toBe(true)
      expect(result.cannotReact).toBe(true)
      expect(result.dicePenalty).toBe(-2)
    })

    it('deve calcular penalidades de condição Atordado', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['ATORDADO'])
      expect(result.cannotAct).toBe(true)
      expect(result.cannotReact).toBe(true)
      expect(result.defenseBase).toBe(true)
    })

    it('deve calcular penalidades de condição Abalado', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['ABALADO'])
      expect(result.dicePenalty).toBe(-1)
    })

    it('deve calcular penalidades de condição Apavorado', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['APAVORADO'])
      expect(result.dicePenalty).toBe(-2)
      expect(result.cannotApproach).toBe(true) // Não pode se aproximar
      expect(result.mustFlee).toBe(true) // Deve fugir
    })

    it('deve calcular penalidades de condição Cego', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['CEGO'])
      expect(result.attributePenalties.agi).toBe(-2)
      expect(result.attributePenalties.for).toBe(-2)
      expect(result.skillPenalties['Percepção']).toBe(-2)
    })

    it('deve calcular penalidades combinadas', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['ABALADO', 'CEGO'])
      expect(result.dicePenalty).toBe(-1)
      expect(result.attributePenalties.agi).toBe(-2)
      expect(result.attributePenalties.for).toBe(-2)
    })

    it('deve calcular penalidades de condição Lento', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['LENTO'])
      expect(result.speedReduction).toBe(0.5)
    })

    it('deve calcular penalidades de condição Exausto', () => {
      const result = ordemParanormalService.calculateConditionPenalties(['EXAUSTO'])
      expect(result.attributePenalties.agi).toBe(-2)
      expect(result.attributePenalties.for).toBe(-2)
      expect(result.attributePenalties.vig).toBe(-2)
      expect(result.speedReduction).toBe(0.5)
    })
  })

  describe('applyCondition', () => {
    it('deve aplicar condição simples', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('ABALADO', [])
      expect(newConditions).toContain('ABALADO')
      // A mensagem deve conter "Abalado" (pode ser "Personagem está Abalado" ou outra variação)
      expect(effects.message.toLowerCase()).toContain('abalado')
    })

    it('deve aplicar Morrendo e automaticamente Inconsciente e Sangrando', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('MORRENDO', [])
      expect(newConditions).toContain('MORRENDO')
      expect(newConditions).toContain('INCONSCIENTE')
      expect(newConditions).toContain('SANGRANDO')
      expect(effects.autoConditions).toContain('INCONSCIENTE')
      expect(effects.autoConditions).toContain('SANGRANDO')
    })

    it('deve transformar Abalado em Apavorado se já estava Abalado', () => {
      // Primeiro aplicar Abalado
      const first = ordemParanormalService.applyCondition('ABALADO', [])
      expect(first.newConditions).toContain('ABALADO')
      
      // Aplicar Abalado novamente (já estava Abalado)
      const { newConditions, effects } = ordemParanormalService.applyCondition('ABALADO', [
        'ABALADO',
      ])
      // Deve remover ABALADO e adicionar APAVORADO
      expect(newConditions.filter(c => c === 'ABALADO').length).toBe(0)
      expect(newConditions).toContain('APAVORADO')
      expect(effects.removeConditions).toContain('ABALADO')
      expect(effects.autoConditions).toContain('APAVORADO')
    })

    it('deve aplicar Atordado e automaticamente Desprevenido', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('ATORDADO', [])
      expect(newConditions).toContain('ATORDADO')
      expect(newConditions).toContain('DESPREVENIDO')
      expect(effects.autoConditions).toContain('DESPREVENIDO')
    })

    it('deve aplicar Paralisado e automaticamente Imóvel e Indefeso', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('PARALISADO', [])
      expect(newConditions).toContain('PARALISADO')
      expect(newConditions).toContain('IMOVEL')
      expect(newConditions).toContain('INDEFESO')
      expect(effects.autoConditions).toContain('IMOVEL')
      expect(effects.autoConditions).toContain('INDEFESO')
    })

    it('deve aplicar Exausto e automaticamente Debilitado e Lento', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('EXAUSTO', [])
      expect(newConditions).toContain('EXAUSTO')
      expect(newConditions).toContain('DEBILITADO')
      expect(newConditions).toContain('LENTO')
    })

    it('deve não duplicar condição já existente', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('ABALADO', [
        'ABALADO',
      ])
      // Deve transformar em Apavorado, não duplicar
      expect(newConditions.filter((c) => c === 'ABALADO').length).toBeLessThanOrEqual(1)
    })
  })

  describe('calculatePETurnLimit', () => {
    it('deve retornar limite 1 para NEX 5%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(5)
      expect(result).toBe(1)
    })

    it('deve retornar limite 2 para NEX 10%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(10)
      expect(result).toBe(2)
    })

    it('deve retornar limite 2 para NEX 15%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(15)
      expect(result).toBe(2)
    })

    it('deve retornar limite 3 para NEX 20%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(20)
      expect(result).toBe(3)
    })

    it('deve retornar limite 3 para NEX 25%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(25)
      expect(result).toBe(3)
    })

    it('deve retornar limite 10 para NEX 95%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(95)
      expect(result).toBe(10)
    })

    it('deve retornar limite 20 para NEX 99%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(99)
      expect(result).toBe(20)
    })

    it('deve retornar limite 1 para NEX 0%', () => {
      const result = ordemParanormalService.calculatePETurnLimit(0)
      expect(result).toBe(1)
    })
  })

  describe('validatePETurnLimit', () => {
    it('deve validar corretamente quando custo está dentro do limite', () => {
      const result = ordemParanormalService.validatePETurnLimit(10, 2)
      expect(result).toBe(true)
    })

    it('deve invalidar quando custo excede o limite', () => {
      const result = ordemParanormalService.validatePETurnLimit(5, 2)
      expect(result).toBe(false)
    })

    it('deve validar quando custo é exatamente o limite', () => {
      const result = ordemParanormalService.validatePETurnLimit(10, 2)
      expect(result).toBe(true)
    })
  })

  describe('calculateMaxCarryCapacity', () => {
    it('deve calcular capacidade máxima baseada em Força', () => {
      const result = ordemParanormalService.calculateMaxCarryCapacity(3)
      // 5 * 3 = 15
      expect(result).toBe(15)
    })

    it('deve retornar mínimo de 2 mesmo com Força 0', () => {
      const result = ordemParanormalService.calculateMaxCarryCapacity(0)
      expect(result).toBe(2)
    })

    it('deve retornar mínimo de 2 mesmo com Força negativa', () => {
      const result = ordemParanormalService.calculateMaxCarryCapacity(-1)
      expect(result).toBe(2)
    })

    it('deve calcular corretamente para Força 1', () => {
      const result = ordemParanormalService.calculateMaxCarryCapacity(1)
      // 5 * 1 = 5, mas mínimo é 2, então retorna 5
      expect(result).toBe(5)
    })
  })

  describe('isOverloaded', () => {
    it('deve retornar true quando peso excede capacidade', () => {
      const result = ordemParanormalService.isOverloaded(15, 10)
      expect(result).toBe(true)
    })

    it('deve retornar false quando peso está dentro da capacidade', () => {
      const result = ordemParanormalService.isOverloaded(8, 10)
      expect(result).toBe(false)
    })

    it('deve retornar false quando peso é exatamente a capacidade', () => {
      const result = ordemParanormalService.isOverloaded(10, 10)
      expect(result).toBe(false)
    })
  })
})

