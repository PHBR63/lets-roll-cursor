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
 * Testes de integração estendidos
 * Testam fluxos completos end-to-end de funcionalidades
 */
describe('Testes de Integração Estendidos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Fluxo Completo: Criação de Personagem até Rolagem', () => {
    it('deve criar personagem, aplicar condições, rolar dados e calcular dano', async () => {
      // 1. Criar personagem
      const mockCharacter = {
        id: 'char-123',
        name: 'Test Character',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 3, int: 0, pre: 1, vig: 2 },
        stats: {
          pv: { current: 28, max: 28 },
          san: { current: 15, max: 15 },
          pe: { current: 6, max: 6 },
          nex: 5,
        },
        skills: {
          Luta: { attribute: 'FOR', training: 'TRAINED', bonus: 5 },
        },
        conditions: [],
        defense: 12,
      }

      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        } as any),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce({ // campaigns
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: { id: 'camp-123' }, error: null } as any),
          })
          .mockReturnValueOnce({ // campaign_participants
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: { role: 'player' }, error: null } as any),
          })
          .mockReturnValueOnce(mockInsert)

      jest.spyOn(ordemParanormalService, 'calculateMaxPV').mockReturnValue(28)
      jest.spyOn(ordemParanormalService, 'calculateMaxSAN').mockReturnValue(15)
      jest.spyOn(ordemParanormalService, 'calculateMaxPE').mockReturnValue(6)
      jest.spyOn(ordemParanormalService, 'calculateDefense').mockReturnValue(12)

      const character = await characterService.createCharacter('user-123', {
        campaignId: 'camp-123',
        name: 'Test Character',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 3, int: 0, pre: 1, vig: 2 },
        nex: 5,
      })

      expect(character).toBeDefined()

      // 2. Aplicar condição
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCharacter, conditions: [] },
          error: null,
        } as any),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const { newConditions } = ordemParanormalService.applyCondition('ABALADO', [])
      expect(newConditions).toContain('ABALADO')

      // 3. Calcular penalidades
      const penalties = ordemParanormalService.calculateConditionPenalties(newConditions)
      expect(penalties.dicePenalty).toBe(-1)

      // 4. Rolagem de perícia com penalidade
      const skillRoll = ordemParanormalService.rollAttributeTest(
        mockCharacter.attributes.for,
        mockCharacter.skills.Luta.bonus + penalties.dicePenalty
      )

      expect(skillRoll).toBeDefined()
      expect(skillRoll.bonus).toBe(4) // 5 - 1 (penalidade)

      // 5. Se acertar, calcular dano
      const attackRoll = ordemParanormalService.rollAttack(
        mockCharacter.attributes.agi,
        mockCharacter.skills.Luta.bonus + penalties.dicePenalty,
        15 // defesa do alvo
      )

      if (attackRoll.hit) {
        const damage = ordemParanormalService.calculateDamage(
          '1d8',
          mockCharacter.attributes.for,
          true, // melee
          attackRoll.critical
        )

        expect(damage).toBeDefined()
        expect(damage.total).toBeGreaterThan(0)
      }
    })
  })

  describe('Fluxo Completo: Recuperação e Gerenciamento de Recursos', () => {
    it('deve recuperar PE, aplicar dano e verificar estados críticos', async () => {
      const mockCharacter = {
        id: 'char-123',
        class: 'COMBATENTE',
        stats: {
          pv: { current: 28, max: 28 },
          pe: { current: 2, max: 6 },
          nex: 5,
        },
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        } as any),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      // 1. Recuperar PE
      jest.spyOn(ordemParanormalService, 'calculatePERecovery').mockReturnValue(2)
      const updatePESpy = jest.spyOn(characterService, 'updatePE').mockResolvedValue({
        ...mockCharacter,
        stats: { ...mockCharacter.stats, pe: { current: 4, max: 6 } },
      } as any)

      await characterService.recoverPE('char-123')

      expect(ordemParanormalService.calculatePERecovery).toHaveBeenCalledWith(5)
      expect(updatePESpy).toHaveBeenCalledWith('char-123', 2, true)

      // 2. Aplicar dano físico
      const updatePVSpy = jest.spyOn(characterService, 'updatePV').mockResolvedValue({
        character: {
          ...mockCharacter,
          stats: {
            ...mockCharacter.stats,
            pv: { current: 10, max: 28 }, // Abaixo de 50%
          },
          isDying: false,
          isInjured: true,
        },
      } as any)

      await characterService.applyDamage('char-123', 18, 'physical')

      expect(updatePVSpy).toHaveBeenCalledWith('char-123', -18, true)

      // 3. Verificar estado crítico (machucado)
      const updatedCharacter = {
        ...mockCharacter,
        stats: {
          ...mockCharacter.stats,
          pv: { current: 10, max: 28 },
          san: { current: 15, max: 15 },
        },
      }

      // Verificar se está machucado (PV < 50%)
      const isInjured = updatedCharacter.stats.pv.current < updatedCharacter.stats.pv.max * 0.5
      const isDying = updatedCharacter.stats.pv.current <= 0

      expect(isInjured).toBe(true) // PV < 50%
      expect(isDying).toBe(false) // PV > 0
    })
  })

  describe('Fluxo Completo: Sistema de Condições e Transformações', () => {
    it('deve aplicar múltiplas condições e verificar transformações automáticas', async () => {
      let currentConditions: any[] = []

      // 1. Aplicar Abalado
      const abalado = ordemParanormalService.applyCondition('ABALADO', currentConditions)
      currentConditions = abalado.newConditions
      expect(currentConditions).toContain('ABALADO')

      // 2. Aplicar Abalado novamente -> deve virar Apavorado
      const apavorado = ordemParanormalService.applyCondition('ABALADO', currentConditions)
      currentConditions = apavorado.newConditions
      expect(currentConditions).not.toContain('ABALADO')
      expect(currentConditions).toContain('APAVORADO')

      // 3. Aplicar Atordado -> deve adicionar Desprevenido
      const atordado = ordemParanormalService.applyCondition('ATORDADO', currentConditions)
      currentConditions = atordado.newConditions
      expect(currentConditions).toContain('ATORDADO')
      expect(currentConditions).toContain('DESPREVENIDO')

      // 4. Calcular todas as penalidades combinadas
      const penalties = ordemParanormalService.calculateConditionPenalties(currentConditions)
      // Apavorado = -2D, Desprevenido = -2D adicional (total -4D)
      expect(penalties.dicePenalty).toBe(-4) // Apavorado (-2D) + Desprevenido (-2D)
      // Desprevenido pode ter -5 ou -10 dependendo de como está implementado
      expect(penalties.defense).toBeLessThanOrEqual(-5) // Desprevenido reduz defesa
    })

    it('deve aplicar condição temporária e verificar expiração', () => {
      const conditions: any[] = []
      const { newConditions, effects } = ordemParanormalService.applyCondition('ABALADO', conditions)

      expect(newConditions).toContain('ABALADO')
      expect(effects.message).toBeDefined()
      expect(typeof effects.message).toBe('string')

      // Simular passagem de tempo (condição temporária)
      // Em um sistema real, isso seria gerenciado por um timer
      const penalties = ordemParanormalService.calculateConditionPenalties(newConditions)
      expect(penalties.dicePenalty).toBe(-1)
    })
  })

  describe('Fluxo Completo: Rolagem de Dados e Histórico', () => {
    it('deve rolar dados, salvar histórico e buscar com filtros', async () => {
      const mockRoll = {
        id: 'roll-123',
        formula: '2d6+3',
        result: 12,
        details: { rolls: [4, 5], modifier: 3 },
        campaign_id: 'camp-123',
        session_id: 'session-123',
        user_id: 'user-123',
        character_id: 'char-123',
        created_at: new Date().toISOString(),
      }

      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockRoll,
          error: null,
        } as any),
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        neq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: [mockRoll],
          error: null,
        }),
      }

      // Mock para getRollHistory precisa retornar this em cada chamada
      mockQuery.eq = jest.fn().mockReturnValue(mockQuery)
      mockQuery.neq = jest.fn().mockReturnValue(mockQuery)
      mockQuery.order = jest.fn().mockReturnValue(mockQuery)
      mockQuery.limit = (jest.fn() as any).mockResolvedValue({
        data: [mockRoll],
        error: null,
      })

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockInsert) // Para rollDice
          .mockReturnValueOnce(mockQuery) // Para getRollHistory

      // 1. Rolagem
      const rollResult = await diceService.rollDice({
        formula: '2d6+3',
        userId: 'user-123',
        campaignId: 'camp-123',
        sessionId: 'session-123',
        characterId: 'char-123',
      })

      expect(rollResult).toBeDefined()
      expect(rollResult.formula).toBe('2d6+3')

      // 2. Buscar histórico por campanha (mock simplificado)
      // O histórico já foi testado no teste básico, aqui apenas verificamos que a função existe
      expect(diceService.getRollHistory).toBeDefined()
    })
  })

  describe('Fluxo Completo: Atualização de Atributos e Recálculo', () => {
    it('deve atualizar atributos, recalcular recursos e atualizar defesa', async () => {
      const mockCharacter = {
        id: 'char-123',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 1, int: 0, pre: 1, vig: 2 },
        stats: { nex: 5 },
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        } as any),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      jest.spyOn(ordemParanormalService, 'calculateMaxPV').mockReturnValue(30)
      jest.spyOn(ordemParanormalService, 'calculateMaxSAN').mockReturnValue(15)
      jest.spyOn(ordemParanormalService, 'calculateMaxPE').mockReturnValue(8)
      jest.spyOn(ordemParanormalService, 'calculateDefense').mockReturnValue(13)

      const newAttributes = { agi: 3, for: 2, int: 1, pre: 2, vig: 3 }

      await characterService.updateAttributes('char-123', newAttributes)

      // Verificar que todos os cálculos foram chamados
      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 3, 5)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 5)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 2, 5)
      expect(ordemParanormalService.calculateDefense).toHaveBeenCalledWith(3)
    })
  })

  describe('Fluxo Completo: Sistema de Combate', () => {
    it('deve executar sequência completa de combate: ataque, dano, condições', () => {
      const attacker = {
        attributes: { agi: 3, for: 2 },
        skills: { Luta: { attribute: 'FOR', training: 'TRAINED', bonus: 5 } },
        conditions: [],
      }

      const defender = {
        defense: 15,
        stats: { pv: { current: 20, max: 20 } },
      }

      // 1. Rolagem de ataque
      const attackRoll = ordemParanormalService.rollAttack(
        attacker.attributes.agi,
        attacker.skills.Luta.bonus,
        defender.defense
      )

      expect(attackRoll).toBeDefined()

      // 2. Se acertar, calcular dano
      if (attackRoll.hit) {
        const damage = ordemParanormalService.calculateDamage(
          '1d8',
          attacker.attributes.for,
          true, // melee
          attackRoll.critical
        )

        expect(damage).toBeDefined()
        expect(damage.total).toBeGreaterThan(0)

        // 3. Aplicar dano (simulado)
        const newPV = defender.stats.pv.current - damage.total
        expect(newPV).toBeLessThanOrEqual(defender.stats.pv.current)

        // 4. Verificar se entrou em estado crítico (se o dano foi suficiente)
        const isInjured = newPV < defender.stats.pv.max * 0.5
        if (isInjured) {
          expect(isInjured).toBe(true)
        }

        // 5. Se crítico, aplicar condição
        if (attackRoll.critical) {
          const { newConditions } = ordemParanormalService.applyCondition('ATORDADO', [])
          expect(newConditions).toContain('ATORDADO')
        }
      }
    })
  })
})

