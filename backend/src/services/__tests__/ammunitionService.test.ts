/**
 * Testes para ammunitionService (Atualizado)
 * Cobre gerenciamento de munição abstrata (Ordem Paranormal)
 */
import { ammunitionService } from '../ammunitionService'
import { supabase } from '../../config/supabase'
import * as cacheModule from '../cache'

// Mock do Supabase e Cache
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

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
  const mockCharacterId = 'char-123'
  const mockSessionId = 'session-123'
  const mockWeaponId = 'weapon-avt-12'

  beforeEach(() => {
    jest.clearAllMocks()
      ; (cacheModule.deleteCache as jest.Mock).mockResolvedValue(undefined)
      ; (cacheModule.deleteCachePattern as jest.Mock).mockResolvedValue(undefined)
  })

  describe('getAmmunitionState', () => {
    it('deve retornar estado inicial CHEIO se não existir', async () => {
      // Mock para select retornando null (não encontrado)
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }

      // Mock para insert (initialize)
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'CHEIO',
            mode: 'A',
            created_at: new Date().toISOString()
          },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockQuery) // Select
          .mockReturnValueOnce(mockInsert) // Insert (dentro do initialize)

      const result = await ammunitionService.getAmmunitionState(mockCharacterId, mockSessionId)

      expect(result.state).toBe('CHEIO')
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', mockCharacterId)
    })

    it('deve retornar estado existente do banco', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'ESTAVEL',
            mode: 'A'
          },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await ammunitionService.getAmmunitionState(mockCharacterId, mockSessionId)

      expect(result.state).toBe('ESTAVEL')
    })
  })

  describe('spendAmmunition', () => {
    it('deve degradar estado de CHEIO para ESTAVEL', async () => {
      // 1. Get current state (CHEIO)
      const mockGet = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'CHEIO',
            mode: 'A',
            reload_to_full: true
          },
          error: null,
        }),
      }

      // 2. Update to ESTAVEL
      const mockUpdate = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'ESTAVEL',
            mode: 'A'
          },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockGet)
          .mockReturnValueOnce(mockUpdate)

      const result = await ammunitionService.spendAmmunition(mockCharacterId, mockSessionId)

      expect(result.state).toBe('ESTAVEL')
    })

    it('não deve degradar se já estiver ESGOTADO', async () => {
      const mockGet = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'ESGOTADO',
            mode: 'A'
          },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockGet)

      const result = await ammunitionService.spendAmmunition(mockCharacterId, mockSessionId)

      expect(result.state).toBe('ESGOTADO')
    })
  })

  describe('reloadAmmunition', () => {
    it('deve recarregar para CHEIO', async () => {
      const mockGet = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'BAIXO',
            reload_to_full: true
          },
          error: null,
        }),
      }

      const mockUpdate = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            character_id: mockCharacterId,
            state: 'CHEIO'
          },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockGet)
          .mockReturnValueOnce(mockUpdate)

      const result = await ammunitionService.reloadAmmunition(mockCharacterId, mockSessionId)

      expect(result.state).toBe('CHEIO')
    })
  })
})
