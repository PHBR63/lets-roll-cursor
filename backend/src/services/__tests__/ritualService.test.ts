/**
 * Testes para ritualService
 * Cobre conjuração de rituais, validação de PE e testes de custo
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ritualService } from '../ritualService'
import { supabase } from '../../config/supabase'
import { ordemParanormalService } from '../ordemParanormalService'
import { characterResourcesService } from '../character/characterResourcesService'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do ordemParanormalService
jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    rollRitualCostTest: jest.fn(),
    calculateSkillBonus: jest.fn(),
  },
}))

// Mock do characterResourcesService
jest.mock('../character/characterResourcesService', () => ({
  characterResourcesService: {
    spendPE: jest.fn(),
    updateSAN: jest.fn(),
  },
}))

describe('ritualService', () => {
  const mockCharacter = {
    id: 'char-123',
    name: 'Test Character',
    class: 'OCULTISTA',
    attributes: {
      agi: 1,
      for: 1,
      int: 3,
      pre: 2,
      vig: 1,
    },
    stats: {
      pv: { current: 15, max: 15 },
      san: { current: 20, max: 20 },
      pe: { current: 10, max: 10 },
      nex: 10,
    },
    skills: {
      Ocultismo: {
        attribute: 'INT',
        training: 'TRAINED',
        bonus: 5,
      },
    },
    conditions: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('conjureRitualWithCost', () => {
    it('deve conjurar ritual com sucesso quando teste passa', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(characterResourcesService.spendPE as jest.Mock).mockResolvedValue({
        character: mockCharacter,
      })
      ;(ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
        success: true,
        rollResult: 20,
        dt: 15,
        criticalFailure: false,
      })

      const result = await ritualService.conjureRitualWithCost('char-123', 3, 0)

      expect(characterResourcesService.spendPE).toHaveBeenCalledWith('char-123', 3, 0)
      expect(ordemParanormalService.rollRitualCostTest).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.sanLoss).toBe(0)
    })

    it('deve falhar se PE insuficiente', async () => {
      const characterLowPE = {
        ...mockCharacter,
        stats: {
          ...mockCharacter.stats,
          pe: { current: 2, max: 10 },
        },
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: characterLowPE,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(ritualService.conjureRitualWithCost('char-123', 5, 0)).rejects.toThrow(
        'PE insuficiente'
      )
    })

    it('deve aplicar perda de SAN quando teste falha', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(characterResourcesService.spendPE as jest.Mock).mockResolvedValue({
        character: mockCharacter,
      })
      ;(ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
        success: false,
        rollResult: 10,
        dt: 15,
        criticalFailure: false,
      })
      ;(characterResourcesService.updateSAN as jest.Mock).mockResolvedValue({
        character: {
          ...mockCharacter,
          stats: {
            ...mockCharacter.stats,
            san: { current: 17, max: 20 },
          },
        },
      })

      const result = await ritualService.conjureRitualWithCost('char-123', 3, 0)

      expect(characterResourcesService.updateSAN).toHaveBeenCalledWith('char-123', -3, true)
      expect(result.success).toBe(false)
      expect(result.sanLoss).toBe(3)
    })

    it('deve aplicar perda permanente de SAN máxima em falha crítica', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: mockCharacter,
            error: null,
          })
          .mockResolvedValueOnce({
            data: {
              ...mockCharacter,
              stats: {
                ...mockCharacter.stats,
                san: { current: 17, max: 19 },
              },
            },
            error: null,
          }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(characterResourcesService.spendPE as jest.Mock).mockResolvedValue({
        character: mockCharacter,
      })
      ;(ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
        success: false,
        rollResult: 1,
        dt: 15,
        criticalFailure: true,
      })
      ;(characterResourcesService.updateSAN as jest.Mock).mockResolvedValue({
        character: {
          ...mockCharacter,
          stats: {
            ...mockCharacter.stats,
            san: { current: 17, max: 20 },
          },
        },
      })

      const result = await ritualService.conjureRitualWithCost('char-123', 3, 0)

      expect(result.sanLoss).toBe(3)
      expect(result.sanMaxLoss).toBe(1)
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            san: expect.objectContaining({
              max: 19,
            }),
          }),
        })
      )
    })

    it('deve validar limite de PE por turno', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(characterResourcesService.spendPE as jest.Mock).mockRejectedValue(
        new Error('Limite de PE por turno excedido')
      )

      await expect(ritualService.conjureRitualWithCost('char-123', 5, 3)).rejects.toThrow(
        'Limite de PE por turno excedido'
      )
    })

    it('deve calcular bônus de Ocultismo corretamente', async () => {
      const characterWithOcultismo = {
        ...mockCharacter,
        skills: {
          Ocultismo: {
            attribute: 'INT',
            training: 'COMPETENT',
            bonus: 10,
          },
        },
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: characterWithOcultismo,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(characterResourcesService.spendPE as jest.Mock).mockResolvedValue({
        character: characterWithOcultismo,
      })
      ;(ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
        success: true,
        rollResult: 25,
        dt: 15,
        criticalFailure: false,
      })

      await ritualService.conjureRitualWithCost('char-123', 3, 0)

      expect(ordemParanormalService.rollRitualCostTest).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: expect.objectContaining({
            Ocultismo: expect.objectContaining({
              bonus: 10,
            }),
          }),
        }),
        3
      )
    })

    it('deve usar bônus padrão se Ocultismo não encontrado', async () => {
      const characterWithoutOcultismo = {
        ...mockCharacter,
        skills: {},
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: characterWithoutOcultismo,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
      ;(characterResourcesService.spendPE as jest.Mock).mockResolvedValue({
        character: characterWithoutOcultismo,
      })
      ;(ordemParanormalService.calculateSkillBonus as jest.Mock).mockReturnValue(0)
      ;(ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
        success: true,
        rollResult: 15,
        dt: 15,
        criticalFailure: false,
      })

      await ritualService.conjureRitualWithCost('char-123', 3, 0)

      expect(ordemParanormalService.rollRitualCostTest).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: expect.objectContaining({
            Ocultismo: expect.objectContaining({
              training: 'UNTRAINED',
              bonus: 0,
            }),
          }),
        }),
        3
      )
    })

    it('deve lançar erro se personagem não encontrado', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(ritualService.conjureRitualWithCost('char-999', 3, 0)).rejects.toThrow(
        'Erro ao conjurar ritual'
      )
    })
  })
})

