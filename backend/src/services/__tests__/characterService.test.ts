import { characterService } from '../characterService'
import { supabase } from '../../config/supabase'
import { ordemParanormalService } from '../ordemParanormalService'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do ordemParanormalService
jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    calculateMaxPV: jest.fn(),
    calculateMaxSAN: jest.fn(),
    calculateMaxPE: jest.fn(),
    calculateDefense: jest.fn(),
    calculateSkillBonus: jest.fn(),
    applyCondition: jest.fn(),
    calculateConditionPenalties: jest.fn(),
    calculatePERecovery: jest.fn(),
    rollAttributeTest: jest.fn(),
    rollAttack: jest.fn(),
    isDying: jest.fn(),
    isInjured: jest.fn(),
    isInsane: jest.fn(),
  },
}))

describe('characterService - Sistema Ordem Paranormal', () => {
  const mockCharacter = {
    id: 'char-123',
    campaign_id: 'camp-123',
    user_id: 'user-123',
    name: 'Test Character',
    class: 'COMBATENTE',
    attributes: { agi: 2, for: 1, int: 0, pre: 1, vig: 2 },
    stats: {
      pv: { current: 20, max: 20 },
      san: { current: 12, max: 12 },
      pe: { current: 2, max: 2 },
      nex: 5,
    },
    skills: {
      Luta: { attribute: 'FOR', training: 'TRAINED', bonus: 5 },
    },
    conditions: [],
    defense: 12,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateAttributes', () => {
    it('deve atualizar atributos e recalcular recursos', async () => {
      const newAttributes = { agi: 3, for: 2, int: 1, pre: 2, vig: 3 }
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      ;(ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(30)
      ;(ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(15)
      ;(ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(6)
      ;(ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(13)

      const result = await characterService.updateAttributes('char-123', newAttributes)

      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 3, 5)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 5)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 2, 5)
      expect(ordemParanormalService.calculateDefense).toHaveBeenCalledWith(3)
    })
  })

  describe('updateSkills', () => {
    it('deve atualizar perícias e recalcular bônus', async () => {
      const newSkills = {
        Luta: { attribute: 'FOR', training: 'COMPETENT' },
        Pontaria: { attribute: 'AGI', training: 'TRAINED' },
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockCharacter, skills: newSkills },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.calculateSkillBonus as jest.Mock)
        .mockReturnValueOnce(10) // COMPETENT
        .mockReturnValueOnce(5) // TRAINED

      await characterService.updateSkills('char-123', newSkills)

      expect(ordemParanormalService.calculateSkillBonus).toHaveBeenCalledWith('COMPETENT')
      expect(ordemParanormalService.calculateSkillBonus).toHaveBeenCalledWith('TRAINED')
    })
  })

  describe('applyCondition', () => {
    it('deve aplicar condição usando ordemParanormalService', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockApplyResult = {
        newConditions: ['ABALADO'],
        effects: {
          message: 'Condição aplicada',
          autoConditions: [],
          removeConditions: [],
        },
      }

      ;(ordemParanormalService.applyCondition as jest.Mock).mockReturnValue(mockApplyResult)

      const result = await characterService.applyCondition('char-123', 'ABALADO')

      expect(ordemParanormalService.applyCondition).toHaveBeenCalledWith('ABALADO', [])
      expect(result.effects).toBeDefined()
    })

    it('deve aplicar condição com condições derivadas', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockCharacter, error: null })
          .mockResolvedValueOnce({
            data: { ...mockCharacter, conditions: ['MORRENDO', 'INCONSCIENTE'] },
            error: null,
          }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockApplyResult = {
        newConditions: ['MORRENDO', 'INCONSCIENTE'],
        effects: {
          message: 'Personagem está morrendo!',
          autoConditions: ['INCONSCIENTE'],
          removeConditions: [],
        },
      }

      ;(ordemParanormalService.applyCondition as jest.Mock).mockReturnValue(mockApplyResult)

      const result = await characterService.applyCondition('char-123', 'MORRENDO')

      expect(result.character.conditions).toContain('MORRENDO')
      expect(result.character.conditions).toContain('INCONSCIENTE')
    })
  })

  describe('removeCondition', () => {
    it('deve remover condição do personagem', async () => {
      const characterWithCondition = {
        ...mockCharacter,
        conditions: ['ABALADO', 'CEGO'],
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: characterWithCondition, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterService.removeCondition('char-123', 'ABALADO')

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: ['CEGO'],
        })
      )
    })
  })

  describe('updateNEX', () => {
    it('deve atualizar NEX e recalcular recursos', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      ;(ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(35)
      ;(ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(18)
      ;(ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(8)

      await characterService.updateNEX('char-123', 10)

      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 2, 10)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 10)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 1, 10)
    })

    it('deve lançar erro se NEX fora do range', async () => {
      await expect(characterService.updateNEX('char-123', 100)).rejects.toThrow(
        'NEX deve estar entre 0 e 99'
      )

      await expect(characterService.updateNEX('char-123', -1)).rejects.toThrow(
        'NEX deve estar entre 0 e 99'
      )
    })
  })

  describe('updatePV', () => {
    it('deve atualizar PV como valor absoluto', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
      ;(ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      const result = await characterService.updatePV('char-123', 15, false)

      expect(result.isDying).toBe(false)
      expect(result.isInjured).toBe(false)
    })

    it('deve atualizar PV como delta', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
      ;(ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      await characterService.updatePV('char-123', -5, true)

      // PV atual (20) - 5 = 15
      expect(mockQuery.update).toHaveBeenCalled()
    })

    it('deve aplicar condição Morrendo se PV <= 0', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isDying as jest.Mock).mockReturnValue(true)
      ;(ordemParanormalService.isInjured as jest.Mock).mockReturnValue(true)
      ;(ordemParanormalService.applyCondition as jest.Mock).mockReturnValue({
        newConditions: ['MORRENDO', 'INCONSCIENTE'],
        effects: { message: 'Morrendo', autoConditions: ['INCONSCIENTE'], removeConditions: [] },
      })

      const result = await characterService.updatePV('char-123', 0, false)

      expect(result.isDying).toBe(true)
      expect(ordemParanormalService.applyCondition).toHaveBeenCalledWith('MORRENDO', [])
    })

    it('deve remover Morrendo se PV > 0', async () => {
      const characterDying = {
        ...mockCharacter,
        conditions: ['MORRENDO', 'INCONSCIENTE'],
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: characterDying, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
      ;(ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      await characterService.updatePV('char-123', 10, false)

      // Deve remover MORRENDO e INCONSCIENTE
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: [],
        })
      )
    })
  })

  describe('updateSAN', () => {
    it('deve atualizar SAN e aplicar condições se necessário', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isInsane as jest.Mock).mockReturnValue(false)

      const result = await characterService.updateSAN('char-123', 10, false)

      expect(result.isInsane).toBe(false)
    })

    it('deve aplicar Enlouquecendo se SAN = 0', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isInsane as jest.Mock).mockReturnValue(true)

      await characterService.updateSAN('char-123', 0, false)

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: expect.arrayContaining(['ENLOUQUECENDO']),
        })
      )
    })

    it('deve aplicar Perturbado se SAN <= 25%', async () => {
      const characterLowSAN = {
        ...mockCharacter,
        stats: {
          ...mockCharacter.stats,
          san: { current: 2, max: 12 },
        },
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: characterLowSAN, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.isInsane as jest.Mock).mockReturnValue(false)

      await characterService.updateSAN('char-123', 3, false)

      // 3 <= 25% de 12 (3), deve aplicar Perturbado
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: expect.arrayContaining(['PERTURBADO']),
        })
      )
    })
  })

  describe('updatePE', () => {
    it('deve atualizar PE como valor absoluto', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.updatePE('char-123', 5, false)

      expect(mockQuery.update).toHaveBeenCalled()
    })

    it('deve atualizar PE como delta', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.updatePE('char-123', 2, true)

      // PE atual (2) + 2 = 4
      expect(mockQuery.update).toHaveBeenCalled()
    })
  })

  describe('rollSkillTest', () => {
    it('deve rolar teste de perícia com penalidades', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.calculateConditionPenalties as jest.Mock).mockReturnValue({
        defense: 0,
        defenseBase: false,
        dicePenalty: 0,
        cannotAct: false,
        cannotReact: false,
        cannotMove: false,
        speedReduction: 1,
        attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
        skillPenalties: {},
      })
      ;(ordemParanormalService.rollAttributeTest as jest.Mock).mockReturnValue({
        dice: [15],
        result: 15,
        bonus: 5,
        total: 20,
        advantage: true,
        disadvantage: false,
      })

      const result = await characterService.rollSkillTest('char-123', 'Luta', 15)

      expect(result.skillName).toBe('Luta')
      expect(result.success).toBe(true)
      expect(result.skillBonus).toBe(5)
    })

    it('deve lançar erro se perícia não encontrada', async () => {
      const characterWithoutSkill = {
        ...mockCharacter,
        skills: {},
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: characterWithoutSkill, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        characterService.rollSkillTest('char-123', 'Luta', 15)
      ).rejects.toThrow('Perícia Luta não encontrada')
    })
  })

  describe('rollAttack', () => {
    it('deve rolar ataque com penalidades', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.calculateConditionPenalties as jest.Mock).mockReturnValue({
        defense: 0,
        defenseBase: false,
        dicePenalty: 0,
        cannotAct: false,
        cannotReact: false,
        cannotMove: false,
        speedReduction: 1,
        attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
        skillPenalties: {},
      })
      ;(ordemParanormalService.rollAttack as jest.Mock).mockReturnValue({
        dice: [18],
        result: 18,
        bonus: 5,
        total: 23,
        hit: true,
        critical: false,
        targetDefense: 15,
      })

      const result = await characterService.rollAttack('char-123', 'Luta', 15)

      expect(result.skillName).toBe('Luta')
      expect(result.hit).toBe(true)
      expect(result.critical).toBe(false)
    })
  })

  describe('applyDamage', () => {
    it('deve aplicar dano físico reduzindo PV', async () => {
      const updatePVSpy = jest.spyOn(characterService, 'updatePV').mockResolvedValue({
        character: mockCharacter,
        isDying: false,
        isInjured: false,
      } as any)

      await characterService.applyDamage('char-123', 5, 'physical')

      expect(updatePVSpy).toHaveBeenCalledWith('char-123', -5, true)

      updatePVSpy.mockRestore()
    })

    it('deve aplicar dano mental reduzindo SAN', async () => {
      const updateSANSpy = jest.spyOn(characterService, 'updateSAN').mockResolvedValue({
        character: mockCharacter,
        isInsane: false,
        isLowSAN: false,
      } as any)

      await characterService.applyDamage('char-123', 3, 'mental')

      expect(updateSANSpy).toHaveBeenCalledWith('char-123', -3, true)

      updateSANSpy.mockRestore()
    })
  })

  describe('recoverPE', () => {
    it('deve recuperar PE baseado no NEX', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(ordemParanormalService.calculatePERecovery as jest.Mock).mockReturnValue(2)

      const updatePESpy = jest.spyOn(characterService, 'updatePE').mockResolvedValue(mockCharacter as any)

      await characterService.recoverPE('char-123')

      expect(ordemParanormalService.calculatePERecovery).toHaveBeenCalledWith(5)
      expect(updatePESpy).toHaveBeenCalledWith('char-123', 2, true)

      updatePESpy.mockRestore()
    })
  })
})

