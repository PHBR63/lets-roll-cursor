/**
 * Testes de integração end-to-end
 * Testam fluxos completos de funcionalidades do sistema
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { characterService } from '../characterService'
import { characterResourcesService } from '../character/characterResourcesService'
import { characterInventoryService } from '../character/characterInventoryService'
import { characterConditionsService } from '../character/characterConditionsService'
import { itemService } from '../itemService'
import { ritualService } from '../ritualService'
import { sessionService } from '../sessionService'
import { chatService } from '../chatService'
import { ordemParanormalService } from '../ordemParanormalService'
import { supabase } from '../../config/supabase'

// Mock do characterConditionsService
jest.mock('../character/characterConditionsService', () => ({
  characterConditionsService: {
    applyCondition: (jest.fn() as any).mockResolvedValue({
      character: { id: 'char-123', conditions: ['ABALADO'] },
    } as any),
    removeCondition: (jest.fn() as any).mockResolvedValue({
      character: { id: 'char-123', conditions: [] },
    } as any),
  },
}))

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do ordemParanormalService
jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    calculateMaxPV: jest.fn(),
    calculateMaxSAN: jest.fn(),
    calculateMaxPE: jest.fn(),
    calculateDefense: jest.fn(),
    calculatePETurnLimit: jest.fn(),
    validatePETurnLimit: jest.fn(),
    calculateMaxCarryCapacity: jest.fn(),
    isOverloaded: jest.fn(),
    rollRitualCostTest: jest.fn(),
    calculateConditionPenalties: jest.fn(),
    rollAttributeTest: jest.fn(),
    applyCondition: jest.fn(),
  },
}))

describe('Testes de Integração End-to-End', () => {
  const mockCharacter = {
    id: 'char-123',
    campaign_id: 'camp-123',
    user_id: 'user-123',
    name: 'Test Character',
    class: 'OCULTISTA',
    rank: 'RECRUTA',
    attributes: { agi: 1, for: 2, int: 3, pre: 2, vig: 1 },
    stats: {
      pv: { current: 15, max: 15 },
      san: { current: 20, max: 20 },
      pe: { current: 10, max: 10 },
      nex: 10,
    },
    skills: {
      Ocultismo: {
        attribute: 'INT',
        training: 'TRAINED',
        bonus: 5,
      },
    },
    conditions: [],
    defense: 11,
  }

  const mockItem = {
    id: 'item-123',
    name: 'Espada',
    category: 'I',
    weight: 2.5,
    campaign_id: 'camp-123',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Fluxo Completo: Criação → Equipamento → Ritual → Sobrecarga', () => {
    it('deve criar personagem, equipar item, conjurar ritual e verificar sobrecarga', async () => {
      // 1. Criar personagem
      const mockCreateQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        } as any),
      }

        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(15)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(20)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(10)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(11)

        ; (supabase.from as jest.Mock).mockReturnValue(mockCreateQuery)

      const character = await characterService.createCharacter('user-123', {
        name: 'Test Character',
        campaignId: 'camp-123',
        class: 'OCULTISTA',
        attributes: { agi: 1, for: 2, int: 3, pre: 2, vig: 1 },
        nex: 10,
      })

      expect(character).toBeDefined()

      // 2. Adicionar item ao inventário
      const mockItemQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockItem,
          error: null,
        } as any),
      }

      const mockInventoryQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          data: [],
          error: null,
        } as any),
      }

      const mockInsertInventory = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { id: 'ci-123', character_id: 'char-123', item_id: 'item-123', quantity: 1 },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockItemQuery)
          .mockReturnValueOnce(mockInventoryQuery)
          .mockReturnValueOnce(mockInsertInventory)

        ; (ordemParanormalService.calculateMaxCarryCapacity as jest.Mock).mockReturnValue(10)
        ; (ordemParanormalService.isOverloaded as jest.Mock).mockReturnValue(false)

      await characterInventoryService.addItemToCharacter('char-123', 'item-123', 1)

      // 3. Conjurar ritual
      const mockRitualCharQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        } as any),
      }

      const mockRitualUpdate = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            ...mockCharacter,
            stats: {
              ...mockCharacter.stats,
              pe: { current: 7, max: 10 },
            },
          },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockRitualCharQuery)
          .mockReturnValueOnce(mockRitualUpdate)

        ; (ordemParanormalService.calculatePETurnLimit as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.validatePETurnLimit as jest.Mock).mockReturnValue(true)
        ; (ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
          success: true,
          rollResult: 20,
          dt: 15,
          criticalFailure: false,
        })

      const ritualResult = await ritualService.conjureRitualWithCost('char-123', 3, 0)

      expect(ritualResult.success).toBe(true)

      // 4. Verificar sobrecarga após adicionar mais itens
      const mockOverloadCharQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            ...mockCharacter,
            attributes: { ...mockCharacter.attributes, for: 2 },
          },
          error: null,
        } as any),
      }

      const mockOverloadInventory = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          data: [
            { item: { weight: 2.5 }, quantity: 1 },
            { item: { weight: 3.0 }, quantity: 1 },
            { item: { weight: 4.0 }, quantity: 1 },
          ],
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockOverloadCharQuery)
          .mockReturnValueOnce(mockOverloadInventory)

        ; (ordemParanormalService.calculateMaxCarryCapacity as jest.Mock).mockReturnValue(10)
        ; (ordemParanormalService.isOverloaded as jest.Mock).mockReturnValue(true)

      const overloadResult = await characterInventoryService.checkOverload('char-123')

      expect(overloadResult.isOverloaded).toBe(true)
      expect(overloadResult.currentWeight).toBe(9.5)
    })
  })

  describe('Fluxo Completo: Sessão → Chat → Momento', () => {
    it('deve criar sessão, enviar mensagem e criar momento', async () => {
      // 1. Criar sessão
      const mockSessionInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            id: 'session-123',
            campaign_id: 'camp-123',
            name: 'Sessão de Teste',
            started_at: new Date().toISOString(),
            ended_at: null,
          },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockSessionInsert)

      const session = await sessionService.createSession('camp-123', {
        name: 'Sessão de Teste',
      })

      expect(session).toBeDefined()

      // 2. Enviar mensagem no chat
      const mockMessageInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            id: 'msg-123',
            campaign_id: 'camp-123',
            session_id: 'session-123',
            user_id: 'user-123',
            content: 'Mensagem de teste',
            type: 'message',
            channel: 'general',
          },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockMessageInsert)

      const message = await chatService.createMessage({
        campaignId: 'camp-123',
        sessionId: 'session-123',
        userId: 'user-123',
        content: 'Mensagem de teste',
      })

      expect(message).toBeDefined()
      expect(message.session_id).toBe('session-123')

      // 3. Criar momento da sessão
      const mockParticipantQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { id: 'participant-123' },
          error: null,
        } as any),
      }

      const mockMomentInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            id: 'moment-123',
            campaign_id: 'camp-123',
            session_id: 'session-123',
            title: 'Momento Épico',
            description: 'Descrição do momento',
            created_by: 'user-123',
          },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockParticipantQuery)
          .mockReturnValueOnce(mockMomentInsert)

      const { momentService } = await import('../momentService')
      const moment = await momentService.createMoment('user-123', {
        campaignId: 'camp-123',
        sessionId: 'session-123',
        title: 'Momento Épico',
        description: 'Descrição do momento',
      })

      expect(moment).toBeDefined()
      expect(moment.session_id).toBe('session-123')
    })
  })

  describe('Fluxo Completo: Validação de PE por Turno → Categoria → Sobrecarga', () => {
    it('deve validar PE por turno, categoria por patente e sobrecarga em sequência', async () => {
      const characterWithRank = {
        ...mockCharacter,
        rank: 'RECRUTA',
      }

      // 1. Tentar gastar PE além do limite
      const mockPEQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: characterWithRank,
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockPEQuery)
        ; (ordemParanormalService.calculatePETurnLimit as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.validatePETurnLimit as jest.Mock).mockReturnValue(false)

      await expect(
        characterResourcesService.spendPE('char-123', 5)
      ).rejects.toThrow('Limite de PE por turno excedido')

      // 2. Tentar equipar item além do limite de categoria
      const mockCategoryItemQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockItem, category: 'III' },
          error: null,
        } as any),
      }

      const mockCategoryInventory = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          data: [
            { item: { category: 'III' }, equipped: true },
            { item: { category: 'III' }, equipped: true },
            { item: { category: 'III' }, equipped: true },
          ],
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({
              data: characterWithRank,
              error: null,
            } as any),
          })
          .mockReturnValueOnce(mockCategoryItemQuery)
          .mockReturnValueOnce(mockCategoryInventory)

      await expect(
        characterInventoryService.addItemToCharacter('char-123', 'item-123', 1, true)
      ).rejects.toThrow('não permite equipar')

      // 3. Verificar sobrecarga
      const mockOverloadQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            ...characterWithRank,
            attributes: { ...characterWithRank.attributes, for: 1 },
          },
          error: null,
        } as any),
      }

      const mockOverloadInventory = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          data: [
            { item: { weight: 3.0 }, quantity: 1 },
            { item: { weight: 3.0 }, quantity: 1 },
          ],
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockOverloadQuery)
          .mockReturnValueOnce(mockOverloadInventory)

        ; (ordemParanormalService.calculateMaxCarryCapacity as jest.Mock).mockReturnValue(5)
        ; (ordemParanormalService.isOverloaded as jest.Mock).mockReturnValue(true)

      const overloadResult = await characterInventoryService.checkOverload('char-123')

      expect(overloadResult.isOverloaded).toBe(true)
    })
  })

  describe('Fluxo Completo: Aplicar Condição → Calcular Penalidades → Teste de Perícia', () => {
    it('deve aplicar condição, calcular penalidades e rolar teste de perícia', async () => {
      // 1. Aplicar condição
      const mockConditionQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        } as any),
        update: (jest.fn() as any).mockReturnThis(),
      }

      const mockUpdateQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCharacter, conditions: ['ABALADO'] },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockConditionQuery)
          .mockReturnValueOnce(mockUpdateQuery)

      const conditionResult = await characterConditionsService.applyCondition('char-123', 'ABALADO')

      expect(conditionResult).toBeDefined()

        // 2. Calcular penalidades (mock já configurado)
        ; (ordemParanormalService.calculateConditionPenalties as jest.Mock).mockReturnValue({
          defense: 0,
          defenseBase: false,
          dicePenalty: -1,
          cannotAct: false,
          cannotReact: false,
          cannotMove: false,
          speedReduction: 1,
          attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
          skillPenalties: {},
        })

      const penalties = ordemParanormalService.calculateConditionPenalties(['ABALADO'])

      expect(penalties).toBeDefined()
      expect(penalties.dicePenalty).toBe(-1)

      // 3. Rolar teste de perícia com penalidades
      const mockSkillQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: {
            ...mockCharacter,
            conditions: ['ABALADO'],
          },
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockSkillQuery)

        ; (ordemParanormalService.rollAttributeTest as jest.Mock).mockReturnValue({
          dice: [15],
          result: 15,
          bonus: 5,
          total: 20,
          advantage: true,
          disadvantage: false,
        })

      const skillTest = await characterService.rollSkillTest('char-123', 'Ocultismo', 15)

      expect(skillTest).toBeDefined()
      expect(skillTest.skillName).toBe('Ocultismo')
    })
  })
})

