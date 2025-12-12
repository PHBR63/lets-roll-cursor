import { api } from './api'

export interface SkillRollRequest {
    characterId: string
    skillName: string
    campaignId: string
    context?: string
    isPrivate?: boolean
}

export interface RollResult {
    id: string
    result: number
    details: {
        rolls: number[]
        result: number
        trainingBonus: number
        flatBonus: number
        breakdown: string
        type: string
        skill: string
        attribute: string
        training: string
        missingKit: boolean
    }
    validation?: {
        allowed: boolean
        trainedOnly: boolean
        missingKit: boolean
    }
}

export const rollService = {
    rollSkill: async (data: SkillRollRequest): Promise<RollResult> => {
        // Usar o novo endpoint específico
        return api.post('/roll/skill', data)
    }
}
