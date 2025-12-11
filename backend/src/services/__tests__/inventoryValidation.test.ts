/**
 * Testes para validação de inventário (categoria por patente e carga)
 */
import { describe, it, expect } from '@jest/globals'
import { characterInventoryService } from '../character/characterInventoryService'
import { Rank, ItemCategory } from '../../types/ordemParanormal'

// Mock do Supabase para evitar erro de inicialização
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('characterInventoryService - Validação de Categoria', () => {
  describe('validateItemCategory', () => {
    it('deve permitir Recruta equipar Categoria I (limite 3)', () => {
      const result = characterInventoryService.validateItemCategory('RECRUTA', 0, 0)
      expect(result).toBe(true)
    })

    it('deve permitir Recruta equipar até 3 itens Categoria I', () => {
      expect(characterInventoryService.validateItemCategory('RECRUTA', 0, 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('RECRUTA', 0, 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('RECRUTA', 0, 2)).toBe(true)
      expect(characterInventoryService.validateItemCategory('RECRUTA', 0, 3)).toBe(false)
    })

    it('deve negar Recruta equipar Categoria III', () => {
      const result = characterInventoryService.validateItemCategory('RECRUTA', 2, 0)
      expect(result).toBe(false)
    })

    it('deve permitir Operador equipar 3 itens Categoria II', () => {
      expect(characterInventoryService.validateItemCategory('OPERADOR', 1, 0)).toBe(true) // 0 < 3
      expect(characterInventoryService.validateItemCategory('OPERADOR', 1, 1)).toBe(true) // 1 < 3
      expect(characterInventoryService.validateItemCategory('OPERADOR', 1, 2)).toBe(true) // 2 < 3
      expect(characterInventoryService.validateItemCategory('OPERADOR', 1, 3)).toBe(false) // 3 < 3 -> false
    })

    it('deve permitir Agente Especial equipar 3 itens Categoria II', () => {
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 1, 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 1, 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 1, 2)).toBe(true)
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 1, 3)).toBe(false)
    })

    it('deve permitir Oficial de Operação equipar 2 itens Categoria IV', () => {
      expect(characterInventoryService.validateItemCategory('OFICIAL_OPERACOES', 3, 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('OFICIAL_OPERACOES', 3, 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('OFICIAL_OPERACOES', 3, 2)).toBe(false)
    })

    it('deve permitir Elite equipar 3 itens Categoria IV', () => {
      expect(characterInventoryService.validateItemCategory('ELITE', 3, 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('ELITE', 3, 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('ELITE', 3, 2)).toBe(true)
      expect(characterInventoryService.validateItemCategory('ELITE', 3, 3)).toBe(false)
    })
  })

  // calculateCarryCapacity removido do serviço
  // describe('calculateCarryCapacity', () => {
  //   it('deve calcular capacidade baseada em Força', () => {
  //     const result = characterInventoryService.calculateCarryCapacity(3)
  //     // 5 * 3 = 15
  //     expect(result).toBe(15)
  //   })

  //   it('deve retornar mínimo de 2 mesmo com Força 0', () => {
  //     const result = characterInventoryService.calculateCarryCapacity(0)
  //     expect(result).toBe(2)
  //   })

  //   it('deve calcular corretamente para Força 1', () => {
  //     const result = characterInventoryService.calculateCarryCapacity(1)
  //     expect(result).toBe(5)
  //   })

  //   it('deve calcular corretamente para Força 5', () => {
  //     const result = characterInventoryService.calculateCarryCapacity(5)
  //     expect(result).toBe(25)
  //   })
  // })
})

