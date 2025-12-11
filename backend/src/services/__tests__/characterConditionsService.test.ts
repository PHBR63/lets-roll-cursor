/**
 * Testes para characterConditionsService
 * Cobre aplicação e remoção de condições de personagens
 */
import { characterConditionsService } from '../character/characterConditionsService'
import { supabase } from '../../config/supabase'
import { ordemParanormalService } from '../ordemParanormalService'

jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    applyCondition: jest.fn(),
  },
}))

jest.mock('../cache', () => ({
  deleteCache: jest.fn(),
  getCharacterCacheKey: jest.fn((filters) => `characters:${JSON.stringify(filters)}`),
}))

describe('characterConditionsService', () => {
  const mockCharacter = {
    id: 'char-123',
    name: 'Test Character',
    conditions: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('applyCondition', () => {
    it('deve aplicar condição ao personagem', async () => {
      // Personagem atualizado com a condição
      const updatedCharacter = {
        ...mockCharacter,
        conditions: ['ABALADO'],
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockCharacter, error: null }) // fetch inicial
          .mockResolvedValueOnce({ data: updatedCharacter, error: null }), // após update
        update: jest.fn().mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockApplyResult = {
        newConditions: ['ABALADO'],
        effects: {
          message: 'Condição aplicada',
          autoConditions: [],
          removeConditions: [],
        },
      }

        ; (ordemParanormalService.applyCondition as jest.Mock).mockReturnValue(mockApplyResult)

      const result = await characterConditionsService.applyCondition('char-123', 'ABALADO')

      expect(ordemParanormalService.applyCondition).toHaveBeenCalledWith('ABALADO', [])
      expect(result.effects).toBeDefined()
      expect(result.character.conditions).toContain('ABALADO')
    })

    it('deve aplicar condição com condições derivadas', async () => {
      // Personagem atualizado com condições derivadas
      const updatedCharacter = {
        ...mockCharacter,
        conditions: ['MORRENDO', 'INCONSCIENTE', 'SANGRANDO'],
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockCharacter, error: null })
          .mockResolvedValueOnce({ data: updatedCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockApplyResult = {
        newConditions: ['MORRENDO', 'INCONSCIENTE', 'SANGRANDO'],
        effects: {
          message: 'Personagem está morrendo!',
          autoConditions: ['INCONSCIENTE', 'SANGRANDO'],
          removeConditions: [],
        },
      }

        ; (ordemParanormalService.applyCondition as jest.Mock).mockReturnValue(mockApplyResult)

      const result = await characterConditionsService.applyCondition('char-123', 'MORRENDO')

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

      const updatedCharacter = {
        ...mockCharacter,
        conditions: ['CEGO'],
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: characterWithCondition, error: null })
          .mockResolvedValueOnce({ data: updatedCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterConditionsService.removeCondition('char-123', 'ABALADO')

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: ['CEGO'],
        })
      )
      expect(result.conditions).toEqual(['CEGO'])
    })

    it('deve retornar personagem sem condições se remover todas', async () => {
      const characterWithCondition = {
        ...mockCharacter,
        conditions: ['ABALADO'],
      }

      const updatedCharacter = {
        ...mockCharacter,
        conditions: [],
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: characterWithCondition, error: null })
          .mockResolvedValueOnce({ data: updatedCharacter, error: null }),
        update: jest.fn().mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterConditionsService.removeCondition('char-123', 'ABALADO')

      expect(result.conditions).toEqual([])
    })
  })
})

