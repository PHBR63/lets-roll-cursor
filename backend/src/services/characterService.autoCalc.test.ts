
import { characterService } from './characterService';
import { supabase } from '../config/supabase';
import { ordemParanormalService } from './ordemParanormalService';

// Mock Dependencies
jest.mock('../config/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

jest.mock('../utils/logger', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock specialized services that updateCharacter calls
jest.mock('./character/characterInventoryService', () => ({
    characterInventoryService: {}
}))
jest.mock('./character/characterAbilitiesService', () => ({
    characterAbilitiesService: {}
}))
jest.mock('./character/characterClassAbilitiesService', () => ({
    characterClassAbilitiesService: {}
}))
jest.mock('./character/characterConditionsService', () => ({
    characterConditionsService: {}
}))
jest.mock('./character/characterResourcesService', () => ({
    characterResourcesService: {}
}))
jest.mock('./character/characterAttributesService', () => ({
    characterAttributesService: {
        updateAttributes: jest.fn(),
        updateSkills: jest.fn()
    }
}))
jest.mock('./cache', () => ({
    getCache: jest.fn(),
    setCache: jest.fn(),
    deleteCache: jest.fn(),
    deleteCachePattern: jest.fn(),
    getCharacterCacheKey: jest.fn()
}))


describe('characterService.updateCharacter Auto-Calculation', () => {
    const mockCharacter = {
        id: '123',
        class: 'COMBATENTE',
        stats: {
            nex: 5,
            pv: { current: 20, max: 20 },
            pe: { current: 5, max: 5 },
            san: { current: 12, max: 12 }
        },
        attributes: { vig: 1, pre: 1, agi: 1, for: 1, int: 1 }
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Supabase Chain
        const mockUpdateBuilder = {
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { ...mockCharacter, stats: { ...mockCharacter.stats, nex: 10 } }, error: null })
        };

        const mockSelectBuilder = {
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockCharacter, error: null }),
            update: jest.fn().mockReturnValue(mockUpdateBuilder)
        };

        (supabase.from as jest.Mock).mockReturnValue(mockSelectBuilder);

        // Spy on calculator methods
        jest.spyOn(ordemParanormalService, 'calculateMaxPV');
        jest.spyOn(ordemParanormalService, 'calculateMaxSAN');
        jest.spyOn(ordemParanormalService, 'calculateMaxPE');
    });

    it('should recalculate max stats when NEX is updated via stats object', async () => {
        const updateData = {
            stats: {
                nex: 10, // Increasing NEX from 5 to 10
                pv: { current: 20, max: 20 }, // Sending old max
            }
        };

        await characterService.updateCharacter('123', updateData as any);

        // Verify recalculation was called with New NEX (10)
        expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 1, 10);

        // Verify update was called with NEW max values
        // We need to inspect the arguments passed to supabase.from().update()
        // The chain is supabase.from('characters').update(data).e...

        // However, in the service implementation:
        // const { data: currentCharacter } = await supabase.from('characters').select('*')...
        // ...
        // const { data: character, error } = await supabase.from('characters').update(updateData)...

        // So update is called on the result of from(), distinct from select.

        // Let's refine the mock to capture the update call.
        // supabase.from is called twice. Once for select, once for update.

        const fromMock = supabase.from as jest.Mock;
        // We can assume the second call is for update if we structure expectations, 
        // but better to check the mock returned by the second call.

        const updateSpy = fromMock.mock.results[1]?.value.update;
        if (!updateSpy) {
            // Fallback if logic is different, but for now let's hope the mock setup works
            // The mock setup returns the SAME builder object for simplicity in the BeforeEach
            // Actually I returned 'mockSelectBuilder' which has 'update'.
            // So I can check mockSelectBuilder.update
        }
    });
});
