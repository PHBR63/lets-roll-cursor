import { diceService } from '../diceService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('diceService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rollDice', () => {
    it('deve rolar dados básicos (1d20)', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'roll-123',
            formula: '1d20',
            result: 15,
            details: { rolls: [15], modifier: 0 },
          },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      const result = await diceService.rollDice({
        formula: '1d20',
        userId: 'user-123',
        campaignId: 'camp-123',
      })

      expect(result).toBeDefined()
      expect(result.formula).toBe('1d20')
      expect(result.result).toBeGreaterThanOrEqual(1)
      expect(result.result).toBeLessThanOrEqual(20)
      expect(mockInsert.insert).toHaveBeenCalled()
    })

    it('deve rolar dados com modificador (2d6+3)', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'roll-123',
            formula: '2d6+3',
            result: 12,
            details: { rolls: [4, 5], modifier: 3 },
          },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      const result = await diceService.rollDice({
        formula: '2d6+3',
        userId: 'user-123',
        campaignId: 'camp-123',
      })

      expect(result).toBeDefined()
      expect(result.formula).toBe('2d6+3')
      expect(Array.isArray(result.details)).toBe(true)
      expect(result.details.length).toBeGreaterThanOrEqual(2)
      expect(mockInsert.insert).toHaveBeenCalled()
    })

    it('deve lançar erro para fórmula inválida', async () => {
      await expect(
        diceService.rollDice({
          formula: 'invalid',
          userId: 'user-123',
          campaignId: 'camp-123',
        })
      ).rejects.toThrow('Fórmula inválida')
    })

    it('deve validar quantidade de dados (máximo 100)', async () => {
      await expect(
        diceService.rollDice({
          formula: '101d20',
          userId: 'user-123',
          campaignId: 'camp-123',
        })
      ).rejects.toThrow('Quantidade de dados deve ser entre 1 e 100')
    })

    it('deve validar número de lados (máximo 1000)', async () => {
      await expect(
        diceService.rollDice({
          formula: '1d1001',
          userId: 'user-123',
          campaignId: 'camp-123',
        })
      ).rejects.toThrow('Número de lados deve ser entre 2 e 1000')
    })

    it('deve salvar rolagem privada corretamente', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'roll-123',
            formula: '1d20',
            result: 10,
            is_private: true,
          },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await diceService.rollDice({
        formula: '1d20',
        userId: 'user-123',
        campaignId: 'camp-123',
        isPrivate: true,
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_private: true,
        })
      )
    })

    it('deve associar rolagem a personagem quando fornecido', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'roll-123',
            formula: '1d20',
            result: 10,
            character_id: 'char-123',
          },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await diceService.rollDice({
        formula: '1d20',
        userId: 'user-123',
        campaignId: 'camp-123',
        characterId: 'char-123',
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          character_id: 'char-123',
        })
      )
    })
  })

  describe('getRollHistory', () => {
    it('deve buscar histórico de rolagens', async () => {
      // Criar mock que suporta encadeamento
      const createMockQuery = () => {
        const mockQuery: any = {
          select: jest.fn(),
          eq: jest.fn(),
          order: jest.fn(),
          limit: jest.fn(),
        }
        // Cada método retorna o próprio objeto para encadeamento
        mockQuery.select.mockReturnValue(mockQuery)
        mockQuery.eq.mockReturnValue(mockQuery)
        mockQuery.order.mockReturnValue(mockQuery)
        mockQuery.limit.mockResolvedValue({
          data: [
            {
              id: 'roll-1',
              formula: '1d20',
              result: 15,
              user: { username: 'user1' },
              character: { name: 'Char1' },
            },
          ],
          error: null,
        })
        return mockQuery
      }

      const mockQuery = createMockQuery()
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await diceService.getRollHistory(undefined, 'camp-123', 10)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(mockQuery.eq).toHaveBeenCalledWith('is_private', false)
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
    })

    it('deve filtrar por sessionId quando fornecido', async () => {
      const createMockQuery = () => {
        const mockQuery: any = {
          select: jest.fn(),
          eq: jest.fn(),
          order: jest.fn(),
          limit: jest.fn(),
        }
        mockQuery.select.mockReturnValue(mockQuery)
        mockQuery.eq.mockReturnValue(mockQuery)
        mockQuery.order.mockReturnValue(mockQuery)
        mockQuery.limit.mockResolvedValue({
          data: [],
          error: null,
        })
        return mockQuery
      }

      const mockQuery = createMockQuery()
      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await diceService.getRollHistory('session-123', 'camp-123', 50)

      expect(mockQuery.eq).toHaveBeenCalledWith('is_private', false)
      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
    })
  })
})

