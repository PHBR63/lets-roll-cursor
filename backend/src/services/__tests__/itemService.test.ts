/**
 * Testes para itemService
 * Cobre CRUD de itens e filtros
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { itemService } from '../itemService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('itemService', () => {
  const mockItem = {
    id: 'item-123',
    name: 'Espada Longa',
    description: 'Uma espada longa',
    type: 'WEAPON',
    weight: 2.5,
    category: 'I',
    campaign_id: 'camp-123',
    is_global: false,
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getItems', () => {
    it('deve buscar itens sem filtros', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockItem],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await itemService.getItems({})

      expect(result).toEqual([mockItem])
      expect(mockQuery.or).toHaveBeenCalledWith('is_global.eq.true,campaign_id.is.null')
    })

    it('deve buscar itens por campaignId', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockItem],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await itemService.getItems({ campaignId: 'camp-123' })

      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(result).toEqual([mockItem])
    })

    it('deve buscar itens globais', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockItem],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await itemService.getItems({ isGlobal: true })

      expect(mockQuery.eq).toHaveBeenCalledWith('is_global', true)
    })

    it('deve aplicar paginação', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [mockItem],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await itemService.getItems({ limit: 10, offset: 20 })

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29)
    })

    it('deve lançar erro se busca falhar', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(itemService.getItems({})).rejects.toThrow('Erro ao buscar itens')
    })
  })

  describe('getItemById', () => {
    it('deve buscar item por ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockItem,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await itemService.getItemById('item-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'item-123')
      expect(result).toEqual(mockItem)
    })

    it('deve lançar erro se item não encontrado', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(itemService.getItemById('item-999')).rejects.toThrow('Erro ao buscar item')
    })
  })

  describe('createItem', () => {
    it('deve criar item com dados válidos', async () => {
      const newItem = {
        name: 'Novo Item',
        description: 'Descrição',
        type: 'EQUIPMENT',
        weight: 1.0,
        campaignId: 'camp-123',
        createdBy: 'user-123',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockItem, ...newItem },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await itemService.createItem(newItem)

      expect(mockQuery.insert).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('deve lançar erro se criação falhar', async () => {
      const newItem = {
        name: 'Novo Item',
        type: 'EQUIPMENT',
        campaignId: 'camp-123',
        createdBy: 'user-123',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(itemService.createItem('user-123', newItem)).rejects.toThrow('Erro ao criar item')
    })
  })

  describe('updateItem', () => {
    it('deve atualizar item existente', async () => {
      const updateData = {
        name: 'Espada Atualizada',
        weight: 3.0,
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockItem, ...updateData },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await itemService.updateItem('item-123', updateData)

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'item-123')
      expect(result).toBeDefined()
    })

    it('deve lançar erro se item não encontrado', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(itemService.updateItem('item-999', { name: 'Novo Nome' })).rejects.toThrow(
        'Erro ao atualizar item'
      )
    })
  })

  describe('deleteItem', () => {
    it('deve deletar item existente', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await itemService.deleteItem('item-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'item-123')
    })

    it('deve lançar erro se deleção falhar', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(itemService.deleteItem('item-123')).rejects.toThrow('Erro ao deletar item')
    })
  })
})

