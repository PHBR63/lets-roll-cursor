/**
 * Testes para characterInventoryService
 */
import { characterInventoryService } from '../character/characterInventoryService'
import { supabase } from '../../config/supabase'

jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('characterInventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCharacterInventory', () => {
    it('deve retornar inventário do personagem', async () => {
      const mockInventory = [
        {
          id: 'inv-1',
          character_id: 'char-123',
          item_id: 'item-1',
          quantity: 2,
          equipped: false,
          item: {
            id: 'item-1',
            name: 'Espada',
            type: 'WEAPON',
          },
        },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockInventory, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.getCharacterInventory('char-123')

      expect(result).toEqual(mockInventory)
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', 'char-123')
    })

    it('deve retornar array vazio se não houver itens', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.getCharacterInventory('char-123')

      expect(result).toEqual([])
    })
  })

  describe('addItemToCharacter', () => {
    it('deve adicionar novo item ao inventário', async () => {
      // Mock para query que não encontra item (PGRST116)
      const mockQueryError = {
        code: 'PGRST116',
        message: 'No rows returned',
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValueOnce({ data: null, error: mockQueryError })
          .mockResolvedValueOnce({
            data: { id: 'inv-1', character_id: 'char-123', item_id: 'item-1', quantity: 1 },
            error: null,
          }),
        insert: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.addItemToCharacter('char-123', 'item-1', 1)

      expect(result).toBeDefined()
      expect(mockQuery.insert).toHaveBeenCalled()
    })

    it('deve incrementar quantidade se item já existe', async () => {
      const existingItem = {
        id: 'inv-1',
        character_id: 'char-123',
        item_id: 'item-1',
        quantity: 2,
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: existingItem, error: null }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterInventoryService.addItemToCharacter('char-123', 'item-1', 3)

      expect(mockQuery.update).toHaveBeenCalledWith({ quantity: 5 })
    })
  })

  describe('removeItemFromCharacter', () => {
    it('deve remover item do inventário', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterInventoryService.removeItemFromCharacter('char-123', 'item-1')

      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', 'char-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('item_id', 'item-1')
    })
  })

  describe('equipItem', () => {
    it('deve equipar item', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'inv-1', equipped: true },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.equipItem('char-123', 'item-1', true)

      expect(result.equipped).toBe(true)
      expect(mockQuery.update).toHaveBeenCalledWith({ equipped: true })
    })

    it('deve desequipar item', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'inv-1', equipped: false },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.equipItem('char-123', 'item-1', false)

      expect(result.equipped).toBe(false)
      expect(mockQuery.update).toHaveBeenCalledWith({ equipped: false })
    })
  })
})

