/**
 * Testes para validação de inventário (categoria por patente e carga)
 */
import { describe, it, expect } from '@jest/globals'
import { characterInventoryService } from '../character/characterInventoryService'
import { Rank, ItemCategory } from '../../types/ordemParanormal'

describe('characterInventoryService - Validação de Categoria', () => {
  describe('validateItemCategory', () => {
    it('deve permitir Recruta equipar Categoria I (limite 3)', () => {
      const result = characterInventoryService.validateItemCategory('RECRUTA', 'I', 0)
      expect(result).toBe(true)
    })

    it('deve permitir Recruta equipar até 3 itens Categoria I', () => {
      expect(characterInventoryService.validateItemCategory('RECRUTA', 'I', 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('RECRUTA', 'I', 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('RECRUTA', 'I', 2)).toBe(true)
      expect(characterInventoryService.validateItemCategory('RECRUTA', 'I', 3)).toBe(false)
    })

    it('deve negar Recruta equipar Categoria III', () => {
      const result = characterInventoryService.validateItemCategory('RECRUTA', 'III', 0)
      expect(result).toBe(false)
    })

    it('deve permitir Operador equipar 1 item Categoria II', () => {
      expect(characterInventoryService.validateItemCategory('OPERADOR', 'II', 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('OPERADOR', 'II', 1)).toBe(false)
    })

    it('deve permitir Agente Especial equipar 2 itens Categoria II', () => {
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 'II', 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 'II', 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('AGENTE_ESPECIAL', 'II', 2)).toBe(false)
    })

    it('deve permitir Oficial de Operação equipar 1 item Categoria IV', () => {
      expect(characterInventoryService.validateItemCategory('OFICIAL_DE_OPERACAO', 'IV', 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('OFICIAL_DE_OPERACAO', 'IV', 1)).toBe(false)
    })

    it('deve permitir Elite equipar 2 itens Categoria IV', () => {
      expect(characterInventoryService.validateItemCategory('ELITE', 'IV', 0)).toBe(true)
      expect(characterInventoryService.validateItemCategory('ELITE', 'IV', 1)).toBe(true)
      expect(characterInventoryService.validateItemCategory('ELITE', 'IV', 2)).toBe(false)
    })
  })

  describe('calculateCarryCapacity', () => {
    it('deve calcular capacidade baseada em Força', () => {
      const result = characterInventoryService.calculateCarryCapacity(3)
      // 5 * 3 = 15
      expect(result).toBe(15)
    })

    it('deve retornar mínimo de 2 mesmo com Força 0', () => {
      const result = characterInventoryService.calculateCarryCapacity(0)
      expect(result).toBe(2)
    })

    it('deve calcular corretamente para Força 1', () => {
      const result = characterInventoryService.calculateCarryCapacity(1)
      expect(result).toBe(5)
    })

    it('deve calcular corretamente para Força 5', () => {
      const result = characterInventoryService.calculateCarryCapacity(5)
      expect(result).toBe(25)
    })
  })
})

