/**
 * Testes para characterInventoryService
 * Cobre operações de inventário de personagens
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
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ data: mockInventory, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.getCharacterInventory('char-123')

      expect(result).toEqual(mockInventory)
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', 'char-123')
    })

    it('deve retornar array vazio se não houver itens', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ data: [], error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.getCharacterInventory('char-123')

      expect(result).toEqual([])
    })
  })

  describe('addItemToCharacter', () => {
    it('deve adicionar novo item ao inventário', async () => {
      const mockCharacter = { id: 'char-123', rank: 'RECRUTA', conditions: [] }
      const mockItem = { id: 'item-1', name: 'Espada', category: null }
      const mockNewInventoryItem = { id: 'inv-1', character_id: 'char-123', item_id: 'item-1', quantity: 1 }

        // Mock para cada query sequencial
        ; (supabase.from as jest.Mock)
          // 1. Buscar personagem
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
          })
          // 2. Buscar item
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockItem, error: null }),
          })
          // 3. Verificar se item já existe (PGRST116 = não existe)
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          })
          // 4. Inserir novo item
          .mockReturnValueOnce({
            insert: (jest.fn() as any).mockReturnThis(),
            select: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockNewInventoryItem, error: null }),
          })

      const result = await characterInventoryService.addItemToCharacter('char-123', 'item-1', 1)

      expect(result).toBeDefined()
      expect(result.id).toBe('inv-1')
    })

    it('deve incrementar quantidade se item já existe', async () => {
      const mockCharacter = { id: 'char-123', rank: 'RECRUTA', conditions: [] }
      const mockItem = { id: 'item-1', name: 'Espada', category: null }
      const existingItem = { id: 'inv-1', character_id: 'char-123', item_id: 'item-1', quantity: 2 }
      const updatedItem = { ...existingItem, quantity: 5 }

        ; (supabase.from as jest.Mock)
          // 1. Buscar personagem
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
          })
          // 2. Buscar item
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockItem, error: null }),
          })
          // 3. Verificar se item já existe (retorna existente)
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: existingItem, error: null }),
          })
          // 4. Atualizar quantidade
          .mockReturnValueOnce({
            update: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            select: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: updatedItem, error: null }),
          })

      const result = await characterInventoryService.addItemToCharacter('char-123', 'item-1', 3)

      expect(result.quantity).toBe(5)
    })
  })

  describe('removeItemFromCharacter', () => {
    it('deve remover item do inventário', async () => {
      const mockQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
      }

      // Configurar para retornar o mockQuery e resolver sem erro no último eq
      mockQuery.eq.mockImplementation(() => {
        return {
          ...mockQuery,
          eq: (jest.fn() as any).mockResolvedValue({ error: null }),
        }
      })

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterInventoryService.removeItemFromCharacter('char-123', 'item-1')

      expect(mockQuery.delete).toHaveBeenCalled()
    })
  })

  describe('equipItem', () => {
    it('deve equipar item', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { id: 'inv-1', equipped: true },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.equipItem('char-123', 'item-1', true)

      expect(result.equipped).toBe(true)
      expect(mockQuery.update).toHaveBeenCalledWith({ equipped: true })
    })

    it('deve desequipar item', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { id: 'inv-1', equipped: false },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterInventoryService.equipItem('char-123', 'item-1', false)

      expect(result.equipped).toBe(false)
      expect(mockQuery.update).toHaveBeenCalledWith({ equipped: false })
    })
  })
})

