/**
 * Testes para characterAttributesService
 */
import { characterAttributesService } from '../character/characterAttributesService'
import { supabase } from '../../config/supabase'
import { ordemParanormalService } from '../ordemParanormalService'

jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    calculateMaxPV: jest.fn(),
    calculateMaxSAN: jest.fn(),
    calculateMaxPE: jest.fn(),
    calculateDefense: jest.fn(),
    calculateSkillBonus: jest.fn(),
    calculateConditionPenalties: jest.fn(),
    rollAttributeTest: jest.fn(),
    rollAttack: jest.fn(),
  },
}))

jest.mock('../cache', () => ({
  deleteCache: jest.fn(),
  getCharacterCacheKey: jest.fn((filters) => `characters:${JSON.stringify(filters)}`),
}))

describe('characterAttributesService', () => {
  const mockCharacter = {
    id: 'char-123',
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

      const result = await characterAttributesService.updateAttributes('char-123', newAttributes)

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

      await characterAttributesService.updateSkills('char-123', newSkills as any)

      expect(ordemParanormalService.calculateSkillBonus).toHaveBeenCalledWith('COMPETENT')
      expect(ordemParanormalService.calculateSkillBonus).toHaveBeenCalledWith('TRAINED')
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

      const result = await characterAttributesService.rollSkillTest('char-123', 'Luta', 15)

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
        characterAttributesService.rollSkillTest('char-123', 'Luta', 15)
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

      const result = await characterAttributesService.rollAttack('char-123', 'Luta', 15)

      expect(result.skillName).toBe('Luta')
      expect(result.hit).toBe(true)
      expect(result.critical).toBe(false)
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
        characterAttributesService.rollAttack('char-123', 'Luta', 15)
      ).rejects.toThrow('Perícia Luta não encontrada')
    })
  })
})

