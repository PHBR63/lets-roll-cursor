import { ritualService } from '../ritualService'
import { supabase } from '../../config/supabase'
import { ordemParanormalService } from '../ordemParanormalService'
import { characterResourcesService } from '../character/characterResourcesService'

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}))

jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    calculateRitualCost: jest.fn(),
    validateRitualCasting: jest.fn(),
    rollRitualCostTest: jest.fn()
  }
}))

jest.mock('../character/characterResourcesService', () => ({
  characterResourcesService: {
    spendPE: jest.fn(),
    checkTurnLimit: jest.fn().mockReturnValue({ allowed: true })
  }
}))

jest.mock('../../utils/cache', () => ({
  deleteCache: jest.fn(),
  getCharacterCacheKey: jest.fn()
}))

describe('ritualService', () => {
  const mockRitual = {
    id: 'ritual-1',
    name: 'Decadência',
    element: 'MORTE',
    circle: 1,
    cost: { basePe: 1, discipleExtraPe: 2, trueExtraPe: 5 },
    execution: 'PADRAO',
    range: 'CURTO',
    target: '1 ser',
    duration: 'instantânea',
    description: 'Teste'
  }

  const mockCharacter = {
    id: 'char-1',
    name: 'Char',
    class: 'OCULTISTA',
    stats: {
      nex: 10,
      pe: { current: 5, max: 10 },
      san: { current: 20, max: 20 },
      pv: { current: 15, max: 15 }
    },
    skills: {
      Ocultismo: { training: 'TRAINED', bonus: 5 }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
      ; (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'characters') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null })
          }
        }
        if (table === 'rituals') {
          // Mock for getRitualById inside conjureRitual
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockRitual, error: null })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          insert: jest.fn().mockResolvedValue({ error: null }),
          delete: jest.fn().mockResolvedValue({ error: null })
        }
      })
  })

  describe('conjureRitual', () => {
    it('should successfully conjure a ritual', async () => {
      // Setup mocks
      (ordemParanormalService.validateRitualCasting as jest.Mock).mockReturnValue({ allowed: true });
      (ordemParanormalService.calculateRitualCost as jest.Mock).mockReturnValue(1);
      (characterResourcesService.spendPE as jest.Mock).mockResolvedValue(mockCharacter);
      (ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue({
        success: true,
        rollResult: 20,
        dt: 15,
        criticalFailure: false,
        sanLoss: 0,
        sanMaxLoss: 0,
        dice: [20]
      });

      const result = await ritualService.conjureRitual('char-1', 'ritual-1', 'NORMAL', 0);

      expect(result.success).toBe(true);
      expect(result.cost).toBe(1);
      expect(characterResourcesService.spendPE).toHaveBeenCalledWith('char-1', 1);
    });

    it('should fail if casting validation fails', async () => {
      (ordemParanormalService.validateRitualCasting as jest.Mock).mockReturnValue({
        allowed: false,
        message: 'NEX insuficiente'
      });
      (ordemParanormalService.calculateRitualCost as jest.Mock).mockReturnValue(1);

      await expect(ritualService.conjureRitual('char-1', 'ritual-1', 'NORMAL', 0))
        .rejects.toThrow('NEX insuficiente');

      expect(characterResourcesService.spendPE).not.toHaveBeenCalled();
    });

    it('should handle critical failure in cost test', async () => {
      (ordemParanormalService.validateRitualCasting as jest.Mock).mockReturnValue({ allowed: true });
      (ordemParanormalService.calculateRitualCost as jest.Mock).mockReturnValue(1);
      (characterResourcesService.spendPE as jest.Mock).mockResolvedValue(mockCharacter);

      const failResult = {
        success: false,
        rollResult: 1,
        dt: 15,
        criticalFailure: true,
        sanLoss: 2,
        sanMaxLoss: 1,
        dice: [1]
      };
      (ordemParanormalService.rollRitualCostTest as jest.Mock).mockReturnValue(failResult);

      const result = await ritualService.conjureRitual('char-1', 'ritual-1', 'NORMAL', 0);

      expect(result.success).toBe(false);
      expect(result.roll.criticalFailure).toBe(true);
      expect(result.sanLoss).toBeGreaterThan(0);
    });
  });
});
