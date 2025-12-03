import { characterService } from '../characterService'
import { ordemParanormalService } from '../ordemParanormalService'
import { diceService } from '../diceService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

/**
 * Testes de integração
 * Testam fluxos completos de funcionalidades
 */
describe('Testes de Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Criação de Personagem Completa', () => {
    it('deve criar personagem e calcular recursos automaticamente', async () => {
      const mockCharacter = {
        id: 'char-123',
        name: 'Test Character',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 1, int: 0, pre: 1, vig: 2 },
        stats: {
          pv: { current: 28, max: 28 },
          san: { current: 15, max: 15 },
          pe: { current: 6, max: 6 },
          nex: 5,
        },
        defense: 12,
      }

      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      // Mock dos cálculos
      jest.spyOn(ordemParanormalService, 'calculateMaxPV').mockReturnValue(28)
      jest.spyOn(ordemParanormalService, 'calculateMaxSAN').mockReturnValue(15)
      jest.spyOn(ordemParanormalService, 'calculateMaxPE').mockReturnValue(6)
      jest.spyOn(ordemParanormalService, 'calculateDefense').mockReturnValue(12)

      const result = await characterService.createCharacter({
        userId: 'user-123',
        campaignId: 'camp-123',
        name: 'Test Character',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 1, int: 0, pre: 1, vig: 2 },
        nex: 5,
      })

      expect(result).toBeDefined()
      expect(result.stats.pv.max).toBe(28)
      expect(result.stats.san.max).toBe(15)
      expect(result.stats.pe.max).toBe(6)
      expect(result.defense).toBe(12)
      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 2, 5)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 5)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 1, 5)
      expect(ordemParanormalService.calculateDefense).toHaveBeenCalledWith(2)
    })
  })

  describe('Atualização de Atributos e Recálculo', () => {
    it('deve atualizar atributos e recalcular todos os recursos', async () => {
      const mockCharacter = {
        id: 'char-123',
        class: 'COMBATENTE',
        attributes: { agi: 3, for: 2, int: 1, pre: 2, vig: 3 },
        stats: { nex: 5 },
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      jest.spyOn(ordemParanormalService, 'calculateMaxPV').mockReturnValue(30)
      jest.spyOn(ordemParanormalService, 'calculateMaxSAN').mockReturnValue(15)
      jest.spyOn(ordemParanormalService, 'calculateMaxPE').mockReturnValue(8)
      jest.spyOn(ordemParanormalService, 'calculateDefense').mockReturnValue(13)

      const newAttributes = { agi: 3, for: 2, int: 1, pre: 2, vig: 3 }

      await characterService.updateAttributes('char-123', newAttributes)

      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 3, 5)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 5)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 2, 5)
      expect(ordemParanormalService.calculateDefense).toHaveBeenCalledWith(3)
    })
  })

  describe('Rolagem de Dados e Histórico', () => {
    it('deve rolar dados e salvar no histórico', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'roll-123',
            formula: '1d20',
            result: 15,
            details: { rolls: [15], modifier: 0 },
            campaign_id: 'camp-123',
          },
          error: null,
        }),
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'roll-123',
              formula: '1d20',
              result: 15,
            },
          ],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce(mockInsert) // Para rollDice
        .mockReturnValueOnce(mockQuery) // Para getRollHistory

      // Rolagem
      const rollResult = await diceService.rollDice({
        formula: '1d20',
        userId: 'user-123',
        campaignId: 'camp-123',
      })

      expect(rollResult).toBeDefined()
      expect(rollResult.formula).toBe('1d20')

      // Buscar histórico
      const history = await diceService.getRollHistory(undefined, 'camp-123', 10)

      expect(history).toBeDefined()
      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
    })
  })

  describe('Aplicação de Condições e Penalidades', () => {
    it('deve aplicar condição e calcular penalidades corretamente', async () => {
      const mockCharacter = {
        id: 'char-123',
        conditions: [],
        attributes: { agi: 2, for: 1, int: 0, pre: 1, vig: 2 },
        skills: {
          Luta: { attribute: 'FOR', training: 'TRAINED', bonus: 5 },
        },
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      // Aplicar condição
      const { newConditions, effects } = ordemParanormalService.applyCondition('ABALADO', [])

      expect(newConditions).toContain('ABALADO')
      expect(effects.message).toBeDefined()

      // Calcular penalidades
      const penalties = ordemParanormalService.calculateConditionPenalties(newConditions)

      expect(penalties.dicePenalty).toBe(-1) // Abalado = -1D
    })
  })

  describe('Sistema de Rolagem Completo', () => {
    it('deve rolar teste de perícia com condições aplicadas', () => {
      const attributes = { agi: 2, for: 1, int: 0, pre: 1, vig: 2 }
      const conditions = ['ABALADO']
      const skillBonus = 5

      // Calcular penalidades
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)

      // Rolagem com penalidade
      const rollResult = ordemParanormalService.rollAttributeTest(
        attributes.for,
        skillBonus + penalties.dicePenalty
      )

      expect(rollResult).toBeDefined()
      expect(rollResult.dice.length).toBeGreaterThan(0)
      expect(rollResult.bonus).toBeLessThan(skillBonus) // Deve ter penalidade aplicada
    })

    it('deve rolar ataque e calcular dano corretamente', () => {
      const attributes = { agi: 2, for: 3, int: 0, pre: 1, vig: 2 }
      const skillBonus = 5
      const targetDefense = 15

      // Rolagem de ataque
      const attackRoll = ordemParanormalService.rollAttack(attributes.agi, skillBonus, targetDefense)

      expect(attackRoll).toBeDefined()
      expect(attackRoll.total).toBeDefined()

      if (attackRoll.hit) {
        // Calcular dano
        const damage = ordemParanormalService.calculateDamage(
          '1d8',
          attributes.for,
          true, // melee
          attackRoll.critical
        )

        expect(damage).toBeDefined()
        expect(damage.total).toBeGreaterThan(0)
        if (attackRoll.critical) {
          expect(damage.isCritical).toBe(true)
        }
      }
    })
  })
})

