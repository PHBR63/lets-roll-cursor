/**
 * Testes para characterAbilitiesService
 */
import { characterAbilitiesService } from '../character/characterAbilitiesService'
import { supabase } from '../../config/supabase'

jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('characterAbilitiesService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCharacterAbilities', () => {
    it('deve retornar habilidades do personagem', async () => {
      const mockAbilities = [
        {
          id: 'char-ability-1',
          character_id: 'char-123',
          ability_id: 'ability-1',
          ability: {
            id: 'ability-1',
            name: 'Ataque Poderoso',
            description: 'Aumenta o dano',
            type: 'COMBAT',
            cost: 2,
          },
        },
      ]

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ data: mockAbilities, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterAbilitiesService.getCharacterAbilities('char-123')

      expect(result).toEqual(mockAbilities)
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', 'char-123')
    })

    it('deve retornar array vazio se não houver habilidades', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ data: [], error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterAbilitiesService.getCharacterAbilities('char-123')

      expect(result).toEqual([])
    })
  })

  describe('addAbilityToCharacter', () => {
    it('deve adicionar habilidade ao personagem', async () => {
      const mockAbility = {
        id: 'char-ability-1',
        character_id: 'char-123',
        ability_id: 'ability-1',
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockAbility, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterAbilitiesService.addAbilityToCharacter('char-123', 'ability-1')

      expect(result).toEqual(mockAbility)
      expect(mockQuery.insert).toHaveBeenCalledWith({
        character_id: 'char-123',
        ability_id: 'ability-1',
      })
    })

    it('deve retornar habilidade existente se já estiver adicionada', async () => {
      const existingAbility = {
        id: 'char-ability-1',
        character_id: 'char-123',
        ability_id: 'ability-1',
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValueOnce({
            data: null,
            error: { code: '23505', message: 'Duplicate key' },
          })
          .mockResolvedValueOnce({ data: existingAbility, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterAbilitiesService.addAbilityToCharacter('char-123', 'ability-1')

      expect(result).toEqual(existingAbility)
    })
  })

  describe('removeAbilityFromCharacter', () => {
    it('deve remover habilidade do personagem', async () => {
      const mockQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        then: (jest.fn() as any).mockImplementation((resolve: any) => resolve({ error: null })),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterAbilitiesService.removeAbilityFromCharacter('char-123', 'ability-1')

      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('character_id', 'char-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('ability_id', 'ability-1')
    })
  })
})

