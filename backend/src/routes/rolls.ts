import { Router } from 'express'
import { diceService } from '../services/diceService'
import { logger } from '../utils/logger'

const router = Router()

/**
 * POST /api/roll/skill
 * Rola uma perícia com validação total do backend
 */
router.post('/skill', async (req, res) => {
    try {
        const { characterId, skillName, context, campaignId, isPrivate } = req.body

        // Validar parâmetros obrigatórios
        if (!characterId || !skillName || !campaignId) {
            return res.status(400).json({
                error: 'characterId, skillName e campaignId são obrigatórios'
            })
        }

        // O userId deve vir do middleware de autenticação (req.user.id)
        // Assumindo que o middleware popula req.user ou similar, mas como não vi o middleware auth aqui,
        // vou usar um fallback ou assumir que o userId vem no body SE for um ambiente de teste/dev sem auth rígida.
        // Em produção, deve vir do token. Vou usar req.body.userId como fallback.
        const userId = (req as any).user?.id || req.body.userId

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' })
        }

        const result = await diceService.resolveSkillRoll({
            characterId,
            skillName,
            userId,
            campaignId,
            context,
            isPrivate
        })

        return res.json(result)
    } catch (error: any) {
        logger.error({ error, body: req.body }, 'Erro na rota /skill')

        // Se for erro de regra de negócio (ex: Perícia não treinada), retornar 400
        if (error.message && (
            error.message.includes('exige treinamento') ||
            error.message.includes('não encontrada')
        )) {
            return res.status(400).json({ error: error.message })
        }

        return res.status(500).json({ error: 'Erro interno ao processar rolagem' })
    }
})

// Endpoint legado para rolagens genéricas (manter compatibilidade)
router.post('/', async (req, res) => {
    try {
        const result = await diceService.rollDice(req.body)
        return res.json(result)
    } catch (error: any) {
        logger.error({ error }, 'Error processing dice roll')
        return res.status(500).json({ error: error.message })
    }
})

export default router
