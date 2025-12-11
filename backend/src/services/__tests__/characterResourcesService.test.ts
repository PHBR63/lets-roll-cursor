/**
 * Testes para characterResourcesService
 */
import { characterResourcesService } from '../character/characterResourcesService'
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
    calculatePERecovery: jest.fn(),
    isDying: jest.fn(),
    isInjured: jest.fn(),
    isInsane: jest.fn(),
    applyCondition: jest.fn(),
  },
}))

jest.mock('../cache', () => ({
  deleteCache: jest.fn(),
  getCharacterCacheKey: jest.fn((filters) => `characters:${JSON.stringify(filters)}`),
}))

describe('characterResourcesService', () => {
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
    conditions: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateNEX', () => {
    it('deve atualizar NEX e recalcular recursos', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(35)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(18)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(8)

      await characterResourcesService.updateNEX('char-123', 10)

      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 2, 10)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 10)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 1, 10)
    })

    it('deve lançar erro se NEX fora do range', async () => {
      await expect(characterResourcesService.updateNEX('char-123', 100)).rejects.toThrow(
        'NEX deve estar entre 0 e 99'
      )

      await expect(characterResourcesService.updateNEX('char-123', -1)).rejects.toThrow(
        'NEX deve estar entre 0 e 99'
      )
    })
  })

  describe('updatePV', () => {
    it('deve atualizar PV como valor absoluto', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      const result = await characterResourcesService.updatePV('char-123', 15, false)

      expect(result.isDying).toBe(false)
      expect(result.isInjured).toBe(false)
    })

    it('deve atualizar PV como delta', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      await characterResourcesService.updatePV('char-123', -5, true)

      expect(mockQuery.update).toHaveBeenCalled()
    })

    it('deve aplicar condição Morrendo se PV <= 0', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(true)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(true)
        ; (ordemParanormalService.applyCondition as jest.Mock).mockReturnValue({
          newConditions: ['MORRENDO', 'INCONSCIENTE'],
          effects: { message: 'Morrendo', autoConditions: ['INCONSCIENTE'], removeConditions: [] },
        })

      const result = await characterResourcesService.updatePV('char-123', 0, false)

      expect(result.isDying).toBe(true)
      expect(ordemParanormalService.applyCondition).toHaveBeenCalledWith('MORRENDO', [])
    })
  })

  describe('updateSAN', () => {
    it('deve atualizar SAN e aplicar condições se necessário', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isInsane as jest.Mock).mockReturnValue(false)

      const result = await characterResourcesService.updateSAN('char-123', 10, false)

      expect(result.isInsane).toBe(false)
    })

    it('deve aplicar Enlouquecendo se SAN = 0', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isInsane as jest.Mock).mockReturnValue(true)

      await characterResourcesService.updateSAN('char-123', 0, false)

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: expect.arrayContaining(['ENLOUQUECENDO']),
        })
      )
    })
  })

  describe('updatePE', () => {
    it('deve atualizar PE como valor absoluto', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterResourcesService.updatePE('char-123', 5, false)

      expect(mockQuery.update).toHaveBeenCalled()
    })

    it('deve atualizar PE como delta', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterResourcesService.updatePE('char-123', 2, true)

      expect(mockQuery.update).toHaveBeenCalled()
    })
  })

  describe('applyDamage', () => {
    it('deve aplicar dano físico reduzindo PV', async () => {
      const updatePVSpy = jest
        .spyOn(characterResourcesService, 'updatePV')
        .mockResolvedValue({
          character: mockCharacter,
          isDying: false,
          isInjured: false,
        } as any)

      await characterResourcesService.applyDamage('char-123', 5, 'physical')

      expect(updatePVSpy).toHaveBeenCalledWith('char-123', -5, true)

      updatePVSpy.mockRestore()
    })

    it('deve aplicar dano mental reduzindo SAN', async () => {
      const updateSANSpy = jest
        .spyOn(characterResourcesService, 'updateSAN')
        .mockResolvedValue({
          character: mockCharacter,
          isInsane: false,
          isLowSAN: false,
        } as any)

      await characterResourcesService.applyDamage('char-123', 3, 'mental')

      expect(updateSANSpy).toHaveBeenCalledWith('char-123', -3, true)

      updateSANSpy.mockRestore()
    })
  })

  describe('recoverPE', () => {
    it('deve recuperar PE baseado no NEX', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculatePERecovery as jest.Mock).mockReturnValue(2)

      const updatePESpy = jest
        .spyOn(characterResourcesService, 'updatePE')
        .mockResolvedValue({ character: mockCharacter } as any)

      await characterResourcesService.recoverPE('char-123')

      expect(ordemParanormalService.calculatePERecovery).toHaveBeenCalledWith(5)
      expect(updatePESpy).toHaveBeenCalledWith('char-123', 2, true)

      updatePESpy.mockRestore()
    })
  })
})

