import { ordemParanormalService } from '../ordemParanormalService'
import { CharacterClass } from '../../types/ordemParanormal'

/**
 * Testes de validação de regras do sistema Ordem Paranormal
 * Verifica se os cálculos seguem as regras oficiais
 */
describe('Validação de Regras do Sistema', () => {
  describe('Cálculos de Recursos', () => {
    it('deve calcular PV corretamente para todas as classes', () => {
      // Combatente NEX 5, VIG 2
      const combatentePV = ordemParanormalService.calculateMaxPV('COMBATENTE', 2, 5)
      expect(combatentePV).toBe(28) // 20 + 2 + (4 + 2) * 1

      // Especialista NEX 10, VIG 1
      const especialistaPV = ordemParanormalService.calculateMaxPV('ESPECIALISTA', 1, 10)
      expect(especialistaPV).toBe(25) // 16 + 1 + (3 + 1) * 2

      // Ocultista NEX 20, VIG 0
      const ocultistaPV = ordemParanormalService.calculateMaxPV('OCULTISTA', 0, 20)
      expect(ocultistaPV).toBe(12) // 12 + 0 + (2 + 0) * 4
    })

    it('deve calcular SAN corretamente para todas as classes', () => {
      // Combatente NEX 5
      const combatenteSAN = ordemParanormalService.calculateMaxSAN('COMBATENTE', 5)
      expect(combatenteSAN).toBe(15) // 12 + 3 * 1

      // Especialista NEX 10
      const especialistaSAN = ordemParanormalService.calculateMaxSAN('ESPECIALISTA', 10)
      expect(especialistaSAN).toBe(24) // 16 + 4 * 2

      // Ocultista NEX 20
      const ocultistaSAN = ordemParanormalService.calculateMaxSAN('OCULTISTA', 20)
      expect(ocultistaSAN).toBe(40) // 20 + 5 * 4
    })

    it('deve calcular PE corretamente para todas as classes', () => {
      // Combatente NEX 5, PRE 1
      const combatentePE = ordemParanormalService.calculateMaxPE('COMBATENTE', 1, 5)
      expect(combatentePE).toBe(6) // 2 + 1 + (2 + 1) * 1

      // Especialista NEX 10, PRE 2
      const especialistaPE = ordemParanormalService.calculateMaxPE('ESPECIALISTA', 2, 10)
      expect(especialistaPE).toBe(14) // 3 + 2 + (3 + 2) * 2

      // Ocultista NEX 20, PRE 3
      const ocultistaPE = ordemParanormalService.calculateMaxPE('OCULTISTA', 3, 20)
      expect(ocultistaPE).toBe(31) // 4 + 3 + (4 + 3) * 4
    })
  })

  describe('Rolagens Seguem Regras do Sistema', () => {
    it('deve rolar com vantagem para atributo positivo', () => {
      const result = ordemParanormalService.rollAttributeTest(2, 0)
      expect(result.advantage).toBe(true)
      expect(result.disadvantage).toBe(false)
      expect(result.dice.length).toBe(3) // 1 + 2
      expect(result.result).toBe(Math.max(...result.dice))
    })

    it('deve rolar com desvantagem para atributo zero ou negativo', () => {
      const resultZero = ordemParanormalService.rollAttributeTest(0, 0)
      expect(resultZero.disadvantage).toBe(true)
      expect(resultZero.advantage).toBe(false)
      expect(resultZero.dice.length).toBe(2)
      expect(resultZero.result).toBe(Math.min(...resultZero.dice))

      const resultNeg = ordemParanormalService.rollAttributeTest(-1, 0)
      expect(resultNeg.disadvantage).toBe(true)
      expect(resultNeg.dice.length).toBe(2) // 1 + 1
    })

    it('deve aplicar bônus de perícia corretamente', () => {
      const result = ordemParanormalService.rollAttributeTest(1, 5)
      expect(result.bonus).toBe(5)
      expect(result.total).toBe(result.result + 5)
    })

    it('deve detectar crítico em rolagem de ataque (20 natural)', () => {
      // Mock para garantir um 20
      const originalRandom = Math.random
      let callCount = 0
      Math.random = jest.fn(() => {
        callCount++
        if (callCount === 1) return 0.99 // 20
        return 0.1
      })

      const result = ordemParanormalService.rollAttack(2, 5, 15)
      expect(result.critical).toBe(true)
      expect(result.hit).toBe(true) // Crítico sempre acerta

      Math.random = originalRandom
    })
  })

  describe('Condições Aplicam Penalidades Corretas', () => {
    it('deve aplicar penalidade de Abalado (-1D)', () => {
      const penalties = ordemParanormalService.calculateConditionPenalties(['ABALADO'])
      expect(penalties.dicePenalty).toBe(-1)
    })

    it('deve aplicar penalidade de Apavorado (-2D)', () => {
      const penalties = ordemParanormalService.calculateConditionPenalties(['APAVORADO'])
      expect(penalties.dicePenalty).toBe(-2)
    })

    it('deve aplicar penalidade de Desprevenido (-5 defesa, -2D)', () => {
      const penalties = ordemParanormalService.calculateConditionPenalties(['DESPREVENIDO'])
      expect(penalties.defense).toBe(-5)
      expect(penalties.defenseBase).toBe(true)
      expect(penalties.dicePenalty).toBe(-2)
    })

    it('deve aplicar penalidades de Cego (-2 AGI, FOR, Percepção)', () => {
      const penalties = ordemParanormalService.calculateConditionPenalties(['CEGO'])
      expect(penalties.attributePenalties.agi).toBe(-2)
      expect(penalties.attributePenalties.for).toBe(-2)
      expect(penalties.skillPenalties['Percepção']).toBe(-2)
    })

    it('deve aplicar penalidades de Exausto (-2 AGI, FOR, VIG, velocidade reduzida)', () => {
      const penalties = ordemParanormalService.calculateConditionPenalties(['EXAUSTO'])
      expect(penalties.attributePenalties.agi).toBe(-2)
      expect(penalties.attributePenalties.for).toBe(-2)
      expect(penalties.attributePenalties.vig).toBe(-2)
      expect(penalties.speedReduction).toBe(0.5)
    })

    it('deve aplicar penalidades combinadas corretamente', () => {
      const penalties = ordemParanormalService.calculateConditionPenalties(['ABALADO', 'CEGO'])
      expect(penalties.dicePenalty).toBe(-1) // Abalado
      expect(penalties.attributePenalties.agi).toBe(-2) // Cego
      expect(penalties.attributePenalties.for).toBe(-2) // Cego
    })
  })

  describe('Limites de Atributos Respeitados', () => {
    it('deve calcular defesa corretamente mesmo com AGI negativa', () => {
      const defense = ordemParanormalService.calculateDefense(-5)
      expect(defense).toBe(5) // 10 + (-5)
    })

    it('deve calcular defesa corretamente com AGI alta', () => {
      const defense = ordemParanormalService.calculateDefense(20)
      expect(defense).toBe(30) // 10 + 20
    })

    it('deve calcular recursos corretamente com atributos extremos', () => {
      // VIG mínimo
      const pvMin = ordemParanormalService.calculateMaxPV('COMBATENTE', -5, 0)
      expect(pvMin).toBe(15) // 20 + (-5)

      // VIG máximo
      const pvMax = ordemParanormalService.calculateMaxPV('COMBATENTE', 20, 99)
      expect(pvMax).toBeGreaterThan(100)

      // PRE mínimo
      const peMin = ordemParanormalService.calculateMaxPE('OCULTISTA', -5, 0)
      expect(peMin).toBe(-1) // 4 + (-5)

      // PRE máximo
      const peMax = ordemParanormalService.calculateMaxPE('OCULTISTA', 20, 99)
      expect(peMax).toBeGreaterThan(100)
    })
  })

  describe('Perícias Somente Treinadas Validadas', () => {
    it('deve retornar bônus 0 para perícia destreinada', () => {
      const bonus = ordemParanormalService.calculateSkillBonus('UNTRAINED')
      expect(bonus).toBe(0)
    })

    it('deve retornar bônus correto para cada nível de treinamento', () => {
      expect(ordemParanormalService.calculateSkillBonus('TRAINED')).toBe(5)
      expect(ordemParanormalService.calculateSkillBonus('COMPETENT')).toBe(10)
      expect(ordemParanormalService.calculateSkillBonus('EXPERT')).toBe(15)
    })

    it('deve aplicar bônus de perícia em rolagem', () => {
      const result = ordemParanormalService.rollAttributeTest(1, 5) // AGI 1, bônus 5
      expect(result.bonus).toBe(5)
      expect(result.total).toBe(result.result + 5)
    })
  })

  describe('Transformações de Condições', () => {
    it('deve transformar Abalado em Apavorado quando aplicado novamente', () => {
      const { newConditions, effects } = ordemParanormalService.applyCondition('ABALADO', [
        'ABALADO',
      ])
      expect(newConditions).not.toContain('ABALADO')
      expect(newConditions).toContain('APAVORADO')
      expect(effects.removeConditions).toContain('ABALADO')
      expect(effects.autoConditions).toContain('APAVORADO')
    })

    it('deve aplicar condições automáticas corretamente', () => {
      // Morrendo -> Inconsciente
      const morrendo = ordemParanormalService.applyCondition('MORRENDO', [])
      expect(morrendo.newConditions).toContain('MORRENDO')
      expect(morrendo.newConditions).toContain('INCONSCIENTE')

      // Atordado -> Desprevenido
      const atordado = ordemParanormalService.applyCondition('ATORDADO', [])
      expect(atordado.newConditions).toContain('ATORDADO')
      expect(atordado.newConditions).toContain('DESPREVENIDO')

      // Paralisado -> Imóvel + Indefeso
      const paralisado = ordemParanormalService.applyCondition('PARALISADO', [])
      expect(paralisado.newConditions).toContain('PARALISADO')
      expect(paralisado.newConditions).toContain('IMOVEL')
      expect(paralisado.newConditions).toContain('INDEFESO')

      // Exausto -> Debilitado + Lento
      const exausto = ordemParanormalService.applyCondition('EXAUSTO', [])
      expect(exausto.newConditions).toContain('EXAUSTO')
      expect(exausto.newConditions).toContain('DEBILITADO')
      expect(exausto.newConditions).toContain('LENTO')
    })
  })

  describe('Cálculo de NEX e Níveis', () => {
    it('deve converter NEX em níveis corretamente', () => {
      expect(ordemParanormalService.calculateNEXLevel(0)).toBe(0)
      expect(ordemParanormalService.calculateNEXLevel(5)).toBe(1)
      expect(ordemParanormalService.calculateNEXLevel(10)).toBe(2)
      expect(ordemParanormalService.calculateNEXLevel(15)).toBe(3)
      expect(ordemParanormalService.calculateNEXLevel(20)).toBe(4)
      expect(ordemParanormalService.calculateNEXLevel(99)).toBe(19)
    })

    it('deve calcular recuperação de PE baseada no nível', () => {
      expect(ordemParanormalService.calculatePERecovery(0)).toBe(1) // nível 0 + 1
      expect(ordemParanormalService.calculatePERecovery(5)).toBe(2) // nível 1 + 1
      expect(ordemParanormalService.calculatePERecovery(10)).toBe(3) // nível 2 + 1
      expect(ordemParanormalService.calculatePERecovery(20)).toBe(5) // nível 4 + 1
    })
  })
})

