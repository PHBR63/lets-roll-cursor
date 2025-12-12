import { diceService } from '../diceService'
import { characterService } from '../characterService'
import { ordemParanormalService } from '../ordemParanormalService'
import { supabase } from '../../config/supabase'

// Mock services
jest.mock('../characterService')
jest.mock('../ordemParanormalService')
jest.mock('../../config/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}))

const mockedCharService = characterService as jest.Mocked<typeof characterService>
const mockedOrdemService = ordemParanormalService as jest.Mocked<typeof ordemParanormalService>

// Mock de Character
const mockCharacter: any = {
    id: 'char-123',
    attributes: { agi: 3, for: 2, int: 2, pre: 1, vig: 2 },
    skills: {
        'Crime': { training: 'UNTRAINED' },       // Treinada Apenas
        'Medicina': { training: 'TRAINED' },      // Requer Kit
        'Luta': { training: 'TRAINED' },          // Comum
        'Percepção': { training: 'UNTRAINED' }    // Comum
    },
    inventory: [
        { name: 'Faca' }
        // Sem Kit de Medicina ou Ladrão
    ],
    conditions: []
}

describe('DiceService Skill Rolls', () => {

    beforeEach(() => {
        jest.clearAllMocks()
        mockedCharService.getCharacterById.mockResolvedValue(mockCharacter)

        // Default implementation for condition penalties
        mockedOrdemService.calculateConditionPenalties.mockReturnValue({
            defense: 0, defenseBase: false, dicePenalty: 0, cannotAct: false, cannotReact: false, cannotMove: false,
            speedReduction: 1, rangedAttackPenalty: 0, ritualDTBonus: 0, onlyOneAction: false, cannotApproach: false, mustFlee: false,
            attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
            skillPenalties: {}
        })

        // Default implementation for bonus calc
        mockedOrdemService.calculateSkillBonus.mockImplementation((training) => {
            if (training === 'TRAINED') return 5
            if (training === 'COMPETENT') return 10
            if (training === 'EXPERT') return 15
            return 0
        })

        // Default implementation for rolling (mocked result)
        mockedOrdemService.rollSkillTest.mockImplementation((params) => ({
            dice: [15, 10, 5],
            result: 15,
            total: 15 + (params.flatBonus || 0) + 5, // Simulado: dado + bonus + 5 (training)
            breakdown: 'Mocked Breakdown',
            trainingBonus: 5,
            flatBonus: params.flatBonus || 0
        }))

        // Mock supabase insert
        const mockInsert = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { id: 'roll-123', result: 20 },
                error: null,
            }),
        }
            ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)
    })

    it('deve bloquear perícia "Treinada Apenas" se destreinado (Crime)', async () => {
        const params = {
            characterId: 'char-123',
            skillName: 'Crime',
            userId: 'user-1',
            campaignId: 'camp-1'
        }

        await expect(diceService.resolveSkillRoll(params))
            .rejects
            .toThrow(/exige treinamento/)
    })

    it('deve aplicar penalidade de -5 para Medicina sem Kit', async () => {
        const params = {
            characterId: 'char-123',
            skillName: 'Medicina',
            userId: 'user-1',
            campaignId: 'camp-1'
        }

        // Mockar rollSkillTest para verificar os parametros passados
        mockedOrdemService.rollSkillTest.mockReturnValueOnce({
            dice: [10], result: 10, total: 10, breakdown: '', trainingBonus: 5, flatBonus: -5
        })

        const result = await diceService.resolveSkillRoll(params)

        // Verificar se chamada para ordemParanormalService teve flatBonus -5
        expect(mockedOrdemService.rollSkillTest).toHaveBeenCalledWith(
            expect.objectContaining({
                flatBonus: -5,
                skillName: 'Medicina'
            })
        )
        expect(result.validation?.missingKit).toBe(true)
    })

    it('deve ter flatBonus 0 se Luta (não requer kit)', async () => {
        const params = {
            characterId: 'char-123',
            skillName: 'Luta',
            userId: 'user-1',
            campaignId: 'camp-1'
        }

        mockedOrdemService.rollSkillTest.mockReturnValueOnce({
            dice: [10], result: 10, total: 15, breakdown: '', trainingBonus: 5, flatBonus: 0
        })

        const result = await diceService.resolveSkillRoll(params)

        expect(mockedOrdemService.rollSkillTest).toHaveBeenCalledWith(
            expect.objectContaining({
                flatBonus: 0
            })
        )
        expect(result.validation?.missingKit).toBe(false)
    })

    it('deve reduzir dados de atributo se tiver condição FRACO', async () => {
        // Configurar Fraco (-1 FOR)
        mockedOrdemService.calculateConditionPenalties.mockReturnValueOnce({
            defense: 0, defenseBase: false, dicePenalty: 0, cannotAct: false, cannotReact: false, cannotMove: false,
            speedReduction: 1, rangedAttackPenalty: 0, ritualDTBonus: 0, onlyOneAction: false, cannotApproach: false, mustFlee: false,
            attributePenalties: { agi: 0, for: -1, int: 0, pre: 0, vig: 0 },
            skillPenalties: {}
        })

        const params = {
            characterId: 'char-123',
            skillName: 'Luta', // Usa FOR
            userId: 'user-1',
            campaignId: 'camp-1'
        }

        await diceService.resolveSkillRoll(params)

        // Base FOR é 2. Com Fraco (-1), deve mandar attributeValue 1.
        expect(mockedOrdemService.rollSkillTest).toHaveBeenCalledWith(
            expect.objectContaining({
                attributeValue: 1,
                skillName: 'Luta'
            })
        )
    })

    it('deve aplicar penalidade extra de dados se condition dicePenalty (ex: Abalado)', async () => {
        // Configurar Abalado (-1D geral)
        mockedOrdemService.calculateConditionPenalties.mockReturnValueOnce({
            defense: 0, defenseBase: false, dicePenalty: -1, cannotAct: false, cannotReact: false, cannotMove: false,
            speedReduction: 1, rangedAttackPenalty: 0, ritualDTBonus: 0, onlyOneAction: false, cannotApproach: false, mustFlee: false,
            attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
            skillPenalties: {}
        })

        const params = {
            characterId: 'char-123',
            skillName: 'Percepção',
            userId: 'user-1',
            campaignId: 'camp-1'
        }

        await diceService.resolveSkillRoll(params)

        expect(mockedOrdemService.rollSkillTest).toHaveBeenCalledWith(
            expect.objectContaining({
                diceMod: -1
            })
        )
    })
})
