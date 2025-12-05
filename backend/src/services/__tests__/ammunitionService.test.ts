import { ammunitionService } from '../ammunitionService'
import { supabase } from '../../config/supabase'
import * as cacheModule from '../cache'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do cache
jest.mock('../cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
  getAmmunitionCacheKey: jest.fn(({ sessionId, characterId }) => {
    return `ammunition:${sessionId}:${characterId}`
  }),
}))

describe('ammunitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cacheModule.deleteCache as jest.Mock).mockResolvedValue(undefined)
    ;(cacheModule.deleteCachePattern as jest.Mock).mockResolvedValue(undefined)
  })

  describe('getAmmunitionState', () => {
    it('deve retornar estado de munição existente', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 75 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await ammunitionService.getAmmunitionState('session-123', 'char-123')

      expect(result).toBe(75)
      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', 'char-123')
    })

    it('deve retornar 100 como padrão se não existir', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // No rows found
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await ammunitionService.getAmmunitionState('session-123', 'char-123')

      expect(result).toBe(100)
    })
  })

  describe('initializeAmmunition', () => {
    it('deve inicializar munição com valor padrão', async () => {
      const mockUpsert = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 100 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockUpsert)

      const result = await ammunitionService.initializeAmmunition('session-123', 'char-123')

      expect(result).toBe(100)
      expect(mockUpsert.upsert).toHaveBeenCalled()
    })

    it('deve inicializar com valor customizado', async () => {
      const mockUpsert = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 50 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockUpsert)

      const result = await ammunitionService.initializeAmmunition('session-123', 'char-123', 50)

      expect(result).toBe(50)
    })
  })

  describe('spendAmmunition', () => {
    it('deve gastar munição corretamente', async () => {
      const mockGet = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 100 },
          error: null,
        }),
      }

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 90 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce(mockGet)
        .mockReturnValueOnce(mockUpdate)

      const result = await ammunitionService.spendAmmunition('session-123', 'char-123', 10)

      expect(result).toBe(90)
    })

    it('deve não permitir munição negativa', async () => {
      const mockGet = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 5 },
          error: null,
        }),
      }

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 0 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce(mockGet)
        .mockReturnValueOnce(mockUpdate)

      const result = await ammunitionService.spendAmmunition('session-123', 'char-123', 10)

      expect(result).toBe(0)
    })
  })

  describe('reloadAmmunition', () => {
    it('deve recarregar munição corretamente', async () => {
      const mockGet = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 50 },
          error: null,
        }),
      }

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 100 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce(mockGet)
        .mockReturnValueOnce(mockUpdate)

      const result = await ammunitionService.reloadAmmunition('session-123', 'char-123', 50)

      expect(result).toBe(100)
    })

    it('deve não permitir munição acima de 100', async () => {
      const mockGet = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 80 },
          error: null,
        }),
      }

      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 100 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce(mockGet)
        .mockReturnValueOnce(mockUpdate)

      const result = await ammunitionService.reloadAmmunition('session-123', 'char-123', 50)

      expect(result).toBe(100)
    })
  })

  describe('setAmmunition', () => {
    it('deve definir munição para valor específico', async () => {
      const mockUpsert = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ammunition: 75 },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockUpsert)

      const result = await ammunitionService.setAmmunition('session-123', 'char-123', 75)

      expect(result).toBe(75)
    })

    it('deve limitar valor entre 0 e 100', async () => {
      const mockUpsert = {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: { ammunition: 0 },
            error: null,
          })
          .mockResolvedValueOnce({
            data: { ammunition: 100 },
            error: null,
          }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockUpsert)

      const result1 = await ammunitionService.setAmmunition('session-123', 'char-123', -10)
      const result2 = await ammunitionService.setAmmunition('session-123', 'char-123', 150)

      expect(result1).toBe(0)
      expect(result2).toBe(100)
    })
  })

  describe('resetSessionAmmunition', () => {
    it('deve resetar munição de todos os personagens da sessão', async () => {
      const mockUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockUpdate)

      await ammunitionService.resetSessionAmmunition('session-123')

      expect(mockUpdate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ammunition: 100,
        }),
        expect.anything()
      )
      expect(mockUpdate.eq).toHaveBeenCalledWith('session_id', 'session-123')
    })
  })
})

