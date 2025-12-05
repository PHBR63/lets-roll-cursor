import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { threatTemplateService } from '../services/threatTemplateService'
import { creatureService } from '../services/creatureService'
import { AppError } from '../types/common'

/**
 * Rotas para gerenciamento de templates de ameaças
 */
export const threatTemplatesRouter = Router()

threatTemplatesRouter.use(authenticateToken)

// Listar templates
threatTemplatesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { campaignId, isGlobal } = req.query
    const templates = await threatTemplateService.getTemplates({
      campaignId: campaignId as string | undefined,
      isGlobal: isGlobal === 'true' ? true : isGlobal === 'false' ? false : undefined,
    })
    res.json(templates)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter template por ID
threatTemplatesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await threatTemplateService.getTemplateById(req.params.id)
    res.json(template)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar template
threatTemplatesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const template = await threatTemplateService.createTemplate(userId, req.body)
    res.status(201).json(template)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Atualizar template
threatTemplatesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const template = await threatTemplateService.updateTemplate(req.params.id, req.body)
    res.json(template)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Deletar template
threatTemplatesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await threatTemplateService.deleteTemplate(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar criatura a partir de template + VD
threatTemplatesRouter.post('/:id/create-creature', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { vd, name, campaignId } = req.body

    if (!vd || vd < 1 || vd > 20) {
      return res.status(400).json({ error: 'VD deve ser um número entre 1 e 20' })
    }

    // Criar dados da criatura a partir do template
    const creatureData = await threatTemplateService.createCreatureFromTemplate(userId, {
      templateId: req.params.id,
      vd,
      name,
      campaignId,
    })

    // Criar a criatura usando o creatureService
    const creature = await creatureService.createCreature(userId, creatureData)

    res.status(201).json(creature)
  } catch (error: unknown) {
    const err = error as AppError
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

