/**
 * Testes para creatureService
 * Cobre CRUD de criaturas e filtros
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { creatureService } from '../creatureService'
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
  getCreatureCacheKey: jest.fn((filters: any) => {
    if (filters.campaignId) return `creatures:campaign:${filters.campaignId}`
    if (filters.isGlobal) return `creatures:global`
    return 'creatures:all'
  }),
}))

describe('creatureService', () => {
  const mockCreature = {
    id: 'creature-123',
    name: 'Zumbi de Sangue',
    description: 'Um zumbi criado por rituais de sangue',
    type: 'UNDEAD',
    challenge_rating: 5,
    campaign_id: 'camp-123',
    is_global: false,
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    attributes: {
      agi: 1,
      for: 3,
      int: -1,
      pre: 0,
      vig: 4,
    },
    stats: {
      pv: { current: 20, max: 20 },
      san: { current: 0, max: 0 },
      pe: { current: 0, max: 0 },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
      ; (cacheModule.getCache as jest.Mock).mockResolvedValue(null)
      ; (cacheModule.setCache as jest.Mock).mockResolvedValue(undefined)
  })

  describe('getCreatures', () => {
    it('deve buscar criaturas sem filtros', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        or: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockResolvedValue({
          data: [mockCreature],
          error: null,
          count: 1,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await creatureService.getCreatures({})

      expect(result.data).toEqual([mockCreature])
      expect(result.total).toBe(1)
      expect(mockQuery.or).toHaveBeenCalledWith('is_global.eq.true,campaign_id.is.null')
    })

    it('deve buscar criaturas por campaignId', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockResolvedValue({
          data: [mockCreature],
          error: null,
          count: 1,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await creatureService.getCreatures({ campaignId: 'camp-123' })

      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(result.data).toEqual([mockCreature])
    })

    it('deve buscar criaturas globais', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockResolvedValue({
          data: [mockCreature],
          error: null,
          count: 1,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await creatureService.getCreatures({ isGlobal: true })

      expect(mockQuery.eq).toHaveBeenCalledWith('is_global', true)
    })

    it('deve retornar do cache se disponível', async () => {
      const cachedData = {
        data: [mockCreature],
        total: 1,
        limit: 20,
        offset: 0,
        hasMore: false,
      }
        ; (cacheModule.getCache as jest.Mock).mockResolvedValue(cachedData)

      const result = await creatureService.getCreatures({})

      expect(result).toEqual(cachedData)
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('deve aplicar paginação', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        or: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockResolvedValue({
          data: [mockCreature],
          error: null,
          count: 10,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await creatureService.getCreatures({ limit: 10, offset: 20 })

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29)
      expect(result.hasMore).toBe(true)
    })

    it('deve lançar erro se busca falhar', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        or: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(creatureService.getCreatures({})).rejects.toThrow('Erro ao buscar criaturas')
    })
  })

  describe('getCreatureById', () => {
    it('deve buscar criatura por ID', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCreature,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await creatureService.getCreatureById('creature-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'creature-123')
      expect(result).toEqual(mockCreature)
    })

    it('deve lançar erro se criatura não encontrada', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(creatureService.getCreatureById('creature-999')).rejects.toThrow(
        'Erro ao buscar criatura'
      )
    })
  })

  describe('createCreature', () => {
    it('deve criar criatura com dados válidos', async () => {
      const newCreature = {
        name: 'Nova Criatura',
        description: 'Descrição',
        type: 'ABERRATION',
        challenge_rating: 3,
        campaignId: 'camp-123',
        createdBy: 'user-123',
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCreature, ...newCreature },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await creatureService.createCreature('user-123', newCreature)

      expect(mockQuery.insert).toHaveBeenCalled()
      expect(cacheModule.deleteCachePattern).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('deve lançar erro se criação falhar', async () => {
      const newCreature = {
        name: 'Nova Criatura',
        type: 'ABERRATION',
        campaignId: 'camp-123',
        createdBy: 'user-123',
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(creatureService.createCreature('user-123', newCreature)).rejects.toThrow('Erro ao criar criatura')
    })
  })

  describe('updateCreature', () => {
    it('deve atualizar criatura existente', async () => {
      const updateData = {
        name: 'Criatura Atualizada',
        challenge_rating: 7,
      }

      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCreature, ...updateData },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await creatureService.updateCreature('creature-123', updateData)

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'creature-123')
      expect(cacheModule.deleteCache).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('deve lançar erro se criatura não encontrada', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(creatureService.updateCreature('creature-999', { name: 'Novo Nome' })).rejects.toThrow(
        'Erro ao atualizar criatura'
      )
    })
  })

  describe('deleteCreature', () => {
    it('deve deletar criatura existente', async () => {
      const mockSelectQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { campaign_id: 'camp-123' },
          error: null,
        }),
      }

      const mockDeleteQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockSelectQuery)
          .mockReturnValueOnce(mockDeleteQuery)

      await creatureService.deleteCreature('creature-123')

      expect(mockDeleteQuery.eq).toHaveBeenCalledWith('id', 'creature-123')
      expect(cacheModule.deleteCache).toHaveBeenCalled()
      expect(cacheModule.deleteCachePattern).toHaveBeenCalled()
    })

    it('deve lançar erro se deleção falhar', async () => {
      const mockSelectQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { campaign_id: 'camp-123' },
          error: null,
        }),
      }

      const mockDeleteQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockSelectQuery)
          .mockReturnValueOnce(mockDeleteQuery)

      await expect(creatureService.deleteCreature('creature-123')).rejects.toThrow('Erro ao deletar criatura')
    })
  })
})

